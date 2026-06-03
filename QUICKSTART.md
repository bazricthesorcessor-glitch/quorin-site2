# QUORIN Environment Quick Reference

## 🎯 One-Liner Setup

### Linux/Mac
```bash
bash scripts/setup-dev.sh && bash scripts/setup-postgres.sh
```

### Windows PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
powershell -ExecutionPolicy Bypass -File scripts/setup-dev.ps1
```

---

## 📋 Environment Variables at a Glance

### Backend (.env)
```env
NODE_ENV=development              # development|test|production
DATABASE_URL=postgresql://...     # PostgreSQL connection string
PORT=3000                         # Server port
CORS_ORIGIN=http://localhost:5173 # Frontend URL
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000/api  # Backend API URL
```

---

## 🚀 Quick Start (5 Steps)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Edit DATABASE_URL
npm run db:setup
npm run dev
```

### 2. Frontend Setup (new terminal)
```bash
cd app
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

### 4. Test API
```bash
curl http://localhost:3000/api/products
```

### 5. View Database
```bash
cd backend
npm run prisma:studio
```

---

## 🔧 Common Tasks

### Change Database
```bash
# Update backend/.env
DATABASE_URL=postgresql://user:pass@host:port/db

# Run migrations
cd backend && npm run db:setup
```

### Change Frontend URL (CORS)
```bash
# Update backend/.env
CORS_ORIGIN=https://your-frontend.com

# Restart backend
cd backend && npm run dev
```

### Change Backend URL
```bash
# Update app/.env.local
VITE_API_URL=https://api.your-domain.com

# Rebuild frontend
cd app && npm run build
```

### Debug Database
```bash
cd backend
npm run prisma:studio
# Opens: http://localhost:5555
```

### Check Environment
```bash
bash scripts/validate-env.sh
```

---

## 🗄️ Database Setup

### Create PostgreSQL User & DB
```bash
# Option 1: Using script
bash scripts/setup-postgres.sh

# Option 2: Manual
psql -U postgres
CREATE USER quorin WITH PASSWORD 'quorin';
CREATE DATABASE quorin OWNER quorin;
GRANT ALL PRIVILEGES ON DATABASE quorin TO quorin;
```

### Verify Database
```bash
psql -U quorin -d quorin -h localhost
\dt        # List tables
\q         # Quit
```

---

## 📊 Environment Variables by Stage

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://quorin:quorin@localhost:5432/quorin
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Testing
```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/quorin_test
PORT=3001
CORS_ORIGIN=http://localhost:5174
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.railway.app:5432/quorin
PORT=3000
CORS_ORIGIN=https://quorin.vercel.app
```

---

## ✅ Pre-Development Checklist

- [ ] Node.js 16+ installed
- [ ] npm installed
- [ ] PostgreSQL 12+ running
- [ ] `backend/.env` created
- [ ] `app/.env.local` created
- [ ] DATABASE_URL updated
- [ ] `npm install` in backend/
- [ ] `npm install` in app/
- [ ] `npm run db:setup` completed
- [ ] Backend starts: `npm run dev`
- [ ] Frontend starts: `npm run dev`

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to database | Check DATABASE_URL and PostgreSQL is running |
| CORS error | Update CORS_ORIGIN in backend/.env |
| API not found | Check VITE_API_URL in app/.env.local |
| Port 3000 in use | Change PORT in backend/.env |
| Module not found | Run `npm install` in affected directory |
| PostgreSQL not found | Install PostgreSQL from postgresql.org |

---

## 📁 File Locations

```
quorin-site/
├── ENV-SETUP.md              ← Full documentation
├── scripts/
│   ├── setup-dev.sh          ← Linux/Mac setup
│   ├── setup-dev.ps1         ← Windows setup
│   ├── setup-postgres.sh     ← Database setup
│   └── validate-env.sh       ← Validation
├── backend/
│   ├── .env                  ← Backend config
│   ├── .env.example          ← Backend template
│   └── src/index.ts          ← Server entry
├── app/
│   └── .env.local            ← Frontend config
└── README.md                 ← Project README
```

---

## 📞 API Endpoints

### Test Connection
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-06-03T..."}
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Post Inquiry
```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

---

## 🎓 Resources

- Node.js: https://nodejs.org/
- PostgreSQL: https://www.postgresql.org/
- Express.js: https://expressjs.com/
- Prisma: https://www.prisma.io/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/

---

*Generated: 2026-06-03*
*QUORIN Premium Handcrafted Commerce Platform*
