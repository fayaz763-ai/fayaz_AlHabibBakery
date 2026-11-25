import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';

const schema = z.object({ name: z.string().trim().min(1).max(180), price: z.coerce.number().min(0).max(9999999999), stock: z.coerce.number().int().min(0).max(2147483647), location: z.string().max(100).nullable().optional(), expiry_date: z.string().date().nullable().optional(), product_category_id: z.string().uuid().nullable().optional(), image_uri: z.string().max(2000000).nullable().optional() });
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await params; const p = await prisma.product.findUniqueOrThrow({ where: { id }, include: { category: true } }); return json({ ...p, price: Number(p.price), expiry_date: p.expiryDate?.toISOString().slice(0, 10) ?? null, image_uri: p.imageUri, product_category_id: p.categoryId, expiryDate: undefined, imageUri: undefined, categoryId: undefined }); }
  catch (error) { return handleError(error); }
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await params; const parsed = schema.partial().safeParse(await request.json()); if (!parsed.success) throw new ApiError(400, 'Invalid product data.'); const d = parsed.data; const product = await prisma.product.update({ where: { id }, data: { ...(d.name !== undefined && { name: d.name }), ...(d.price !== undefined && { price: d.price }), ...(d.stock !== undefined && { stock: d.stock }), ...(d.location !== undefined && { location: d.location }), ...(d.expiry_date !== undefined && { expiryDate: d.expiry_date ? new Date(`${d.expiry_date}T00:00:00.000Z`) : null }), ...(d.product_category_id !== undefined && { categoryId: d.product_category_id }), ...(d.image_uri !== undefined && { imageUri: d.image_uri }) }, include: { category: true } }); return json({ ...product, price: Number(product.price), expiry_date: product.expiryDate?.toISOString().slice(0, 10) ?? null, image_uri: product.imageUri, product_category_id: product.categoryId, expiryDate: undefined, imageUri: undefined, categoryId: undefined }); }
  catch (error) { return handleError(error); }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await params; await prisma.$transaction(async (tx) => { await tx.sale.deleteMany({ where: { productId: id } }); await tx.product.delete({ where: { id } }); }); return json({ success: true }); }
  catch (error) { return handleError(error); }
}
