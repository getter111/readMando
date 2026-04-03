# Contributing to ReadMando 🚀

Welcome to ReadMando! We're thrilled that you'd like to contribute. This document outlines the architecture, local setup instructions, and deployment strategies to help you get up and running quickly.

## 🏗 System Architecture

ReadMando follows a decoupled client-server architecture:

- **Frontend:** React application built with Vite and TailwindCSS (`frontend/my-app`).
- **Backend:** Python FastAPI service (`backend/`).
- **Database & Storage:** Supabase (PostgreSQL for data, S3-compatible storage for audio files).
- **AI Integrations:** OpenAI (GPT-4o-mini) for content generation, Edge-TTS/gTTS for text-to-speech, and Jieba for Chinese word segmentation.

---

## 💻 Local Development Setup

To ensure security features (like secure cookies and CORS) work correctly, **both the frontend and backend are configured to run over local HTTPS** using custom `.pem` certificates.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/downloads/) (v3.12+ recommended)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/getter111/readMando.git
cd readMando
```

### 2. Backend Setup

The backend runs on FastAPI and uses a local development script to serve over HTTPS.

```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows (CMD):
.\.venv\Scripts\activate.bat
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the local development server (HTTPS enabled)
python run.py
```

*The backend will be available at `https://127.0.0.1:8000`.*

### 3. Frontend Setup

The frontend is a Vite + React application.

```bash
cd frontend/my-app

# Install dependencies
npm install

# Start the Vite development server (HTTPS enabled)
npm run dev
```

*The frontend will be available at `https://localhost:5173`.*

> **⚠️ Note on SSL Warnings:** Because we are using local `.pem` certificates (`localhost+1.pem` and `localhost+1-key.pem`), your browser may warn you that the connection is not private. You can safely bypass this warning for `localhost` by clicking "Advanced" -> "Proceed to localhost".

### 4. Environment Variables

To run the application locally, you will need to configure environment variables for both the frontend and backend. We have provided `.env.example` files to make this easy.

**Backend (`backend/`):**
Copy the example file to create your local `.env`:
```bash
cp .env.example .env
```
Open `backend/.env` and fill in the missing values:
- **Supabase:** You will need to create a free project on [Supabase](https://supabase.com/) and paste your Project URL and API Key.
- **OpenAI:** Provide your API key from [OpenAI](https://platform.openai.com/).
- **Emails:** The `MAIL_` variables are required to test email features (like password reset/verification). If testing emails, provide valid SMTP credentials.
- **Security:** Generate a random `SECRET_KEY` for local development.

**Frontend (`frontend/my-app/`):**
Copy the example file to create your local `.env`:
```bash
cp .env.example .env
```
By default, `VITE_API_BASE_URL` is already set to `https://127.0.0.1:8000`, which matches the local backend.

### 5. Supabase Database & Storage Setup

To ensure the backend functions correctly with your local Supabase project, you must configure the database tables and storage bucket:

1. **Storage Bucket (Audio):**
   - In your Supabase dashboard, navigate to **Storage**.
   - Create a new bucket named **`audio`**.
   - Set the bucket to **Public** so the frontend can stream the generated TTS audio files.

2. **Vocabulary Data Import:**
   - The repository includes a file named `Most Common Chinese words - Sheet1.csv`.
   - In Supabase, navigate to the **Table Editor** and create or open your `vocabulary` table.
   - Use the Supabase CSV import tool to upload this file. This populates your database with the core vocabulary context required for the AI to generate appropriate stories and reading materials.

---

## 🚀 Deployment

### Frontend (Netlify)

The frontend is hosted on [Netlify](https://readmando.netlify.app/). 

- **Auto-deployment:** Netlify is connected to the GitHub repository. Any code merged into the `main` branch will automatically trigger a production build (`npm run build`) and deploy the new version.

### Backend (Fly.io)

The backend is containerized using Docker and hosted on [Fly.io](https://fly.io/).

- **Auto-deployment:** The backend is deployed automatically via GitHub Actions whenever changes are pushed or merged into the `main` branch.
- **Manual fallback:** If you need to trigger a backend deployment manually, install the Fly CLI and run the following from the `backend/` directory:
  ```bash
  cd backend
  fly deploy

---

## 🤝 How to Contribute

1. **Fork the repository** and clone your fork locally.
2. **Create a new branch** for your feature or bugfix (`git checkout -b feature/your-feature-name`).
3. **Write your code**, keeping our architecture and formatting in mind.
4. **Commit your changes** with clear, descriptive messages.
5. **Push to your fork** and submit a **Pull Request** against the `main` branch.

If you have any questions or ideas, feel free to open an issue or reach out to the maintainers!