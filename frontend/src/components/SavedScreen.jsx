import { useState } from 'react'
import { useLocalTime } from '../hooks'
import { SORT_OPTIONS } from '../constants'
import { SortModal } from './modals/SortModal'
import PlaceCard from './PlaceCard'

function CollectionDetailScreen({ collection, savedList, onViewDetail, onRemove, onBack }) {
  const time = useLocalTime()
  const places = savedList.filter(p => collection.placeNames.includes(p.name))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-black text-white px-5 pt-4 pb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{time}</span><span>Collection</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <button
            className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full text-white"
            onClick={onBack}
          >←</button>
          <span className="text-3xl">{collection.icon}</span>
        </div>
        <h2 className="text-xl font-bold">{collection.name}</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {places.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No places here yet. Use "Add to plan" on any place to add here!
          </p>
        ) : (
          <div className="space-y-2">
            {places.map((p, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onViewDetail(p)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-gray-900">{p.name}</h4>
                      {p.type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                          {p.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.neighborhood}</p>
                    {p.note && <p className="text-xs text-gray-500 mt-1">{p.note}</p>}
                  </div>
                  <button
                    className="text-gray-300 hover:text-gray-600 text-sm shrink-0 transition-colors"
                    onClick={e => { e.stopPropagation(); onRemove(collection.id, p.name) }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedScreen({ savedList, toggleSave, onViewDetail, collections, onViewCollection, onRemoveFromCollection }) {
  const time = useLocalTime()
  const [sortBy, setSortBy] = useState('recent')
  const [showSort, setShowSort] = useState(false)
  const [activeCol, setActiveCol] = useState(null)

  const sortedSaves = [...savedList].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'neighborhood') return (a.neighborhood || '').localeCompare(b.neighborhood || '')
    if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '')
    return b.savedAt - a.savedAt
  })
  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label || 'Recently saved'

  if (activeCol) {
    const col = collections.find(c => c.id === activeCol)
    return (
      <CollectionDetailScreen
        collection={col}
        savedList={savedList}
        onViewDetail={onViewDetail}
        onRemove={onRemoveFromCollection}
        onBack={() => setActiveCol(null)}
      />
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showSort && (
        <SortModal current={sortBy} onSelect={setSortBy} onClose={() => setShowSort(false)} />
      )}
      <div className="bg-black text-white px-5 pt-4 pb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>{time}</span><span>Saved</span>
        </div>
        <p className="text-sm text-gray-400 mb-0.5">Your lists and favorites</p>
        <h1 className="text-2xl font-bold">Saved places</h1>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {/* Collections */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Collections</h3>
            <button
              className="text-xs text-gray-500 hover:text-black transition-colors"
              onClick={() => onViewCollection('new')}
            >+ New list</button>
          </div>
          {collections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-semibold text-gray-800 mb-1">No lists yet</p>
              <p className="text-xs text-gray-400 mb-4">
                Tap "+ New list" to create your first collection — like Date Night, Brunch Spots, or Hidden Gems.
              </p>
              <button
                className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition-colors"
                onClick={() => onViewCollection('new')}
              >+ Create your first list</button>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 cursor-pointer py-2 hover:bg-gray-50 rounded-xl px-1 transition-colors"
                  onClick={() => setActiveCol(c.id)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-xl shrink-0">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {c.placeNames.length} {c.placeNames.length === 1 ? 'place' : 'places'}
                    </p>
                  </div>
                  <span className="text-gray-300 text-sm">→</span>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Recently saved */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Recently saved</h3>
            <button
              className="text-xs text-gray-500 hover:text-black transition-colors"
              onClick={() => setShowSort(true)}
            >↕ {currentSortLabel}</button>
          </div>
          {savedList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No saved places yet. Go to Home and heart a recommendation!
            </p>
          ) : (
            <div className="space-y-2">
              {sortedSaves.map((p, i) => (
                <PlaceCard
                  key={i}
                  place={p}
                  onClick={() => onViewDetail(p)}
                  onUnsave={() => toggleSave(p)}
                  showUnsave
                />
              ))}
            </div>
          )}
        </section>
        {/* Banner */}
        <div className="bg-black text-white rounded-2xl p-4 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Organize smarter</p>
            <h3 className="font-bold text-base">Build lists by mood</h3>
            <p className="text-xs text-gray-400 mt-1">
              Group saved places into collections like rooftop nights, birthdays, or cozy date spots.
            </p>
          </div>
          <span className="text-2xl shrink-0">📌</span>
        </div>
      </div>
    </div>
  )
}
