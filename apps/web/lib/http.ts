import { cookies, headers } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/db';

const COOKIE = 'bakery_session';
const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters.');
  return new TextEncoder().encode(value);
};

export async function makeToken(user: { id: string; role: string }) {
  return new SignJWT({ role: user.role }).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret());
}

export async function currentUser() {
  const headerList = await headers();
  const bearer = headerList.get('authorization')?.replace(/^Bearer\s+/i, '');
  const cookieJar = await cookies();
  const token = bearer || cookieJar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } }).then((user) => user?.active ? user : null);
  } catch { return null; }
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, 'Please sign in.');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new ApiError(403, 'Administrator access required.');
  return user;
}

export function setSession(response: Response, token: string) {
  response.headers.append('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
  return response;
}

export function clearSession(response: Response) {
  response.headers.append('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
  return response;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return json({ error: 'A record with that value already exists.' }, 409);
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') return json({ error: 'Record not found.' }, 404);
  console.error(error);
  return json({ error: 'An unexpected server error occurred.' }, 500);
}

export function productDto(product: any) {
  return { ...product, price: Number(product.price), stock: Number(product.stock), expiry_date: product.expiryDate?.toISOString().slice(0, 10) ?? null, image_uri: product.imageUri, product_category_id: product.categoryId, expiryDate: undefined, imageUri: undefined, categoryId: undefined };
}

export function saleDto(sale: any) {
  return { ...sale, quantity: Number(sale.quantity), unit_price: Number(sale.unitPrice), total_price: Number(sale.totalPrice), productId: sale.productId, performedAt: sale.performedAt.toISOString(), unitPrice: undefined, totalPrice: undefined };
}
