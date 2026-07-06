# Quorin Site 2 - Production Deployment

## Deployed Services
- Frontend: https://quorin-site2-sable.vercel.app (Vercel)
- Backend: https://quorin-backend.onrender.com (Render)
- Database: Neon PostgreSQL

## Changes Made
1. Updated render.yaml with broader CORS and fixed start command
2. Fixed medusa-config.js redisUrl to not default to localhost
3. Created Render web service quorin-backend with correct env vars
4. Deployed frontend to Vercel from app/ directory
5. Updated CORS on Render to include Vercel domain
6. Generated and seeded publishable API key linked to QUORIN Store sales channel
7. Updated VITE_MEDUSA_PUBLISHABLE_KEY on Vercel

## API Key
- Token: pk_3f56348530a9e49f897c3a8d640ae5e7ca3b7bb867575f069067ed49624ae933
- Linked to: QUORIN Store sales channel

## Status
- Backend health: OK
- Products: 16 seeded
- Regions: India (INR)
- Frontend loads: Yes
