from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.shortcuts import redirect
from datetime import timedelta
from typing import Dict, Any
import logging
import os
import requests
from urllib.parse import urlencode
from ..models import User, RefreshToken as RefreshTokenModel
from django.db import IntegrityError
from ..serializers import SignupSerializer, LoginSerializer, RefreshTokenSerializer
from ..utils.google_oauth import verify_google_token

logger = logging.getLogger(__name__)


def generate_tokens_for_user(user: User) -> Dict[str, str]:
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
    
    # Type assertion for Pylance - access_token is a valid attribute
    access_token_str = str(refresh.access_token)  # type: ignore
    
    return {
        'access_token': access_token_str,
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
    
    # validated_data is guaranteed to exist after is_valid() returns True
    data: Dict[str, Any] = serializer.validated_data  # type: ignore
    
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
        
        # validated_data is guaranteed to exist after is_valid() returns True
        data: Dict[str, Any] = serializer.validated_data  # type: ignore
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
    # validated_data is guaranteed to exist after is_valid() returns True
    data: Dict[str, Any] = serializer.validated_data  # type: ignore
    refresh_token_str = data['refresh_token']
    
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
        # Type assertion for Pylance - access_token is a valid attribute
        access_token = str(refresh.access_token)  # type: ignore
        
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
    # Handle both cases: with or without refresh token in request
    if not request.data:
        return Response({'message': 'Logged out successfully'})
    
    serializer = RefreshTokenSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({'message': 'Logged out successfully'})
    
    # validated_data is guaranteed to exist after is_valid() returns True
    data: Dict[str, Any] = serializer.validated_data  # type: ignore
    refresh_token_str = data.get('refresh_token')
    
    if refresh_token_str:
        RefreshTokenModel.objects.filter(token=refresh_token_str).delete()
    
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    GET /api/auth/google
    Redirect to Google OAuth consent screen.
    """
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    google_callback_url = os.getenv('GOOGLE_CALLBACK_URL', 'http://127.0.0.1:8000/api/auth/google/callback')
    
    if not google_client_id:
        return Response(
            {'error': 'Google OAuth is not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Build Google OAuth URL
    params = {
        'client_id': google_client_id,
        'redirect_uri': google_callback_url,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent',
    }
    
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(google_auth_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def google_callback(request):
    """
    GET /api/auth/google/callback
    Handle Google OAuth callback.
    """
    # Type assertions for request.GET access
    code: Any = request.GET.get('code')  # type: ignore
    error: Any = request.GET.get('error')  # type: ignore
    
    if error:
        # Redirect to frontend with error
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error={error}")
    
    if not code:
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error=no_code")
    
    try:
        # Exchange code for tokens
        google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        google_callback_url = os.getenv('GOOGLE_CALLBACK_URL', 'http://127.0.0.1:8000/api/auth/google/callback')
        
        token_response = requests.post('https://oauth2.googleapis.com/token', data={
            'code': code,
            'client_id': google_client_id,
            'client_secret': google_client_secret,
            'redirect_uri': google_callback_url,
            'grant_type': 'authorization_code',
        })
        token_data: Dict[str, Any] = token_response.json()
        
        if 'error' in token_data:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            error_msg = token_data.get('error', 'unknown')
            return redirect(f"{frontend_url}/login?error={error_msg}")
        
        # Get user info from Google
        access_token = token_data.get('access_token', '')
        if not access_token:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f"{frontend_url}/login?error=no_access_token")
        
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        user_info: Dict[str, Any] = user_info_response.json()
        
        # Find or create user
        google_id = user_info.get('id')
        email = user_info.get('email')
        
        if not google_id or not email:
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f"{frontend_url}/login?error=invalid_user_info")
        
        user, created = User.objects.get_or_create(
            google_id=google_id,
            defaults={
                'email': email,
                'name': user_info.get('name', email),
            }
        )
        
        # If user exists with email but no google_id, link accounts
        if not created and not user.google_id:
            user.google_id = user_info['id']
            user.save()
        
        # Generate tokens
        tokens = generate_tokens_for_user(user)
        
        # Redirect to frontend with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/auth/callback?access={tokens['access_token']}&refresh={tokens['refresh_token']}"
        return redirect(redirect_url)
        
    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error=auth_failed")

