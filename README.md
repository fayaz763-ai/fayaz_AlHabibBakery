# Al Habib Bakery — Next.js + PostgreSQL and Expo Mobile

This feature branch adds a full-stack Next.js App Router application with PostgreSQL (Prisma) and keeps the existing Expo React Native app as a native Android/iOS client. Both clients use the same authenticated API and shared database. The Next.js web UI is responsive and installable as a PWA.

## Stack
- Next.js App Router and Route Handlers: `apps/web`
- PostgreSQL with Prisma schema/migrations: `apps/web/prisma`
- Password hashing (bcrypt), signed sessions (JWT), Zod validation, and role-based API access
- Existing Expo / React Native mobile application at repository root

## Local setup
1. Install PostgreSQL and create an empty database named `al_habib_bakery`.
2. Copy `apps/web/.env.example` to `apps/web/.env`, set `DATABASE_URL`, and set a random `JWT_SECRET` of 32+ characters. Change the admin credentials to a strong password of at least 12 characters.
3. Install and initialize the Next app:
   ```bash
   cd apps/web
   npm install
   npx prisma migrate dev --name init
   npm run db:seed
   npm run dev
   ```
4. Open http://localhost:3000 and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment file.
5. For the Expo app, install root dependencies (`npm install`) and set `EXPO_PUBLIC_API_URL` to the reachable Next.js URL. On a physical phone, use your computer's LAN IP (not `localhost`) and ensure the device can access it.
   ```bash
   npm start
   ```

The mobile application should connect to the hosted HTTPS API in production. Never put `DATABASE_URL` or `JWT_SECRET` in Expo environment variables: those are server-only secrets.

## API routes
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`, `PATCH /api/auth/me` (change password)
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`
- `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`
- `GET/POST /api/sales`, `DELETE /api/sales/:id`
- `GET/POST /api/users`, `PUT/DELETE /api/users/:id`

All inventory routes require an active session; management and sales routes are admin-only. Public registration always creates a regular user. Use seeded admin or the protected user management route to grant administrator access. Sale creation and deletion update stock transactionally in PostgreSQL. Deleting a product removes its associated sales in the same transaction.

## Hosting
Deploy `apps/web` as the Next.js application (e.g. Vercel) and provide `DATABASE_URL` and `JWT_SECRET` as server environment variables. Run `prisma migrate deploy` during deployment. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the one-time seed command. Configure Expo's `EXPO_PUBLIC_API_URL` to the deployed HTTPS origin and rebuild the mobile app.

The previous `build:web` Expo web build remains available. The Next app has its own package and can be run via `npm run web:next` from the root after dependencies are installed in `apps/web`.
