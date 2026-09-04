'use client';

import { supabase } from '@/lib/portfolio';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * RealtimeListener subscribes to Supabase Realtime database changes.
 * Whenever an admin updates data, it instantly revalidates Next.js router cache
 * and updates the UI for all connected visitors seamlessly without full page reload.
 */
export function RealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    const channel = client
      .channel('portfolio-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        async () => {
          try {
            await fetch('/api/revalidate', { method: 'POST' });
          } catch {}
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [router]);

  return null;
}
