import { clearSession, json } from '@/lib/http';
export async function POST() { return clearSession(json({ success: true })); }
