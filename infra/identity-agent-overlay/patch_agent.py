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

html_path = Path("/app/identity-agents.html")
html = html_path.read_text(encoding="utf-8")
fragment = Path("/overlay/live-action-fragment.html").read_text(encoding="utf-8")
if "id=\"mk-live-action\"" not in html:
    marker = "</body>"
    if marker not in html:
        raise SystemExit("identity HTML body marker not found")
    html_path.write_text(html.replace(marker, fragment + "\n" + marker, 1), encoding="utf-8")

