import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold">ITZALAN TECH – Automatización Legal</h1>
        <p className="mt-4 text-lg text-slate-600">
          Plataforma LegalTech con dashboard, CRM jurídico, expediente digital y agentes IA.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Frontend</h2>
            <p className="mt-2 text-slate-600">Next.js + Tailwind CSS + TypeScript.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Backend</h2>
            <p className="mt-2 text-slate-600">NestJS + API REST + autenticación JWT.</p>
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
