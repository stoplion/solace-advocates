import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solace Candidate Assignment',
  description: 'Show us what you got',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`} style={{background: 'radial-gradient(#ffffff, #f1f7f5)'}}>{children}</body>
    </html>
  );
}
