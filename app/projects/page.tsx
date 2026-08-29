import { getProjects } from '@/lib/portfolio';
import { ProjectsPageClient } from './ProjectsPageClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsPageClient projects={projects} />;
}
