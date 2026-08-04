const SOCIAL_META = {
  linkedin: { label: 'LinkedIn', icon: 'lni lni-linkedin' },
  github: { label: 'GitHub', icon: 'lni lni-github' },
  website: { label: 'Website', icon: 'lni lni-world' },
};

function splitName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

function mergeSocials(existing = [], socials = {}) {
  const imported = Object.entries(SOCIAL_META)
    .filter(([key]) => socials[key])
    .map(([key, meta]) => ({ ...meta, url: socials[key] }));
  const importedLabels = new Set(imported.map(item => item.label.toLowerCase()));
  return [...existing.filter(item => !importedLabels.has((item.label || '').toLowerCase())), ...imported];
}

export function mapResumeToPortfolio(current, resume) {
  const { firstName, lastName } = splitName(resume.basicInfo?.name);
  const experience = (resume.experience || []).map((item, index) => ({
    id: `resume-${Date.now()}-${index}`,
    year: item.date || '',
    title: item.title || '',
    company: item.company || '',
    location: item.location || '',
    description: item.description || '',
    technologies: [],
    achievements: item.bullets || [],
  }));

  return {
    ...current,
    ...(firstName && { first_name: firstName }),
    ...(lastName && { last_name: lastName }),
    ...(resume.basicInfo?.headline && { job_title: resume.basicInfo.headline }),
    ...(resume.basicInfo?.about && { about_me: resume.basicInfo.about }),
    ...(resume.basicInfo?.email && { email: resume.basicInfo.email }),
    ...(resume.basicInfo?.phone && { phone: resume.basicInfo.phone }),
    ...(resume.basicInfo?.location && { location: resume.basicInfo.location, city: resume.basicInfo.location.split(',')[0].trim() }),
    ...(resume.education?.[0]?.institution && { university: resume.education[0].institution }),
    social_links: mergeSocials(current.social_links, resume.socials),
    ...(resume.education?.length && { education: resume.education }),
    ...(experience.length && { experience }),
    ...(resume.projects?.length && { projects: resume.projects }),
    ...(resume.skills?.length && { categories: resume.skills, skills: resume.skills }),
    ...(resume.certifications?.length && { certifications: resume.certifications }),
    ...(resume.awards?.length && { awards: resume.awards }),
    ...(resume.languages?.length && { languages: resume.languages }),
    ...(resume.hobbies?.length && { hobbies: resume.hobbies.map(title => ({ title, description: '', demoUrl: '' })) }),
    ...(resume.volunteering?.length && { volunteering: resume.volunteering }),
  };
}
