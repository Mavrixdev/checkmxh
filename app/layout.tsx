import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { DevToolsGuard } from '@/components/dev-tools-guard'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let settings = null;

  try {
    const res = await fetch(`${API_URL}/api/public-settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch settings for metadata:', error);
  }

  const site = settings?.site || {
    title: 'MavrixCheck - Tra cứu danh tính',
    description: 'Hệ thống tra cứu thông tin số điện thoại, mạng xã hội và kiểm tra lừa đảo chuyên nghiệp',
    keywords: 'tra cứu số điện thoại, tra cứu mạng xã hội, kiểm tra lừa đảo, zalo, facebook, telegram',
    iconUrl: '/icon-favicon.png'
  };

  return {
    title: site.title,
    description: site.description,
    keywords: site.keywords,
    generator: 'Mavrixdev',
    icons: {
      icon: [
        {
          url: site.iconUrl || '/icon-favicon.png',
        },
      ],
      apple: site.iconUrl || '/apple-icon.png',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-950 text-slate-100">
        <Providers>
          <DevToolsGuard />
          <div className="animated-bg" />
          {children}
          <Toaster theme="dark" richColors position="top-right" />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
