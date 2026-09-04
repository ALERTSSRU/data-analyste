// Force dynamic rendering so admin edits (profile, projects…) appear immediately
export const dynamic = 'force-dynamic';

import { HomeJourney } from '@/app/components/home/HomeJourney';
import { getCertifications, getEducation, getExperiences, getMetrics, getProfile, getProjects, getSkills } from '@/lib/portfolio';

export default async function Home() {
  const [profile, education, experiences, projects, certifications, skills, metrics] = await Promise.all([
    getProfile(),
    getEducation(),
    getExperiences(),
    getProjects(),
    getCertifications(),
    getSkills(),
    getMetrics(),
  ]);

  return (
    <HomeJourney
      profile={profile}
      education={education}
      experiences={experiences}
      projects={projects}
      certifications={certifications}
      skills={skills}
      metrics={metrics}
    />
  );
}
