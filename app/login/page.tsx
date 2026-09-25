// Session lookup requires cookies: never prerender this page at build time.
export const dynamic = 'force-dynamic';

import { getServerUser } from '@/lib/supabase/server';
import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Connexion administrateur',
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  if (await getServerUser()) {
    redirect(safeNext(next));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060913] px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#0a0f1d] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-3">Terminal Administrateur</h1>
          <p className="text-xs text-slate-400 font-normal">Identifiez-vous pour gérer votre portfolio</p>
        </div>

        <LoginForm next={safeNext(next)} />
      </div>
    </main>
  );
}
