"""Offline test for check-backup-fresh.py against a fake Resend endpoint.
Run: python3 -I backup/tests/test_check_fresh.py
"""
import datetime as dt, http.server, json, os, shutil, subprocess, sys, tempfile, threading

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "check-backup-fresh.py")
sent = []


class FakeResend(http.server.BaseHTTPRequestHandler):
    status = 200

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        sent.append((self.headers.get("Authorization"), json.loads(self.rfile.read(n))))
        self.send_response(FakeResend.status)
        self.send_header("Content-Length", "2")
        self.end_headers()
        self.wfile.write(b"{}")

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeResend)
threading.Thread(target=srv.serve_forever, daemon=True).start()

# isolated copy so a real .env next to the script is never read
iso = tempfile.mkdtemp()
script = os.path.join(iso, "check-backup-fresh.py")
shutil.copy(SCRIPT, script)


def make_run(out, hours_ago, status):
    name = (dt.datetime.now() - dt.timedelta(hours=hours_ago)).strftime("%Y-%m-%d_%H-%M-%S")
    os.makedirs(os.path.join(out, name))
    with open(os.path.join(out, name, "_metadata.json"), "w") as f:
        json.dump({"status": status, "errors": [] if status == "ok" else ["x"]}, f)


def run(out, *args, key="re_test"):
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": iso, "BACKUP_OUT_DIR": out,
           "RESEND_API_KEY": key, "ALERT_EMAIL_TO": "me@example.com",
           "RESEND_API_URL": f"http://127.0.0.1:{srv.server_address[1]}/emails"}
    p = subprocess.run([sys.executable, "-I", script, *args], env=env, cwd=iso,
                       capture_output=True, text=True, timeout=60)
    return p.returncode, p.stdout + p.stderr


def case(name, setup, expect_rc, expect_sent, expect_text, *args, status=200):
    sent.clear()
    FakeResend.status = status
    out = tempfile.mkdtemp()
    os.makedirs(os.path.join(out, "media"))  # must be ignored
    for h, s in setup:
        make_run(out, h, s)
    rc, output = run(out, *args)
    assert rc == expect_rc, f"{name}: rc {rc} != {expect_rc}\n{output}"
    assert len(sent) == expect_sent, f"{name}: sent {len(sent)} != {expect_sent}\n{output}"
    assert expect_text in output, f"{name}: {expect_text!r} not in output\n{output}"
    assert "re_test" not in output, f"{name}: key printed"
    if sent:
        assert sent[0][0] == "Bearer re_test" and sent[0][1]["to"] == ["me@example.com"], name
    print(f"ok  {name}")


case("fresh ok run -> no email", [(2, "ok")], 0, 0, "BACKUP FRESH")
case("stale ok run -> email", [(30, "ok")], 0, 1, "ALERT SENT")
case("latest failed, older ok fresh -> email", [(1, "failed"), (5, "ok")], 0, 1, "did not finish OK")
case("only failed runs -> email", [(1, "failed")], 0, 1, "no successful backup run")
case("no runs -> email", [], 0, 1, "no backup runs found")
case("resend error -> exit 1", [(30, "ok")], 1, 1, "ALERT SEND FAILED", status=500)
case("--test sends once", [(2, "ok")], 0, 1, "TEST ALERT SENT", "--test")
srv.shutdown()
print("ALL OK")
