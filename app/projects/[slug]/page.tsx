import { getProjectBySlug } from '@/lib/portfolio';
import { notFound } from 'next/navigation';
import { ProjectDetailPageClient } from './ProjectDetailPageClient';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailPageClient project={project} />;
}
