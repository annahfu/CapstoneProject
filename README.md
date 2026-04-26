# 🗽 NYC Places Recommendation System

> An AI-powered recommendation engine that suggests NYC venues tailored to your vibe, budget, and neighborhood — backed by semantic search and a curated database of 139 locations.

[![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-sentence--transformers-yellow?logo=huggingface)](https://huggingface.co)
[![SQLite](https://img.shields.io/badge/SQLite-embedded-green?logo=sqlite)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Docker-containerized-2496ED?logo=docker)](https://docker.com)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-HuggingFace%20Spaces-blue?logo=huggingface)](https://huggingface.co/spaces/annahfu1/App)

---

## 📖 Overview

The NYC Places Recommendation System helps users discover restaurants, cafes, museums, nightlife spots, and more across all five boroughs. Users define their preferences — neighborhood, budget, atmosphere, activities — and the engine combines **strict filtering** with **semantic similarity ranking** powered by HuggingFace's `sentence-transformers` to surface the most relevant places.

The project ships with:
- A **FastAPI REST backend** served via Uvicorn
- A **React frontend** for a mobile-style UI experience
- A **Docker** multi-stage build for deployment on HuggingFace Spaces

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 Semantic Search | `all-MiniLM-L6-v2` embeddings for smart ranking |
| 🎯 Strict Filtering | Neighborhood, category, atmosphere, price tier, and more all work as hard filters |
| 💰 Price Tiers | `$` (<$15) · `$$` ($15–40) · `$$$` ($41–80) · `$$$$` (>$80) |
| 🏙️ Neighborhood Filter | Filter by borough or specific NYC neighborhoods |
| 👤 Solo / Group Mode | Find places suited to your crew size |
| 🍸 Drinks Filter | Surface only spots that serve alcohol |
| 🗃️ 139 Curated Locations | Cafes, food, entertainment, museums, nightlife, and more |
| 📱 Mobile-style UI | React frontend with home, search, saved, profile, notifications, and detail screens |
| 🔔 Notifications | In-app notification support |
| 🐳 Dockerized Deployment | Multi-stage Docker build for HuggingFace Spaces |

---

## 🏗️ Architecture

```
CapstoneProject/
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── modals/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── DetailScreen.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── OnboardingFlow.jsx
│   │   │   ├── PlaceCard.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── SavedScreen.jsx
│   │   │   └── SearchScreen.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── constants.js
│   │   ├── hooks.js
│   │   ├── storage.js
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── BottomNav.test.jsx
│   │   │   └── PlaceCard.test.jsx
│   │   ├── integration/
│   │   │   └── SearchScreen.test.jsx
│   │   └── e2e/
│   │       └── userJourney.cy.js
│   ├── babel.config.js
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                          # Python backend
│   ├── tests/
│   │   ├── test_strict_filters.py
│   │   ├── test_atmosphere_filter.py
│   │   ├── test_gradio_params.py
│   │   └── test_upscale_bug.py
│   ├── database/
│   │   ├── create_database.py
│   │   ├── verify_database.py
│   │   ├── check_price_columns.py
│   │   ├── show_schema.py
│   │   └── nyc_places.db
│   ├── main.py
│   ├── recommendation_engine.py
│   └── requirements.txt
│
├── Dockerfile
├── .gitignore
└── README.md
```

---

## ⚙️ How It Works

Recommendations are generated in two stages:

### Stage 1 — Strict Filtering
Every user selection acts as a **hard filter**. A place must match **all** selected criteria to be considered:

- **Neighborhood** — e.g. "Brooklyn", "Upper East Side"
- **Category** — e.g. "Cafe", "Museums", "Night Life"
- **Atmosphere** — e.g. "Upscale", "Casual", "Lively & Social"
- **Max Price Tier** — shows places at or below your budget
- **Activity Type** — "Solo", "Group", or "Both"
- **Drinks** — filters to alcohol-serving venues only

### Stage 2 — Semantic Ranking
Within the filtered results, places are ranked by cosine similarity to your free-text preferences using HuggingFace embeddings:

- **Activities** — e.g. "Eating, Museums, Art"
- **Music Genres** — e.g. "Hip-Hop, Jazz, R&B"

```
User Input → Apply Filters → Generate Embeddings → Cosine Similarity → Top-N Results
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip

### 1. Clone the Repository

```bash
git clone https://github.com/ravencheneg/CapstoneProject.git
cd CapstoneProject
```

### 2. Set Up a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the App

**Gradio Interface** (recommended):
```bash
python app.py
```
Then open [http://127.0.0.1:7860](http://127.0.0.1:7860) in your browser.

**Flask REST API**:
```bash
python flask_api.py
```
API runs at [http://127.0.0.1:5000](http://127.0.0.1:5000).

> 💡 The SQLite database (`nyc_places.db`) is included — no extra setup needed. To rebuild from scratch, run `python create_database.py`.

---

## 🌐 Live Demo

Try the deployed app on HuggingFace Spaces:
👉 **[NYC Places Recommendation App](https://huggingface.co/spaces/annahfu1/App)**

---

## 🔌 API Reference

Base URL: `http://localhost:7860`

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "online",
  "message": "NYC Places Recommendation API",
  "version": "1.0.0"
}
```
### `POST /api/recommendations`

Get recommendations based on user preferences.
**Request Body:**
```json
{
  "preferred_neighborhood": "Manhattan",
  "activities": "Eating, Museums",
  "atmosphere": "Lively & Social",
  "music_genres": "Jazz, Hip-Hop",
  "category": "Cafe",
  "activity_type": "Solo",
  "drinks": true,
  "max_price_tier": "$$",
  "top_n": 10
}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "recommendations": [ ... ]
}
```

### `GET /api/user/<user_id>/recommendations`

Fetch recommendations for a stored user profile.

### `GET /api/places`

Return all 139 places in the database (name, type, category, neighborhood, vibe, price level).


## 💡 Usage Examples

### Basic (Python SDK)

```python
from recommendation_engine import NYCRecommendationEngine

engine = NYCRecommendationEngine()

user_profile = {
    "preferred_neighborhood": "Manhattan",
    "activities": "Eating, Museums",
    "atmosphere": "Lively & Social",
    "drinks": True
}

recommendations = engine.get_recommendations(user_profile, top_n=5)
print(recommendations)
```

### Budget Solo Café Explorer

```python
user_profile = {
    "preferred_neighborhood": "Brooklyn",
    "activities": "Coffee, Reading, Working",
    "atmosphere": "Quiet & Relaxed",
    "category": "Cafe",
    "activity_type": "Solo",
    "max_price_tier": "$"
}
recommendations = engine.get_recommendations(user_profile, top_n=10)
```

### Group Nightlife

```python
user_profile = {
    "preferred_neighborhood": "Manhattan",
    "activities": "Dancing, Music",
    "atmosphere": "Energetic",
    "music_genres": "Hip-Hop, House",
    "category": "Night Life",
    "activity_type": "Group",
    "drinks": True,
    "max_price_tier": "$$$"
}
recommendations = engine.get_recommendations(user_profile, top_n=10)
```

---

## 🗄️ Dataset

The SQLite database (`nyc_places.db`) contains two tables:

| Table | Records | Description |
|---|---|---|
| `places` | 139 | NYC locations with type, category, neighborhood, vibe, price, solo/group fit, music, alcohol |
| `users` | 92 | User profiles with preferences, demographics, and interests |

CSV source files (`Users.csv`, `Places.csv`) are included for reference.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python tests/test_strict_filters.py      # Test strict filter logic
python tests/test_atmosphere_filter.py   # Test atmosphere filtering
python tests/test_gradio_params.py       # Test interface parameters
python tests/test_upscale_bug.py         # Test regression: upscale bug fix
```

### Frontend Tests

```bash
cd frontend

# Run unit & integration tests
npm test

# Run with coverage report
npm run test:coverage

# Run end-to-end tests (start the app first)
npm run dev           # Terminal 1
npm run cypress:open  # Terminal 2
```

| Test Type | Files | What's Covered |
|---|---|---|
| Unit | `BottomNav.test.jsx`, `PlaceCard.test.jsx` | Individual component rendering and interactions |
| Integration | `SearchScreen.test.jsx` | Filters, API calls, results rendering |
| End-to-End | `userJourney.cy.js` | Full user flow from navigation to place detail |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.x |
| ML / Embeddings | HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`) |
| Similarity | scikit-learn (cosine similarity) |
| Data | Pandas, SQLite |
| Backend API | Flask, Flask-CORS |
| Frontend (Gradio) | Gradio 4.19.2 |
| Frontend (Web) | React, JavaScript, CSS |
| Containerization | Docker |

---

## 🔮 Future Enhancements

- [ ] Geolocation integration and travel-time-aware suggestions
- [ ] Cloud deployment (AWS / GCP / Heroku)
- [ ] Expand dataset beyond 139 locations

---

## 👤 Author

**Raven Glenn**
GitHub: [@ravencheneg](https://github.com/ravencheneg)

**Anna Fu**
GitHub: [@annahfu](https://github.com/annahfu)

---

*Built as a Capstone Project — NYC, 2026*
