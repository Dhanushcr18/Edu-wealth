from django.contrib import admin
from .models import User, Interest, UserInterest, Course, UserSavedCourse, RefreshToken, Expense


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'budget_amount', 'currency', 'created_at']
    search_fields = ['email', 'name']
    list_filter = ['created_at', 'currency']


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name', 'slug']


@admin.register(UserInterest)
class UserInterestAdmin(admin.ModelAdmin):
    list_display = ['user', 'interest', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'interest__name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'provider_name', 'price', 'currency', 'rating', 'scraped_at']
    search_fields = ['title', 'provider_name']
    list_filter = ['provider_slug', 'scraped_at']


@admin.register(UserSavedCourse)
class UserSavedCourseAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'added_at']
    list_filter = ['added_at']
    search_fields = ['user__email', 'course__title']


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'expires_at', 'created_at']
    list_filter = ['expires_at', 'created_at']
    search_fields = ['user__email']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['user', 'item_name', 'amount', 'currency', 'category', 'date', 'created_at']
    list_filter = ['category', 'date', 'created_at']
    search_fields = ['user__email', 'item_name', 'description']
