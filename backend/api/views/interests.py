from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils.text import slugify
from ..models import Interest, UserInterest
from ..serializers import UpdateInterestsSerializer, InterestSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_interests(request):
    """
    GET /api/interests
    Get all available interests (public endpoint).
    """
    interests = Interest.objects.all().order_by('name')
    serializer = InterestSerializer(interests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_interests(request):
    """
    GET /api/interests/me
    Get current user's interests.
    """
    user_interests = UserInterest.objects.filter(user=request.user).select_related('interest')
    interests = [ui.interest for ui in user_interests]
    serializer = InterestSerializer(interests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_user_interests(request):
    """
    POST /api/interests/me
    Save user interests and trigger course search.
    """
    serializer = UpdateInterestsSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    interests_data = serializer.validated_data['interests']
    
    # Limit to prevent timeout - max 10 interests at a time
    limited_interests = interests_data[:10]
    
    if len(interests_data) > 10:
        print(f"⚠️ User selected {len(interests_data)} interests, limiting to first 10")
    
    # Delete existing interests
    UserInterest.objects.filter(user=request.user).delete()
    
    # Process interests and create them
    interest_ids = []
    
    for interest_name in limited_interests:
        slug = slugify(interest_name)
        
        # Create or get interest
        interest, created = Interest.objects.get_or_create(
            slug=slug,
            defaults={'name': interest_name}
        )
        
        interest_ids.append(interest.id)
    
    # Create user interests
    for interest_id in interest_ids:
        UserInterest.objects.create(
            user=request.user,
            interest_id=interest_id
        )
    
    # Fetch and return the updated interests
    updated_interests = UserInterest.objects.filter(user=request.user).select_related('interest')
    interests = [ui.interest for ui in updated_interests]
    
    return Response({
        'message': 'Interests saved successfully!',
        'interests': InterestSerializer(interests, many=True).data
    })
