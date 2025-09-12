import os
import django
from django.conf import settings

# Configure Django settings for pytest
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup() 