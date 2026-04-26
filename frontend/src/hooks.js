import { useState, useEffect } from 'react'

// ── Clock hook ────────────────────────────────────────────────────────────────
export function useLocalTime() {
  const [time, setTime] = useState(formatTime())

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return time
}

// ── Greeting ──────────────────────────────────────────────────────────────────
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

// ── Time context ──────────────────────────────────────────────────────────────
//
// IMPORTANT — how the backend uses each field:
//
//   atmosphere       → HARD FILTER on Vibe_Type column (keyword match)
//                      Only use this when you want to RESTRICT to a vibe.
//                      Omit it when you want broad results (bars + restaurants + entertainment).
//
//   activities       → Soft semantic signal → "Enjoys X" in user profile text
//                      Influences ranking without eliminating anything.
//                      USE THIS to pull bars, clubs, entertainment to the top.
//
//   dining_preferences → Soft semantic signal → "Dining: X" in user profile text
//                        Same as activities — influences score, not filter.
//
//   drinks: true     → HARD FILTER — only places with Has_Alcohol == "Yes"
//                      Great for happy hour / night out.
//                      Do NOT use for morning/afternoon slots.
//
// Strategy per slot:
//   Food-focused slots (morning, brunch, afternoon):
//     Use atmosphere to restrict to the right vibe + dining_preferences for semantics
//   Drink/entertainment slots (happy hour, evening, night):
//     Omit atmosphere so we get bars, clubs, live music, restaurants all together
//     Use drinks: true + rich activities text to semantically rank the right places up

export function getTimeContext() {
  const hour = new Date().getHours()

  // ── 12am – 6:59am: Late night ─────────────────────────────────────────────
  if (hour >= 0 && hour < 7) {
    return {
      label: 'Late night picks',
      payload: {
        // No atmosphere filter — want bars, diners, late-night spots all together
        activities:         'Late night bars, cocktails, live music, dancing, late night food',
        dining_preferences: 'Late night eating, bars, nightlife',
        drinks:             true,
      },
    }
  }

  // ── 7am – 10:59am: Morning ────────────────────────────────────────────────
  if (hour >= 7 && hour < 11) {
    return {
      label: 'Morning spots',
      payload: {
        atmosphere:         'Cozy',   // restrict to cozy/relaxed places in morning
        activities:         'Coffee, breakfast, brunch, cafes, bakeries',
        dining_preferences: 'Breakfast, Coffee, Brunch, Cafe',
      },
    }
  }

  // ── 11am – 1:59pm: Brunch & lunch ────────────────────────────────────────
  if (hour >= 11 && hour < 14) {
    return {
      label: 'Brunch & lunch',
      payload: {
        // No atmosphere filter — brunch places can be cozy OR lively
        activities:         'Brunch, lunch, brunch cocktails, eggs, casual dining',
        dining_preferences: 'Brunch, Lunch, Casual dining',
      },
    }
  }

  // ── 2pm – 4:59pm: Afternoon ───────────────────────────────────────────────
  if (hour >= 14 && hour < 17) {
    return {
      label: 'Afternoon picks',
      payload: {
        // No atmosphere filter — afternoon can be cafes, museums, galleries, bars
        activities:         'Coffee, light bites, cafes, museums, galleries, art, shopping',
        dining_preferences: 'Casual dining, Coffee, Light bites',
      },
    }
  }

  // ── 5pm – 6:59pm: Happy hour ──────────────────────────────────────────────
  if (hour >= 17 && hour < 19) {
    return {
      label: 'Happy hour',
      payload: {
        // NO atmosphere filter — we want bars, restaurants, rooftops, lounges all showing up
        // drinks: true ensures only alcohol-serving places appear
        activities:         'Happy hour, cocktails, craft beer, wine bars, rooftop bars, live music, entertainment',
        dining_preferences: 'Cocktail bars, Wine bars, Tapas, Happy hour specials',
        drinks:             true,
      },
    }
  }

  // ── 7pm – 8:59pm: Dinner ─────────────────────────────────────────────────
  if (hour >= 19 && hour < 21) {
    return {
      label: 'Dinner spots',
      payload: {
        // No atmosphere filter — dinner can be fine dining, casual, rooftops, etc.
        activities:         'Dinner, fine dining, date night, restaurants, cocktails, wine',
        dining_preferences: 'Dinner, Fine Dining, Sit-down restaurant, Date night',
      },
    }
  }

  // ── 9pm – 11:59pm: Night out ─────────────────────────────────────────────
  return {
    label: 'Night out picks',
    payload: {
      // NO atmosphere filter — want bars, clubs, live music, rooftops, late restaurants
      activities:         'Bars, cocktail bars, live music, dancing, clubs, nightlife, rooftop, entertainment',
      dining_preferences: 'Cocktail bars, Nightlife, Bars, Late night',
      drinks:             true,
    },
  }
}