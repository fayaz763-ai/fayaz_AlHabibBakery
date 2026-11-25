import { currentUser, handleError, json, requireUser } from '@/lib/http';
export async function GET() {
  try { const user = await currentUser(); return user ? json({ user }) : json({ user: null }, 401); }
  catch (error) { return handleError(error); }
}
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const bcrypt = await import('bcryptjs');
    if (typeof body.currentPassword !== 'string' || typeof body.password !== 'string' || body.password.length < 12) return json({ error: 'Enter the current password and a new password of at least 12 characters.' }, 400);
    const existing = await (await import('@/lib/db')).prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await bcrypt.default.compare(body.currentPassword, existing.passwordHash))) return json({ error: 'Current password is incorrect.' }, 400);
    await (await import('@/lib/db')).prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.default.hash(body.password, 12) } });
    return json({ success: true });
  } catch (error) { return handleError(error); }
}
