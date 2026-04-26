import { useState } from 'react'

export default function AddToPlanModal({ place, collections, onAddToCollections, onClose }) {
  const placeName = place.Name_of_place || place.name
  const [selected, setSelected] = useState([])
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  function toggleCollection(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleSave() {
    onAddToCollections({
      added: selected,
      newCollection: showNew && newName.trim() ? newName.trim() : null,
      placeName,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-gray-900 mb-1">Add to plan</h3>
        <p className="text-xs text-gray-400 mb-4 truncate">{placeName}</p>
        {/* Existing collections */}
        {collections.length > 0 && (
          <div className="space-y-2 mb-4">
            {collections.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCollection(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-colors text-left
                  ${selected.includes(c.id)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className={`text-xs ${selected.includes(c.id) ? 'text-gray-300' : 'text-gray-400'}`}>
                    {c.placeNames.length} {c.placeNames.length === 1 ? 'place' : 'places'}
                  </p>
                </div>
                {selected.includes(c.id) && <span className="text-xs shrink-0">✓</span>}
              </button>
            ))}
          </div>
        )}
        {/* New collection */}
        {showNew ? (
          <div className="mb-4">
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-black transition-colors"
              placeholder="New list name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <button
            className="w-full text-sm text-gray-500 border border-dashed border-gray-200 rounded-2xl py-3 hover:bg-gray-50 transition-colors mb-4"
            onClick={() => setShowNew(true)}
          >+ Create new list</button>
        )}
        <div className="flex gap-3">
          <button
            className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >Cancel</button>
          <button
            className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 transition-colors"
            onClick={handleSave}
          >Save</button>
        </div>
      </div>
    </div>
  )
}