import { NAV_ITEMS } from '../constants'

export default function BottomNav({ active, onChange }) {
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map(n => (
        <button key={n.id} className={`nav-item ${active===n.id?'nav-active':''}`} onClick={()=>onChange(n.id)}>
          <span className="nav-icon">{n.icon}</span>
          <span className="nav-label">{n.label}</span>
        </button>
      ))}
    </div>
  )
}
