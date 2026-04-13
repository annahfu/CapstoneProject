// Cities shown in the City dropdown
export const CITIES = ["Any", "Queens", "Manhattan", "Brooklyn"]

// Neighborhoods by city — used to filter neighborhood list based on city selection
export const NEIGHBORHOODS_BY_CITY = {
  Any:       ["Any","SoHo","West Village","East Village","Lower East Side","Upper West Side","Upper East Side","Midtown","Williamsburg","Fort Greene","Park Slope","Brooklyn Heights","Astoria","Harlem","Chelsea","Tribeca","Bronx","Staten Island"],
  Manhattan: ["Any","SoHo","West Village","East Village","Lower East Side","Upper West Side","Upper East Side","Midtown","Harlem","Chelsea","Tribeca"],
  Brooklyn:  ["Any","Williamsburg","Fort Greene","Park Slope","Brooklyn Heights"],
  Queens:    ["Any","Astoria"],
}

export const NEIGHBORHOODS = [
  "Any","SoHo","West Village","East Village","Lower East Side",
  "Upper West Side","Upper East Side","Midtown","Williamsburg",
  "Fort Greene","Park Slope","Brooklyn Heights","Astoria",
  "Harlem","Chelsea","Tribeca","Bronx","Staten Island"
]
export const VIBES         = ["Any","Lively & Social","Quiet & Relaxed","Casual","Upscale","Energetic","Artistic"]
export const PRICE_TIERS   = ["Any","$","$$","$$$","$$$$"]
export const ACTIVITY_TYPES= ["Any","Solo","Group","Both"]
export const VIBE_CHIPS    = ["Chill","Rooftop","Hidden Gem","Girls Night","Cocktails","Live Music"]

export const NAV_ITEMS = [
  { id:'home',    icon:'🏠', label:'Home'    },
  { id:'search',  icon:'🔍', label:'Search'  },
  { id:'saved',   icon:'❤️', label:'Saved'   },
  { id:'profile', icon:'👤', label:'Profile' },
]

export const SORT_OPTIONS = [
  { id:'recent',       label:'Recently saved', icon:'🕐' },
  { id:'name',         label:'Name (A–Z)',      icon:'🔤' },
  { id:'neighborhood', label:'Neighborhood',    icon:'📍' },
  { id:'type',         label:'Type',            icon:'🏷️' },
]

// New users start with no collections — they create their own via "+ New list"
export const DEFAULT_COLLECTIONS = []

export const ALL_VIBE_TAGS = [
  'Hidden Gems','Rooftops','Cocktail Bars','Live Music','Girls Night','Speakeasies',
  'Date Night','Brunch','Dancing','Jazz Bars','Dive Bars','Fine Dining',
  'Outdoor Spots','Sports Bars','Karaoke','Comedy Shows','Art Galleries','Wine Bars'
]
export const ALL_EDIT_NEIGHBORHOODS = [
  'Lower East Side','Williamsburg','West Village','East Village','SoHo',
  'Midtown','Upper East Side','Upper West Side','Brooklyn Heights',
  'Astoria','Park Slope','Fort Greene','Harlem','Chelsea','Tribeca'
]
export const BUDGET_OPTIONS = ['$','$$ to $$$','$$$','$$$$','Any budget']
export const STYLE_OPTIONS  = ['Solo explorer','Social but curated','Group outings','Spontaneous','Planning ahead']
export const MUSIC_OPTIONS  = ['R&B, House, Jazz','Hip-Hop, R&B','Electronic, House','Jazz, Blues','Pop, Top 40','Latin, Afrobeats','No preference']
