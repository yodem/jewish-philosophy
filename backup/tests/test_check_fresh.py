"""Offline test for check-backup-fresh.py against fake Resend and Telegram endpoints.
Run: python3 -I backup/tests/test_check_fresh.py
"""
import datetime as dt, http.server, json, os, shutil, subprocess, sys, tempfile, threading, urllib.parse

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "check-backup-fresh.py")
TG_TOKEN = "123:TEST-BOT-TOKEN"
sent = []  # (channel, auth_or_path, payload)


class Fake(http.server.BaseHTTPRequestHandler):
    status = 200

    def do_POST(self):
        raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        if self.path == "/emails":
            sent.append(("email", self.headers.get("Authorization"), json.loads(raw)))
        else:
            sent.append(("telegram", self.path, dict(urllib.parse.parse_qsl(raw.decode()))))
        self.send_response(Fake.status)
        self.send_header("Content-Length", "2")
        self.end_headers()
        self.wfile.write(b"{}")

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Fake)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}"

# isolated copy so a real .env next to the script is never read
iso = tempfile.mkdtemp()
script = os.path.join(iso, "check-backup-fresh.py")
shutil.copy(SCRIPT, script)
# creds file shaped like ~/.claude/sync-and-update.env
tg_file = os.path.join(iso, "tg.env")
with open(tg_file, "w") as f:
    f.write(f'WIKI_TG_TOKEN="{TG_TOKEN}"\nexport WIKI_TG_CHAT=4242\n')


def make_run(out, hours_ago, status):
    name = (dt.datetime.now() - dt.timedelta(hours=hours_ago)).strftime("%Y-%m-%d_%H-%M-%S")
    os.makedirs(os.path.join(out, name))
    with open(os.path.join(out, name, "_metadata.json"), "w") as f:
        json.dump({"status": status, "errors": [] if status == "ok" else ["x"]}, f)


EMAIL = {"RESEND_API_KEY": "re_test", "ALERT_EMAIL_TO": "me@example.com", "RESEND_API_URL": f"{BASE}/emails"}
TG = {"TELEGRAM_ENV_FILE": tg_file, "TELEGRAM_TOKEN_VAR": "WIKI_TG_TOKEN",
      "TELEGRAM_CHAT_VAR": "WIKI_TG_CHAT", "TELEGRAM_API_BASE": BASE}


def case(name, setup, chans, expect_rc, expect_sent, expect_text, *args, status=200):
    sent.clear()
    Fake.status = status
    out = tempfile.mkdtemp()
    os.makedirs(os.path.join(out, "media"))  # must be ignored
    for h, s in setup:
        make_run(out, h, s)
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": iso, "BACKUP_OUT_DIR": out}
    for c in chans:
        env.update(c)
    p = subprocess.run([sys.executable, "-I", script, *args], env=env, cwd=iso,
                       capture_output=True, text=True, timeout=60)
    output = p.stdout + p.stderr
    assert p.returncode == expect_rc, f"{name}: rc {p.returncode} != {expect_rc}\n{output}"
    got = sorted(c for c, _, _ in sent)
    assert got == sorted(expect_sent), f"{name}: sent {got} != {expect_sent}\n{output}"
    assert expect_text in output, f"{name}: {expect_text!r} not in output\n{output}"
    assert "re_test" not in output and TG_TOKEN not in output, f"{name}: secret printed"
    for c, a, payload in sent:
        if c == "email":
            assert a == "Bearer re_test" and payload["to"] == ["me@example.com"], name
        else:
            assert a == f"/bot{TG_TOKEN}/sendMessage" and payload["chat_id"] == "4242", (name, a, payload)
            assert "parse_mode" not in payload, name
    print(f"ok  {name}")


case("fresh ok run -> nothing sent", [(2, "ok")], [EMAIL, TG], 0, [], "BACKUP FRESH")
case("stale -> email only", [(30, "ok")], [EMAIL], 0, ["email"], "ALERT SENT")
case("stale -> telegram via creds file", [(30, "ok")], [TG], 0, ["telegram"], "telegram=ok")
case("stale -> both channels", [(30, "ok")], [EMAIL, TG], 0, ["email", "telegram"], "ALERT SENT")
case("latest failed, older ok fresh", [(1, "failed"), (5, "ok")], [TG], 0, ["telegram"], "did not finish OK")
case("only failed runs", [(1, "failed")], [TG], 0, ["telegram"], "no successful backup run")
case("no runs", [], [TG], 0, ["telegram"], "no backup runs found")
case("no channel configured -> exit 1", [(30, "ok")], [], 1, [], "no alert channel configured")
case("telegram HTTP error -> exit 1, token not printed", [(30, "ok")], [TG], 1, ["telegram"],
     "Telegram returned HTTP 500", status=500)
case("--test sends on every channel", [(2, "ok")], [EMAIL, TG], 0, ["email", "telegram"], "TEST ALERT SENT", "--test")
srv.shutdown()
print("ALL OK")
