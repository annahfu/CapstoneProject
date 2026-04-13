// SortModal.jsx
import { SORT_OPTIONS } from '../../constants'
export function SortModal({ current, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Sort by</h3>
        <div className="collection-pick-list">
          {SORT_OPTIONS.map(opt=>(
            <button key={opt.id} className={`collection-pick-row ${current===opt.id?'collection-pick-active':''}`} onClick={()=>{onSelect(opt.id);onClose()}}>
              <span className="collection-pick-icon">{opt.icon}</span>
              <span className="collection-pick-name">{opt.label}</span>
              {current===opt.id&&<span className="collection-pick-check">✓</span>}
            </button>
          ))}
        </div>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
