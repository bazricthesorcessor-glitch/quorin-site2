#!/bin/bash
# setup-postgres.sh - PostgreSQL setup for QUORIN

set -e

echo "🗄️  PostgreSQL Setup for QUORIN"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL not found"
    echo "Install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

print_status "PostgreSQL found: $(psql --version)"

# Get PostgreSQL admin user
read -p "PostgreSQL admin username (default: postgres): " PGUSER
PGUSER=${PGUSER:-postgres}

# Get host
read -p "PostgreSQL host (default: localhost): " PGHOST
PGHOST=${PGHOST:-localhost}

# Get port
read -p "PostgreSQL port (default: 5432): " PGPORT
PGPORT=${PGPORT:-5432}

print_warning "Enter PostgreSQL admin password"
read -s PGPASSWORD

export PGPASSWORD

# Test connection
if ! psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tc "SELECT 1" > /dev/null 2>&1; then
    print_error "Cannot connect to PostgreSQL"
    print_error "Check host, port, and credentials"
    exit 1
fi

print_status "Connected to PostgreSQL"

# Create user if not exists
echo ""
echo "Creating QUORIN database user..."
USER_EXISTS=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tc "SELECT 1 FROM pg_user WHERE usename = 'quorin'" | grep -c "1" || echo "0")

if [ "$USER_EXISTS" = "0" ]; then
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" << SQL
CREATE USER quorin WITH PASSWORD 'quorin';
SQL
    print_status "User 'quorin' created"
else
    print_status "User 'quorin' already exists"
fi

# Create database if not exists
echo ""
echo "Creating QUORIN database..."
DB_EXISTS=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tc "SELECT 1 FROM pg_database WHERE datname = 'quorin'" | grep -c "1" || echo "0")

if [ "$DB_EXISTS" = "0" ]; then
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" << SQL
CREATE DATABASE quorin OWNER quorin;
SQL
    print_status "Database 'quorin' created"
else
    print_status "Database 'quorin' already exists"
fi

# Grant privileges
echo ""
echo "Granting privileges..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" << SQL
GRANT ALL PRIVILEGES ON DATABASE quorin TO quorin;
SQL

print_status "Privileges granted"

unset PGPASSWORD

# Show connection string
echo ""
echo -e "${GREEN}✅ PostgreSQL setup complete!${NC}"
echo ""
echo -e "${YELLOW}Connection String:${NC}"
echo "postgresql://quorin:quorin@$PGHOST:$PGPORT/quorin"
echo ""
echo -e "${YELLOW}Next: Update backend/.env with this connection string${NC}"
