#!/usr/bin/env python3
"""Alert by email (Resend) when the Strapi backup is stale or the last run failed.

Run from cron a couple of hours after backup-strapi.sh. Exit codes:
  0  backup is fresh, or an alert was sent successfully
  1  an alert was needed but sending failed
  2  bad configuration

Env (or a .env next to this script, same file the backup uses):
  BACKUP_OUT_DIR       where backup-strapi.sh writes timestamped runs (required)
  BACKUP_MAX_AGE_HOURS default 26
  RESEND_API_KEY       a send-only Resend key (required to alert)
  ALERT_EMAIL_TO       recipient (required to alert)
  ALERT_EMAIL_FROM     verified sender, default noreply@religousphilosophy.com
  RESEND_API_URL       default https://api.resend.com/emails (override for tests)

Flags: --test sends one email regardless of state, to prove delivery works.
"""
import datetime as dt
import json
import os
import re
import socket
import sys
import urllib.error
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


def send(subject, text):
    key = os.environ.get("RESEND_API_KEY", "")
    to = os.environ.get("ALERT_EMAIL_TO", "")
    if not key or not to:
        print("ERROR: RESEND_API_KEY and ALERT_EMAIL_TO are required to send an alert", file=sys.stderr)
        return False
    body = json.dumps({
        "from": os.environ.get("ALERT_EMAIL_FROM", "noreply@religousphilosophy.com"),
        "to": [to],
        "subject": subject,
        "text": text,
    }).encode()
    req = urllib.request.Request(
        os.environ.get("RESEND_API_URL", "https://api.resend.com/emails"),
        data=body, method="POST",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                 "User-Agent": "strapi-backup-alert/1"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
        return True
    except urllib.error.HTTPError as e:
        print(f"ERROR: Resend returned HTTP {e.code}: {e.read()[:300]!r}", file=sys.stderr)
    except (urllib.error.URLError, OSError) as e:
        print(f"ERROR: could not reach Resend: {e}", file=sys.stderr)
    return False


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
                  f"Test of the Strapi backup alert on {host}.\nBackup dir: {out_dir}\n")
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
