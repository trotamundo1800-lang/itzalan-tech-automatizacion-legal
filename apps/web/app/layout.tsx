import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import Footer from './components/footer';
import Nav from './components/nav';

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const headingFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ITZALAN TECH – Automatización Legal',
  description: 'Plataforma LegalTech para abogados y empresas',
  icons: {
    icon: '/brand/itzalan-mark.svg',
    shortcut: '/brand/itzalan-mark.svg',
    apple: '/brand/itzalan-mark.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${bodyFont.variable} ${headingFont.variable} bg-slate-950 text-slate-50`}>
        <div className="min-h-screen">
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
