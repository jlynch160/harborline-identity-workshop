"""Guarded Microsoft Graph executor for the Harborline live action demo.

The model never calls this module. A presenter explicitly approves one of two
allowlisted operations: add the configured demo user to the configured demo group,
or reverse that membership. Azure Container Apps managed identity supplies the token.
"""
from __future__ import annotations

import json
import hashlib
import hmac
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from flask import jsonify, request


GRAPH_ROOT = "https://graph.microsoft.com/v1.0"
TENANT_ID = os.getenv("AI_EXECUTOR_TENANT_ID", "").strip()
GROUP_ID = os.getenv("AI_EXECUTOR_GROUP_ID", "").strip()
GROUP_NAME = os.getenv("AI_EXECUTOR_GROUP_NAME", "ZZ-DEMO-AI-Replay").strip()
USER_ID = os.getenv("AI_EXECUTOR_USER_ID", "").strip()
USER_NAME = os.getenv("AI_EXECUTOR_USER_NAME", "Jordan Vale").strip()
USER_UPN = os.getenv("AI_EXECUTOR_USER_UPN", "").strip()
AUDIT_PATH = os.getenv("AI_EXECUTOR_AUDIT_PATH", "/tmp/identity-action-audit.jsonl")

_lock = threading.Lock()
_token = {"value": "", "expires": 0.0}
_receipts: dict[str, dict] = {}
_last_receipt_id = ""


class ExecutorError(RuntimeError):
    def __init__(self, message: str, status: int = 500, graph_request_id: str = ""):
        super().__init__(message)
        self.status = status
        self.graph_request_id = graph_request_id


def _configured() -> bool:
    return bool(TENANT_ID and GROUP_ID and USER_ID)


def _managed_identity_token() -> str:
    now = time.time()
    if _token["value"] and _token["expires"] > now + 120:
        return _token["value"]

    endpoint = os.getenv("IDENTITY_ENDPOINT", "").strip()
    identity_header = os.getenv("IDENTITY_HEADER", "").strip()
    if not endpoint or not identity_header:
        raise ExecutorError("Managed identity is unavailable in this runtime.", 503)

    query = urlencode({"resource": "https://graph.microsoft.com/", "api-version": "2019-08-01"})
    req = Request(f"{endpoint}?{query}", headers={"X-IDENTITY-HEADER": identity_header})
    try:
        with urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise ExecutorError(f"Managed identity token request failed: {exc}", 503) from exc

    value = payload.get("access_token", "")
    if not value:
        raise ExecutorError("Managed identity returned no access token.", 503)
    _token["value"] = value
    _token["expires"] = float(payload.get("expires_on") or now + 300)
    return value


def _graph(method: str, path: str, body: dict | None = None) -> tuple[dict | None, str]:
    headers = {
        "Authorization": f"Bearer {_managed_identity_token()}",
        "Accept": "application/json",
    }
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    req = Request(f"{GRAPH_ROOT}{path}", data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=20) as response:
            raw = response.read()
            payload = json.loads(raw.decode("utf-8")) if raw else None
            return payload, response.headers.get("request-id", "")
    except HTTPError as exc:
        request_id = exc.headers.get("request-id", "") if exc.headers else ""
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(raw).get("error", {}).get("message", raw)
        except ValueError:
            detail = raw
        raise ExecutorError(f"Microsoft Graph rejected the operation: {detail[:300]}", exc.code, request_id) from exc
    except (URLError, TimeoutError) as exc:
        raise ExecutorError(f"Microsoft Graph could not be reached: {exc}", 503) from exc


def _is_member() -> bool:
    try:
        _graph("GET", f"/groups/{GROUP_ID}/members/{USER_ID}?$select=id")
        return True
    except ExecutorError as exc:
        if exc.status == 404:
            return False
        raise


def _set_membership(member: bool) -> str:
    if member:
        _, request_id = _graph("POST", f"/groups/{GROUP_ID}/members/$ref", {
            "@odata.id": f"{GRAPH_ROOT}/directoryObjects/{USER_ID}"
        })
        return request_id
    _, request_id = _graph("DELETE", f"/groups/{GROUP_ID}/members/{USER_ID}/$ref")
    return request_id


def _verify(expected: bool) -> bool:
    # Entra group writes can be acknowledged before every directory replica returns
    # the new membership. Keep the presenter in a verified pending state long enough
    # to observe the durable value instead of treating eventual consistency as failure.
    consecutive = 0
    for delay in (0.0, 0.8, 1.2, 1.8, 2.5, 3.0, 4.0, 5.0, 5.0):
        if delay:
            time.sleep(delay)
        if _is_member() == expected:
            consecutive += 1
            if consecutive >= 3:
                return True
        else:
            consecutive = 0
    return False


def _public_receipt(receipt: dict | None) -> dict | None:
    if not receipt:
        return None
    return {k: receipt[k] for k in (
        "id", "action", "before", "after", "verified", "timestamp", "graphRequestId", "undone", "undoToken"
    ) if k in receipt}


def _undo_token(receipt_id: str, action: str, before: bool) -> str:
    key = (os.getenv("BOARD_GATE_PASSWORD") or TENANT_ID or "identity-action").encode("utf-8")
    message = f"{receipt_id}|{action}|{str(bool(before)).lower()}|{GROUP_ID}|{USER_ID}".encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def _append_audit(receipt: dict) -> None:
    try:
        with open(AUDIT_PATH, "a", encoding="utf-8") as stream:
            stream.write(json.dumps(receipt, separators=(",", ":")) + "\n")
    except OSError:
        pass


def _status_payload(member_override=None, receipt_override=None) -> dict:
    global _last_receipt_id
    member = member_override if member_override is not None else (_is_member() if _configured() else None)
    last_receipt = receipt_override or _receipts.get(_last_receipt_id)
    return {
        "available": _configured(),
        "mode": "managed-identity",
        "scope": "one demo user · one non-role security group",
        "user": {"displayName": USER_NAME, "userPrincipalName": USER_UPN},
        "group": {"displayName": GROUP_NAME},
        "member": member,
        "nextAction": "remove_member" if member else "add_member",
        "lastReceipt": _public_receipt(last_receipt),
    }


def register_action_routes(bp) -> None:
    @bp.get("/api/identity/actions/status")
    def action_status():
        try:
            return jsonify(_status_payload())
        except ExecutorError as exc:
            return jsonify({"available": False, "error": str(exc), "requestId": exc.graph_request_id}), exc.status

    @bp.post("/api/identity/actions/execute")
    def action_execute():
        global _last_receipt_id
        if not _configured():
            return jsonify({"error": "The executor allowlist is not configured."}), 503
        payload = request.get_json(silent=True) or {}
        action = str(payload.get("action") or "")
        if action not in {"add_member", "remove_member"}:
            return jsonify({"error": "Unsupported action."}), 400
        if payload.get("approval") != "APPROVE":
            return jsonify({"error": "Explicit presenter approval is required."}), 403

        desired = action == "add_member"
        with _lock:
            try:
                before = _is_member()
                request_id = ""
                if before != desired:
                    request_id = _set_membership(desired)
                verified = _verify(desired)
                after = desired if verified else _is_member()
                receipt = {
                    "id": str(uuid.uuid4()),
                    "action": action,
                    "before": before,
                    "after": after,
                    "verified": verified and after == desired,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "graphRequestId": request_id,
                    "undone": False,
                    "target": {"groupId": GROUP_ID, "userId": USER_ID},
                }
                receipt["undoToken"] = _undo_token(receipt["id"], receipt["action"], receipt["before"])
                _receipts[receipt["id"]] = receipt
                _last_receipt_id = receipt["id"]
                _append_audit(receipt)
                return jsonify({"ok": receipt["verified"], "receipt": _public_receipt(receipt), "status": _status_payload(after, receipt)}), (200 if receipt["verified"] else 502)
            except ExecutorError as exc:
                return jsonify({"error": str(exc), "requestId": exc.graph_request_id}), exc.status

    @bp.post("/api/identity/actions/undo")
    def action_undo():
        payload = request.get_json(silent=True) or {}
        receipt_id = str(payload.get("receiptId") or _last_receipt_id)
        if payload.get("approval") != "APPROVE":
            return jsonify({"error": "Explicit presenter approval is required."}), 403
        with _lock:
            receipt = _receipts.get(receipt_id)
            if not receipt:
                action = str(payload.get("action") or "")
                before = payload.get("before")
                supplied_token = str(payload.get("undoToken") or "")
                expected_token = _undo_token(receipt_id, action, bool(before))
                if action not in {"add_member", "remove_member"} or not supplied_token or not hmac.compare_digest(supplied_token, expected_token):
                    return jsonify({"error": "No valid reversible action receipt was found."}), 404
                receipt = {
                    "id": receipt_id,
                    "action": action,
                    "before": bool(before),
                    "after": not bool(before),
                    "verified": True,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "graphRequestId": "",
                    "undone": False,
                    "undoToken": supplied_token,
                    "target": {"groupId": GROUP_ID, "userId": USER_ID},
                }
            try:
                desired = bool(receipt["before"])
                current = _is_member()
                request_id = ""
                if current != desired:
                    request_id = _set_membership(desired)
                verified = _verify(desired)
                receipt["undone"] = verified
                receipt["undoTimestamp"] = datetime.now(timezone.utc).isoformat()
                receipt["undoGraphRequestId"] = request_id
                _append_audit({**receipt, "event": "undo"})
                return jsonify({"ok": verified, "receipt": _public_receipt(receipt), "status": _status_payload(desired if verified else None, receipt)}), (200 if verified else 502)
            except ExecutorError as exc:
                return jsonify({"error": str(exc), "requestId": exc.graph_request_id}), exc.status
