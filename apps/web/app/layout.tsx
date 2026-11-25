import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Al Habib Bakery | Inventory', description: 'Bakery inventory and sales management', manifest: '/manifest.webmanifest', appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Al Habib Bakery' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#6f3b1e' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
