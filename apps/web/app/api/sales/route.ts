import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin, ApiError } from '@/lib/http';
const dto = (sale: any) => ({ ...sale, quantity: Number(sale.quantity), unit_price: Number(sale.unitPrice), total_price: Number(sale.totalPrice), performedAt: sale.performedAt.toISOString(), unitPrice: undefined, totalPrice: undefined });
export async function GET() { try { await requireAdmin(); const sales = await prisma.sale.findMany({ include: { product: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } }, orderBy: { performedAt: 'desc' } }); return json(sales.map(dto)); } catch (error) { return handleError(error); } }
const schema = z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().positive(), unit_price: z.coerce.number().nonnegative(), performedAt: z.string().datetime().optional() });
export async function POST(request: Request) {
  try {
    const user = await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) throw new ApiError(400, 'Invalid sale data.'); const d = parsed.data;
    const sale = await prisma.$transaction(async (tx) => {
      const changed = await tx.product.updateMany({ where: { id: d.productId, stock: { gte: d.quantity } }, data: { stock: { decrement: d.quantity } } });
      if (!changed.count) throw new ApiError(409, 'Product not found or there is not enough stock.');
      return tx.sale.create({ data: { productId: d.productId, userId: user.id, quantity: d.quantity, unitPrice: d.unit_price, totalPrice: d.quantity * d.unit_price, performedAt: d.performedAt ? new Date(d.performedAt) : new Date() }, include: { product: { select: { id: true, name: true } } } });
    });
    return json(dto(sale), 201);
  } catch (error) { return handleError(error); }
}
