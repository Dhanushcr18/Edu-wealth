import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { searchCoursesFromWeb } from '../services/courseScraper';

const router = Router();

// GET /api/interests - Public endpoint
router.get('/', async (_req: any, res: Response): Promise<void> => {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(interests);
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validation schemas
const updateInterestsSchema = z.object({
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
});

// GET /api/me/interests
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userInterests = await prisma.userInterest.findMany({
      where: { userId: req.user!.userId },
      include: {
        interest: true,
      },
    });

    res.json(userInterests.map((ui: any) => ui.interest));
  } catch (error) {
    console.error('Get user interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/interests/me - Save user interests and find courses
router.post('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interests } = updateInterestsSchema.parse(req.body);

    // Limit to prevent timeout - max 10 interests at a time
    const limitedInterests = interests.slice(0, 10);
    
    if (interests.length > 10) {
      console.log(`⚠️ User selected ${interests.length} interests, limiting to first 10`);
    }

    // Delete existing interests
    await prisma.userInterest.deleteMany({
      where: { userId: req.user!.userId },
    });

    // Process interests and create them first (fast operation)
    const interestIds: number[] = [];
    
    for (const interestName of limitedInterests) {
      // Slugify: lowercase and replace any non-alphanumeric characters with hyphens
      const slug = interestName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      try {
        // Create or find interest
        const interest = await prisma.interest.upsert({
          where: { slug },
          create: { name: interestName, slug },
          update: {},
        });

        interestIds.push(interest.id);
      } catch (err) {
        console.error(`Failed to upsert interest '${interestName}' (slug '${slug}')`, err);
      }
    }

    // Create user interests one by one to avoid transaction issues
    for (const interestId of interestIds) {
      await prisma.userInterest.create({
        data: {
          userId: req.user!.userId,
          interestId,
        },
      });
    }

    // Fetch and return the updated interests immediately
    const updatedInterests = await prisma.userInterest.findMany({
      where: { userId: req.user!.userId },
      include: {
        interest: true,
      },
    });

    // Send response immediately - don't wait for course scraping
    res.json({
      message: 'Interests saved successfully!',
      interests: updatedInterests.map((ui: any) => ui.interest),
    });

    // Scrape courses in the background (async, don't wait)
    // This runs after the response is sent
    setImmediate(async () => {
      try {
        console.log(`🔍 Starting background course search for ${limitedInterests.length} interests...`);
        let totalCourses = 0;

        for (const interestName of limitedInterests) {
          try {
            const webCourses = await searchCoursesFromWeb(interestName);
            
            // Save courses to database
            for (const webCourse of webCourses) {
              try {
                const crypto = require('crypto');
                const sourceHash = crypto.createHash('sha256').update(webCourse.url).digest('hex');

                // Check if course already exists
                const existingCourse = await prisma.course.findFirst({
                  where: { sourceHash },
                });

                if (!existingCourse) {
                  await prisma.course.create({
                    data: {
                      title: webCourse.title,
                      providerName: webCourse.providerName,
                      providerSlug: webCourse.providerSlug,
                      url: webCourse.url,
                      price: webCourse.price,
                      currency: webCourse.currency,
                      rating: webCourse.rating || 0,
                      duration: webCourse.duration || '',
                      categories: [interestName],
                      thumbnailUrl: webCourse.thumbnailUrl || '',
                      description: webCourse.description || '',
                      sourceHash,
                    },
                  });
                  totalCourses++;
                }
              } catch (error) {
                // Silently ignore individual course save errors
              }
            }
          } catch (error) {
            console.error(`Error searching courses for ${interestName}:`, error);
          }
        }

        console.log(`✅ Background scraping complete: ${totalCourses} new courses added`);
      } catch (error) {
        console.error('Background course scraping error:', error);
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Update interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
