#!/bin/bash
# validate-env.sh - Validate environment configuration

echo "🔍 QUORIN Environment Validation"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check Node.js
echo ""
echo "Runtime Environment:"
if command -v node &> /dev/null; then
    print_pass "Node.js $(node -v)"
else
    print_fail "Node.js not found"
fi

if command -v npm &> /dev/null; then
    print_pass "npm $(npm -v)"
else
    print_fail "npm not found"
fi

# Check backend configuration
echo ""
echo "Backend Configuration:"

if [ -f "backend/.env" ]; then
    print_pass "backend/.env exists"
    
    # Check DATABASE_URL
    if grep -q "DATABASE_URL" backend/.env; then
        DB_URL=$(grep "DATABASE_URL" backend/.env | cut -d'=' -f2-)
        print_pass "DATABASE_URL configured"
        print_info "  $DB_URL"
        
        # Validate format
        if [[ $DB_URL =~ ^postgresql:// ]]; then
            print_pass "DATABASE_URL has correct format"
        else
            print_warn "DATABASE_URL format may be incorrect"
        fi
    else
        print_fail "DATABASE_URL not configured"
    fi
    
    # Check NODE_ENV
    if grep -q "NODE_ENV" backend/.env; then
        NODE_ENV=$(grep "NODE_ENV" backend/.env | cut -d'=' -f2)
        print_pass "NODE_ENV set to $NODE_ENV"
    else
        print_warn "NODE_ENV not configured (defaults to development)"
    fi
    
    # Check PORT
    if grep -q "PORT" backend/.env; then
        PORT=$(grep "PORT" backend/.env | cut -d'=' -f2)
        print_pass "PORT set to $PORT"
    else
        print_warn "PORT not configured (defaults to 3000)"
    fi
    
    # Check CORS_ORIGIN
    if grep -q "CORS_ORIGIN" backend/.env; then
        CORS=$(grep "CORS_ORIGIN" backend/.env | cut -d'=' -f2)
        print_pass "CORS_ORIGIN configured"
        print_info "  $CORS"
    else
        print_warn "CORS_ORIGIN not configured (defaults to *)"
    fi
else
    print_fail "backend/.env not found"
    print_info "Run: cp backend/.env.example backend/.env"
fi

# Check frontend configuration
echo ""
echo "Frontend Configuration:"

if [ -f "app/.env.local" ]; then
    print_pass "app/.env.local exists"
    
    if grep -q "VITE_API_URL" app/.env.local; then
        API_URL=$(grep "VITE_API_URL" app/.env.local | cut -d'=' -f2)
        print_pass "VITE_API_URL configured"
        print_info "  $API_URL"
    else
        print_warn "VITE_API_URL not configured (will use default /api)"
    fi
else
    print_warn "app/.env.local not found (will use defaults)"
fi

# Check backend dependencies
echo ""
echo "Backend Dependencies:"

if [ -d "backend/node_modules" ]; then
    print_pass "backend/node_modules exists"
else
    print_warn "backend/node_modules not found"
    print_info "Run: cd backend && npm install"
fi

# Check frontend dependencies
echo ""
echo "Frontend Dependencies:"

if [ -d "app/node_modules" ]; then
    print_pass "app/node_modules exists"
else
    print_warn "app/node_modules not found"
    print_info "Run: cd app && npm install"
fi

# Check Prisma
echo ""
echo "Database Configuration:"

if [ -f "backend/prisma/schema.prisma" ]; then
    print_pass "Prisma schema exists"
else
    print_fail "Prisma schema not found"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    print_pass "PostgreSQL client found"
else
    print_warn "PostgreSQL client not found"
    print_info "Install PostgreSQL to test database connection"
fi

# Security checks
echo ""
echo "Security Checks:"

if grep -q "password=" backend/.env 2>/dev/null; then
    if grep "password=quorin" backend/.env > /dev/null; then
        print_warn "Using default development password"
        print_info "Change this for production environments"
    fi
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        print_pass ".env files ignored in git"
    else
        print_warn ".env files may be committed to git"
    fi
fi

# Git configuration
echo ""
echo "Version Control:"

if [ -d ".git" ]; then
    print_pass "Git repository initialized"
    
    if command -v git &> /dev/null; then
        UNCOMMITTED=$(git status --porcelain | wc -l)
        if [ "$UNCOMMITTED" -gt 0 ]; then
            print_info "$UNCOMMITTED uncommitted changes"
        else
            print_pass "No uncommitted changes"
        fi
    fi
else
    print_warn "Not a git repository"
fi

# Summary
echo ""
echo "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready. Start developing:"
    echo "  cd backend && npm run dev"
    echo "  (in another terminal) cd app && npm run dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo ""
    echo "You can continue, but fix warnings for optimal setup"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    echo ""
    echo "Please fix these errors before continuing"
    exit 1
fi
