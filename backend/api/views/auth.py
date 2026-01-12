from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from datetime import timedelta
import logging
from ..models import User, RefreshToken as RefreshTokenModel
from django.db import IntegrityError
from ..serializers import SignupSerializer, LoginSerializer, RefreshTokenSerializer
from ..utils.google_oauth import verify_google_token

logger = logging.getLogger(__name__)


def generate_tokens_for_user(user):
    """Generate access and refresh tokens for a user."""
    refresh = JWTRefreshToken.for_user(user)
    
    # Store refresh token in database
    try:
        RefreshTokenModel.objects.create(
            token=str(refresh),
            user=user,
            expires_at=timezone.now() + timedelta(days=7)
        )
    except IntegrityError:
        # If a duplicate token happens (rare), ignore and proceed
        logger.warning("Duplicate refresh token detected; proceeding without DB insert")
    except Exception as e:
        # Don't fail login if token persistence fails
        logger.error(f"Failed to persist refresh token: {e}")
    
    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    POST /api/auth/signup
    Register a new user.
    """
    serializer = SignupSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    data = serializer.validated_data
    
    # Check if user already exists
    if User.objects.filter(email=data['email']).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create(
        name=data['name'],
        email=data['email']
    )
    user.set_password(data['password'])
    user.save()
    
    # Generate tokens
    tokens = generate_tokens_for_user(user)
    
    return Response({
        'user': {
            'id': str(user.id),
            'name': user.name,
            'email': user.email,
        },
        'accessToken': tokens['access_token'],
        'refreshToken': tokens['refresh_token'],
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login
    Login with email and password.
    """
    try:
        logger.info("=== LOGIN ATTEMPT ===")
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"Validation failed: {serializer.errors}")
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        logger.info(f"Login attempt for: {data['email']}")
        
        # Find user
        try:
            user = User.objects.get(email=data['email'])
            logger.info(f"User found: {user.email}, has password: {bool(user.password)}")
        except User.DoesNotExist:
            logger.error(f"User not found: {data['email']}")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check password
        if not user.password:
            logger.error("User has no password set")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        password_valid = user.check_password(data['password'])
        logger.info(f"Password check result: {password_valid}")
        
        if not password_valid:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate tokens
        tokens = generate_tokens_for_user(user)
        logger.info(f"Tokens generated for user: {user.email}")
        
        return Response({
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
            },
            'accessToken': tokens['access_token'],
            'refreshToken': tokens['refresh_token'],
        })
    except Exception as e:
        logger.exception(f"Login error: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    POST /api/auth/refresh
    Refresh access token using refresh token.
    """
    serializer = RefreshTokenSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    refresh_token_str = serializer.validated_data['refresh_token']
    
    # Verify token exists in database
    try:
        token_obj = RefreshTokenModel.objects.select_related('user').get(token=refresh_token_str)
    except RefreshTokenModel.DoesNotExist:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if token is expired
    if token_obj.expires_at < timezone.now():
        token_obj.delete()
        return Response(
            {'error': 'Refresh token expired'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate new access token
    try:
        refresh = JWTRefreshToken(refresh_token_str)
        access_token = str(refresh.access_token)
        
        return Response({
            'accessToken': access_token,
        })
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    POST /api/auth/logout
    Logout and invalidate refresh token.
    """
    serializer = RefreshTokenSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({'message': 'Logged out successfully'})
    
    refresh_token_str = serializer.validated_data.get('refresh_token')
    
    if refresh_token_str:
        RefreshTokenModel.objects.filter(token=refresh_token_str).delete()
    
    return Response({'message': 'Logged out successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    POST /api/auth/google
    Authenticate with Google OAuth token.
    """
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'error': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify Google token
        user_info = verify_google_token(token)
        
        # Find or create user
        user, created = User.objects.get_or_create(
            google_id=user_info['google_id'],
            defaults={
                'email': user_info['email'],
                'name': user_info['name'],
            }
        )
        
        # If user exists with email but no google_id, link accounts
        if not created and not user.google_id:
            user.google_id = user_info['google_id']
            user.save()
        
        # Generate tokens
        tokens = generate_tokens_for_user(user)
        
        return Response({
            'user': {
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
            },
            'accessToken': tokens['access_token'],
            'refreshToken': tokens['refresh_token'],
        })
    except Exception as e:
        return Response(
            {'error': f'Google authentication failed: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )
