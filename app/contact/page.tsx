import { getProfile } from '@/lib/portfolio';
import { ContactPageClient } from './ContactPageClient';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const profile = await getProfile();

  return <ContactPageClient profile={profile} />;
}
