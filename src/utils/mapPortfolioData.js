// Maps a Supabase portfolio record to the shape expected by portfolio components.

export function mapPortfolioData(portfolio) {
  if (!portfolio) return null;

  return {
    // For Hero / Navbar
    name: {
      firstname: portfolio.first_name || '',
      lastname: portfolio.last_name || '',
      profileImage: portfolio.profile_image_url || '',
      url: portfolio.resume_url || '',
    },
    company: {
      name: portfolio.company_name || '',
      logos: portfolio.company_logos || [],
    },
    backgroundImageUrl: portfolio.background_image_url || '',
    socialProfiles: portfolio.social_links || [],

    // For Typewriter
    typeWriterText: portfolio.typewriter_text || [],

    // For Achievement
    achievements: portfolio.achievements || [],
    jobTitle: portfolio.job_title || '',
    university: portfolio.university || '',

    // For Projects (hobbies slider)
    projectData: portfolio.hobbies || [],

    // For InteractiveTimeline
    experience: portfolio.experience || [],

    // For AboutMe
    aboutMeText: {
      infotext: portfolio.about_me || '',
    },
    email: portfolio.email || '',
    phone: portfolio.phone || '',
    city: portfolio.city || '',
    location: portfolio.location || '',

    // For ContactMe
    emailConfig: {
      serviceID: portfolio.emailjs_service_id || '',
      templateID: portfolio.emailjs_template_id || '',
      userID: portfolio.emailjs_public_key || '',
    },

    // Raw fields (used by dashboard, slug page title, etc.)
    slug: portfolio.slug || '',
    published: portfolio.published ?? true,
    // theme holds all customization settings; safe empty object if not yet set
    theme: portfolio.theme || {},
  };
}
