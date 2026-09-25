import { getServerUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/** Every public page that renders database content. */
const PUBLIC_PAGES = ['/', '/projects', '/experiences', '/certifications', '/about', '/analytics'];

/**
 * On-demand revalidation, called by the admin dashboard after a mutation
 * (and by the realtime listener while an admin is connected).
 *
 * Authenticated only: an unauthenticated caller could otherwise bust the cache
 * of the whole site in a loop. There is intentionally no GET handler, so a
 * trivial `<img src="/api/revalidate">` cannot trigger it either.
 */
export async function POST() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    revalidatePath('/', 'layout');
    PUBLIC_PAGES.forEach((page) => revalidatePath(page, 'page'));
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
  }
}
