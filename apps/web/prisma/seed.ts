import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before seeding.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.admin, active: true, passwordHash },
    create: { name: 'Bakery Administrator', email, passwordHash, role: UserRole.admin },
  });
  console.log(`Administrator ready: ${email}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
