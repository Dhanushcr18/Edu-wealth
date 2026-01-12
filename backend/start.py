#!/usr/bin/env python
"""
Script to run the Django development server.
"""
import subprocess
import sys
import os


def main():
    # Check if virtual environment is activated
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Virtual environment not activated!")
        print("Please activate it first:")
        print("  Windows: .\\venv\\Scripts\\Activate.ps1")
        print("  Linux/Mac: source venv/bin/activate")
        return
    
    # Check if dependencies are installed
    try:
        import django
        print(f"✅ Django {django.get_version()} found")
    except ImportError:
        print("❌ Django not installed!")
        print("Please run: pip install -r requirements.txt")
        return
    
    # Run migrations
    print("\n🔄 Running migrations...")
    subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
    
    # Start server
    print("\n🚀 Starting Django development server...")
    print("📚 API: http://localhost:4000/api")
    print("💚 Health: http://localhost:4000/health")
    print("🔧 Admin: http://localhost:4000/admin")
    print("\nPress Ctrl+C to stop the server\n")
    
    subprocess.run([sys.executable, "manage.py", "runserver", "4000"])


if __name__ == "__main__":
    main()
