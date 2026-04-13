---
title: NYC Places Recommendation
emoji: 🗽
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.19.2
app_file: app.py
pinned: false
---

# NYC Places Recommendation System

A recommendation engine that suggests NYC places to visit based on user interests and demographics, powered by HuggingFace transformers.

## Features

- 🤖 Uses HuggingFace `sentence-transformers` for semantic similarity matching
- 🎯 **Strict filtering** - all selections work as hard filters, not preferences
- 🚀 Interactive Gradio web interface
- 💾 SQLite database for portable, embedded data storage
- 💰 Price tier filtering system ($, $$, $$$, $$$$)
- 🏷️ Category-based filtering (Cafe, Food, Entertainment, Museums, etc.)
- 👤 Solo/Group friendly filtering
- 🌆 Neighborhood filtering - only show places in selected area
- 📊 139 curated NYC locations across all boroughs

## Setup

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

**The SQLite database (`nyc_places.db`) is included in the repository** - no setup needed!

If you need to recreate it from CSV files:
```bash
python create_database.py
```

### 3. Run the Application

**Gradio Web Interface**:
```bash
python app.py
```
Then open your browser to the URL shown (usually `http://127.0.0.1:7860`)

**Or visit the deployed app**: [NYC Places Recommendation on HuggingFace](https://huggingface.co/spaces/ravencheneg/NYC-places-recommendation)

## How It Works

### Strict Filtering (Step 1)
All user selections work as **strict filters** - only places matching ALL criteria are shown:

- **`preferred_neighborhood`**: String - Only show places in this neighborhood (e.g., "Manhattan", "Upper East Side")
- **`category`**: String or Array - Only show places in this category (e.g., "Cafe", "Food")
- **`atmosphere`**: String - Only show places with matching vibe (e.g., "Upscale", "Casual", "Lively & Social")
- **`max_price_tier`**: String - Only show places at or below this price tier
  - `$` = Under $15
  - `$$` = $15-$40
  - `$$$` = $41-$80
  - `$$$$` = Over $80
- **`activity_type`**: String - Filter by "Solo", "Group", or "Both"
- **`drinks`**: Boolean - Only show places that serve alcohol

### Semantic Ranking (Step 2)
Within filtered results, places are ranked by similarity to your preferences:

- **`activities`**: String - Activities you enjoy (e.g., "Eating, Museums, Art")
- **`music_genres`**: String - Music preferences (e.g., "Hip-Hop, Jazz, R&B")

### Technical Process
1. **Apply Filters**: Removes all places that don't match your selected criteria
2. **Create Embeddings**: Uses HuggingFace's `all-MiniLM-L6-v2` model to generate semantic embeddings
3. **Calculate Similarity**: Computes cosine similarity between your preferences and remaining places
4. **Return Results**: Shows top-N places ranked by similarity score

## Example Usage

### Basic Usage
```python
from recommendation_engine import NYCRecommendationEngine

engine = NYCRecommendationEngine()

user_profile = {
    'preferred_neighborhood': 'Manhattan',
    'activities': 'Eating, Museums',
    'atmosphere': 'Lively & Social',
    'drinks': True
}

recommendations = engine.get_recommendations(user_profile, top_n=5)
print(recommendations)
```

### Advanced Usage with Filters
```python
# Budget-conscious solo cafe explorer
user_profile = {
    'preferred_neighborhood': 'Brooklyn',
    'activities': 'Coffee, Reading, Working',
    'atmosphere': 'Quiet & Relaxed',
    'category': 'Cafe',
    'solo_friendly': True,
    'max_price_tier': '$'
}

recommendations = engine.get_recommendations(user_profile, top_n=10)

# Group nightlife with price range
user_profile = {
    'preferred_neighborhood': 'Manhattan',
    'activities': 'Dancing, Music',
    'atmosphere': 'Energetic',
    'music_genres': 'Hip-Hop, House',
    'category': 'Night Life',
    'group_friendly': True,
    'price_tier': ['$$', '$$$'],
    'drinks': True
}

recommendations = engine.get_recommendations(user_profile, top_n=10)
```
## User Interface
The UI walks users through the full discovery experience: a first-time onboarding flow gathers taste preferences, neighborhoods, and budget, then drops users into a home feed of personalized suggestions. The Search screen lets users apply strict filters to find exactly what they're looking for, while the Saved screen organizes favorites into custom collections. A Detail view surfaces place info and lets users log visits, and a Profile screen lets them update their preferences at any time. The whole app is wrapped in a phone-frame layout with a persistent bottom navigation bar.
## Tech Stack

- **Python 3.x**
- **Docker**
- **HuggingFace sentence-transformers**: Semantic embeddings
- **Pandas**: Data manipulation
- **scikit-learn**: Cosine similarity calculations
- **SQLite**: Embedded database

## Testing

Run the included test scripts to verify functionality:

```bash
# Test strict filtering behavior
python test_strict_filters.py

# Test atmosphere filtering
python test_atmosphere_filter.py
```

## Dataset

The system uses a **SQLite database** (`nyc_places.db`) containing:

- **Users table**: 92 user profiles with preferences, demographics, and interests
- **Places table**: 139 NYC locations with attributes including:
  - Type, Category, Neighborhood
  - Vibe and Crowd Type
  - Price Level, Solo/Group Friendliness
  - Music, Alcohol, and Smoking availability

**CSV files** (`Users.csv` and `Places.csv`) are also included for reference and can be used to recreate the database.

## Future Enhancements

- Implement user feedback loop for better recommendations
- Add collaborative filtering based on similar users
- Integrate geolocation and travel time calculations
- Deploy to cloud platform (Heroku, AWS, GCP)
- Add more NYC locations to the database
