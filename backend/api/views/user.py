from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import UserInterest
from ..serializers import UserSerializer, UpdateProfileSerializer, UpdateBudgetSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """
    GET /api/me
    Get current user profile.
    """
    user = request.user
    
    # Get user with interests
    interests = UserInterest.objects.filter(user=user).select_related('interest')
    
    return Response({
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'budgetAmount': float(user.budget_amount) if user.budget_amount else None,
        'currency': user.currency,
        'createdAt': user.created_at.isoformat(),
        'interests': [{'id': ui.interest.id, 'name': ui.interest.name, 'slug': ui.interest.slug} for ui in interests],
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    """
    PUT /api/me
    Update user profile.
    """
    serializer = UpdateProfileSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    data = serializer.validated_data
    
    if 'name' in data:
        user.name = data['name']
    if 'budget_amount' in data:
        user.budget_amount = data['budget_amount']
    if 'currency' in data:
        user.currency = data['currency']
    
    user.save()
    
    return Response({
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'budgetAmount': float(user.budget_amount) if user.budget_amount else None,
        'currency': user.currency,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_budget(request):
    """
    PUT /api/me/budget
    Update user budget.
    """
    serializer = UpdateBudgetSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    data = serializer.validated_data
    
    user.budget_amount = data['budget_amount']
    if 'currency' in data:
        user.currency = data['currency']
    
    user.save()
    
    return Response({
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'budgetAmount': float(user.budget_amount) if user.budget_amount else None,
        'currency': user.currency,
    })
