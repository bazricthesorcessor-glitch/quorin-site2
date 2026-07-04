# Vite Server Startup Issues - Troubleshooting Log

## Symptom
`npm run dev` starts the process but it exits silently before binding any port. No TypeScript errors (`tsc --noEmit` passes clean).

## Attempts Made

### 1. `npm run dev -- --host 0.0.0.0` (foreground)
Result: Process exits immediately, no output. Shell returns to prompt.

### 2. `npm run dev -- --host 0.0.0.0` (background with nohup)
Result: PID starts, dies within seconds, no port listening. Log file is empty.

### 3. `npx vite --host 0.0.0.0` (direct binary)
Result: Same silent exit, no port binding.

### 4. `npx tsc --noEmit` (TypeScript check)
Result: Clean - zero errors. TypeScript is not the cause.

### 5. `npx vite build`
Result: Silent exit, no build artifacts generated.

### 6. Checked vite.config.ts port setting
Result: Config has `server: { port: 3000 }` - server starts on 3000, not 5173.
Port 5173 check was a false negative because the config overrides the default.

### 7. Killed stale PIDs, purged .vite cache, npm install
Result: Node modules present, build tools functional.

## Current Status [SOLVED]
Resolved by decoupling the background Node.js/Vite processes from standard input using `stdin=subprocess.DEVNULL` in Python wrapper script and `< /dev/null` in bash startup script. This prevents the `EIO` read error on `ResetStdio()` when the parent shell detaches.
