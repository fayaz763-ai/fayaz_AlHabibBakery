import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { handleError, json, makeToken, setSession, ApiError } from '@/lib/http';

const schema = z.object({ email: z.string().email().max(320), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, 'Enter a valid email and password.');
    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password.');
    const { passwordHash, ...safeUser } = user;
    const token = await makeToken(user);
    const response = json({ user: safeUser, token });
    return setSession(response, token);
  } catch (error) { return handleError(error); }
}
