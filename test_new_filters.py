"""
Test script to verify Solo/Group Friendly and Category filtering.
"""
from recommendation_engine import NYCRecommendationEngine


def test_new_filters():
    """Test solo/group friendly and category filtering."""
    print("Initializing recommendation engine...")
    engine = NYCRecommendationEngine()

    # Display category distribution
    print("\n" + "="*70)
    print("CATEGORY DISTRIBUTION IN DATASET")
    print("="*70)
    category_counts = engine.places_df['Category'].value_counts()
    print("\nAvailable categories:")
    for category, count in category_counts.items():
        print(f"  {category}: {count} places")

    # Display Solo/Group friendly stats
    print("\n" + "="*70)
    print("SOLO/GROUP FRIENDLY DISTRIBUTION")
    print("="*70)
    solo_count = (engine.places_df['Solo_Friendly'] == 'Yes').sum()
    group_count = (engine.places_df['Group_Friendly'] == 'Yes').sum()
    both_count = ((engine.places_df['Solo_Friendly'] == 'Yes') &
                  (engine.places_df['Group_Friendly'] == 'Yes')).sum()

    print(f"\nSolo Friendly: {solo_count} places")
    print(f"Group Friendly: {group_count} places")
    print(f"Both Solo & Group Friendly: {both_count} places")

    # Test Case 1: Solo-friendly cafes
    print("\n" + "="*70)
    print("TEST 1: Solo-friendly cafes in Manhattan")
    print("="*70)

    user1 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Working, Reading',
        'atmosphere': 'Quiet & Relaxed',
        'category': 'Cafe',
        'solo_friendly': True,
        'max_price_tier': '$$'
    }

    recs1 = engine.get_recommendations(user1, top_n=5)
    print(f"\nFound {len(recs1)} solo-friendly cafe recommendations")
    print("\nTop 5 Solo-Friendly Cafes:")
    for idx, row in recs1.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Category: {row['Category']} | Type: {row['Type']}")
        print(f"    Neighborhood: {row['Neighborhood']}")
        print(f"    Price: {row['price_tier']} | {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 2: Group-friendly entertainment
    print("\n" + "="*70)
    print("TEST 2: Group-friendly entertainment venues")
    print("="*70)

    user2 = {
        'preferred_neighborhood': 'Brooklyn',
        'activities': 'Entertainment, Social',
        'atmosphere': 'Lively',
        'category': 'Entertainment',
        'group_friendly': True
    }

    recs2 = engine.get_recommendations(user2, top_n=5)
    print(f"\nFound {len(recs2)} group-friendly entertainment recommendations")
    print("\nTop 5 Group-Friendly Entertainment Venues:")
    for idx, row in recs2.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Category: {row['Category']} | Type: {row['Type']}")
        print(f"    Neighborhood: {row['Neighborhood']}")
        print(f"    Price: {row['price_tier']} | {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 3: Multiple categories filter
    print("\n" + "="*70)
    print("TEST 3: Multiple categories (Cafe, Entertainment)")
    print("="*70)

    user3 = {
        'preferred_neighborhood': 'Manhattan',
        'activities': 'Coffee, Shows',
        'category': ['Cafe', 'Entertainment'],
        'max_price_tier': '$$'
    }

    recs3 = engine.get_recommendations(user3, top_n=5)
    print(f"\nFound {len(recs3)} recommendations in Cafe and Entertainment")
    print("\nTop 5 Recommendations:")
    for idx, row in recs3.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Category: {row['Category']} | Type: {row['Type']}")
        print(f"    Neighborhood: {row['Neighborhood']}")
        print(f"    Price: {row['price_tier']} | {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 4: Combined filters - Solo, Gallery, Budget
    print("\n" + "="*70)
    print("TEST 4: Solo-friendly galleries (budget-conscious)")
    print("="*70)

    user4 = {
        'preferred_neighborhood': 'Lower East Side',
        'activities': 'Art, Galleries',
        'atmosphere': 'Quiet, Artistic',
        'category': 'Gallery',
        'solo_friendly': True,
        'max_price_tier': '$'
    }

    recs4 = engine.get_recommendations(user4, top_n=5)
    print(f"\nFound {len(recs4)} solo-friendly gallery recommendations")
    print("\nTop 5 Solo-Friendly Galleries:")
    for idx, row in recs4.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Category: {row['Category']} | Type: {row['Type']}")
        print(f"    Neighborhood: {row['Neighborhood']}")
        print(f"    Price: {row['price_tier']} | {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    # Test Case 5: Group-friendly nightlife with multiple filters
    print("\n" + "="*70)
    print("TEST 5: Group-friendly nightlife (mid-range pricing)")
    print("="*70)

    user5 = {
        'preferred_neighborhood': 'Brooklyn',
        'activities': 'Dancing, Music',
        'atmosphere': 'Energetic, Party',
        'music_genres': 'Hip-Hop, House',
        'category': 'Night Life',
        'group_friendly': True,
        'drinks': True,
        'max_price_tier': '$$'
    }

    recs5 = engine.get_recommendations(user5, top_n=5)
    print(f"\nFound {len(recs5)} group-friendly nightlife recommendations")
    print("\nTop 5 Nightlife Spots:")
    for idx, row in recs5.iterrows():
        print(f"\n  {row['Name_of_place']}")
        print(f"    Category: {row['Category']} | Type: {row['Type']}")
        print(f"    Neighborhood: {row['Neighborhood']}")
        print(f"    Price: {row['price_tier']} | {row['Price_Level']}")
        print(f"    Match Score: {row['similarity_score']:.3f}")

    print("\n" + "="*70)
    print("All new filter tests completed successfully!")
    print("="*70 + "\n")


if __name__ == "__main__":
    test_new_filters()
