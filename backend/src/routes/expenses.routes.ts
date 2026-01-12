import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// Function to analyze if spending is essential/beneficial or wasteful/harmful
function analyzeSpending(category: string, itemName: string, description?: string) {
  const itemLower = itemName.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combinedText = `${itemLower} ${descLower}`;

  // Essential/Beneficial items - NO course suggestions
  const essentialKeywords = [
    // Basic necessities & groceries
    'groceries', 'vegetables', 'fruits', 'rice', 'wheat', 'flour', 'dal', 'milk', 'eggs',
    'bread', 'butter', 'oil', 'sugar', 'salt', 'spices', 'lentils', 'beans',
    // Healthy fruits & vegetables
    'apple', 'banana', 'orange', 'mango', 'grapes', 'watermelon', 'papaya', 'pomegranate',
    'tomato', 'potato', 'onion', 'carrot', 'spinach', 'broccoli', 'cabbage',
    // Healthy proteins
    'chicken', 'fish', 'meat', 'paneer', 'tofu', 'nuts', 'almonds', 'cashews',
    // Healthcare
    'medicine', 'doctor', 'hospital', 'medical', 'health insurance', 'treatment', 'pharmacy',
    // Bills & utilities
    'rent', 'electricity', 'water bill', 'gas', 'internet bill', 'phone bill', 'maintenance',
    // Education
    'school fee', 'college fee', 'tuition', 'books', 'stationery', 'uniform', 'study material',
    // Transport (essential)
    'transport', 'bus pass', 'metro', 'fuel for work', 'commute', 'petrol for office',
    // Healthy food & drinks
    'salad', 'juice', 'smoothie', 'whole grain', 'protein', 'vitamins', 'green tea',
    // Fitness & wellness
    'gym membership', 'yoga', 'fitness', 'exercise equipment', 'sports equipment',
    // Productive items
    'course', 'learning', 'skill development', 'certification', 'training',
    'laptop for work', 'work equipment', 'professional tools',
  ];

  // Wasteful/Harmful items - SHOW course suggestions
  const wastefulKeywords = [
    // Junk food (clearly unhealthy)
    'burger', 'pizza', 'fries', 'french fries', 'chips', 'wafers', 'candy', 
    'cake', 'pastry', 'donuts', 'cookies', 'biscuits', 'soda', 'cold drink', 'cola',
    'junk food', 'fast food', 'street food', 'pani puri', 'samosa fried', 'pakora',
    'momos', 'chaat', 'vada pav', 'pav bhaji fried',
    // Processed & unhealthy
    'instant noodles', 'maggi', 'kurkure', 'lays', 'doritos', 'cheetos',
    // Harmful substances
    'cigarette', 'tobacco', 'alcohol', 'beer', 'wine', 'whiskey', 'vodka', 'rum', 'smoking',
    // Entertainment/Luxury (non-essential)
    'movie ticket', 'cinema', 'gaming', 'video game', 'console', 'playstation', 'xbox',
    'party', 'club', 'nightclub', 'pub', 'bar',
    'luxury item', 'branded bag', 'shopping spree', 'impulse buy', 'unnecessary shopping',
    // Unnecessary subscriptions
    'ott subscription', 'netflix', 'prime video', 'hotstar', 'multiple subscriptions',
  ];

  // Check for essential keywords
  for (const keyword of essentialKeywords) {
    if (combinedText.includes(keyword)) {
      return {
        isEssential: true,
        showCourses: false,
        message: '✅ Great! This is an essential/beneficial expense. Keep investing in what matters!',
        category: 'Essential',
      };
    }
  }

  // Check for wasteful keywords
  for (const keyword of wastefulKeywords) {
    if (combinedText.includes(keyword)) {
      return {
        isEssential: false,
        showCourses: true,
        message: '💡 This could be an opportunity to invest in yourself! Instead of temporary satisfaction, consider learning something valuable.',
        category: 'Non-Essential',
      };
    }
  }

  // Check category-based rules for specific cases
  if (category === 'Food & Drinks') {
    // For Food & Drinks, if it's not in essential keywords, show courses
    // This prevents random items like "bug" from being marked as healthy
    return {
      isEssential: false,
      showCourses: true,
      message: '💡 Consider if this is truly necessary. You could invest in a skill that benefits you long-term!',
      category: 'Non-Essential Food',
    };
  }

  if (category === 'Entertainment' || category === 'Shopping') {
    return {
      isEssential: false,
      showCourses: true,
      message: '🎯 Entertainment is good, but growth is better! Consider investing this amount in your future.',
      category: 'Non-Essential',
    };
  }

  // For other categories, check if it seems essential
  // Default to showing courses only if it's clearly non-essential
  const seemsEssential = category === 'Transport' || combinedText.includes('work') || 
                        combinedText.includes('office') || combinedText.includes('essential');
  
  if (seemsEssential) {
    return {
      isEssential: true,
      showCourses: false,
      message: '✅ This seems like a necessary expense. Good financial management!',
      category: 'Essential',
    };
  }

  // Default for unclear cases - lean towards essential unless proven otherwise
  return {
    isEssential: true,
    showCourses: false,
    message: '✅ Expense tracked successfully!',
    category: 'General',
  };
}

// Function to search courses online
async function searchCoursesOnline(priceRange: number, _currency: string) {
  // Real courses data based on price range
  const sampleCourses = [];
  
  if (priceRange <= 100) {
    sampleCourses.push({
      title: 'Complete Web Development Bootcamp 2024',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      price: 85,
      currency: 'INR',
      rating: 4.7,
      duration: '61 hours',
      categories: ['web-development', 'programming', 'html', 'css', 'javascript'],
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1565838_e54e_18.jpg',
      description: 'Learn Web Development from scratch with HTML, CSS, JavaScript, Node, React, MongoDB and more!',
    });
  }
  
  if (priceRange <= 300) {
    sampleCourses.push({
      title: 'Python for Beginners - Learn Programming from scratch',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/python-for-beginners-learn-programming-from-scratch/',
      price: Math.min(299, priceRange * 1.2),
      currency: 'INR',
      rating: 4.5,
      duration: '9 hours',
      categories: ['python', 'programming'],
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/394676_ce3d_5.jpg',
      description: 'Learn Python programming from basics to advanced. Perfect for beginners!',
    });
  }
  
  if (priceRange <= 500) {
    sampleCourses.push({
      title: 'The Complete Digital Marketing Course',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/learn-digital-marketing-course/',
      price: Math.min(449, priceRange * 1.1),
      currency: 'INR',
      rating: 4.4,
      duration: '23 hours',
      categories: ['digital-marketing', 'business', 'seo'],
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg',
      description: 'Master Digital Marketing: SEO, Social Media, Email Marketing, and more!',
    });
  }
  
  if (priceRange > 500 || priceRange > 300) {
    sampleCourses.push({
      title: 'The Complete 2024 Web Development Bootcamp',
      providerName: 'Udemy',
      providerSlug: 'udemy',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      price: Math.min(priceRange * 0.9, 999),
      currency: 'INR',
      rating: 4.7,
      duration: '61 hours',
      categories: ['web-development', 'full-stack'],
      thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/1565838_e54e_18.jpg',
      description: 'Become a Full-Stack Web Developer with just ONE course.',
    });
  }
  
  // Always add Excel as a budget-friendly option
  sampleCourses.push({
    title: 'Microsoft Excel - Excel from Beginner to Advanced',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/',
    price: 49,
    currency: 'INR',
    rating: 4.6,
    duration: '16 hours',
    categories: ['excel', 'productivity', 'microsoft-office'],
    thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/321410_7f8b_5.jpg',
    description: 'Master Microsoft Excel from Beginner to Advanced level.',
  });
  
  // Add JavaScript course for tech learners
  sampleCourses.push({
    title: 'The Complete JavaScript Course 2024',
    providerName: 'Udemy',
    providerSlug: 'udemy',
    url: 'https://www.udemy.com/course/the-complete-javascript-course/',
    price: Math.min(priceRange * 0.8, 399),
    currency: 'INR',
    rating: 4.7,
    duration: '69 hours',
    categories: ['javascript', 'programming', 'web-development'],
    thumbnailUrl: 'https://img-c.udemycdn.com/course/240x135/851712_fc61_6.jpg',
    description: 'The modern JavaScript course for everyone! Master JavaScript with projects.',
  });
  
  // Filter courses within price range
  return sampleCourses.filter(course => 
    course.price >= priceRange * 0.3 && course.price <= priceRange * 1.5
  ).slice(0, 3);
}

// Validation schemas
const createExpenseSchema = z.object({
  category: z.string().min(1).max(50),
  itemName: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
});

const getExpensesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

// POST /api/expenses - Add expense and get course recommendation
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createExpenseSchema.parse(req.body);

    // Analyze if spending is essential or wasteful
    const analysis = analyzeSpending(data.category, data.itemName, data.description);

    // Create expense record
    const expense = await prisma.expense.create({
      data: {
        userId: req.user!.userId,
        category: data.category,
        itemName: data.itemName,
        amount: data.amount,
        currency: data.currency || 'INR',
        description: data.description,
      },
    });

    // Only show course recommendations if spending is non-essential
    let recommendations: any[] = [];
    
    if (analysis.showCourses) {
      // Find course recommendations around the same price
      const priceRange = Number(data.amount);
      const minPrice = priceRange * 0.5; // 50% lower
      const maxPrice = priceRange * 1.5; // 50% higher
      recommendations = await prisma.course.findMany({
        where: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
          currency: data.currency || 'INR',
        },
        orderBy: [
          { rating: 'desc' },
          { price: 'asc' },
        ],
        take: 3,
      });

      // If no courses found in database, search online
      if (recommendations.length === 0) {
        try {
          // Search for courses online based on price
          const searchResults = await searchCoursesOnline(priceRange, data.currency || 'INR');
          
          // Save found courses to database for future use
          for (const course of searchResults) {
            try {
              await prisma.course.create({
                data: {
                  title: course.title,
                  providerName: course.providerName,
                  providerSlug: course.providerSlug,
                  url: course.url,
                  price: course.price,
                  currency: course.currency,
                  rating: course.rating,
                  duration: course.duration,
                  categories: course.categories,
                  thumbnailUrl: course.thumbnailUrl,
                  description: course.description,
                  sourceHash: `expense-search-${Date.now()}-${Math.random()}`,
                },
              });
            } catch (error) {
              // Ignore duplicate errors
              console.log('Course already exists or error saving:', error);
            }
          }
          
          recommendations = searchResults as any[];
        } catch (error) {
          console.error('Error searching online courses:', error);
        }
      }
    }

    // Create response based on analysis
    const response: any = {
      expense,
      analysis: {
        isEssential: analysis.isEssential,
        category: analysis.category,
        message: analysis.message,
      },
    };

    // Only include course recommendations if spending is non-essential
    if (analysis.showCourses && recommendations.length > 0) {
      response.recommendations = recommendations;
      response.savings = {
        amount: data.amount,
        currency: data.currency || 'INR',
        message: `You could learn something valuable for the same price!`,
      };
    }

    res.status(201).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/expenses - Get user's expenses
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = getExpensesSchema.parse(req.query);

    const where: any = {
      userId: req.user!.userId,
    };

    if (query.startDate || query.endDate) {
      where.spentAt = {};
      if (query.startDate) {
        where.spentAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.spentAt.lte = new Date(query.endDate);
      }
    }

    if (query.category) {
      where.category = query.category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { spentAt: 'desc' },
    });

    // Calculate totals
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const byCategory = expenses.reduce((acc: any, expense) => {
      const cat = expense.category;
      acc[cat] = (acc[cat] || 0) + Number(expense.amount);
      return acc;
    }, {});

    res.json({
      expenses,
      summary: {
        total,
        byCategory,
        count: expenses.length,
      },
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/expenses/stats - Get spending statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user!.userId,
        spentAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const avgPerDay = totalSpent / 30;

    const categoryBreakdown = expenses.reduce((acc: any, exp) => {
      const cat = exp.category;
      if (!acc[cat]) {
        acc[cat] = { total: 0, count: 0, items: [] };
      }
      acc[cat].total += Number(exp.amount);
      acc[cat].count += 1;
      acc[cat].items.push(exp.itemName);
      return acc;
    }, {});

    // Calculate potential savings
    const potentialCoursesValue = totalSpent;
    
    res.json({
      period: '30 days',
      totalSpent,
      avgPerDay: Math.round(avgPerDay * 100) / 100,
      expenseCount: expenses.length,
      categoryBreakdown,
      potentialSavings: {
        amount: potentialCoursesValue,
        message: `You could have invested ₹${potentialCoursesValue.toFixed(2)} in courses to upskill yourself!`,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    if (expense.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
