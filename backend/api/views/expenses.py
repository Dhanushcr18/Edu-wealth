from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime
from decimal import Decimal
from ..models import Expense, Course
from ..serializers import ExpenseSerializer


def analyze_spending(category, item_name, description=None):
    """
    Analyze if spending is essential/beneficial or wasteful/harmful.
    """
    item_lower = item_name.lower()
    desc_lower = (description or '').lower()
    combined_text = f"{item_lower} {desc_lower}"
    
    # Essential/Beneficial items - NO course suggestions
    essential_keywords = [
        # Basic necessities & groceries
        'groceries', 'vegetables', 'fruits', 'rice', 'wheat', 'flour', 'dal', 'milk', 'eggs',
        'bread', 'butter', 'oil', 'sugar', 'salt', 'spices', 'lentils', 'beans',
        # Healthy fruits & vegetables
        'apple', 'banana', 'orange', 'mango', 'grapes', 'watermelon', 'papaya', 'pomegranate',
        'tomato', 'potato', 'onion', 'carrot', 'spinach', 'broccoli', 'cabbage',
        # Healthy proteins
        'chicken', 'fish', 'meat', 'paneer', 'tofu', 'nuts', 'almonds', 'cashews',
        # Healthcare
        'medicine', 'doctor', 'hospital', 'medical', 'health insurance', 'treatment', 'pharmacy',
        # Bills & utilities
        'rent', 'electricity', 'water bill', 'gas', 'internet bill', 'phone bill', 'maintenance',
        # Education
        'school fee', 'college fee', 'tuition', 'books', 'stationery', 'uniform', 'study material',
        # Transport (essential)
        'transport', 'bus pass', 'metro', 'fuel for work', 'commute', 'petrol for office',
        # Healthy food & drinks
        'salad', 'juice', 'smoothie', 'whole grain', 'protein', 'vitamins', 'green tea',
        # Fitness & wellness
        'gym membership', 'yoga', 'fitness', 'exercise equipment', 'sports equipment',
        # Productive items
        'course', 'learning', 'skill development', 'certification', 'training',
        'laptop for work', 'work equipment', 'professional tools',
    ]
    
    # Wasteful/Harmful items - SHOW course suggestions
    wasteful_keywords = [
        # Junk food (clearly unhealthy)
        'burger', 'pizza', 'fries', 'french fries', 'chips', 'wafers', 'candy',
        'cake', 'pastry', 'donuts', 'cookies', 'biscuits', 'soda', 'cold drink', 'cola',
        'junk food', 'fast food', 'street food', 'pani puri', 'samosa fried', 'pakora',
        'momos', 'chaat', 'vada pav', 'pav bhaji fried',
        # Processed & unhealthy
        'instant noodles', 'maggi', 'kurkure', 'lays', 'doritos', 'cheetos',
        # Harmful substances
        'cigarette', 'tobacco', 'alcohol', 'beer', 'wine', 'whiskey', 'vodka', 'rum', 'smoking',
        # Entertainment/Luxury (non-essential)
        'movie ticket', 'cinema', 'gaming', 'video game', 'console', 'playstation', 'xbox',
        'party', 'club', 'nightclub', 'pub', 'bar',
        'luxury item', 'branded bag', 'shopping spree', 'impulse buy', 'unnecessary shopping',
        # Unnecessary subscriptions
        'ott subscription', 'netflix', 'prime video', 'hotstar', 'multiple subscriptions',
    ]
    
    # Check for essential keywords
    for keyword in essential_keywords:
        if keyword in combined_text:
            return {
                'is_essential': True,
                'show_courses': False,
                'message': '✅ Great! This is an essential/beneficial expense. Keep investing in what matters!',
                'category': 'Essential',
            }
    
    # Check for wasteful keywords
    for keyword in wasteful_keywords:
        if keyword in combined_text:
            return {
                'is_essential': False,
                'show_courses': True,
                'message': '💡 This could be an opportunity to invest in yourself! Instead of temporary satisfaction, consider learning something valuable.',
                'category': 'Non-Essential',
            }
    
    # Check category-based rules for specific cases
    if category == 'Food & Drinks':
        return {
            'is_essential': False,
            'show_courses': True,
            'message': '💡 Consider if this is truly necessary. You could invest in a skill that benefits you long-term!',
            'category': 'Non-Essential Food',
        }
    
    if category in ['Entertainment', 'Shopping']:
        return {
            'is_essential': False,
            'show_courses': True,
            'message': '🎯 Entertainment is good, but growth is better! Consider investing this amount in your future.',
            'category': 'Non-Essential',
        }
    
    # For other categories, check if it seems essential
    seems_essential = category == 'Transport' or 'work' in combined_text or 'office' in combined_text or 'essential' in combined_text
    
    if seems_essential:
        return {
            'is_essential': True,
            'show_courses': False,
            'message': '✅ This seems like a necessary expense. Good financial management!',
            'category': 'Essential',
        }
    
    # Default for unclear cases - lean towards essential unless proven otherwise
    return {
        'is_essential': True,
        'show_courses': False,
        'message': '✅ Expense tracked successfully!',
        'category': 'General',
    }


def search_courses_online(price_range, currency):
    """
    Search for courses based on price range.
    """
    sample_courses = []
    
    if price_range <= 100:
        sample_courses.append({
            'title': 'Complete Web Development Bootcamp 2024',
            'provider_name': 'Udemy',
            'provider_slug': 'udemy',
            'url': 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
            'price': 85,
            'currency': 'INR',
            'rating': 4.7,
            'duration': '61 hours',
            'categories': ['web-development', 'programming', 'html', 'css', 'javascript'],
            'thumbnail_url': 'https://img-c.udemycdn.com/course/240x135/1565838_e54e_18.jpg',
            'description': 'Learn Web Development from scratch with HTML, CSS, JavaScript, Node, React, MongoDB and more!',
        })
    
    if price_range <= 300:
        sample_courses.append({
            'title': 'Python for Beginners - Learn Programming from scratch',
            'provider_name': 'Udemy',
            'provider_slug': 'udemy',
            'url': 'https://www.udemy.com/course/python-for-beginners-learn-programming-from-scratch/',
            'price': min(299, price_range * 1.2),
            'currency': 'INR',
            'rating': 4.5,
            'duration': '9 hours',
            'categories': ['python', 'programming'],
            'thumbnail_url': 'https://img-c.udemycdn.com/course/240x135/394676_ce3d_5.jpg',
            'description': 'Learn Python programming from basics to advanced. Perfect for beginners!',
        })
    
    if price_range <= 500:
        sample_courses.append({
            'title': 'The Complete Digital Marketing Course',
            'provider_name': 'Udemy',
            'provider_slug': 'udemy',
            'url': 'https://www.udemy.com/course/learn-digital-marketing-course/',
            'price': min(449, price_range * 1.1),
            'currency': 'INR',
            'rating': 4.4,
            'duration': '23 hours',
            'categories': ['digital-marketing', 'business', 'seo'],
            'thumbnail_url': 'https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg',
            'description': 'Master Digital Marketing: SEO, Social Media, Email Marketing, and more!',
        })
    
    # Always add Excel as a budget-friendly option
    sample_courses.append({
        'title': 'Microsoft Excel - Excel from Beginner to Advanced',
        'provider_name': 'Udemy',
        'provider_slug': 'udemy',
        'url': 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/',
        'price': 49,
        'currency': 'INR',
        'rating': 4.6,
        'duration': '16 hours',
        'categories': ['excel', 'productivity', 'microsoft-office'],
        'thumbnail_url': 'https://img-c.udemycdn.com/course/240x135/321410_7f8b_5.jpg',
        'description': 'Master Microsoft Excel from Beginner to Advanced level.',
    })
    
    # Filter courses within price range
    return [c for c in sample_courses if c['price'] >= price_range * 0.3 and c['price'] <= price_range * 1.5][:3]


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expenses(request):
    """
    GET /api/expenses - Get user's expenses with optional filters
    POST /api/expenses - Add expense and get course recommendations if non-essential
    """
    if request.method == 'GET':
        start_date = request.GET.get('startDate')
        end_date = request.GET.get('endDate')
        category = request.GET.get('category')
        
        expenses_qs = Expense.objects.filter(user=request.user)
        
        if start_date:
            expenses_qs = expenses_qs.filter(date__gte=start_date)
        if end_date:
            expenses_qs = expenses_qs.filter(date__lte=end_date)
        if category:
            expenses_qs = expenses_qs.filter(category=category)
        
        serializer = ExpenseSerializer(expenses_qs, many=True)
        
        # Calculate total
        total = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        return Response({
            'expenses': serializer.data,
            'total': float(total),
            'count': expenses_qs.count()
        })
    
    # POST method
    # Validate required fields
    category = request.data.get('category')
    item_name = request.data.get('itemName')
    amount = request.data.get('amount')
    
    if not category or not item_name or not amount:
        return Response(
            {'error': 'category, itemName, and amount are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError()
    except:
        return Response(
            {'error': 'amount must be a positive number'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Analyze if spending is essential or wasteful
    analysis = analyze_spending(category, item_name, request.data.get('description'))
    
    # Create expense record
    expense = Expense.objects.create(
        user=request.user,
        category=category,
        item_name=item_name,
        amount=amount,
        currency=request.data.get('currency', 'INR'),
        description=request.data.get('description'),
        date=request.data.get('date', datetime.now().date())
    )
    
    # Only show course recommendations if spending is non-essential
    recommendations = []
    
    if analysis['show_courses']:
        # Find course recommendations around the same price
        price_range = float(amount)
        min_price = Decimal(price_range * 0.5)
        max_price = Decimal(price_range * 1.5)
        
        recommendations = Course.objects.filter(
            price__gte=min_price,
            price__lte=max_price,
            currency=request.data.get('currency', 'INR')
        ).order_by('-rating', 'price')[:3]
        
        # If no courses found in database, search online
        if not recommendations:
            try:
                search_results = search_courses_online(price_range, request.data.get('currency', 'INR'))
                recommendations = search_results
            except Exception as e:
                print(f'Error searching online courses: {e}')
    
    # Create response based on analysis
    response_data = {
        'expense': ExpenseSerializer(expense).data,
        'analysis': {
            'isEssential': analysis['is_essential'],
            'category': analysis['category'],
            'message': analysis['message'],
        },
    }
    
    # Only include course recommendations if spending is non-essential
    if analysis['show_courses'] and recommendations:
        if isinstance(recommendations[0], dict):
            # Online search results
            response_data['recommendations'] = recommendations
        else:
            # Database results
            from ..serializers import CourseSerializer
            response_data['recommendations'] = CourseSerializer(recommendations, many=True).data
        
        response_data['savings'] = {
            'amount': float(amount),
            'currency': request.data.get('currency', 'INR'),
            'message': 'You could learn something valuable for the same price!',
        }
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expense(request, expense_id):
    """
    GET /api/expenses/:id
    Get a single expense.
    """
    try:
        expense = Expense.objects.get(id=expense_id, user=request.user)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)
    except Expense.DoesNotExist:
        return Response(
            {'error': 'Expense not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_expense(request, expense_id):
    """
    DELETE /api/expenses/:id
    Delete an expense.
    """
    try:
        expense = Expense.objects.get(id=expense_id, user=request.user)
        expense.delete()
        return Response({'message': 'Expense deleted successfully'})
    except Expense.DoesNotExist:
        return Response(
            {'error': 'Expense not found'},
            status=status.HTTP_404_NOT_FOUND
        )
