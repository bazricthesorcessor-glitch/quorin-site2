# setup-dev.ps1 - Windows PowerShell setup for QUORIN

Write-Host "🚀 QUORIN Development Setup (Windows)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Functions
function Print-Status {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Print-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host $Title -ForegroundColor Yellow
    Write-Host "---" -ForegroundColor Yellow
}

# Step 1: Check prerequisites
Print-Section "[Step 1] Checking Prerequisites"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Print-Error "Node.js not found"
    Print-Info "Download from https://nodejs.org/"
    exit 1
}
Print-Status "Node.js $(node --version)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Print-Error "npm not found"
    exit 1
}
Print-Status "npm $(npm --version)"

# Step 2: Backend Setup
Print-Section "[Step 2] Setting up Backend"

if (-not (Test-Path "backend")) {
    Print-Error "backend directory not found"
    exit 1
}

Push-Location backend

Print-Status "Installing backend dependencies..."
npm install --legacy-peer-deps

# Create .env file
if (-not (Test-Path ".env")) {
    Print-Status "Creating .env file..."
    @"
NODE_ENV=development
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
PORT=3000
CORS_ORIGIN=http://localhost:5173
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Print-Warning "Created .env with default values"
    Print-Info "Update DATABASE_URL if PostgreSQL credentials are different"
}
else {
    Print-Status ".env file already exists"
}

# Generate Prisma client
Print-Status "Generating Prisma client..."
npm run prisma:generate

Print-Warning "Database setup will be done after configuration"

Pop-Location

# Step 3: Frontend Setup
Print-Section "[Step 3] Setting up Frontend"

if (-not (Test-Path "app")) {
    Print-Error "app directory not found"
    exit 1
}

Push-Location app

Print-Status "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Create .env.local file
if (-not (Test-Path ".env.local")) {
    Print-Status "Creating .env.local file..."
    @"
VITE_API_URL=http://localhost:3000/api
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}
else {
    Print-Status ".env.local file already exists"
}

Pop-Location

# Step 4: Summary
Print-Section "Setup Complete!"

Write-Host ""
Write-Host "Environment Files Created:" -ForegroundColor Cyan
Write-Host "  📄 backend\.env (configure DATABASE_URL)"
Write-Host "  📄 app\.env.local"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Setup PostgreSQL:"
Write-Host "   • Install PostgreSQL 12+"
Write-Host "   • Create user 'quorin' with password 'quorin'"
Write-Host "   • Create database 'quorin'"
Write-Host ""
Write-Host "2️⃣  Setup Database (after PostgreSQL is running):"
Write-Host "   cd backend && npm run db:setup"
Write-Host ""
Write-Host "3️⃣  Start Backend:"
Write-Host "   cd backend && npm run dev"
Write-Host ""
Write-Host "4️⃣  In another terminal, Start Frontend:"
Write-Host "   cd app && npm run dev"
Write-Host ""
Write-Host "5️⃣  Open browser:"
Write-Host "   http://localhost:5173"
Write-Host ""
Write-Host "✅ Ready to develop!" -ForegroundColor Green
