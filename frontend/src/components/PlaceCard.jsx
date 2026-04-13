export default function PlaceCard({ place, onClick, onUnsave, showUnsave }) {
  const name  = place.Name_of_place || place.name
  const type  = place.Type          || place.type  || ''
  const hood  = place.Neighborhood  || place.neighborhood || ''
  const vibe  = place.Vibe_Type     || place.note  || ''
  const score = place.similarity_score != null
    ? `${(place.similarity_score * 100).toFixed(0)}% match`
    : null

  return (
    <div className="place-card" onClick={onClick}>
      <div className="place-card-top">
        <div className="place-card-info">
          <div className="place-name-row">
            <h4 className="place-name">{name}</h4>
            {type && <span className="place-type-badge">{type}</span>}
          </div>
          {hood && <p className="place-neighborhood">{hood}</p>}
          {vibe && <p className="place-vibe">{vibe}</p>}
        </div>
        {score && <span className="match-badge">{score}</span>}
        {showUnsave && (
          <button className="heart-btn" onClick={e=>{e.stopPropagation();onUnsave()}}>❤️</button>
        )}
      </div>
      <div className="tag-row">
        {[place.Category||place.type, place.price_tier].filter(Boolean).map(t=>(
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </div>
  )
}
