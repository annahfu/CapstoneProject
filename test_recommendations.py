"""
Test script to verify the recommendation engine works correctly.
"""
from recommendation_engine import NYCRecommendationEngine


def test_basic_recommendations():
    """Test basic recommendation functionality."""
    print("Initializing recommendation engine...")
    engine = NYCRecommendationEngine()

    # Test Case 1: User who likes lively social places
    print("\n" + "="*70)
    print("TEST 1: User who enjoys lively social dining")
    print("="*70)

    user1 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Eating',
        'dining_preferences': 'Fine Dining, Rooftop',
        'atmosphere': 'Lively & Social',
        'music_genres': 'Hip-Hop, R&B',
        'activity_type': 'Group',
        'drinks': True
    }

    recs1 = engine.get_recommendations(user1, top_n=5)
    print("\nTop 5 Recommendations:")
    for idx, row in recs1.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Vibe: {row['Vibe_Type']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 2: Solo user who likes quiet, relaxed cafes
    print("\n" + "="*70)
    print("TEST 2: Solo user who prefers quiet cafes")
    print("="*70)

    user2 = {
        'preferred_neighborhood': 'Brooklyn',
        'activities': 'Reading, Working',
        'atmosphere': 'Quiet & Relaxed',
        'activity_type': 'Solo',
        'drinks': False
    }

    recs2 = engine.get_recommendations(user2, top_n=5)
    print("\nTop 5 Recommendations:")
    for idx, row in recs2.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Vibe: {row['Vibe_Type']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 3: Get existing user from database
    print("\n" + "="*70)
    print("TEST 3: Recommendations for existing user from database")
    print("="*70)

    user_id = engine.users_df['#'].iloc[0]  # Get first user ID
    user_data = engine.get_user_by_id(user_id)

    if user_data:
        print(f"\nUser: {user_data['name']}")
        print(f"Preferred Area: {user_data['preferred_neighborhood']}")
        print(f"Activities: {user_data['activities']}")

        recs3 = engine.get_recommendations(user_data, top_n=5)
        print("\nTop 5 Recommendations:")
        for idx, row in recs3.iterrows():
            print(f"\n  {row['Name_of_place']}")
            print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
            print(f"    Vibe: {row['Vibe_Type']} | Price: {row['Price_Level']}")
            print(f"    Match Score: {row['similarity_score']:.3f}")

    print("\n" + "="*70)
    print("All tests completed successfully!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_basic_recommendations()
