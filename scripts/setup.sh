#!/bin/bash

echo "🚀 AiBuild X - Setup Script"
echo "============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Installing Backend Dependencies...${NC}"
cd /app/backend
pip install -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo -e "\n${YELLOW}Step 2: Installing Frontend Dependencies...${NC}"
cd /app/frontend
yarn install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo -e "\n${YELLOW}Step 3: Seeding Database...${NC}"
cd /app/backend
python seed_data.py
echo -e "${GREEN}✓ Database seeded${NC}"

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo -e "\n📋 Test Credentials:"
echo -e "   Super Admin: admin@aibuildx.com / admin123"
echo -e "   Marketing: marketing@aibuildx.com / marketing123"
echo -e "   Client Admin: john@techstruct.com / john123"
echo -e "   Client Engineer: jane@techstruct.com / jane123"
echo -e "\n🚀 Start the application:"
echo -e "   Backend: cd /app/backend && uvicorn server:app --host 0.0.0.0 --port 8001"
echo -e "   Frontend: cd /app/frontend && yarn start"
