import os
import sys

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduwealth.settings')

# Run Django
from django.core.management import execute_from_command_line
execute_from_command_line([' manage.py', 'runserver', '0.0.0.0:8000'])
