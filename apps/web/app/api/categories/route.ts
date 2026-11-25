import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';
const schema = z.object({ name: z.string().trim().min(1).max(120), description: z.string().max(1000).nullable().optional() });
export async function GET() { try { await requireAdmin(); return json(await prisma.category.findMany({ orderBy: { name: 'asc' } })); } catch (error) { return handleError(error); } }
export async function POST(request: Request) { try { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) throw new ApiError(400, 'A category name is required.'); return json(await prisma.category.create({ data: parsed.data }), 201); } catch (error) { return handleError(error); } }
