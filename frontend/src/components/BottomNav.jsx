import { NAV_ITEMS } from '../constants'

export default function BottomNav({ active, onChange }) {
  return (
    <div className="flex border-t border-gray-200 bg-white shrink-0">
      {NAV_ITEMS.map(n => (
        <button
          key={n.id}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors
            ${active === n.id ? 'text-black' : 'text-gray-400'}`}
          onClick={() => onChange(n.id)}
        >
          <span className="text-xl leading-none">{n.icon}</span>
          <span>{n.label}</span>
        </button>
      ))}
    </div>
  )
}
