# 🗽 NYC Places Recommendation System

> An AI-powered recommendation engine that suggests NYC venues tailored to your vibe, budget, and neighborhood — backed by semantic search and a curated database of 139 locations.

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-lightgrey?logo=flask)](https://flask.palletsprojects.com)
[![Gradio](https://img.shields.io/badge/Gradio-4.19.2-orange?logo=gradio)](https://gradio.app)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-sentence--transformers-yellow?logo=huggingface)](https://huggingface.co)
[![SQLite](https://img.shields.io/badge/SQLite-embedded-green?logo=sqlite)](https://sqlite.org)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-HuggingFace%20Spaces-blue?logo=huggingface)](https://huggingface.co/spaces/ravencheneg/NYC-places-recommendation)

---

## 📖 Overview

The NYC Places Recommendation System helps users discover restaurants, cafes, museums, nightlife spots, and more across all five boroughs. Users define their preferences — neighborhood, budget, atmosphere, activities — and the engine combines **strict filtering** with **semantic similarity ranking** powered by HuggingFace's `sentence-transformers` to surface the most relevant places.

The project ships with:
- A **Gradio web app** for interactive discovery
- A **Flask REST API** for programmatic access
- A **React/JS frontend** for a mobile-style UI experience

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
| 🖥️ Dual Interface | Gradio app + Flask REST API |

---

## 🏗️ Architecture

```
CapstoneProject/
│
├── app.py                    # Gradio web interface (main entry point)
├── flask_api.py              # REST API (Flask + CORS)
├── recommendation_engine.py  # Core ML logic: filtering + semantic ranking
├── create_database.py        # Build SQLite DB from CSV files
├── verify_database.py        # DB integrity checks
├── check_price_columns.py    # Data validation utility
├── show_schema.py            # Print DB schema
│
├── nyc_places.db             # SQLite database (included)
├── requirements.txt
│
├── frontend/                 # React/JS frontend (phone-frame UI)
│
├── test_strict_filters.py    # Filter behavior tests
├── test_atmosphere_filter.py # Atmosphere filter tests
├── test_gradio_params.py     # Gradio interface tests
└── test_upscale_bug.py       # Regression tests
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
👉 **[NYC Places Recommendation](https://huggingface.co/spaces/ravencheneg/NYC-places-recommendation)**

---

## 🔌 API Reference

Base URL: `http://localhost:5000`

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

### `GET /api/places/<place_id>`

Return full details for a specific place.

---

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

```bash
# Test strict filter logic
python test_strict_filters.py

# Test atmosphere filtering
python test_atmosphere_filter.py

# Test Gradio interface parameters
python test_gradio_params.py

# Test regression: upscale bug fix
python test_upscale_bug.py
```

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

- [ ] User feedback loop to improve recommendations over time
- [ ] Collaborative filtering based on similar user profiles
- [ ] Geolocation integration and travel-time-aware suggestions
- [ ] Cloud deployment (AWS / GCP / Heroku)
- [ ] Expand dataset beyond 139 locations
- [ ] User accounts and saved favorites

---

## 👤 Author

**Raven Cheng**  
GitHub: [@ravencheneg](https://github.com/ravencheneg)

---

*Built as a Capstone Project — NYC, 2024*
