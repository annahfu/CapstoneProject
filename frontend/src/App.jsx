import { useState, useEffect } from 'react'
import './App.css'

import { loadState, saveState, addRecentlyViewed } from './storage'
import { DEFAULT_COLLECTIONS } from './constants'

import BottomNav from './components/BottomNav'
import HomeScreen from './components/HomeScreen'
import SearchScreen from './components/SearchScreen'
import SavedScreen from './components/SavedScreen'
import ProfileScreen from './components/ProfileScreen'
import DetailScreen from './components/DetailScreen'
import OnboardingFlow from './components/OnboardingFlow'
import NewListModal from './components/modals/NewListModal'
import { NotificationBanner, useNotifications } from './components/Notifications'

const DEFAULT_PROFILE = {
  name: 'Explorer',
  vibes: ['Hidden Gems','Rooftops','Cocktail Bars','Live Music','Girls Night','Speakeasies'],
  neighborhoods: ['Lower East Side','Williamsburg','West Village'],
  prefs: { budget:'$$ to $$$', style:'Social but curated', music:'R&B, House, Jazz' },
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() => loadState('onboarded', false))
  const [tab, setTab] = useState('home')
  const [detail, setDetail] = useState(null)
  const [showNewList, setShowNewList] = useState(false)

  const [profile, setProfile] = useState(() => loadState('profile', DEFAULT_PROFILE))
  const [savedList, setSaved] = useState(() => loadState('savedList', []))
  const [collections, setCollections] = useState(() => loadState('collections', DEFAULT_COLLECTIONS))
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadState('recentlyViewed', []))
  const [visitLog, setVisitLog] = useState(() => loadState('visitLog', []))

  useEffect(() => { saveState('profile', profile) }, [profile])
  useEffect(() => { saveState('savedList', savedList) }, [savedList])
  useEffect(() => { saveState('collections', collections) }, [collections])
  useEffect(() => { saveState('recentlyViewed', recentlyViewed) }, [recentlyViewed])
  useEffect(() => { saveState('visitLog', visitLog) }, [visitLog])

  const { notifications, dismiss } = useNotifications(savedList, visitLog)

  // ── Onboarding ────────────────────────────────────────────────────────────
  function handleOnboardingComplete(data) {
    const p = { name:data.name, vibes:data.vibes, neighborhoods:data.neighborhoods,
      prefs:{ budget:data.budget, style:'Social but curated', music:data.music } }
    setProfile(p)
    saveState('profile', p)
    saveState('onboarded', true)
    setOnboarded(true)
  }

  // ── Saved ─────────────────────────────────────────────────────────────────
  function toggleSave(place) {
    const name = place.Name_of_place || place.name
    setSaved(prev => {
      const exists = prev.find(p=>(p.name||p.Name_of_place)===name)
      if (exists) return prev.filter(p=>(p.name||p.Name_of_place)!==name)
      return [...prev, {
        name: place.Name_of_place || place.name,
        type: place.Type || place.type || '',
        neighborhood: place.Neighborhood || place.neighborhood || '',
        note: place.Vibe_Type || place.note || '',
        savedAt: Date.now(),
        _full: place,
      }]
    })
  }

  function isSaved(place) {
    const name = place?.Name_of_place || place?.name
    return savedList.some(p=>(p.name||p.Name_of_place)===name)
  }

  function viewSavedDetail(item) {
    setDetail(item._full || {
      Name_of_place: item.name, Type:item.type,
      Neighborhood: item.neighborhood, Vibe_Type:item.note, similarity_score:1,
    })
  }

  // ── Collections ───────────────────────────────────────────────────────────
  function handleAddToCollections({ added, newCollection, placeName }) {
    setCollections(prev => {
      let u = [...prev]
      if (newCollection) {
        const id = newCollection.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now()
        u = [...u, { id, name:newCollection, icon:'📌', placeNames:[placeName] }]
      }
      if (added) u = u.map(c=>added.includes(c.id)&&!c.placeNames.includes(placeName)?{...c,placeNames:[...c.placeNames,placeName]}:c)
      return u
    })
  }

  function handleCreateCollection({ name, icon }) {
    const id = name.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now()
    setCollections(prev=>[...prev,{id,name,icon,placeNames:[]}])
  }

  function handleRemoveFromCollection(collectionId, placeName) {
    setCollections(prev=>prev.map(c=>c.id===collectionId?{...c,placeNames:c.placeNames.filter(n=>n!==placeName)}:c))
  }

  function handleViewCollection(id) {
    if (id==='new') { setShowNewList(true); return }
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  function handleViewDetail(place) {
    setRecentlyViewed(prev => {
      const updated = addRecentlyViewed(place, prev)
      return updated
    })
    setDetail(place)
  }

  function handleLogVisit(entry) { setVisitLog(prev=>[...prev, entry]) }

  if (!onboarded) return <OnboardingFlow onComplete={handleOnboardingComplete}/>

  if (detail) return (
    <div className="app-shell">
      <div className="phone-frame">
        <NotificationBanner notifications={notifications} onDismiss={dismiss}/>
        <DetailScreen
          place={detail}
          onBack={()=>setDetail(null)}
          onSave={toggleSave}
          saved={isSaved(detail)}
          collections={collections}
          onAddToCollections={handleAddToCollections}
          onLogVisit={handleLogVisit}
          visitLog={visitLog}
          onViewDetail={handleViewDetail}
        />
        <BottomNav active={tab} onChange={t=>{setDetail(null);setTab(t)}}/>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      {showNewList && (
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}}>
          <NewListModal onClose={()=>setShowNewList(false)} onCreate={handleCreateCollection}/>
        </div>
      )}
      <div className="phone-frame">
        <NotificationBanner notifications={notifications} onDismiss={dismiss}/>
        {tab==='home' && (
          <HomeScreen
            profile={profile}
            onViewDetail={handleViewDetail}
            onNavigate={setTab}
            savedList={savedList}
            toggleSave={toggleSave}
            recentlyViewed={recentlyViewed}
            setRecentlyViewed={setRecentlyViewed}
          />
        )}
        {tab==='search' && <SearchScreen onViewDetail={handleViewDetail}/>}
        {tab==='saved' && (
          <SavedScreen
            savedList={savedList}
            toggleSave={toggleSave}
            onViewDetail={viewSavedDetail}
            collections={collections}
            onViewCollection={handleViewCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
          />
        )}
        {tab==='profile' && (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={setProfile}
            visitLog={visitLog}
            savedList={savedList}
          />
        )}
        <BottomNav active={tab} onChange={setTab}/>
      </div>
    </div>
  )
}
