import { useState } from 'react'
const ICONS = ['📌','🎉','🍕','🍸','🎵','🌙','✨','🥂','🏙️','💫','🔥','🌿']

export default function NewListModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📌')
  function submit() {
    const t = name.trim(); if (!t) return
    onCreate({ name:t, icon }); onClose()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">New list</h3>
        <p className="modal-sub">Give your collection a name and icon</p>
        <div className="filter-field">
          <label className="filter-label">List name</label>
          <input className="filter-input" placeholder="e.g. Birthday Spots…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus/>
        </div>
        <div className="filter-field">
          <label className="filter-label">Choose an icon</label>
          <div className="icon-picker">
            {ICONS.map(ic=><button key={ic} className={`icon-pick-btn ${icon===ic?'icon-pick-active':''}`} onClick={()=>setIcon(ic)}>{ic}</button>)}
          </div>
        </div>
        <button className={`modal-confirm ${!name.trim()?'modal-confirm-disabled':''}`} onClick={submit} disabled={!name.trim()}>Create list</button>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
