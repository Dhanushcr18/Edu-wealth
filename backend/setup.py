#!/usr/bin/env python3
"""
Quick setup script to install Django dependencies and configure VS Code.
Run this to fix all import errors in VS Code.
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🔧 EduWealth Backend - Quick Setup")
    print("=" * 50)
    print()
    
    # Check if we're in the backend directory
    if not Path("manage.py").exists():
        print("❌ Error: Please run this from the backend directory")
        print("   cd backend")
        sys.exit(1)
    
    # Check for virtual environment
    venv_path = Path("venv")
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment exists")
    
    print()
    print("📥 Installing dependencies...")
    print("   This may take 2-3 minutes...")
    print()
    
    # Determine the pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = venv_path / "Scripts" / "pip.exe"
        python_path = venv_path / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        pip_path = venv_path / "bin" / "pip"
        python_path = venv_path / "bin" / "python"
    
    # Install requirements
    result = subprocess.run([str(pip_path), "install", "-r", "requirements.txt"], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Dependencies installed successfully")
    else:
        print("⚠️  Some dependencies may have failed. Check output above.")
        print(result.stderr)
    
    print()
    print("✅ Setup complete!")
    print()
    print("📌 Next steps:")
    print()
    print("1. Select Python Interpreter in VS Code:")
    print("   • Press Ctrl+Shift+P")
    print("   • Type 'Python: Select Interpreter'")
    print(f"   • Choose: {python_path}")
    print()
    print("2. Reload VS Code window:")
    print("   • Press Ctrl+Shift+P")
    print("   • Type 'Developer: Reload Window'")
    print()
    print("3. All import errors should be gone! 🎉")
    print()
    print("4. Start the server:")
    print("   • python manage.py migrate")
    print("   • python manage.py runserver 4000")
    print()

if __name__ == "__main__":
    main()
