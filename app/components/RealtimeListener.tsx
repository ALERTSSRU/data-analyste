'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Keeps every open admin dashboard in sync when the database changes, and
 * invalidates the cached public pages through /api/revalidate.
 *
 * Mounted from the admin dashboard only: an anonymous visitor has no session,
 * so subscribing from the public layout used to spam an authenticated endpoint
 * (and re-render every visitor's page) for nothing.
 *
 * Requires Realtime to be enabled for the synced tables in the Supabase
 * dashboard (Database > Replication).
 */
export function RealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('portfolio-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
        try {
          await fetch('/api/revalidate', { method: 'POST' });
        } catch {}
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
