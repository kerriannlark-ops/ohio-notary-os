#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import socket
import subprocess
import argparse
import sys
import time
import urllib.request
from pathlib import Path

APP_SUPPORT_DIR = Path.home() / 'Library' / 'Application Support' / 'Notary OS Study Hub'
STATE_FILE = APP_SUPPORT_DIR / 'server-state.json'
CHROME_PROFILE_DIR = APP_SUPPORT_DIR / 'chrome-app-profile'
CHROME_CANDIDATES = [
    Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    Path.home() / 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    Path('/Applications/Chromium.app/Contents/MacOS/Chromium'),
    Path('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'),
    Path('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'),
    Path('/Applications/Arc.app/Contents/MacOS/Arc'),
]


def pid_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def port_ready(port: int) -> bool:
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/index.html', timeout=0.4) as response:
            return response.status == 200
    except Exception:
        return False


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(('127.0.0.1', 0))
        return int(sock.getsockname()[1])


def load_state() -> dict | None:
    if not STATE_FILE.exists():
        return None
    try:
        return json.loads(STATE_FILE.read_text(encoding='utf-8'))
    except Exception:
        return None


def save_state(state: dict) -> None:
    APP_SUPPORT_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding='utf-8')


def ensure_server(web_dir: Path) -> int:
    existing = load_state()
    if existing:
        port = int(existing.get('port', 0))
        pid = int(existing.get('pid', 0))
        saved_dir = existing.get('webDir')
        if port and pid and saved_dir == str(web_dir) and pid_alive(pid) and port_ready(port):
            return port

    port = find_free_port()
    process = subprocess.Popen(
        [sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'],
        cwd=str(web_dir),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )

    for _ in range(30):
        if port_ready(port):
            save_state({'pid': process.pid, 'port': port, 'webDir': str(web_dir), 'startedAt': int(time.time())})
            return port
        time.sleep(0.2)

    raise RuntimeError('Failed to start local study server.')


def chrome_binary() -> Path | None:
    for candidate in CHROME_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def launch_standalone_window(url: str) -> None:
    binary = chrome_binary()
    if binary is not None:
        CHROME_PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        subprocess.Popen(
            [
                str(binary),
                f'--app={url}',
                f'--user-data-dir={CHROME_PROFILE_DIR}',
                '--window-size=1440,980',
                '--window-position=120,80',
                '--disable-session-crashed-bubble',
                '--disable-features=Translate,ExtensionsToolbarMenu',
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        return

    subprocess.Popen(['open', url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> int:
    parser = argparse.ArgumentParser(description='Launch or prepare the Notary OS Study Hub local workspace.')
    parser.add_argument('web_dir', help='Path to the bundled web workspace')
    parser.add_argument('--server-only', action='store_true', help='Start/ensure the local server and print the local URL')
    args = parser.parse_args()

    web_dir = Path(args.web_dir).resolve()
    if not web_dir.exists():
        raise SystemExit(f'Web app directory not found: {web_dir}')

    port = ensure_server(web_dir)
    url = f'http://127.0.0.1:{port}/index.html'
    if args.server_only:
        print(url)
        return 0

    launch_standalone_window(url)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
