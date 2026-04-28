import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { cookies } from 'next/headers';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import ToastSoundPlayer from '@/components/common/ToastSoundPlayer';
import ImpersonationBanner from '@/components/admin/ImpersonationBanner';
import { ConnectivityProvider } from '@/context/ConnectivityContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const viewport = {
  themeColor: '#FFD700',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'GoldMine Pro - Digital Gold Mining Platform',
  description: 'Mine digital gold, earn rewards, and withdraw monthly. Start your mining journey today!',
  keywords: 'gold mining, digital gold, mining platform, earn gold, crypto mining',
  authors: [{ name: 'GoldMine Pro' }],
  creator: 'GoldMine Pro',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GoldMine Pro',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'GoldMine Pro',
    title: 'GoldMine Pro - Digital Gold Mining Platform',
    description: 'Mine digital gold, earn rewards, and withdraw monthly.',
    images: ['/og-image.png'],
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('admin-impersonator-token');

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/splash/splash.png" />
      </head>
      <body className={`bg-slate-50 text-dark-50 font-sans antialiased overflow-x-hidden ${isImpersonating ? 'impersonating' : ''}`} suppressHydrationWarning>
        <AuthProvider>
          <ConnectivityProvider>
            <ImpersonationBanner initialIsImpersonating={isImpersonating} />
            {/* Global Sound Listener for Toasts */}
            <ToastSoundPlayer />

            {/* PWA Install Prompt - Top Header Bar for Mobile */}
            <PWAInstallPrompt />

            {/* PWA Status Bar Spacer */}
            <div className="pwa-status-bar" />

            {/* Offline Indicator */}
            <OfflineIndicator />

            {/* Main Content */}
            {children}

            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
                success: {
                  iconTheme: { primary: '#E6B800', secondary: '#ffffff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
                },
              }}
            />
          </ConnectivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}