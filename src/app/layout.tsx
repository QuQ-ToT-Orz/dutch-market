import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleMapsProvider } from '@/components/GoogleMapsProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dutch Markets - Find Local Markets in Netherlands',
  description: 'Discover local markets in the Netherlands, their schedules, and recommended products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <GoogleMapsProvider>
            {children}
          </GoogleMapsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
