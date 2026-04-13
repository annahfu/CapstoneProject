import { useState } from 'react'

export default function AddToPlanModal({ place, collections, onAddToCollections, onClose }) {
  const placeName = place.Name_of_place || place.name
  const [added,   setAdded]   = useState(()=>collections.filter(c=>c.placeNames.includes(placeName)).map(c=>c.id))
  const [newName, setNewName] = useState('')
  const [success, setSuccess] = useState('')

  function toggle(id) { setAdded(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]) }

  function createList() {
    const t = newName.trim()
    if (!t||collections.find(c=>c.name===t)) return
    onAddToCollections({ newCollection:t, added, placeName })
    setNewName('')
  }

  function confirm() {
    if (!added.length) return
    onAddToCollections({ added, placeName })
    const names = collections.filter(c=>added.includes(c.id)).map(c=>c.name)
    setSuccess(`Added to ${names.join(', ')}!`)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Add to plan</h3>
        <p className="modal-sub">Choose a collection for <strong>{placeName}</strong></p>
        {success ? <div className="success-msg">{success}</div> : (<>
          <div className="collection-pick-list">
            {collections.map(c=>(
              <button key={c.id} className={`collection-pick-row ${added.includes(c.id)?'collection-pick-active':''}`} onClick={()=>toggle(c.id)}>
                <span className="collection-pick-icon">{c.icon}</span>
                <span className="collection-pick-name">{c.name}</span>
                <span className="collection-pick-check">{added.includes(c.id)?'✓':''}</span>
              </button>
            ))}
          </div>
          <div className="new-list-row">
            <input className="new-list-input" placeholder="Create new list…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createList()}/>
            <button className="new-list-btn" onClick={createList}>+</button>
          </div>
          <button className={`modal-confirm ${added.length===0?'modal-confirm-disabled':''}`} onClick={confirm} disabled={added.length===0}>
            Add to {added.length>0?collections.filter(c=>added.includes(c.id)).map(c=>c.name).join(', '):'a collection'}
          </button>
        </>)}
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
