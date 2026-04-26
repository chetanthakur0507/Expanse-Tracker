#!/bin/bash

echo "🚀 Finance Tracker Setup Starting..."
echo "======================================"

# Backend setup
echo ""
echo "📦 Backend dependencies install ho rahi hain..."
cd backend
npm install
echo "✅ Backend ready!"

# Frontend setup
echo ""
echo "📦 Frontend dependencies install ho rahi hain..."
cd ../frontend
npm install
echo "✅ Frontend ready!"

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. MongoDB Atlas setup karo:"
echo "   - mongodb.com/atlas pe free account banao"
echo "   - New cluster create karo (M0 Free Tier)"
echo "   - Database user banao (username + password)"
echo "   - Network Access mein 0.0.0.0/0 allow karo"
echo "   - Connection string copy karo"
echo ""
echo "2. backend/.env file mein update karo:"
echo "   MONGO_URI=<tumhara connection string>"
echo "   JWT_SECRET=<kuch bhi random likho>"
echo ""
echo "3. Two terminals mein run karo:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Browser mein open karo: http://localhost:5173"
echo ""
echo "Happy Coding! 🎉"
