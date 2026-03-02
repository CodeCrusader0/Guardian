Guardian: Content-Addressable Storage (CAS)
Guardian is a hash-based file deduplication and archival management system designed to secure server bandwidth and optimize storage. It fingerprints files using SHA-256, prevents duplicate uploads, and automatically archives old data.

🚀 Features
Deduplication Engine: Calculates SHA-256 fingerprints locally (using Web Crypto API) to check for file existence before any bandwidth-heavy upload occurs.

Modern Dashboard: Built with React, TypeScript, and HeroUI for a professional, responsive UI.

Automated Archival: Python-based management command to batch-zip files older than a specific date, clear them from the server disk, and maintain a JSON manifest.

API-First Backend: Django-powered API that secures storage through a "Ledger" (Database) vs. "Vault" (File System) architecture.

🛠 Prerequisites
Python 3.10+

Node.js 18+

MySQL (or SQLite for local dev)

📦 Installation
1. Backend Setup (Django)
Bash
# Clone the repository
git clone https://github.com/CodeCrusader0/Guardian.git
cd Guardian

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run the server
python manage.py runserver
2. Frontend Setup (React + HeroUI)
Bash
cd frontend

# Install all dependencies (HeroUI, Tailwind, Axios, etc.)
# This command automatically reads package.json and grabs everything!
npm install

# Run the frontend dev server
npm run dev
📜 Usage
Archiving Files
To archive files older than 365 days (default) and free up server space, run:

Bash
python manage.py archive_files
To archive files older than a custom number of days (useful for testing):

Bash
python manage.py archive_files --days=30
🏗 Project Structure
Hashtool/: Core Django application containing models, views, and archival logic.

frontend/: React + TypeScript application using HeroUI components.

media/: Vault for physical file storage.

requirements.txt: Python package dependencies.# Guardian
