from pathlib import Path

source = Path("/app/identity_agents.py")
text = source.read_text(encoding="utf-8")
needle = 'bp = Blueprint("identity", __name__)\n'
injection = (
    needle
    + "from action_executor import register_action_routes\n"
    + "register_action_routes(bp)\n"
)
if "register_action_routes(bp)" not in text:
    if needle not in text:
        raise SystemExit("identity blueprint marker not found")
    source.write_text(text.replace(needle, injection, 1), encoding="utf-8")

# The private console is embedded cross-site in the public workshop. A Lax cookie is
# discarded on the iframe POST redirect, which makes a correct password appear to do
# nothing. Use a Secure, SameSite=None, partitioned cookie so modern browsers can keep
# the authenticated session inside that top-level workshop without sharing it elsewhere.
server_path = Path("/app/server.py")
server = server_path.read_text(encoding="utf-8")
old_cookie = '''resp.set_cookie(_GATE_COOKIE, _gate_token(), max_age=60 * 60 * 24 * 30,
                            httponly=True, secure=secure, samesite="Lax")'''
new_cookie = '''resp.set_cookie(_GATE_COOKIE, _gate_token(), max_age=60 * 60 * 24 * 30,
                            httponly=True, secure=True, samesite="None")
            cookie_header = resp.headers.get("Set-Cookie", "")
            if cookie_header and "Partitioned" not in cookie_header:
                resp.headers["Set-Cookie"] = cookie_header + "; Partitioned"'''
if "samesite=\"Lax\"" in server:
    if old_cookie not in server:
        raise SystemExit("private gate cookie marker not found")
    server_path.write_text(server.replace(old_cookie, new_cookie, 1), encoding="utf-8")

html_path = Path("/app/identity-agents.html")
html = html_path.read_text(encoding="utf-8")
fragment = Path("/overlay/live-action-fragment.html").read_text(encoding="utf-8")
if "id=\"mk-live-action\"" not in html:
    marker = "</body>"
    if marker not in html:
        raise SystemExit("identity HTML body marker not found")
    html_path.write_text(html.replace(marker, fragment + "\n" + marker, 1), encoding="utf-8")
