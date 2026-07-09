//////////////////////////////////////// ** HEADER / HERO SECTION **///////////////////////////////////////////

// your_info.jsx

// const backgroundImageUrl = 'https://www.freeimages.com/photo/sydney-harbour-silhouette-1379030';
const backgroundImageUrl = '';
// /images/sydney-harbour-silhouette-1379030.jpg

// Enter here your first and last name
const name = {
  firstname: 'Koko',
  lastname: 'Araki',
// Enter as url a link where your resume can be downloaded ( dropbox, OneDrive, ect )
  url: '/Complete_Portfolio/Koko%20Araki%20-%20Resume.pdf',
  profileImage: '/images/koko_image.jpeg',
};

const company = {
  name: 'Kimberly Clark',
  logos: [
    '/images/Kimberly_Clark_Lo.jpeg',
    '/images/usyd_logo.png',
  ],
};

// Display your job title or skills or whatever you want in the typewriter
const typeWriterText = [
  'Sales Manager',
  'The University of Sydney',
  'Class of 2024'  
];

// Social media profiles buttons
const socialProfiles = [
  {
    name: 'LinkedIn',
    icon: 'lni lni-linkedin',
    url: 'https://www.linkedin.com/in/kokoaraki20021015/',
  },
  // {
  //   name: 'GitHub',
  //   icon: 'lni lni-github',
  //   url: 'https://github.com/Pfrommer1982',
  // },
  //   Add more social profiles here, it will automatically add more link-buttons with icons (if available)
  //   {
  //     name: 'Twitter',
  //     icon: 'lni lni-twitter',
  //     url: 'https://twitter.com/your-username',
  //   },
  //   {
  //     name: 'Facebook',
  //     icon: 'lni lni-facebook',
  //     url: 'https://facebook.com/your-username',
  //   },
];

//////////////////////////////////////// ** CONTENT SECTION **//////////////////////////////////////////////////


const categories = [
  {
    name: 'Web Development',
    icon: 'lni lni-code',
    title: 'Photography',
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas diam lorem, tempus at dapibus vitae, vehicula sit amet dui. Fusce at libero id massa ornare molestie sed eu tellus.",
    skills: [
      {
        icon: 'lni lni-camera',
        title: 'HTML5',
      },
      {
        icon: 'lni lni-certificate',
        title: 'CSS3',
      },
      {
        icon: 'lni lni-instagram',
        title: 'JavaScript',
      },
    ],
  },
  {
    name: 'Software',
    icon: 'lni lni-code',
    title: 'Software',
    description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas diam lorem, tempus at dapibus vitae, vehicula sit amet dui. Fusce at libero id massa ornare molestie sed eu tellus.",
    skills: [
      {
        icon: 'lni lni-adobe',
        title: 'adobe',
      },
      {
        icon: 'lni lni-code',
        title: 'Code',
      },
      {
        icon: 'lni lni-sketch',
        title: 'Sketch'
      },
     
      
    ],
  },
  {
    name: 'brands',
    icon: 'lni lni-code',
    title: 'Brands',
    description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas diam lorem, tempus at dapibus vitae, vehicula sit amet dui. Fusce at libero id massa ornare molestie sed eu tellus.",
    skills: [
      {
        icon: 'lni lni-pinterest',
        title: 'Pinterest',
      },
      {
        icon: 'lni lni-crop',
        title: 'Crop',
      },
      
    ],
  },
  
];

// Here you can give in your achiements in a number counter animation
const achievements = [
  { word: 'Grade: Distinction, Dalyell Scholar' },
  { word: 'finished projects', value: 7500, unit: '' },
  { word: 'experience', value: 20, unit: ' years' },
];



// If you already have some projects, fill the url 
const projectData = [
  {
    title: 'Secured 2nd place at an intervarsity business consulting competition!',
    description: '',
    demoUrl: '/images/second_place_image.png' 
  },
  {
    title: 'Took the stage as a host speaker at UNIC, sharing how individuals can unlock growth by building and owning their personal brand.',
    description: '',
    demoUrl: '/images/host_speaker_image.png' 
  },
  {
    title: 'Behind the scenes of leading BusinessOne Consulting to a 1st place victory at the USYD Cup.',
    description: '',
    demoUrl: '/images/business_one_image.png' 
  },
  // {
  //   title: 'Activity 2',
  //   description: 'Description of Activity 2',
  //   demoUrl: 'src/assets/images/Jonathan Dominion Template.gif' 
  // },
  
];


//////////////////////////////////////// ** FOOTER SECTION **//////////////////////////////////////////////////



// You can tell something about yourself in the infotext.
const aboutMeText = {
  infotext: `Professionally, I have been enjoying working in Sales

\nHow do you turn insight into influence?

\nI enjoy analysing sales data,
breaking down drivers and building strategy around it. 

\nBut I also love to have meaningful chat.
Coming up with Ideas and learning how to influence. The moment when someone says, “I like your idea let’s do it.”

\nI’m early in my career, currently working in FMCG and rotating across roles as a National Account Executive (NAE), Assistant Brand Manager (ABM), and Field Sales Representative.

\nWhich means I’ve had exposure to strategy in slides… and strategy in store from day 1 of my career! 

\n\nIn every role, my focus is the same:
\nGround ideas in data but deliver them in a way that moves people.

\nAnd I am still learning.

\nRight now? I am reflecting deeply and figuring out how I can learn from the best.

\nIf you’re in corporate, building a startup, or somewhere in between let’s connect
    `,
  // power_slogan: `Lorem ipsum dolor sit amet`,
};

// For contact form: You need to make an account on emailjs.com
// There you can choose a free tier ( 200 emails per month )
// In your account settings you can see 'serviceID, templateID and userID. 
// Fill them here and it will automatically work. 

const emailConfig = {
  serviceID: 'service_XXXXXXX',
  templateID: 'template_XXXXXXXX',
  userID: 'XXXXXXXXXXXX',
};

export {
  backgroundImageUrl,
  name,
  company,
  typeWriterText,
  socialProfiles,
  categories,
  achievements,
  projectData,
  aboutMeText,
  emailConfig,
};
