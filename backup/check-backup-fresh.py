#!/usr/bin/env python3
"""Alert by Telegram and/or email (Resend) when the Strapi backup is stale or the last run failed.

Run from cron a couple of hours after backup-strapi.sh. Exit codes:
  0  backup is fresh, or the alert reached every configured channel
  1  an alert was needed but a channel failed, or no channel is configured
  2  bad configuration

Env (or a .env next to this script, same file the backup uses):
  BACKUP_OUT_DIR       where backup-strapi.sh writes timestamped runs (required)
  BACKUP_MAX_AGE_HOURS default 26

  Telegram channel (enabled when a token and chat id are found):
  TELEGRAM_ENV_FILE    a chmod-600 file to read the bot credentials from at send time, so the
                       token is never copied (e.g. ~/.claude/sync-and-update.env)
  TELEGRAM_TOKEN_VAR   name of the token variable in that file/env, default TELEGRAM_BOT_TOKEN
  TELEGRAM_CHAT_VAR    name of the chat-id variable, default TELEGRAM_CHAT_ID
  TELEGRAM_API_BASE    default https://api.telegram.org (override for tests)

  Email channel (enabled when RESEND_API_KEY and ALERT_EMAIL_TO are set):
  RESEND_API_KEY       a send-only Resend key
  ALERT_EMAIL_TO       recipient
  ALERT_EMAIL_FROM     verified sender, default noreply@religousphilosophy.com
  RESEND_API_URL       default https://api.resend.com/emails (override for tests)

Flags: --test sends one message on every configured channel regardless of state.
"""
import datetime as dt
import json
import os
import re
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
RUN_DIR = re.compile(r"^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$")


def load_env_file(path):
    """Fill os.environ from KEY=VALUE lines without overriding values already set."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def runs(out_dir):
    """Return [(run_name, metadata_dict_or_None)] newest first."""
    names = sorted((n for n in os.listdir(out_dir) if RUN_DIR.match(n)), reverse=True)
    result = []
    for n in names:
        meta = None
        try:
            with open(os.path.join(out_dir, n, "_metadata.json"), encoding="utf-8") as f:
                meta = json.load(f)
        except (OSError, ValueError):
            pass
        result.append((n, meta))
    return result


def assess(out_dir, max_age_h, now):
    """Return a list of problems (empty means healthy)."""
    if not os.path.isdir(out_dir):
        return [f"backup directory does not exist: {out_dir}"]
    all_runs = runs(out_dir)
    if not all_runs:
        return ["no backup runs found"]
    problems = []
    latest_name, latest_meta = all_runs[0]
    if not latest_meta or latest_meta.get("status") != "ok":
        n_err = len((latest_meta or {}).get("errors") or [])
        problems.append(f"latest run {latest_name} did not finish OK ({n_err} errors recorded)")
    ok = [n for n, m in all_runs if m and m.get("status") == "ok"]
    if not ok:
        problems.append("no successful backup run exists")
    else:
        # run names are local time of the machine that wrote them (same machine as this check)
        last_ok = dt.datetime.strptime(ok[0], "%Y-%m-%d_%H-%M-%S")
        age_h = (now - last_ok).total_seconds() / 3600
        if age_h > max_age_h:
            problems.append(f"newest successful run {ok[0]} is {age_h:.1f}h old (limit {max_age_h}h)")
    return problems


def _post(url, data, headers):
    req = urllib.request.Request(url, data=data, method="POST",
                                 headers={"User-Agent": "strapi-backup-alert/2", **headers})
    with urllib.request.urlopen(req, timeout=30) as resp:
        resp.read()


def telegram_creds():
    """Token and chat id from TELEGRAM_ENV_FILE (read now, never copied) or the environment."""
    tok_var = os.environ.get("TELEGRAM_TOKEN_VAR", "TELEGRAM_BOT_TOKEN")
    chat_var = os.environ.get("TELEGRAM_CHAT_VAR", "TELEGRAM_CHAT_ID")
    values = {tok_var: os.environ.get(tok_var, ""), chat_var: os.environ.get(chat_var, "")}
    path = os.path.expanduser(os.environ.get("TELEGRAM_ENV_FILE", ""))
    if path and os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("export "):
                    line = line[7:]
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    v = v.strip()
                    if v[:1] in ('"', "'") and v[1:].find(v[0]) >= 0:
                        v = v[1:1 + v[1:].find(v[0])]          # quoted value: keep what is inside
                    else:
                        v = v.split(" #", 1)[0].strip()       # unquoted: drop an inline comment
                    if k.strip() in values and v:
                        values[k.strip()] = v
    return values[tok_var], values[chat_var]


TG_TOKEN_RE = re.compile(r"^\d+:[A-Za-z0-9_-]+$")
TG_CHAT_RE = re.compile(r"^-?\d+$|^@[A-Za-z0-9_]{5,}$")


def send_telegram(subject, text):
    token, chat = telegram_creds()
    # validate before the token goes into a URL, so a malformed value cannot surface in an error
    if not TG_TOKEN_RE.match(token) or not TG_CHAT_RE.match(chat):
        print("ERROR: Telegram token or chat id is malformed", file=sys.stderr)
        return False
    base = os.environ.get("TELEGRAM_API_BASE", "https://api.telegram.org")
    # plain text, no parse_mode: a stray _ or ` would make Telegram reject the message
    data = urllib.parse.urlencode({"chat_id": chat, "text": f"{subject}\n\n{text}"}).encode()
    try:
        _post(f"{base}/bot{token}/sendMessage", data,
              {"Content-Type": "application/x-www-form-urlencoded"})
        return True
    except urllib.error.HTTPError as e:
        print(f"ERROR: Telegram returned HTTP {e.code}", file=sys.stderr)
    except Exception as e:  # noqa: BLE001 - the URL holds the token; never let a traceback print it
        print(f"ERROR: Telegram send failed ({type(e).__name__})", file=sys.stderr)
    return False


def send_email(subject, text):
    body = json.dumps({
        "from": os.environ.get("ALERT_EMAIL_FROM", "noreply@religousphilosophy.com"),
        "to": [os.environ["ALERT_EMAIL_TO"]],
        "subject": subject,
        "text": text,
    }).encode()
    try:
        _post(os.environ.get("RESEND_API_URL", "https://api.resend.com/emails"), body,
              {"Authorization": f"Bearer {os.environ['RESEND_API_KEY']}", "Content-Type": "application/json"})
        return True
    except urllib.error.HTTPError as e:
        print(f"ERROR: Resend returned HTTP {e.code}: {e.read()[:300]!r}", file=sys.stderr)
    except (urllib.error.URLError, OSError) as e:
        print(f"ERROR: could not reach Resend: {e}", file=sys.stderr)
    return False


def channels():
    found = []
    token, chat = telegram_creds()
    if token and chat:
        found.append(("telegram", send_telegram))
    if os.environ.get("RESEND_API_KEY") and os.environ.get("ALERT_EMAIL_TO"):
        found.append(("email", send_email))
    return found


def send(subject, text):
    """Send on every configured channel. True only if there is at least one and all succeed."""
    chans = channels()
    if not chans:
        print("ERROR: no alert channel configured (Telegram creds or RESEND_API_KEY + ALERT_EMAIL_TO)",
              file=sys.stderr)
        return False
    results = {name: fn(subject, text) for name, fn in chans}
    print("channels:", ", ".join(f"{n}={'ok' if r else 'FAILED'}" for n, r in results.items()))
    return all(results.values())


def main():
    load_env_file(os.path.join(HERE, ".env"))
    out_dir = os.environ.get("BACKUP_OUT_DIR", "")
    if not out_dir:
        print("ERROR: BACKUP_OUT_DIR is not set", file=sys.stderr)
        return 2
    try:
        max_age = float(os.environ.get("BACKUP_MAX_AGE_HOURS", "26"))
    except ValueError:
        print("ERROR: BACKUP_MAX_AGE_HOURS must be a number", file=sys.stderr)
        return 2

    host = socket.gethostname()
    if "--test" in sys.argv[1:]:
        ok = send(f"[backup] test alert from {host}",
                  f"Test of the religousphilosophy.com backup alert on {host}.\nBackup dir: {out_dir}\n")
        print("TEST ALERT SENT" if ok else "TEST ALERT FAILED")
        return 0 if ok else 1

    problems = assess(out_dir, max_age, dt.datetime.now())
    if not problems:
        print("BACKUP FRESH")
        return 0
    text = (f"The religousphilosophy.com Strapi backup on {host} needs attention:\n\n"
            + "\n".join(f"- {p}" for p in problems)
            + f"\n\nBackup dir: {out_dir}\nLog: {os.path.join(os.path.dirname(out_dir), 'backup.log')}\n")
    print("ALERT:", "; ".join(problems))
    ok = send("[backup] religousphilosophy.com backup is stale or failing", text)
    print("ALERT SENT" if ok else "ALERT SEND FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
