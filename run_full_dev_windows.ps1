<#
run_full_dev_windows.ps1

PowerShell script for Windows 11 to:
- create/use a Python venv and install Python requirements (if any)
- install Node.js/npm via winget (preferred) or Chocolatey (fallback)
- run npm install and start the Vite dev server
- open the default browser to http://localhost:5173 when ready

Usage: Run in an elevated (Administrator) PowerShell or regular PowerShell where you can install packages.
  .\run_full_dev_windows.ps1
#>

param(
    [int]$Port = 5173,
    [string]$Url = "http://localhost:5173/"
)

function Log($m){
    $t = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$t] $m"
    Write-Output $line
    $line | Out-File -FilePath run_full_dev_windows.log -Append -Encoding utf8
}

Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$root = Get-Location
Log "Starting run_full_dev_windows.ps1 in $root"

# 1) Create or reuse Python venv
$venv = Join-Path $root '.venv'
if (-Not (Test-Path $venv)) {
    Log "Creating Python venv at $venv"
    python -m venv $venv 2>&1 | Out-Null
} else {
    Log "Using existing venv at $venv"
}

# Select pip/python inside venv
$pythonExe = Join-Path $venv 'Scripts\python.exe'
$pipExe = Join-Path $venv 'Scripts\pip.exe'
if (-Not (Test-Path $pythonExe)) {
    # fallback to system python
    $pythonExe = (Get-Command python -ErrorAction SilentlyContinue).Source
    if (-Not $pythonExe) { Log "Python not found. Please install Python 3 and re-run."; exit 1 }
}

# Install Python requirements if present
$req = Join-Path $root 'requirements.txt'
if (Test-Path $req) {
    Log "Installing Python requirements via $pipExe"
    & $pipExe install -r $req | Tee-Object -FilePath run_full_dev_windows.log -Append
} else {
    Log "No requirements.txt found; skipping Python deps"
}

# 2) Ensure Node/npm available (winget preferred)
function Ensure-Node {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Log "Node found: $(node --version)"
        return $true
    }

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Log "Attempting to install Node.js LTS via winget (requires admin)"
        try {
            Start-Process -FilePath winget -ArgumentList 'install','--id','OpenJS.NodeJS.LTS','-e','--silent' -Wait -NoNewWindow
            Start-Sleep -Seconds 2
            if (Get-Command node -ErrorAction SilentlyContinue) { Log "Node installed via winget"; return $true }
        } catch {
            Log "winget install failed: $_"
        }
    }

    # Chocolatey fallback
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Log "Attempting to install nodejs-lts via Chocolatey (requires admin)"
        try {
            choco install nodejs-lts -y | Tee-Object -FilePath run_full_dev_windows.log -Append
            Start-Sleep -Seconds 2
            if (Get-Command node -ErrorAction SilentlyContinue) { Log "Node installed via choco"; return $true }
        } catch {
            Log "choco install failed: $_"
        }
    }

    Log "Could not auto-install Node. Please install Node.js LTS via https://nodejs.org/ or winget/choco and re-run."
    return $false
}

if (-Not (Ensure-Node)) { exit 1 }

# Refresh PATH in this session if node is in Program Files but not yet on PATH
if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
    $nodefolder = 'C:\Program Files\nodejs'
    if (Test-Path $nodefolder) {
        $env:Path = "$nodefolder;" + $env:Path
        Log "Added $nodefolder to PATH for current session"
    }
}

Log "Node version: $(node --version)"
Log "npm version: $(npm --version)"

# 3) npm install and start dev server
# find package.json at root or app/
$pkgRoot = $root
if (-Not (Test-Path (Join-Path $pkgRoot 'package.json'))) {
    if (Test-Path (Join-Path $root 'app' 'package.json')) { $pkgRoot = Join-Path $root 'app' }
    else { Log "package.json not found in project root or app/"; exit 1 }
}

Log "Running npm install in $pkgRoot"
Push-Location $pkgRoot
npm install --silent | Tee-Object -FilePath run_full_dev_windows.log -Append

# Determine start command from package.json
$pkgJson = Get-Content -Raw -Path (Join-Path $pkgRoot 'package.json') | ConvertFrom-Json
$startCmd = 'npm run dev -- --host 0.0.0.0 --port ' + $Port
if ($pkgJson.scripts.start -and -Not $pkgJson.scripts.dev) { $startCmd = 'npm run start' }

# Start dev server in background
Log "Starting dev server: $startCmd (cwd=$pkgRoot)"
# Use cmd.exe to start detached process on Windows
$logFile = Join-Path $root 'run_full_dev_windows.log'
$startInfo = "cmd /c start /B cmd /c \"$startCmd > \"$logFile\" 2>&1\""
Start-Process -FilePath cmd -ArgumentList '/c','start','/B','cmd','/c',$startCmd -WorkingDirectory $pkgRoot

# Wait for server to respond
function Wait-For-Url($url, $timeoutSec=180) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($r.StatusCode -eq 200) { return $true }
        } catch { }
        Start-Sleep -Seconds 1
    }
    return $false
}

$up = Wait-For-Url -url $Url -timeoutSec 180
if (-Not $up) { Log "Dev server did not become available at $Url. Check run_full_dev_windows.log"; exit 1 }

# Open default browser
Log "Opening browser to $Url"
# Copy to clipboard for convenience
try {
    Set-Clipboard -Value $Url
    Log "Copied URL to clipboard (Set-Clipboard)"
} catch {
    Log "Set-Clipboard not available or failed: $_"
}
Start-Process $Url

Pop-Location
Log "run_full_dev_windows.ps1 finished"
