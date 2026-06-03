# QUORIN Environment Setup Guide

## 📋 Complete Environment Variables Reference

### Backend Environment Variables (`.env`)

#### Database Configuration
```env
# Database Connection String
# Format: postgresql://[username]:[password]@[host]:[port]/[database]
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
```

**Description**: PostgreSQL connection string for Prisma ORM.
- **username**: PostgreSQL username (create this user)
- **password**: PostgreSQL password (keep secure)
- **host**: Database server hostname (localhost for development)
- **port**: PostgreSQL port (default 5432)
- **database**: Database name (create this database)

**Production Value**: 
```env
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.railway.app:5432/quorin
```

---

#### Server Configuration
```env
# Node Environment
NODE_ENV=development
```

**Values**:
- `development` - Development with hot-reload, detailed errors
- `test` - Testing environment
- `production` - Production with optimizations

---

```env
# Server Port
PORT=3000
```

**Description**: Port where Express server runs.
- **Development**: 3000 (default)
- **Production**: Often behind reverse proxy (80/443)

---

#### CORS Configuration
```env
# Allowed Frontend URL for CORS
CORS_ORIGIN=http://localhost:5173
```

**Description**: Frontend URL that can access the backend API.

**Development Values**:
- `http://localhost:5173` - Local Vite frontend
- `http://localhost:3000` - Local static frontend
- `*` - Allow all (NOT recommended for production)

**Production Values**:
- `https://quorin.vercel.app` - Vercel deployment
- `https://quorin.com` - Custom domain
- Multiple URLs (comma-separated):
  ```env
  CORS_ORIGIN=https://quorin.vercel.app,https://www.quorin.com
  ```

---

### Frontend Environment Variables (`.env` or `.env.local`)

#### API Configuration
```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api
```

**Description**: Base URL for all API calls from frontend.

**Development**: `http://localhost:3000/api`
**Production**: `https://api.quorin.com/api`

---

### Environment Variable Summary Table

| Variable | Backend | Frontend | Required | Default | Stage |
|----------|---------|----------|----------|---------|-------|
| `NODE_ENV` | ✅ | - | Yes | development | Dev/Prod |
| `DATABASE_URL` | ✅ | - | Yes | - | Dev/Prod |
| `PORT` | ✅ | - | No | 3000 | Dev/Prod |
| `CORS_ORIGIN` | ✅ | - | No | * | Dev/Prod |
| `VITE_API_URL` | - | ✅ | No | /api | Dev/Prod |

---

## 🚀 Quick Setup Scripts

### Script 1: Complete Development Setup
```bash
#!/bin/bash
# setup-dev.sh - Complete development environment setup

set -e  # Exit on error

echo "🚀 QUORIN Development Setup"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking Prerequisites${NC}"

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 16+"
    exit 1
fi
print_status "Node.js found: $(node -v)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
fi
print_status "npm found: $(npm -v)"

if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Backend setup will fail."
    print_warning "Install PostgreSQL and try again."
fi

# Step 2: Backend Setup
echo -e "\n${YELLOW}Step 2: Setting up Backend${NC}"

if [ ! -d "backend" ]; then
    print_error "backend directory not found"
    exit 1
fi

cd backend

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Create .env file
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
PORT=3000
CORS_ORIGIN=http://localhost:5173
EOF
    print_warning "Created .env. Update DATABASE_URL if needed."
else
    print_status ".env file already exists"
fi

# Setup database
print_status "Setting up database..."
npm run db:setup

cd ..

# Step 3: Frontend Setup
echo -e "\n${YELLOW}Step 3: Setting up Frontend${NC}"

if [ ! -d "app" ]; then
    print_error "app directory not found"
    exit 1
fi

cd app

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Create .env.local file
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:3000/api
EOF
else
    print_status ".env.local file already exists"
fi

cd ..

# Step 4: Summary
echo -e "\n${GREEN}Setup Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Start Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In another terminal, Start Frontend:"
echo "   cd app && npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:5173"
echo ""
echo -e "${YELLOW}Troubleshooting:${NC}"
echo "- If database fails, ensure PostgreSQL is running"
echo "- Update DATABASE_URL in backend/.env if needed"
echo "- Check CORS_ORIGIN matches frontend URL"
```

---

### Script 2: Database Setup
```bash
#!/bin/bash
# setup-postgres.sh - PostgreSQL setup

set -e

echo "🗄️  PostgreSQL Setup"
echo "===================="

# Create PostgreSQL user and database
PGUSER=${1:-postgres}
PGHOST=${2:-localhost}

print_status() {
    echo "✓ $1"
}

print_error() {
    echo "✗ $1"
}

echo "Enter PostgreSQL admin password:"
read -s PGPASSWORD

export PGPASSWORD

# Create user
echo "Creating PostgreSQL user 'quorin'..."
psql -h $PGHOST -U $PGUSER -tc "SELECT 1 FROM pg_user WHERE usename = 'quorin'" | grep -q 1 || \
    psql -h $PGHOST -U $PGUSER -c "CREATE USER quorin WITH PASSWORD 'quorin';"

print_status "User created/exists"

# Create database
echo "Creating PostgreSQL database 'quorin'..."
psql -h $PGHOST -U $PGUSER -tc "SELECT 1 FROM pg_database WHERE datname = 'quorin'" | grep -q 1 || \
    psql -h $PGHOST -U $PGUSER -c "CREATE DATABASE quorin OWNER quorin;"

print_status "Database created/exists"

# Grant privileges
psql -h $PGHOST -U $PGUSER -c "GRANT ALL PRIVILEGES ON DATABASE quorin TO quorin;"

print_status "Privileges granted"

unset PGPASSWORD

echo "✅ PostgreSQL setup complete!"
```

---

### Script 3: Environment Validator
```bash
#!/bin/bash
# validate-env.sh - Check if environment is correctly configured

set -e

echo "🔍 Environment Validation"
echo "=========================="

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js $(node -v)"
else
    echo "✗ Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✓ npm $(npm -v)"
else
    echo "✗ npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "✓ backend/.env exists"
    
    # Check DATABASE_URL
    if grep -q "DATABASE_URL" backend/.env; then
        echo "  ✓ DATABASE_URL configured"
        DB_URL=$(grep "DATABASE_URL" backend/.env | cut -d'=' -f2)
        echo "    → $DB_URL"
    else
        echo "  ✗ DATABASE_URL not configured"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check CORS_ORIGIN
    if grep -q "CORS_ORIGIN" backend/.env; then
        echo "  ✓ CORS_ORIGIN configured"
        CORS=$(grep "CORS_ORIGIN" backend/.env | cut -d'=' -f2)
        echo "    → $CORS"
    else
        echo "  ✗ CORS_ORIGIN not configured"
    fi
else
    echo "✗ backend/.env not found"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend .env.local
if [ -f "app/.env.local" ]; then
    echo "✓ app/.env.local exists"
    
    if grep -q "VITE_API_URL" app/.env.local; then
        echo "  ✓ VITE_API_URL configured"
        API_URL=$(grep "VITE_API_URL" app/.env.local | cut -d'=' -f2)
        echo "    → $API_URL"
    else
        echo "  ✗ VITE_API_URL not configured"
    fi
else
    echo "ℹ app/.env.local not found (will use default)"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL client found"
else
    echo "✗ PostgreSQL client not found"
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed!"
else
    echo "⚠️  $ERRORS error(s) found. Please fix before proceeding."
fi
```

---

### Script 4: Windows PowerShell Setup
```powershell
# setup-dev.ps1 - Windows PowerShell setup

$ErrorActionPreference = "Stop"

Write-Host "🚀 QUORIN Development Setup (Windows)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check prerequisites
Write-Host "`n[Step 1] Checking Prerequisites" -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $(node -v)" -ForegroundColor Green

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm $(npm -v)" -ForegroundColor Green

# Backend setup
Write-Host "`n[Step 2] Setting up Backend" -ForegroundColor Yellow

Push-Location backend

Write-Host "✓ Installing backend dependencies..." -ForegroundColor Green
npm install

if (-not (Test-Path ".env")) {
    Write-Host "✓ Creating .env file..." -ForegroundColor Green
    @"
NODE_ENV=development
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
PORT=3000
CORS_ORIGIN=http://localhost:5173
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "✓ Setting up database..." -ForegroundColor Green
npm run db:setup

Pop-Location

# Frontend setup
Write-Host "`n[Step 3] Setting up Frontend" -ForegroundColor Yellow

Push-Location app

Write-Host "✓ Installing frontend dependencies..." -ForegroundColor Green
npm install

if (-not (Test-Path ".env.local")) {
    Write-Host "✓ Creating .env.local file..." -ForegroundColor Green
    @"
VITE_API_URL=http://localhost:3000/api
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
}

Pop-Location

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Start Backend: cd backend && npm run dev"
Write-Host "2. In another terminal, Start Frontend: cd app && npm run dev"
Write-Host "3. Open browser: http://localhost:5173"
```

---

## 📝 Manual Setup Steps

### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your database credentials
# Open backend/.env and configure:
# - DATABASE_URL (PostgreSQL connection string)
# - PORT (optional, default 3000)
# - CORS_ORIGIN (your frontend URL)

# 5. Setup database
npm run db:setup

# 6. Start development server
npm run dev
```

### Frontend Setup
```bash
# 1. Navigate to frontend
cd app

# 2. Install dependencies
npm install

# 3. Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# 4. Start frontend
npm run dev
```

---

## 🔐 Environment Variable Security

### DO NOT COMMIT
```
❌ Never commit .env files
❌ Never commit actual passwords
❌ Never commit database credentials
❌ Never commit API keys
```

### Use `.gitignore`
```
backend/.env
backend/.env.local
backend/.env.*.local
app/.env.local
app/.env.*.local
```

### Secure Production Values
```
✅ Use environment variables on hosting platform
✅ Use secrets manager (AWS Secrets Manager, etc.)
✅ Rotate credentials regularly
✅ Use strong random passwords
✅ Never hardcode sensitive values
```

---

## 🌐 Multi-Environment Configuration

### Development Environment
```env
NODE_ENV=development
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/quorin_dev
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Testing Environment
```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/quorin_test
PORT=3001
CORS_ORIGIN=http://localhost:5174
```

### Production Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_pass@prod-db.railway.app:5432/quorin
PORT=3000
CORS_ORIGIN=https://quorin.vercel.app,https://www.quorin.com
```

---

## 📊 Environment Variable Checklist

### Before Development
- [ ] Node.js 16+ installed
- [ ] npm 7+ installed
- [ ] PostgreSQL 12+ running
- [ ] PostgreSQL user created
- [ ] PostgreSQL database created
- [ ] backend/.env created with DATABASE_URL
- [ ] backend/.env created with CORS_ORIGIN
- [ ] app/.env.local created with VITE_API_URL
- [ ] `npm install` run in backend/
- [ ] `npm install` run in app/
- [ ] `npm run db:setup` completed

### Before First Run
- [ ] Backend DATABASE_URL points to running PostgreSQL
- [ ] Frontend VITE_API_URL matches backend PORT
- [ ] Backend CORS_ORIGIN matches frontend URL
- [ ] No .env files committed to git

### Before Production
- [ ] All credentials changed from defaults
- [ ] NODE_ENV set to production
- [ ] CORS_ORIGIN set to production domain
- [ ] Database URL points to production PostgreSQL
- [ ] Secrets stored in hosting platform
- [ ] HTTPS enabled (frontend and backend)
- [ ] Database backups configured

---

## 🆘 Troubleshooting

### "Cannot find module 'dotenv'"
```bash
# Solution: Install dependencies
cd backend
npm install
```

### "Database connection refused"
```bash
# Solution: Check PostgreSQL
psql -U postgres  # Test PostgreSQL connection
# If fails, start PostgreSQL service
```

### "CORS error from frontend"
```
Issue: XMLHttpRequest blocked by CORS
Solution: Update backend/.env
CORS_ORIGIN=<your-frontend-url>
```

### "API URL not found"
```
Issue: Frontend cannot reach backend
Solution: Check VITE_API_URL in app/.env.local
Should match: http://localhost:3000/api (dev)
```

---

## 📚 Environment Variable Files Location

```
quorin-site/
├── backend/
│   ├── .env                 ← Backend configuration
│   └── .env.example         ← Backend template
├── app/
│   └── .env.local           ← Frontend configuration
└── .env.example             ← Project template
```

---

*Generated: 2026-06-03*
