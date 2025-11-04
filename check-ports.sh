#!/bin/bash

# Check for port conflicts before deploying AI Agent Manager
# Usage: ./check-ports.sh

echo "🔍 Checking for port conflicts..."
echo ""

# Default ports
BACKEND_PORT=${BACKEND_PORT:-4392}
FRONTEND_PORT=${FRONTEND_PORT:-8039}
POSTGRES_PORT=5432

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Port $port is IN USE${NC} (needed for $service)"
        lsof -Pi :$port -sTCP:LISTEN
        return 1
    else
        echo -e "${GREEN}✅ Port $port is AVAILABLE${NC} ($service)"
        return 0
    fi
}

# Check each port
echo "Checking backend port ($BACKEND_PORT)..."
check_port $BACKEND_PORT "Backend API"
BACKEND_STATUS=$?
echo ""

echo "Checking frontend port ($FRONTEND_PORT)..."
check_port $FRONTEND_PORT "Frontend"
FRONTEND_STATUS=$?
echo ""

echo "Checking PostgreSQL port ($POSTGRES_PORT)..."
check_port $POSTGRES_PORT "PostgreSQL"
POSTGRES_STATUS=$?
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $BACKEND_STATUS -eq 1 ] || [ $FRONTEND_STATUS -eq 1 ]; then
    echo -e "${RED}⚠️  PORT CONFLICTS DETECTED${NC}"
    echo ""
    echo "Solutions:"
    echo "1. Change ports in .env file:"
    echo "   BACKEND_PORT=4393"
    echo "   FRONTEND_PORT=8040"
    echo ""
    echo "2. Stop conflicting services"
    echo ""
    exit 1
fi

if [ $POSTGRES_STATUS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  PostgreSQL port 5432 is in use${NC}"
    echo ""
    echo "This is OK! The default docker-compose.yml uses an INTERNAL PostgreSQL"
    echo "that doesn't expose port 5432 to the host - no conflicts!"
    echo ""
    echo "Options:"
    echo "1. Use default docker-compose.yml (recommended)"
    echo "   → No port conflicts"
    echo ""
    echo "2. Use shared PostgreSQL"
    echo "   → See DEPLOYMENT.md for configuration"
    echo ""
else
    echo -e "${GREEN}✅ All ports available${NC}"
    echo ""
    echo "You're good to go! Deploy with:"
    echo "  docker-compose up -d"
    echo ""
fi

# Check Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Docker status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    docker --version

    if docker compose version &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose is installed${NC}"
        docker compose version
    else
        echo -e "${RED}❌ Docker Compose not found${NC}"
        echo "Install: https://docs.docker.com/compose/install/"
    fi
else
    echo -e "${RED}❌ Docker not found${NC}"
    echo "Install: https://docs.docker.com/get-docker/"
fi

echo ""
