from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation_engine import NYCRecommendationEngine
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize recommendation engine
print("Initializing recommendation engine...")
engine = NYCRecommendationEngine()
print("Engine ready!")


@app.route('/')
def home():
    """Health check endpoint."""
    return jsonify({
        'status': 'online',
        'message': 'NYC Places Recommendation API',
        'version': '1.0.0'
    })


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get place recommendations based on user preferences.

    Expected JSON body:
    {
        "preferred_neighborhood": "Manhattan",
        "activities": "Eating, Museums",
        "dining_preferences": "Fine Dining, Rooftop",
        "atmosphere": "Lively & Social",
        "music_genres": "Hip-Hop, Jazz",
        "activity_type": "Both",
        "drinks": true,
        "price_tier": "$$" or ["$$", "$$$"],
        "max_price_tier": "$$",
        "solo_friendly": true,
        "group_friendly": true,
        "category": "Cafe" or ["Cafe", "Entertainment"],
        "top_n": 10
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Get number of recommendations (default 10)
        top_n = data.pop('top_n', 10)

        # Get recommendations
        recommendations = engine.get_recommendations(data, top_n=top_n)

        # Convert to JSON-friendly format
        result = recommendations.to_dict('records')

        return jsonify({
            'success': True,
            'count': len(result),
            'recommendations': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/<user_id>/recommendations', methods=['GET'])
def get_user_recommendations(user_id):
    """Get recommendations for an existing user from the database."""
    try:
        # Get user data
        user_data = engine.get_user_by_id(user_id)

        if not user_data:
            return jsonify({'error': 'User not found'}), 404

        # Get recommendations
        top_n = request.args.get('top_n', default=10, type=int)
        recommendations = engine.get_recommendations(user_data, top_n=top_n)

        # Convert to JSON
        result = recommendations.to_dict('records')

        return jsonify({
            'success': True,
            'user': user_data['name'],
            'count': len(result),
            'recommendations': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/places', methods=['GET'])
def get_all_places():
    """Get all places in the database."""
    try:
        places = engine.places_df[[
            'Place_ID', 'Name_of_place', 'Type', 'Category',
            'Neighborhood', 'Vibe_Type', 'Price_Level'
        ]].to_dict('records')

        return jsonify({
            'success': True,
            'count': len(places),
            'places': places
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/places/<int:place_id>', methods=['GET'])
def get_place_details(place_id):
    """Get details for a specific place."""
    try:
        place = engine.places_df[engine.places_df['Place_ID'] == place_id]

        if place.empty:
            return jsonify({'error': 'Place not found'}), 404

        result = place.to_dict('records')[0]

        return jsonify({
            'success': True,
            'place': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
