#!/bin/bash
# setup-dev.sh - Complete development environment setup for QUORIN

set -e  # Exit on error

echo "🚀 QUORIN Development Setup"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo -e "\n${YELLOW}$1${NC}"
    echo "---"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Step 1: Check prerequisites
print_section "Step 1: Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 16+"
    echo "Download from: https://nodejs.org/"
    exit 1
fi
print_status "Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_status "npm $(npm -v)"

# Optional: Check for psql
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found (recommended)"
    print_info "Install PostgreSQL from https://www.postgresql.org/download/"
fi

# Step 2: Backend Setup
print_section "Step 2: Setting up Backend"

if [ ! -d "$SCRIPT_DIR/backend" ]; then
    print_error "backend directory not found"
    exit 1
fi

cd "$SCRIPT_DIR/backend"

print_status "Installing backend dependencies..."
npm install --legacy-peer-deps

# Create .env file
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
PORT=3000
CORS_ORIGIN=http://localhost:5173
EOF
    print_warning "Created .env with default values"
    print_info "Update DATABASE_URL if PostgreSQL credentials are different"
else
    print_status ".env file already exists"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npm run prisma:generate

print_warning "Database setup will be done after configuration"

cd "$SCRIPT_DIR"

# Step 3: Frontend Setup
print_section "Step 3: Setting up Frontend"

if [ ! -d "$SCRIPT_DIR/app" ]; then
    print_error "app directory not found"
    exit 1
fi

cd "$SCRIPT_DIR/app"

print_status "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Create .env.local file
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:3000/api
EOF
else
    print_status ".env.local file already exists"
fi

cd "$SCRIPT_DIR"

# Step 4: Summary
print_section "Setup Complete!"

echo ""
echo -e "${BLUE}Environment Files Created:${NC}"
echo "  📄 backend/.env (configure DATABASE_URL)"
echo "  📄 app/.env.local"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1️⃣  Setup PostgreSQL:"
echo "   • Install PostgreSQL 12+"
echo "   • Create user 'quorin' with password 'quorin'"
echo "   • Create database 'quorin'"
echo ""
echo "   Or run: bash scripts/setup-postgres.sh"
echo ""
echo "2️⃣  Setup Database (after PostgreSQL is running):"
echo "   cd backend && npm run db:setup"
echo ""
echo "3️⃣  Start Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4️⃣  In another terminal, Start Frontend:"
echo "   cd app && npm run dev"
echo ""
echo "5️⃣  Open browser:"
echo "   http://localhost:5173"
echo ""
echo -e "${GREEN}✅ Ready to develop!${NC}"
