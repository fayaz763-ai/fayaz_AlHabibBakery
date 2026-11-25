import { prisma } from '@/lib/db';
import { handleError, json, requireAdmin } from '@/lib/http';
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); const { id } = await params; await prisma.$transaction(async (tx) => { const sale = await tx.sale.findUniqueOrThrow({ where: { id } }); await tx.product.update({ where: { id: sale.productId }, data: { stock: { increment: sale.quantity } } }); await tx.sale.delete({ where: { id } }); }); return json({ success: true }); }
  catch (error) { return handleError(error); }
}
