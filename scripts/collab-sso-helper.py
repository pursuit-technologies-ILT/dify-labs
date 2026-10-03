#!/usr/bin/env python3
"""Same-origin Studio SSO helper. Listens on :3850.

Validates a short-lived HMAC ticket from the walkthrough, signs into Dify,
and forwards __Host-access_token cookies so Studio opens without a second login.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import sys
import http.client
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
ENV_PATHS = (
    ROOT / "web" / ".env.local",
    ROOT / "lab-creds.env",
    ROOT / ".env",
)


def load_env() -> None:
    for path in ENV_PATHS:
        if not path.is_file():
            continue
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip("'").strip('"')
            os.environ.setdefault(key, value)


def ticket_ok(ticket: str, secret: str) -> bool:
    parts = ticket.split(".")
    if len(parts) != 3:
        return False
    issued_raw, expires_raw, signature_hex = parts
    if not issued_raw.isdigit() or not expires_raw.isdigit():
        return False
    if len(signature_hex) != 64:
        return False
    try:
        expires_at = int(expires_raw)
    except ValueError:
        return False
    if time.time() * 1000 > expires_at:
        return False
    payload = f"{issued_raw}.{expires_raw}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_hex)


def login_dify_cookies(origin: str, email: str, password: str) -> list[str]:
    """Return Set-Cookie values from a successful console login."""
    parsed = urlparse(origin if "://" in origin else f"http://{origin}")
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    payloads = [
        {
            "email": email,
            "password": base64.b64encode(password.encode("utf-8")).decode("ascii"),
            "remember_me": True,
        },
        {"email": email, "password": password, "remember_me": True},
    ]
    for body in payloads:
        raw = json.dumps(body).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Host": host if port in (80, 443) else f"{host}:{port}",
            "Content-Length": str(len(raw)),
        }
        conn: http.client.HTTPConnection
        if parsed.scheme == "https":
            conn = http.client.HTTPSConnection(host, port, timeout=20)
        else:
            conn = http.client.HTTPConnection(host, port, timeout=20)
        try:
            conn.request("POST", "/console/api/login", body=raw, headers=headers)
            resp = conn.getresponse()
            payload = json.loads(resp.read().decode("utf-8") or "{}")
            cookies = [value for key, value in resp.getheaders() if key.lower() == "set-cookie"]
        except (OSError, TimeoutError, json.JSONDecodeError, http.client.HTTPException):
            continue
        finally:
            conn.close()
        if not isinstance(payload, dict) or payload.get("result") != "success":
            continue
        if cookies:
            return cookies
    return []


def html_page(title: str, body: str) -> bytes:
    page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <style>
    body {{ font-family: ui-sans-serif, system-ui, sans-serif; margin: 3rem auto; max-width: 40rem; color: #111; }}
    p {{ line-height: 1.5; }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""
    return page.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path not in ("/collab-sso", "/", "/collab-sso/"):
            self.send_response(404)
            self.end_headers()
            return

        secret = os.environ.get("COLLAB_SESSION_SECRET", "").strip()
        password = os.environ.get("COLLAB_PASSWORD", "").strip()
        email = os.environ.get("DIFY_ADMIN_EMAIL") or os.environ.get(
            "NEXT_PUBLIC_DIFY_ADMIN_EMAIL", "lab-admin@example.com"
        )
        origin = os.environ.get("DIFY_INTERNAL_URL", "http://127.0.0.1:3847")
        default_next = os.environ.get(
            "NEXT_PUBLIC_DIFY_CANVAS_PATH",
            "/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow",
        )
        query = parse_qs(parsed.query)
        ticket = (query.get("ticket") or [""])[0]
        next_path = (query.get("next") or [default_next])[0]
        if not next_path.startswith("/"):
            next_path = default_next

        if not secret or not password:
            self._send(
                503,
                html_page(
                    "SSO not configured",
                    "<p>Collaborator SSO helper is missing COLLAB_PASSWORD / COLLAB_SESSION_SECRET.</p>",
                ),
            )
            return
        if not ticket_ok(ticket, secret):
            self._send(
                401,
                html_page(
                    "Link expired",
                    "<p>That Studio link expired or is invalid. Sign in on the walkthrough and click Open Dify canvas again.</p>",
                ),
            )
            return

        cookies = login_dify_cookies(origin, email, password)
        if not cookies:
            self._send(
                502,
                html_page(
                    "Studio login failed",
                    "<p>Could not create a Dify session. The helper logs the HTTP status, not the password.</p>",
                ),
            )
            return
        self.send_response(302)
        self.send_header("Location", next_path)
        self.send_header("Cache-Control", "no-store")
        for cookie in cookies:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()

    def _send(self, code: int, body: bytes) -> None:
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()


def main() -> int:
    load_env()
    host = os.environ.get("COLLAB_SSO_BIND", "0.0.0.0")
    port = int(os.environ.get("COLLAB_SSO_PORT", "3850"))
    print(f"collab-sso-helper listening on {host}:{port}", flush=True)
    ThreadingHTTPServer((host, port), Handler).serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
