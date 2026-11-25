import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';

const productSchema = z.object({ name: z.string().trim().min(1).max(180), price: z.coerce.number().min(0).max(9999999999), stock: z.coerce.number().int().min(0).max(2147483647), location: z.string().max(100).nullable().optional(), expiry_date: z.string().date().nullable().optional(), product_category_id: z.string().uuid().nullable().optional(), image_uri: z.string().max(2000000).nullable().optional() });
const include = { category: { select: { id: true, name: true } } } as const;
export async function GET() {
  try { await requireAdmin(); const products = await prisma.product.findMany({ include, orderBy: { name: 'asc' } }); return json(products.map((p) => ({ ...p, price: Number(p.price), expiry_date: p.expiryDate?.toISOString().slice(0, 10) ?? null, image_uri: p.imageUri, product_category_id: p.categoryId, expiryDate: undefined, imageUri: undefined, categoryId: undefined }))); }
  catch (error) { return handleError(error); }
}
export async function POST(request: Request) {
  try {
    await requireAdmin(); const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) throw new ApiError(400, 'Invalid product data. Check name, price, stock, and category.');
    const d = parsed.data;
    const product = await prisma.product.create({ data: { name: d.name, price: d.price, stock: d.stock, location: d.location || null, expiryDate: d.expiry_date ? new Date(`${d.expiry_date}T00:00:00.000Z`) : null, categoryId: d.product_category_id || null, imageUri: d.image_uri || null }, include });
    return json({ ...product, price: Number(product.price), expiry_date: product.expiryDate?.toISOString().slice(0, 10) ?? null, image_uri: product.imageUri, product_category_id: product.categoryId, expiryDate: undefined, imageUri: undefined, categoryId: undefined }, 201);
  } catch (error) { return handleError(error); }
}
