import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { handleError, json, makeToken, setSession, ApiError } from '@/lib/http';

const schema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().max(320), password: z.string().min(12).max(200) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, 'Provide a name, valid email, and password of at least 12 characters.');
    const { name, password } = parsed.data;
    const user = await prisma.user.create({ data: { name, email: parsed.data.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'user' }, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } });
    const token = await makeToken(user);
    return setSession(json({ user, token }, 201), token);
  } catch (error) { return handleError(error); }
}
