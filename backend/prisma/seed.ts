import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const interests = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Data Science', slug: 'data-science' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Mobile Development', slug: 'mobile-development' },
  { name: 'Cloud Computing', slug: 'cloud-computing' },
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'UI/UX Design', slug: 'ui-ux-design' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Business & Entrepreneurship', slug: 'business-entrepreneurship' },
  { name: 'Finance & Investing', slug: 'finance-investing' },
  { name: 'Photography', slug: 'photography' },
  { name: 'Music Production', slug: 'music-production' },
  { name: 'Video Editing', slug: 'video-editing' },
  { name: 'Graphic Design', slug: 'graphic-design' },
  { name: 'Game Development', slug: 'game-development' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Blockchain', slug: 'blockchain' },
  { name: 'Internet of Things', slug: 'iot' },
  { name: 'Robotics', slug: 'robotics' },
];

const sampleCourses = [
  {
    title: 'Complete Web Development Bootcamp 2024',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    price: 499,
    currency: 'INR',
    rating: 4.7,
    duration: '65 hours',
    categories: ['web-development', 'javascript', 'html', 'css', 'node.js'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Web+Dev+Bootcamp',
    description: 'Master full-stack web development with HTML, CSS, JavaScript, Node.js, React, and more.',
    sourceHash: 'udemy-web-dev-bootcamp-2024',
  },
  {
    title: 'Python for Data Science and Machine Learning',
    providerName: 'Coursera',
    providerSlug: 'coursera',
    url: 'https://www.coursera.org/specializations/python-data-science',
    price: null,
    currency: null,
    rating: 4.8,
    duration: '4 months',
    categories: ['data-science', 'machine-learning', 'python'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Python+ML',
    description: 'Learn Python programming and data analysis with real-world projects.',
    sourceHash: 'coursera-python-ml-2024',
  },
  {
    title: 'UI/UX Design Specialization',
    providerName: 'Coursera',
    providerSlug: 'coursera',
    url: 'https://www.coursera.org/specializations/ui-ux-design',
    price: 3999,
    currency: 'INR',
    rating: 4.6,
    duration: '6 months',
    categories: ['ui-ux-design', 'design', 'figma'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=UI+UX+Design',
    description: 'Master user interface and user experience design principles.',
    sourceHash: 'coursera-uiux-2024',
  },
  {
    title: 'AWS Certified Solutions Architect',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/aws-certified-solutions-architect/',
    price: 599,
    currency: 'INR',
    rating: 4.9,
    duration: '24 hours',
    categories: ['cloud-computing', 'aws', 'devops'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=AWS+Architect',
    description: 'Prepare for AWS Solutions Architect certification.',
    sourceHash: 'udemy-aws-architect-2024',
  },
  {
    title: 'Digital Marketing Masterclass',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/digital-marketing-masterclass/',
    price: 449,
    currency: 'INR',
    rating: 4.5,
    duration: '40 hours',
    categories: ['digital-marketing', 'seo', 'social-media'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Digital+Marketing',
    description: 'Master SEO, social media marketing, email marketing, and more.',
    sourceHash: 'udemy-digital-marketing-2024',
  },
  {
    title: 'Introduction to Artificial Intelligence',
    providerName: 'edX',
    providerSlug: 'edx',
    url: 'https://www.edx.org/course/artificial-intelligence-ai',
    price: null,
    currency: null,
    rating: 4.7,
    duration: '12 weeks',
    categories: ['artificial-intelligence', 'machine-learning'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Intro+to+AI',
    description: 'Learn the fundamentals of artificial intelligence and machine learning.',
    sourceHash: 'edx-intro-ai-2024',
  },
  {
    title: 'Blockchain and Cryptocurrency',
    providerName: 'Coursera',
    providerSlug: 'coursera',
    url: 'https://www.coursera.org/specializations/blockchain',
    price: 2999,
    currency: 'INR',
    rating: 4.4,
    duration: '4 months',
    categories: ['blockchain', 'cryptocurrency', 'finance'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Blockchain',
    description: 'Understand blockchain technology and cryptocurrency.',
    sourceHash: 'coursera-blockchain-2024',
  },
  {
    title: 'Complete Mobile App Development',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/complete-mobile-app-development/',
    price: 549,
    currency: 'INR',
    rating: 4.6,
    duration: '50 hours',
    categories: ['mobile-development', 'react-native', 'flutter'],
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Mobile+Dev',
    description: 'Build cross-platform mobile apps with React Native and Flutter.',
    sourceHash: 'udemy-mobile-dev-2024',
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to preserve data)
  console.log('🧹 Cleaning existing data...');
  await prisma.userSavedCourse.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.course.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.user.deleteMany();

  // Seed interests
  console.log('📚 Seeding interests...');
  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { slug: interest.slug },
      update: {},
      create: interest,
    });
  }
  console.log(`✅ Created ${interests.length} interests`);

  // Seed courses
  console.log('📖 Seeding courses...');
  for (const course of sampleCourses) {
    await prisma.course.upsert({
      where: { sourceHash: course.sourceHash },
      update: {},
      create: course,
    });
  }
  console.log(`✅ Created ${sampleCourses.length} courses`);

  // Create a demo user
  console.log('👤 Creating demo user...');
  const demoPassword = await hashPassword('demo123456');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@eduwealth.com' },
    update: {},
    create: {
      email: 'demo@eduwealth.com',
      passwordHash: demoPassword,
      name: 'Demo User',
      budgetAmount: 5000,
      currency: 'INR',
    },
  });

  // Assign interests to demo user
  const webDev = await prisma.interest.findUnique({ where: { slug: 'web-development' } });
  const dataScience = await prisma.interest.findUnique({ where: { slug: 'data-science' } });
  
  if (webDev) {
    await prisma.userInterest.upsert({
      where: {
        userId_interestId: {
          userId: demoUser.id,
          interestId: webDev.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        interestId: webDev.id,
      },
    });
  }

  if (dataScience) {
    await prisma.userInterest.upsert({
      where: {
        userId_interestId: {
          userId: demoUser.id,
          interestId: dataScience.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        interestId: dataScience.id,
      },
    });
  }

  console.log('✅ Created demo user (email: demo@eduwealth.com, password: demo123456)');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
