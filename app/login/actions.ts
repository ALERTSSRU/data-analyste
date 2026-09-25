'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type LoginState = { error: string };

/**
 * Only same-origin absolute paths are accepted as post-login redirect targets,
 * so a crafted `?next=//evil.com` cannot turn the login page into an open redirect.
 */
function safeRedirectTarget(value: unknown): string {
  if (typeof value !== 'string') return '/admin';
  if (!value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeRedirectTarget(formData.get('next'));

  if (!email || !password) {
    return { error: 'Email et mot de passe sont requis.' };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: 'Supabase n’est pas configuré (voir .env.example).' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately identical for unknown user / wrong password.
    return { error: 'Identifiants invalides.' };
  }

  // `redirect` throws, so it must stay outside the try/catch of callers.
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect('/login');
}
