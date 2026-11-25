# Next.js bakery application

This directory is an independent Next.js app and API. Run `npm install` here, configure `.env` using `.env.example` at this directory's parent, then apply Prisma migrations and seed the administrator from the repository root or this directory.

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```
