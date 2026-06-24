import './globals.css';
import type { Metadata } from 'next';
import Footer from './components/footer';
import Nav from './components/nav';

export const metadata: Metadata = {
  title: 'ITZALAN TECH – Automación Legal',
  description: 'Plataforma LegalTech para abogados y empresas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen">
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
