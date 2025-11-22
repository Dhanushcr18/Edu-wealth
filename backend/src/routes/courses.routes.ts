import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const getCoursesSchema = z.object({
  interest: z.string().optional(),
  max_price: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  search: z.string().optional(),
});

const saveCourseSchema = z.object({
  courseId: z.string().uuid(),
});

// GET /api/courses - Get course recommendations
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = getCoursesSchema.parse(req.query);
    
    const limit = parseInt(query.limit || '20', 10);
    const offset = parseInt(query.offset || '0', 10);
    const maxPrice = query.max_price ? parseFloat(query.max_price) : undefined;

    // Get user interests if available
    let userInterests: string[] = [];
    if (req.user) {
      const interests = await prisma.userInterest.findMany({
        where: { userId: req.user.userId },
        include: { interest: true },
      });
      userInterests = interests.map((ui: any) => ui.interest.name.toLowerCase());
    }

    // Build where clause
    const where: any = {};

    // Filter by search term
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filter by price
    if (maxPrice !== undefined) {
      where.OR = [
        { price: { lte: maxPrice } },
        { price: null }, // Include free courses
      ];
    }

    // Filter by interest
    if (query.interest) {
      const interestLower = query.interest.toLowerCase();
      where.categories = {
        path: '$',
        array_contains: interestLower,
      };
    }

    // Fetch courses
    const courses = await prisma.course.findMany({
      where,
      take: limit * 3, // Fetch more for scoring
      skip: offset,
      orderBy: [
        { rating: 'desc' },
        { scrapedAt: 'desc' },
      ],
    });

    // Score and rank courses
    const scoredCourses = courses.map((course: any) => {
      let score = 0;

      // Interest match score
      if (userInterests.length > 0 && course.categories) {
        const courseCategories = Array.isArray(course.categories) 
          ? course.categories.map((c: any) => String(c).toLowerCase())
          : [];
        
        const matchCount = courseCategories.filter((cat: string) => 
          userInterests.some((ui: string) => cat.includes(ui) || ui.includes(cat))
        ).length;

        score += matchCount * 10;
      }

      // Rating score
      if (course.rating) {
        score += Number(course.rating) * 2;
      }

      // Price score (cheaper is better within budget)
      if (maxPrice && course.price) {
        const priceRatio = Number(course.price) / maxPrice;
        if (priceRatio <= 1) {
          score -= priceRatio * 5; // Reduce score slightly based on price
        }
      } else if (!course.price) {
        score += 5; // Bonus for free courses
      }

      return {
        ...course,
        score,
      };
    });

    // Sort by score and take only requested limit
    const rankedCourses = scoredCourses
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);

    // Generate motivational message
    let motivationalMessage = '';
    if (req.user) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (user?.budgetAmount) {
        const affordableCount = courses.filter((c: any) => 
          !c.price || Number(c.price) <= Number(user.budgetAmount)
        ).length;

        if (affordableCount > 0) {
          motivationalMessage = `Your budget: ${user.currency} ${user.budgetAmount} — ${affordableCount} courses you can take now!`;
        } else {
          motivationalMessage = `Almost there! Consider these low-cost alternatives or save a bit more for premium courses.`;
        }
      } else {
        motivationalMessage = `Skip one burger this month — invest in a course that pays back with skills.`;
      }
    }

    res.json({
      courses: rankedCourses.map(({ score, ...course }: any) => ({
        ...course,
        price: course.price ? Number(course.price) : null,
        rating: course.rating ? Number(course.rating) : null,
        budgetAmount: course.price,
      })),
      total: courses.length,
      limit,
      offset,
      motivationalMessage,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id - Get course details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json({
      ...course,
      price: course.price ? Number(course.price) : null,
      rating: course.rating ? Number(course.rating) : null,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes for saving courses
router.use(authenticate);

// POST /api/me/saved-courses - Save a course
router.post('/me/saved-courses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = saveCourseSchema.parse(req.body);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check if already saved
    const existing = await prisma.userSavedCourse.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.userId,
          courseId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Course already saved' });
      return;
    }

    // Save course
    const saved = await prisma.userSavedCourse.create({
      data: {
        userId: req.user!.userId,
        courseId,
      },
      include: {
        course: true,
      },
    });

    res.status(201).json(saved);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Save course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me/saved-courses - Get saved courses
router.get('/me/saved-courses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const savedCourses = await prisma.userSavedCourse.findMany({
      where: { userId: req.user!.userId },
      include: {
        course: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    res.json(savedCourses.map((sc: any) => ({
      ...sc.course,
      savedAt: sc.addedAt,
      price: sc.course.price ? Number(sc.course.price) : null,
      rating: sc.course.rating ? Number(sc.course.rating) : null,
    })));
  } catch (error) {
    console.error('Get saved courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/me/saved-courses/:courseId - Remove saved course
router.delete('/me/saved-courses/:courseId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.userSavedCourse.delete({
      where: {
        userId_courseId: {
          userId: req.user!.userId,
          courseId: req.params.courseId,
        },
      },
    });

    res.json({ message: 'Course removed from saved list' });
  } catch (error) {
    console.error('Delete saved course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
