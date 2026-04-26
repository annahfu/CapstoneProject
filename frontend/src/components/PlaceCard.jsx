export default function PlaceCard({ place, onClick, onUnsave, showUnsave }) {
  const name = place.Name_of_place || place.name
  const type = place.Type          || place.type  || ''
  const hood = place.Neighborhood  || place.neighborhood || ''
  const vibe = place.Vibe_Type     || place.note  || ''

  // similarity_score is still used internally by the backend for ranking
  // but we don't display it to users

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-gray-900 leading-snug">{name}</h4>
            {type && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                {type}
              </span>
            )}
          </div>
          {hood && <p className="text-xs text-gray-400 mt-0.5">{hood}</p>}
          {vibe && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{vibe}</p>}
        </div>
        {/* % match badge removed — score hidden from users */}
        {showUnsave && (
          <button
            className="text-base shrink-0"
            onClick={e => { e.stopPropagation(); onUnsave() }}
          >❤️</button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap mt-2">
        {[place.Category || place.type, place.price_tier].filter(Boolean).map(t => (
          <span key={t} className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}