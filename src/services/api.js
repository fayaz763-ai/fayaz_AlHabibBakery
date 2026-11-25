import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || '';
const TOKEN_KEY = 'bakery_api_token';
let token: string | null = null;

export async function getToken() { if (token) return token; token = await AsyncStorage.getItem(TOKEN_KEY); return token; }
export async function setToken(value: string | null) { token = value; if (value) await AsyncStorage.setItem(TOKEN_KEY, value); else await AsyncStorage.removeItem(TOKEN_KEY); }

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('Set EXPO_PUBLIC_API_URL to the deployed Next.js API URL before running the mobile app.');
  const authToken = await getToken();
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/api/${path.replace(/^\//, '')}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}
export function record(data: unknown) { return JSON.stringify(data); }
