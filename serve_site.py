#!/usr/bin/env python3
"""
Simple helper to start the Vite dev server in the app/ folder and print the URL when ready.
Usage: python3 serve_site.py

What it does:
- cd into ./app
- runs `npm install` if node_modules is missing
- starts `npm run dev -- --host 127.0.0.1 --port 5173`
- polls http://127.0.0.1:5173/ until it returns a response (timeout 60s)
- prints the URL and then streams the dev-server logs to stdout

Notes:
- Requires Python 3.7+ and npm in PATH.
- If you prefer a different port or host, edit the PORT/HOST constants below.
"""
import os
import sys
import subprocess
import threading
import time
import urllib.request
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(ROOT, 'app')
HOST = '127.0.0.1'
PORT = 5173
URL = f'http://{HOST}:{PORT}/'


def run_cmd(cmd, cwd=None):
    proc = subprocess.Popen(cmd, cwd=cwd, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return proc


def stream_output(proc):
    assert proc.stdout
    try:
        for line in proc.stdout:
            print(line, end='')
    except Exception:
        pass


def wait_for_url(url, timeout=60):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def ensure_node_modules():
    nm = os.path.join(APP_DIR, 'node_modules')
    if os.path.exists(nm):
        return True
    print('node_modules not found. Running npm install (this may take a while)...')
    cmd = ['npm', 'install']
    proc = run_cmd(cmd, cwd=APP_DIR)
    stream_output(proc)
    rc = proc.wait()
    return rc == 0


def main():
    if not os.path.isdir(APP_DIR):
        print('Error: app/ directory not found. Run this script from the project root.')
        sys.exit(1)

    npm_path = shutil.which('npm')
    if not npm_path:
        print('Error: npm not found in PATH. Please install Node.js and npm.')
        sys.exit(1)

    # ensure deps
    ok = ensure_node_modules()
    if not ok:
        print('npm install failed. Fix npm errors and try again.')
        sys.exit(1)

    # start dev server
    print(f'Starting Vite dev server in {APP_DIR}...')
    cmd = ['npm', 'run', 'dev', '--', '--host', HOST, '--port', str(PORT)]
    proc = run_cmd(cmd, cwd=APP_DIR)

    # start thread to stream logs
    t = threading.Thread(target=stream_output, args=(proc,), daemon=True)
    t.start()

    # wait for server
    print(f'Waiting for {URL} to respond (timeout 60s)...')
    ready = wait_for_url(URL, timeout=60)
    if ready:
        print('\nDev server is UP ->', URL)
        print('Press Ctrl+C to stop. Logs will continue below:')
        try:
            proc.wait()
        except KeyboardInterrupt:
            print('\nStopping dev server...')
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except Exception:
                proc.kill()
    else:
        print('\nDev server did not respond within timeout. Check the logs above for errors.')
        try:
            proc.terminate()
        except Exception:
            pass
        sys.exit(1)


if __name__ == '__main__':
    main()
