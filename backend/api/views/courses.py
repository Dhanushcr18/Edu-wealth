from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from decimal import Decimal
from ..models import Course, UserSavedCourse, UserInterest
from ..serializers import CourseSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request):
    """
    GET /api/courses
    Get course recommendations based on user interests and filters.
    """
    interest = request.GET.get('interest')
    max_price = request.GET.get('max_price')
    search = request.GET.get('search')
    limit = int(request.GET.get('limit', '20'))
    offset = int(request.GET.get('offset', '0'))
    
    # Get user interests
    user_interests = UserInterest.objects.filter(user=request.user).select_related('interest')
    interest_names = [ui.interest.name.lower() for ui in user_interests]
    
    # Build query
    query = Q()
    
    # Filter by search term
    if search:
        query &= Q(title__icontains=search) | Q(description__icontains=search)
    
    # Filter by price
    if max_price:
        max_price_decimal = Decimal(max_price)
        query &= Q(price__lte=max_price_decimal) | Q(price__isnull=True)
    
    # Filter by interest
    if interest:
        # This is a simplified filter - in production you'd want more sophisticated matching
        interest_lower = interest.lower()
        query &= Q(title__icontains=interest_lower) | Q(description__icontains=interest_lower)
    
    # Fetch courses
    courses = Course.objects.filter(query).order_by('-rating', '-scraped_at')[:limit * 3]
    
    # Score and rank courses
    scored_courses = []
    for course in courses:
        score = 0
        
        # Interest match score
        if interest_names and course.categories:
            # Handle JSONField - can be list or None
            categories_data = course.categories if course.categories else []
            course_categories = [str(cat).lower() for cat in categories_data] if isinstance(categories_data, list) else []
            
            match_count = sum(1 for cat in course_categories 
                            if any(ui in cat or cat in ui for ui in interest_names))
            score += match_count * 10
        
        # Rating score
        if course.rating:
            score += float(course.rating) * 2
        
        # Free course bonus
        if not course.price:
            score += 5
        
        # Price penalty
        if course.price:
            price_penalty = min(float(course.price) / 1000, 5)
            score -= price_penalty
        
        scored_courses.append({
            'course': course,
            'score': score
        })
    
    # Sort by score and apply limit
    scored_courses.sort(key=lambda x: x['score'], reverse=True)
    final_courses = [item['course'] for item in scored_courses[offset:offset + limit]]
    
    serializer = CourseSerializer(final_courses, many=True)
    
    return Response({
        'courses': serializer.data,
        'total': len(scored_courses),
        'limit': limit,
        'offset': offset,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_course(request):
    """
    POST /api/courses/save
    Save a course to user's saved courses.
    """
    course_id = request.data.get('courseId')
    
    if not course_id:
        return Response(
            {'error': 'courseId is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already saved
    if UserSavedCourse.objects.filter(user=request.user, course=course).exists():
        return Response(
            {'message': 'Course already saved'},
            status=status.HTTP_200_OK
        )
    
    # Save course
    UserSavedCourse.objects.create(user=request.user, course=course)
    
    return Response({
        'message': 'Course saved successfully',
        'course': CourseSerializer(course).data
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_course(request, course_id):
    """
    DELETE /api/courses/save/:courseId
    Remove a course from user's saved courses.
    """
    try:
        saved_course = UserSavedCourse.objects.get(user=request.user, course_id=course_id)
        saved_course.delete()
        return Response({'message': 'Course removed from saved courses'})
    except UserSavedCourse.DoesNotExist:
        return Response(
            {'error': 'Saved course not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_courses(request):
    """
    GET /api/courses/saved
    Get user's saved courses.
    """
    saved_courses = UserSavedCourse.objects.filter(user=request.user).select_related('course')
    courses = [sc.course for sc in saved_courses]
    serializer = CourseSerializer(courses, many=True)
    
    return Response({
        'courses': serializer.data,
        'total': len(courses)
    })
