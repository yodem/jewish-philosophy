"""Offline test: backup-strapi.sh must not leak the API token across a cross-host redirect.

Server A (127.0.0.1) 302-redirects every request to server B (localhost, a different host).
B records the headers it receives. Run: python3 -I backup/tests/test_redirect_auth.py
"""
import http.server, json, os, shutil, subprocess, sys, tempfile, threading

TOKEN = "SECRET-TEST-TOKEN-123"
SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backup-strapi.sh")
received = []  # (path, headers dict) seen by B


class B(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        received.append((self.path, {k.lower(): v for k, v in self.headers.items()}))
        body = json.dumps({"data": [], "meta": {"pagination": {"page": 1, "pageCount": 1, "total": 0}}}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


def make_a(b_port):
    class A(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(302)
            self.send_header("Location", f"http://localhost:{b_port}{self.path}")
            self.send_header("Content-Length", "0")
            self.end_headers()

        def log_message(self, *a):
            pass
    return A


def serve(handler):
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


b = serve(B)
a = serve(make_a(b.server_address[1]))
out = tempfile.mkdtemp()
# Run an isolated copy: the script sources a .env next to itself, which could hold real
# credentials or output settings. The temp dir has no .env, and the env is built from scratch.
isolated = tempfile.mkdtemp()
script_copy = os.path.join(isolated, "backup-strapi.sh")
shutil.copy(SCRIPT, script_copy)
assert not os.path.exists(os.path.join(isolated, ".env"))
env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": isolated,
       "STRAPI_BASE_URL": f"http://127.0.0.1:{a.server_address[1]}",
       "STRAPI_API_TOKEN": TOKEN, "BACKUP_OUT_DIR": out}
proc = subprocess.run(["bash", script_copy], env=env, cwd=isolated, capture_output=True, text=True, timeout=300)

assert received, "redirect was never followed, test is vacuous:\n" + proc.stdout + proc.stderr
leaked = [p for p, h in received if "authorization" in h]
assert not leaked, f"Authorization leaked to other host on: {leaked[:3]}"
assert TOKEN not in proc.stdout + proc.stderr, "token printed"
print(f"OK: {len(received)} redirected requests reached the other host, none carried Authorization")
a.shutdown(); b.shutdown()
