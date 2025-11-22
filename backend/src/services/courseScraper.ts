interface ScrapedCourse {
  title: string;
  providerName: string;
  providerSlug: string;
  url: string;
  price: number;
  currency: string;
  rating?: number;
  duration?: string;
  thumbnailUrl?: string;
  description?: string;
}

// Udemy search scraping
async function scrapeUdemyCourses(query: string, limit: number = 5): Promise<ScrapedCourse[]> {
  try {
    // For production, you would use a proper scraping service or API
    // For now, we'll use curated course data based on common interests
    
    const courseDatabase = getCourseDatabase();
    const matchedCourses = courseDatabase
      .filter(course => {
        const queryLower = query.toLowerCase();
        return course.categories.some(cat => queryLower.includes(cat.toLowerCase()));
      })
      .slice(0, limit);

    return matchedCourses;
  } catch (error) {
    console.error('Udemy scraping error:', error);
    return [];
  }
}

// Coursera search scraping
async function scrapeCourseraCourses(query: string, limit: number = 3): Promise<ScrapedCourse[]> {
  try {
    const courseDatabase = getCourseDatabase();
    const matchedCourses = courseDatabase
      .filter(course => {
        const queryLower = query.toLowerCase();
        return course.providerName === 'Coursera' && 
               course.categories.some(cat => queryLower.includes(cat.toLowerCase()));
      })
      .slice(0, limit);

    return matchedCourses;
  } catch (error) {
    console.error('Coursera scraping error:', error);
    return [];
  }
}

// Main search function that combines multiple sources
export async function searchCoursesFromWeb(interest: string): Promise<ScrapedCourse[]> {
  try {
    // Search multiple platforms
    const [udemyCourses, courseraCourses] = await Promise.all([
      scrapeUdemyCourses(interest, 5),
      scrapeCourseraCourses(interest, 3),
    ]);

    // Combine and deduplicate
    const allCourses = [...udemyCourses, ...courseraCourses];
    const uniqueCourses = Array.from(
      new Map(allCourses.map(course => [course.url, course])).values()
    );

    return uniqueCourses.slice(0, 10);
  } catch (error) {
    console.error('Web scraping error:', error);
    return [];
  }
}

// Curated course database (in production, this would be real-time scraping or API calls)
function getCourseDatabase(): (ScrapedCourse & { categories: string[] })[] {
  return [
    // Web Development Courses
    {
      title: 'The Complete 2024 Web Development Bootcamp',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      price: 499,
      currency: 'INR',
      rating: 4.7,
      duration: '61 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1565838_e54e_18.jpg',
      description: 'Become a Full-Stack Web Developer with just ONE course.',
      categories: ['Web Development', 'Programming', 'Full Stack'],
    },
    {
      title: 'Modern JavaScript From The Beginning',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/modern-javascript-from-the-beginning/',
      price: 449,
      currency: 'INR',
      rating: 4.7,
      duration: '37 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1463348_52a4_2.jpg',
      description: 'Learn and build projects with pure JavaScript (No frameworks or libraries)',
      categories: ['Web Development', 'Programming', 'JavaScript'],
    },
    {
      title: 'React - The Complete Guide',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      price: 499,
      currency: 'INR',
      rating: 4.6,
      duration: '49 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg',
      description: 'Dive in and learn React.js from scratch!',
      categories: ['Web Development', 'Programming', 'React'],
    },

    // Video Editing Courses
    {
      title: 'Adobe Premiere Pro CC – Advanced Training Course',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/adobe-premiere-pro-video-editing/',
      price: 449,
      currency: 'INR',
      rating: 4.6,
      duration: '11 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1361498_7d11_2.jpg',
      description: 'Master Adobe Premiere Pro CC for professional video editing',
      categories: ['Video Editing', 'Adobe Premiere', 'Creative'],
    },
    {
      title: 'Complete DaVinci Resolve 18 Video Editing Course',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/davinci-resolve-video-editing/',
      price: 399,
      currency: 'INR',
      rating: 4.7,
      duration: '16 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/2451516_e8da.jpg',
      description: 'Learn professional video editing with DaVinci Resolve',
      categories: ['Video Editing', 'DaVinci Resolve', 'Creative'],
    },
    {
      title: 'Video Editing Masterclass: Edit Your Videos Like a Pro!',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/video-editing-masterclass/',
      price: 349,
      currency: 'INR',
      rating: 4.5,
      duration: '8 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1349346_9fa4_2.jpg',
      description: 'Learn video editing fundamentals and advanced techniques',
      categories: ['Video Editing', 'Creative', 'Filmmaking'],
    },

    // Data Science & Machine Learning
    {
      title: 'Python for Data Science and Machine Learning Bootcamp',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
      price: 499,
      currency: 'INR',
      rating: 4.6,
      duration: '25 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/903744_8eb2.jpg',
      description: 'Learn Python for Data Science, NumPy, Pandas, Matplotlib, Scikit-Learn, Machine Learning',
      categories: ['Data Science', 'Machine Learning', 'Python', 'Programming'],
    },
    {
      title: 'Machine Learning A-Z™: AI, Python & R',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/machinelearning/',
      price: 499,
      currency: 'INR',
      rating: 4.5,
      duration: '44 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/950390_270f_3.jpg',
      description: 'Learn to create Machine Learning Algorithms in Python and R',
      categories: ['Machine Learning', 'Data Science', 'AI', 'Python'],
    },

    // Digital Marketing
    {
      title: 'The Complete Digital Marketing Course - 12 Courses in 1',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/learn-digital-marketing-course/',
      price: 449,
      currency: 'INR',
      rating: 4.4,
      duration: '23 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg',
      description: 'Master Digital Marketing: SEO, Social Media, Email Marketing, and more!',
      categories: ['Digital Marketing', 'SEO', 'Social Media', 'Business'],
    },
    {
      title: 'SEO Training Masterclass 2024: Beginner to Advanced SEO',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/seo-training/',
      price: 399,
      currency: 'INR',
      rating: 4.5,
      duration: '12 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1311626_6e96.jpg',
      description: 'Learn SEO from scratch and rank #1 in Google',
      categories: ['Digital Marketing', 'SEO', 'Marketing'],
    },

    // Graphic Design
    {
      title: 'Graphic Design Masterclass - Learn GREAT Design',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/',
      price: 449,
      currency: 'INR',
      rating: 4.6,
      duration: '35 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1369830_ff90_4.jpg',
      description: 'Learn all the main Graphic Design and Software Skills to become a Pro Graphic Designer',
      categories: ['Graphic Design', 'Design', 'Creative', 'Adobe'],
    },
    {
      title: 'Canva Master Course | Learn Canva For Graphic Design',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/canva-graphic-design-masterclass/',
      price: 349,
      currency: 'INR',
      rating: 4.7,
      duration: '8 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/2452566_3ff7_2.jpg',
      description: 'Master Canva and create stunning designs for social media, marketing, and more',
      categories: ['Graphic Design', 'Design', 'Canva', 'Creative'],
    },

    // UI/UX Design
    {
      title: 'User Experience Design Essentials - Adobe XD UI UX Design',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/',
      price: 449,
      currency: 'INR',
      rating: 4.5,
      duration: '9 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1330926_1ce6.jpg',
      description: 'Learn UI/UX Design with Adobe XD. User Interface, User Experience Design',
      categories: ['UI/UX Design', 'Design', 'Adobe XD', 'User Experience'],
    },
    {
      title: 'Complete Web & Mobile Designer: UI/UX, Figma, +more',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/',
      price: 499,
      currency: 'INR',
      rating: 4.7,
      duration: '24 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1472654_bfc0_3.jpg',
      description: 'Become a Designer in 2024! Master Mobile and Web Design, UI/UX, Figma',
      categories: ['UI/UX Design', 'Design', 'Figma', 'Web Design'],
    },

    // Photography
    {
      title: 'Photography Masterclass: A Complete Guide to Photography',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/photography-masterclass-complete-guide-to-photography/',
      price: 449,
      currency: 'INR',
      rating: 4.7,
      duration: '23 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/358758_76e6_2.jpg',
      description: 'Learn Digital Photography, Portrait, Product, Real Estate, Wedding Photography',
      categories: ['Photography', 'Creative', 'Camera Skills'],
    },

    // Mobile App Development
    {
      title: 'The Complete Android & Kotlin Development Masterclass',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/android-kotlin-developer/',
      price: 499,
      currency: 'INR',
      rating: 4.5,
      duration: '34 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/2443660_1994.jpg',
      description: 'Learn Android App Development with Kotlin',
      categories: ['Mobile App Development', 'Android', 'Kotlin', 'Programming'],
    },
    {
      title: 'iOS & Swift - The Complete iOS App Development Bootcamp',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/ios-13-app-development-bootcamp/',
      price: 499,
      currency: 'INR',
      rating: 4.8,
      duration: '60 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1778502_f4b9_12.jpg',
      description: 'From Beginner to iOS App Developer with Just One Course',
      categories: ['Mobile App Development', 'iOS', 'Swift', 'Programming'],
    },

    // Cybersecurity
    {
      title: 'The Complete Cyber Security Course',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/',
      price: 449,
      currency: 'INR',
      rating: 4.5,
      duration: '12 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1033458_81ce_3.jpg',
      description: 'Learn Cybersecurity from scratch: Network Security, Ethical Hacking & more',
      categories: ['Cybersecurity', 'IT', 'Security', 'Ethical Hacking'],
    },

    // Content Writing
    {
      title: 'Content Writing: The Complete Guide to Writing Copy',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/content-writing-course/',
      price: 349,
      currency: 'INR',
      rating: 4.4,
      duration: '5 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1424816_d4c3.jpg',
      description: 'Master content writing, copywriting, and creative writing',
      categories: ['Content Writing', 'Writing', 'Copywriting', 'Marketing'],
    },

    // Game Development
    {
      title: 'Complete C# Unity Game Developer 3D',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/unitycourse2/',
      price: 499,
      currency: 'INR',
      rating: 4.7,
      duration: '37 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/2466942_8de3.jpg',
      description: 'Learn Unity 3D with C# and create your own games',
      categories: ['Game Development', 'Unity', 'Programming', 'C#'],
    },

    // Cloud Computing
    {
      title: 'AWS Certified Solutions Architect - Associate 2024',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
      price: 499,
      currency: 'INR',
      rating: 4.7,
      duration: '27 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/362070_b9a1_2.jpg',
      description: 'Pass the AWS Certified Solutions Architect Associate Certification',
      categories: ['Cloud Computing', 'AWS', 'IT', 'DevOps'],
    },

    // Business Analytics & Finance
    {
      title: 'The Business Intelligence Analyst Course 2024',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/the-business-intelligence-analyst-course-2018/',
      price: 449,
      currency: 'INR',
      rating: 4.5,
      duration: '16 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1445124_22e2.jpg',
      description: 'Learn Business Intelligence, Data Analysis, and Data Visualization',
      categories: ['Business Analytics', 'Data Analysis', 'Business', 'Finance & Accounting'],
    },
    {
      title: 'Accounting & Bookkeeping Masterclass - Beginner to Advanced',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/accounting-bookkeeping-masterclass/',
      price: 399,
      currency: 'INR',
      rating: 4.6,
      duration: '18 hours',
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/2404564_3bcb_2.jpg',
      description: 'Learn accounting and bookkeeping from scratch',
      categories: ['Finance & Accounting', 'Accounting', 'Business'],
    },

    // Coursera Courses
    {
      title: 'Google Data Analytics Professional Certificate',
      providerName: 'Coursera',
      providerSlug: 'coursera',
      url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
      price: 3900,
      currency: 'INR',
      rating: 4.8,
      duration: '6 months',
      thumbnailUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fb/4e95e0b38211e8b9c3f3b9e24cd6/GCC_PGC_800x800.png',
      description: 'Launch your career in Data Analytics',
      categories: ['Data Science', 'Data Analysis', 'Google', 'Business Analytics'],
    },
    {
      title: 'IBM Data Science Professional Certificate',
      providerName: 'Coursera',
      providerSlug: 'coursera',
      url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
      price: 3900,
      currency: 'INR',
      rating: 4.6,
      duration: '11 months',
      thumbnailUrl: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/c1/24b9f0d1a211e8b194f96ea1f4b54f/IBM-Data-Science-Logo.png',
      description: 'Kickstart your career in data science & ML',
      categories: ['Data Science', 'Machine Learning', 'IBM', 'Programming'],
    },
  ];
}
