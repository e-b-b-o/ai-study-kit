# AI Study Kit

A full-stack academic study tool that generates zero-hallucination summaries and quizzes from uploaded lecture PDFs using RAG (Retrieval-Augmented Generation).

## Architecture

```
Frontend (React/Vite)  →  Backend (Express)  →  RAG Service (Flask)
                              ↓                       ↓
                          MongoDB Atlas           ChromaDB
```

- **Frontend**: React + Vite (runs independently, NOT Dockerized)
- **Backend**: Node.js + Express (Dockerized)
- **RAG Service**: Python 3.11 + Flask + Gunicorn (Dockerized)
- **Database**: MongoDB Atlas
- **Vector Store**: ChromaDB (persistent volume)

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js (for frontend only)

### 1. Environment Variables

```bash
cp .env.example .env
```

Fill in your values:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `GEMINI_API_KEY` | Google Gemini API key |

### 2. Start Backend + RAG (Docker)

```bash
docker-compose up --build
```

This starts:
- **Backend** on `http://localhost:4000`
- **RAG Service** on `http://localhost:5000`

### 3. Start Frontend (Separate Terminal)

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Health Checks

```bash
# Backend health (also checks RAG + MongoDB connectivity)
curl http://localhost:4000/health

# RAG service health
curl http://localhost:5000/health
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Auth, Document, Generation logic
│   │   ├── middlewares/      # JWT auth, file upload (Multer)
│   │   ├── models/           # User, Document (Mongoose)
│   │   ├── routes/           # API route definitions
│   │   └── server.js         # Express entry point
│   ├── rag/
│   │   ├── app.py            # Flask API (ingest, summary, quiz, health)
│   │   ├── rag.py            # ChromaDB + Gemini RAG pipeline
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── Dockerfile
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/       # ThemeProvider (dark/light mode)
│   │   ├── pages/            # Landing, Login, Register, Dashboard, StudyKit
│   │   ├── services/         # API client, auth, study kit services
│   │   └── index.css         # Single consolidated CSS file
│   └── package.json
├── docker-compose.yml        # Backend + RAG only
├── .env.example              # Environment variable template
└── .gitignore
```

## API Endpoints

### Backend (`localhost:4000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/documents/upload` | Upload PDF |
| `GET` | `/api/documents` | List documents |
| `GET` | `/api/documents/:id` | Get document |
| `DELETE` | `/api/documents/:id` | Delete document |
| `POST` | `/api/generate/:id/summary` | Generate summary |
| `POST` | `/api/generate/:id/quiz` | Generate quiz |

### RAG Service (`localhost:5000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/ingest` | Ingest document vectors |
| `POST` | `/generate-summary` | Generate summary from vectors |
| `POST` | `/generate-quiz` | Generate quiz from vectors |
| `POST` | `/reset` | Delete document vectors |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Lucide Icons |
| Backend | Node.js, Express, Mongoose |
| RAG | Python, Flask, ChromaDB, Google Gemini |
| Database | MongoDB Atlas |
| DevOps | Docker, Docker Compose |
