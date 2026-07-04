#!/usr/bin/env python3
"""
run_full_dev.py

Creates/activates Python venv, installs Python and Node deps, starts the dev server
and opens the site in the default browser when ready.

Usage: python3 run_full_dev.py

Designed for use from the project root.
"""
import os
import sys
import subprocess
import shlex
import time
import shutil
import socket
import webbrowser
from pathlib import Path
import urllib.request

ROOT = Path(os.getcwd())
LOG = ROOT / "run_full_dev.log"
VENV_DIR = ROOT / ".venv"
HTTP_URL = "http://localhost:5173/"  # default vite address
PORT = 5173


def log(msg: str):
    t = time.strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{t}] {msg}"
    print(line)
    try:
        with open(LOG, 'a') as f:
            f.write(line + "\n")
    except Exception:
        pass


def run(cmd, cwd=ROOT, check=True, env=None):
    log(f"Running: {' '.join(cmd)} (cwd={cwd})")
    return subprocess.run(cmd, cwd=cwd, check=check, env=env)


def kill_vite_processes():
    # Best-effort: only on Unix-like systems pgrep/kill available
    if shutil.which('pgrep') and shutil.which('kill'):
        try:
            pids = subprocess.check_output(["pgrep", "-f", "node_modules/.bin/vite"], text=True).strip().split()
            if pids:
                log(f"Found vite PIDs: {pids}, killing...")
                subprocess.run(["kill", "-9"] + pids)
        except subprocess.CalledProcessError:
            log("No vite processes found via pgrep")
    else:
        log("pgrep/kill not available; skipping vite kill step")


def create_and_install_venv():
    if not VENV_DIR.exists():
        log(f"Creating venv at {VENV_DIR}")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
    else:
        log(f"Using existing venv at {VENV_DIR}")

    if os.name == 'nt':
        pip_exe = VENV_DIR / "Scripts" / "pip"
        python_exe = VENV_DIR / "Scripts" / "python"
    else:
        pip_exe = VENV_DIR / "bin" / "pip"
        python_exe = VENV_DIR / "bin" / "python"

    req = ROOT / "requirements.txt"
    if req.exists():
        log("Installing Python requirements into venv")
        subprocess.run([str(pip_exe), "install", "-r", str(req)], check=True)
    else:
        log("No requirements.txt found; skipping Python deps")

    return str(python_exe)


def ensure_node_and_npm():
    """Ensure Node.js and npm are available. Try apt (NodeSource) first, then nvm as fallback.
    Returns a dict: { 'use_bash': bool, 'bash_prefix': str }
    If use_bash is True, npm/node commands must be invoked via: bash -lc '<bash_prefix> && npm ...'
    """
    if shutil.which('node') and shutil.which('npm'):
        try:
            node_v = subprocess.check_output(['node', '--version'], text=True).strip()
            npm_v = subprocess.check_output(['npm', '--version'], text=True).strip()
            log(f"Found node {node_v} and npm {npm_v}")
        except Exception:
            pass
        return {'use_bash': False, 'bash_prefix': ''}

    # Try apt-get + NodeSource (Debian/Ubuntu)
    if shutil.which('apt-get'):
        try:
            if not shutil.which('curl'):
                log('Installing curl (required for NodeSource setup) via apt-get')
                subprocess.run(['sudo', 'apt-get', 'update'], check=True)
                subprocess.run(['sudo', 'apt-get', 'install', '-y', 'curl'], check=True)
            log('Attempting NodeSource setup for Node.js LTS (setup_20.x)')
            subprocess.run(['curl', '-fsSL', 'https://deb.nodesource.com/setup_20.x', '-o', '/tmp/nodesource_setup.sh'], check=True)
            subprocess.run(['sudo', 'bash', '/tmp/nodesource_setup.sh'], check=True)
            subprocess.run(['sudo', 'apt-get', 'install', '-y', 'nodejs'], check=True)
            if shutil.which('node') and shutil.which('npm'):
                log('Installed node/npm via apt-get')
                return {'use_bash': False, 'bash_prefix': ''}
        except Exception as e:
            log(f"apt-get Node install failed: {e}")

    # Fallback: install nvm and use it inside bash - this does not modify current Python process PATH
    try:
        log('Attempting to install nvm and Node.js (fallback)')
        subprocess.run('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash', shell=True, check=True, executable='/bin/bash')
        nvm_dir = os.path.expanduser('~/.nvm')
        bash_prefix = f'export NVM_DIR="{nvm_dir}"; [ -s "{nvm_dir}/nvm.sh" ] && . "{nvm_dir}/nvm.sh"; nvm install --lts; nvm use --lts'
        # Verify npm available through this bash prefix
        subprocess.run(['bash', '-lc', f'{bash_prefix} && npm --version'], check=True)
        return {'use_bash': True, 'bash_prefix': bash_prefix}
    except Exception as e:
        log(f'nvm install fallback failed: {e}')

    raise SystemExit('Could not install Node.js/npm automatically. Please install Node.js and npm manually.')


def npm_install_and_start():
    # determine package.json location (prefer app/ when it contains index.html)
    app_index = ROOT / 'app' / 'index.html'
    app_pkg = ROOT / 'app' / 'package.json'
    root_index = ROOT / 'index.html'

    if app_index.exists():
        npm_cwd = ROOT / 'app'
        pkg = npm_cwd / 'package.json'
    else:
        pkg = ROOT / 'package.json'
        if not pkg.exists():
            if app_pkg.exists():
                npm_cwd = ROOT / 'app'
                pkg = app_pkg
            else:
                raise SystemExit('package.json not found in project root or app/')
        else:
            npm_cwd = ROOT

    # Ensure node/npm available (may install them)
    info = ensure_node_and_npm()
    use_bash = info.get('use_bash', False)
    bash_prefix = info.get('bash_prefix', '')

    # prefer "dev" script, fallback to "start"
    # check package.json scripts
    try:
        import json
        pkg_json = json.loads(pkg.read_text())
        scripts = pkg_json.get('scripts', {})
        if 'dev' in scripts:
            start_cmd = ['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', str(PORT)]
        elif 'start' in scripts:
            start_cmd = ['npm', 'run', 'start']
        else:
            start_cmd = ['npx', 'vite', '--host', '0.0.0.0', '--port', str(PORT)]
    except Exception:
        start_cmd = ['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', str(PORT)]

    logfile = open(LOG, 'a')

    if use_bash:
        # run npm install and start via bash -lc with nvm loaded
        log(f"Running npm install (via nvm) in {npm_cwd}")
        subprocess.run(['bash', '-lc', f'{bash_prefix} && npm install --silent'], cwd=str(npm_cwd), check=True)
        start_cmd_str = ' '.join(shlex.quote(x) for x in start_cmd)
        log(f"Starting dev server (via nvm): {start_cmd_str} (cwd={npm_cwd})")
        proc = subprocess.Popen(['bash', '-lc', f'{bash_prefix} && {start_cmd_str}'], cwd=str(npm_cwd), stdin=subprocess.DEVNULL, stdout=logfile, stderr=logfile)
    else:
        if not shutil.which('npm'):
            raise SystemExit('npm not found on PATH after installation attempt')
        # run npm install
        log(f"Running npm install in {npm_cwd}")
        run(['npm', 'install', '--silent'], cwd=npm_cwd)
        # start the dev server in background, redirect stdout/stderr to log
        log(f"Starting dev server: {' '.join(start_cmd)} (cwd={npm_cwd})")
        proc = subprocess.Popen(start_cmd, cwd=npm_cwd, stdin=subprocess.DEVNULL, stdout=logfile, stderr=logfile)

    log(f"Dev server PID: {proc.pid}")
    return proc


def wait_for_http(url, timeout=120):
    """Wait for the server to accept TCP connections on the host:port and return a non-5xx HTTP status.
    This is more robust for dev servers that might reply 404 for root initially.
    """
    log(f"Waiting for {url} (timeout {timeout}s)")
    deadline = time.time() + timeout
    last_exc = None

    # parse host and port
    try:
        from urllib.parse import urlparse
        parts = urlparse(url)
        host = parts.hostname or '127.0.0.1'
        port = parts.port or PORT
    except Exception:
        host, port = '127.0.0.1', PORT

    while time.time() < deadline:
        # basic TCP check first
        try:
            with socket.create_connection((host, port), timeout=2):
                # TCP is open, try HTTP
                try:
                    req = urllib.request.Request(url, method='GET')
                    with urllib.request.urlopen(req, timeout=2) as r:
                        status = getattr(r, 'status', None) or r.getcode()
                        if status < 500:
                            log(f"Got HTTP {status} from {url}")
                            return True
                        else:
                            last_exc = Exception(f'HTTP {status}')
                except Exception as e:
                    # record and retry
                    last_exc = e
        except Exception as e:
            last_exc = e
        time.sleep(1)
    log(f"Timed out waiting for {url}; last error: {last_exc}")
    return False


def copy_to_clipboard(url):
    # Try several common clipboard tools silently
    tools = [
        (['xclip', '-selection', 'clipboard'], True),
        (['wl-copy'], True),
        (['pbcopy'], True),
    ]
    for cmd, use_stdin in tools:
        if shutil.which(cmd[0]):
            try:
                p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
                p.communicate(input=url.encode('utf-8'))
                log(f"Copied URL to clipboard via {cmd[0]}")
                return True
            except Exception:
                continue
    return False


def open_browser(url):
    try:
        webbrowser.open(url)
        log(f"Opened browser to {url}")
    except Exception as e:
        log(f"Failed to open browser: {e}")

    # attempt to copy to clipboard for convenience
    try:
        if copy_to_clipboard(url):
            log('URL copied to clipboard')
    except Exception:
        pass


if __name__ == '__main__':
    try:
        log("=== run_full_dev.py starting ===")

        # 1) Kill old vite processes (best-effort)
        kill_vite_processes()

        # 2) Create python venv and install python deps
        python_exe = create_and_install_venv()

        # 3) Install node deps and start dev server
        proc = npm_install_and_start()

        # 4) Wait for server and open browser
        up = wait_for_http(HTTP_URL, timeout=180)
        if not up:
            log("Server did not become available. Check run_full_dev.log for details.")
            sys.exit(1)

        # 5) Print clickable URL and open browser
        print('\nDev server is up! Open the URL below if it did not open automatically:')
        print(HTTP_URL)
        open_browser(HTTP_URL)

        log("=== run_full_dev.py finished successfully ===")

        # Keep this process running to retain the venv activated in this process? Not necessary.
    except KeyboardInterrupt:
        log('Interrupted by user')
        sys.exit(1)
    except Exception as e:
        log(f'ERROR: {e}')
        sys.exit(2)
