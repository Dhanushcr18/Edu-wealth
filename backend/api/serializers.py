from rest_framework import serializers
from .models import User, Interest, UserInterest, Course, UserSavedCourse, Expense


class UserSerializer(serializers.ModelSerializer):
    interests = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'budget_amount', 'currency', 'created_at', 'interests']
        read_only_fields = ['id', 'email', 'created_at']
    
    def get_interests(self, obj):
        user_interests = UserInterest.objects.filter(user=obj).select_related('interest')
        return [InterestSerializer(ui.interest).data for ui in user_interests]


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'provider_name', 'provider_slug', 'url',
            'price', 'currency', 'rating', 'duration', 'categories',
            'thumbnail_url', 'description', 'scraped_at', 'updated_at'
        ]
        read_only_fields = ['id', 'scraped_at', 'updated_at']


class UserSavedCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = UserSavedCourse
        fields = ['id', 'course', 'added_at']
        read_only_fields = ['id', 'added_at']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id', 'item_name', 'amount', 'currency', 'category',
            'description', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=100, write_only=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class UpdateBudgetSerializer(serializers.Serializer):
    budget_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    currency = serializers.CharField(max_length=3, required=False)


class UpdateProfileSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=100, required=False)
    budget_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)
    currency = serializers.CharField(max_length=3, required=False)


class UpdateInterestsSerializer(serializers.Serializer):
    interests = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        error_messages={'min_length': 'At least one interest is required'}
    )
