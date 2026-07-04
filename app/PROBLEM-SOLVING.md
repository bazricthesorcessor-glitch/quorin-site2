# Problem-Solving Log

## Vite Dev Server Won't Start

### Issue
`npm run dev` initiates the Vite dev server but the process exits silently before binding any port. No error trace or stack output is produced.

### Methods Tried

1. **Checked TypeScript compilation**
   - Ran `npx tsc --noEmit` — passed with 0 errors. Type system is not the blocker.

2. **Killed stale processes on port 3000**
   - Ran `lsof -ti:3000 | xargs kill -9` — no process was found occupying the port.

3. **Killed stale processes on port 5173**
   - Ran `lsof -ti:5173 | xargs kill -9` — no process was found occupying the port.

4. **Attempted to start on port 3000**
   - Ran `PORT=3000 npm run dev` — server still exited silently.

5. **Attempted to start on port 5173**
   - Ran `PORT=5173 npm run dev` — server still exited silently.

6. **Ran without the `--host` flag**
   - Ran `npx vite --host` — server still exited silently.

7. **Checked vite.config.ts**
   - Found `port: 3000` hardcoded in the Vite config. The config also had an `inspectAttr()` plugin from `kimi-plugin-inspect-react`.

8. **Killed all node processes**
   - Ran `pkill -f node` to clear any lingering processes, then tried restarting.

9. **Cleared Vite cache and node_modules cache**
   - Ran `rm -rf node_modules/.vite` to clear the Vite cache.

10. **Ran `npm run dev` normally (default config)**
    - Server exited silently again with no output.

### Current Status [SOLVED]
- The dev server crash has been fully resolved.
- **Root Cause**: Node.js/Vite was inheriting standard input (`stdin`) from the parent shell when started in background mode or via wrapper scripts (`run_full_dev.py`/`start.sh`). When standard streams detached or the runner script completed, Node.js attempted to read from stdin/reset stdio and crashed with `Error: read EIO` and assertion failures in `node::ResetStdio()`.
- **Resolution**: Added standard input redirection (`stdin=subprocess.DEVNULL` in Python, `< /dev/null` in bash) to decouple Vite and Node from the parent terminal session.

---

## Other Notes
- Both frontend (port 5173) and backend (port 9000) are running stably.
