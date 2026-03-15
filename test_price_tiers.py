"""
Test script to verify price tier filtering functionality.
"""
from recommendation_engine import NYCRecommendationEngine


def test_price_tiers():
    """Test price tier filtering with various scenarios."""
    print("Initializing recommendation engine...")
    engine = NYCRecommendationEngine()

    # Display price tier distribution
    print("\n" + "="*70)
    print("PRICE TIER DISTRIBUTION IN DATASET")
    print("="*70)
    print(f"\nTotal places: {len(engine.places_df)}")

    tier_counts = engine.places_df['price_tier'].value_counts().sort_index()
    print("\nDistribution by tier:")
    for tier, count in tier_counts.items():
        print(f"  {tier}: {count} places")

    no_price = engine.places_df['price_tier'].isna().sum()
    print(f"  No price info: {no_price} places")

    # Test Case 1: Budget-conscious user ($ tier only)
    print("\n" + "="*70)
    print("TEST 1: Budget-conscious user ($ tier only)")
    print("="*70)

    user1 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Eating, Cafes',
        'atmosphere': 'Casual',
        'max_price_tier': "$"  # Only $ tier
    }

    recs1 = engine.get_recommendations(user1, top_n=5)
    print(f"\nFound {len(recs1)} recommendations in $ tier")
    print("\nTop 5 Budget-Friendly Recommendations:")
    for idx, row in recs1.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Price Tier: {row['price_tier']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 2: Mid-range budget ($ and $$ tiers)
    print("\n" + "="*70)
    print("TEST 2: Mid-range budget ($ and $$ tiers)")
    print("="*70)

    user2 = {
        'preferred_neighborhood': 'Brooklyn',
        'activities': 'Eating, Dining',
        'atmosphere': 'Lively & Social',
        'max_price_tier': "$$"  # Up to $$ tier
    }

    recs2 = engine.get_recommendations(user2, top_n=5)
    print(f"\nFound {len(recs2)} recommendations in $ and $$ tiers")
    print("\nTop 5 Mid-Range Recommendations:")
    for idx, row in recs2.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Price Tier: {row['price_tier']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 3: High-end dining ($$$ or $$$$ only)
    print("\n" + "="*70)
    print("TEST 3: High-end dining ($$$ and $$$$ tiers)")
    print("="*70)

    user3 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Fine Dining',
        'dining_preferences': 'Fine Dining, Rooftop',
        'atmosphere': 'Upscale',
        'price_tier': ["$$$", "$$$$"]  # Only high-end
    }

    recs3 = engine.get_recommendations(user3, top_n=5)
    print(f"\nFound {len(recs3)} recommendations in $$$ and $$$$ tiers")
    print("\nTop 5 High-End Recommendations:")
    for idx, row in recs3.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Price Tier: {row['price_tier']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 4: Specific tier only ($$ tier)
    print("\n" + "="*70)
    print("TEST 4: Moderate pricing only ($$ tier)")
    print("="*70)

    user4 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Dining, Entertainment',
        'atmosphere': 'Social',
        'price_tier': "$$"  # Only $$ tier
    }

    recs4 = engine.get_recommendations(user4, top_n=5)
    print(f"\nFound {len(recs4)} recommendations in $$ tier only")
    print("\nTop 5 Moderate-Price Recommendations:")
    for idx, row in recs4.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Price Tier: {row['price_tier']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 5: No price filter
    print("\n" + "="*70)
    print("TEST 5: No price filter - all price ranges")
    print("="*70)

    user5 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Museums, Art',
        'atmosphere': 'Quiet'
    }

    recs5 = engine.get_recommendations(user5, top_n=5)
    print(f"\nFound {len(recs5)} recommendations (no price filter)")
    print("\nTop 5 Recommendations:")
    for idx, row in recs5.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Type: {row['Type']} | Neighborhood: {row['Neighborhood']}")
        print(f"    Price Tier: {row['price_tier']} | Price: {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    print("\n" + "="*70)
    print("All price tier tests completed successfully!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_price_tiers()
