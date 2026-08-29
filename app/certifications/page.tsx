import { getCertifications } from '@/lib/portfolio';
import { CertificationsPageClient } from './CertificationsPageClient';

export const dynamic = 'force-dynamic';

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return <CertificationsPageClient certifications={certifications} />;
}
