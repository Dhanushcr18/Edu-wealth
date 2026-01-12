import uuid
from decimal import Decimal
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=5, default='INR')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.email


class Interest(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'interests'
    
    def __str__(self):
        return self.name


class UserInterest(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_interests')
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE, related_name='user_interests')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'user_interests'
        unique_together = ('user', 'interest')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['interest']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.interest.name}"


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=500)
    provider_name = models.CharField(max_length=50)
    provider_slug = models.CharField(max_length=50, db_index=True)
    url = models.URLField(max_length=1000)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, db_index=True)
    currency = models.CharField(max_length=5, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, db_index=True)
    duration = models.CharField(max_length=50, null=True, blank=True)
    categories = models.JSONField(null=True, blank=True)
    thumbnail_url = models.URLField(max_length=1000, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    source_hash = models.CharField(max_length=64, unique=True)
    scraped_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        indexes = [
            models.Index(fields=['provider_slug']),
            models.Index(fields=['price']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return self.title


class UserSavedCourse(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='saved_by_users')
    added_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'user_saved_courses'
        unique_together = ('user', 'course')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.course.title}"


class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=500, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'refresh_tokens'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - Token"


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    item_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default='INR')
    category = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expenses'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['date']),
            models.Index(fields=['category']),
        ]
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.item_name} - {self.amount}"
