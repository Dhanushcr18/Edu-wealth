from django.urls import path
from .views import auth, user, interests, courses, expenses

urlpatterns = [
    # Auth routes
    path('auth/signup', auth.signup, name='signup'),
    path('auth/login', auth.login, name='login'),
    path('auth/refresh', auth.refresh_token, name='refresh_token'),
    path('auth/logout', auth.logout, name='logout'),
    path('auth/google', auth.google_auth, name='google_auth'),
    path('auth/google/callback', auth.google_callback, name='google_callback'),
    
    # User routes
    path('me', user.get_user, name='get_user'),
    path('me', user.update_user, name='update_user'),
    path('me/budget', user.update_budget, name='update_budget'),
    
    # Interests routes
    path('interests', interests.get_interests, name='get_interests'),
    # Single endpoint handles both GET (fetch) and POST (save)
    path('interests/me', interests.user_interests, name='user_interests'),
    
    # Courses routes
    path('courses', courses.get_courses, name='get_courses'),
    path('courses/save', courses.save_course, name='save_course'),
    path('courses/saved', courses.get_saved_courses, name='get_saved_courses'),
    path('courses/save/<uuid:course_id>', courses.unsave_course, name='unsave_course'),
    
    # Expenses routes
    path('expenses', expenses.expenses, name='expenses'),
    path('expenses/<uuid:expense_id>', expenses.get_expense, name='get_expense'),
    path('expenses/<uuid:expense_id>', expenses.delete_expense, name='delete_expense'),
]
