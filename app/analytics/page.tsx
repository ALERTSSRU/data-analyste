// Force dynamic rendering for real-time analytics dashboard
export const dynamic = 'force-dynamic';

import { getProfile, getProjects, getExperiences, getSkills, getCertifications } from '@/lib/portfolio';
import { AnalyticsDashboardClient } from './AnalyticsDashboardClient';

export default async function AnalyticsPage() {
  const [profile, projects, experiences, skills, certifications] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperiences(),
    getSkills(),
    getCertifications(),
  ]);

  return (
    <AnalyticsDashboardClient
      profile={profile}
      projects={projects}
      experiences={experiences}
      skills={skills}
      certifications={certifications}
    />
  );
}
