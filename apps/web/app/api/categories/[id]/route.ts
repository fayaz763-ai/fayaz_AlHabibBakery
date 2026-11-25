import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';
const schema = z.object({ name: z.string().trim().min(1).max(120), description: z.string().max(1000).nullable().optional() });
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdmin(); const { id } = await params; const parsed = schema.partial().safeParse(await request.json()); if (!parsed.success) throw new ApiError(400, 'Invalid category data.'); return json(await prisma.category.update({ where: { id }, data: parsed.data })); } catch (error) { return handleError(error); } }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requireAdmin(); const { id } = await params; await prisma.category.delete({ where: { id } }); return json({ success: true }); } catch (error) { return handleError(error); } }
