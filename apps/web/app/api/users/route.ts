import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';
const schema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().max(320), password: z.string().min(12).max(200), role: z.enum(['admin', 'user']).default('user') });
export async function GET() { try { await requireAdmin(); return json(await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }, orderBy: { createdAt: 'desc' } })); } catch (error) { return handleError(error); } }
export async function POST(request: Request) { try { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) throw new ApiError(400, 'Provide a valid name, email, password (12+ characters), and role.'); const d = parsed.data; const user = await prisma.user.create({ data: { name: d.name, email: d.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(d.password, 12), role: d.role }, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }); return json(user, 201); } catch (error) { return handleError(error); } }
