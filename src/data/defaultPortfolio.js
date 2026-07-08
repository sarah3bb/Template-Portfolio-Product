// Default portfolio data for new users.
// Replace all placeholder text with your own content via the dashboard.

const defaultPortfolio = {
  slug: 'my-portfolio',
  published: true,

  first_name: 'Your',
  last_name: 'Name',
  job_title: 'Your Job Title',
  company_name: 'Your Company',
  company_logos: [],
  email: 'you@example.com',
  phone: '+1 234 567 890',
  city: 'Your City',
  location: 'Your City, Country',

  profile_image_url: '',
  background_image_url: '',
  resume_url: '',

  about_me: `Write something about yourself here.\n\nTell visitors who you are, what you do, and what makes you unique.`,

  university: 'Your University',
  education: [],
  experience: [
    {
      id: 1,
      year: '2023 - Present',
      title: 'Your Current Role',
      company: 'Company Name',
      location: 'City, Country',
      description: 'Describe what you do in this role.',
      technologies: [],
      achievements: [],
    },
  ],

  hobbies: [
    {
      title: 'Add a hobby or interest',
      description: 'Tell visitors what you enjoy outside of work.',
      demoUrl: '',
    },
  ],

  social_links: [
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/your-profile',
      icon: 'lni lni-linkedin',
    },
  ],

  typewriter_text: ['Your Job Title', 'Your University', 'Your City'],

  categories: [],

  achievements: [
    { word: 'Add your achievements here', value: null, unit: '' },
  ],

  projects: [],

  emailjs_service_id: '',
  emailjs_template_id: '',
  emailjs_public_key: '',

  theme: {
    accentColor: '#c79b3b',  // matches the existing gold design
    fontFamily: 'Amethysta',
    imageShape: 'circle',
    buttonStyle: 'rounded',
    cardStyle: 'bordered',
  },
};

export default defaultPortfolio;
