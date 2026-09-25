'use client';

import { ShieldCheck } from 'lucide-react';
import { useActionState } from 'react';
import { type LoginState, signIn } from './actions';

const initialState: LoginState = { error: '' };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="email"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          placeholder="admin@exemple.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-300 text-center"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500 transition duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{isPending ? 'Authentification...' : 'Se connecter'}</span>
      </button>
    </form>
  );
}
