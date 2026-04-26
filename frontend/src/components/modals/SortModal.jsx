import { SORT_OPTIONS } from '../../constants'

export function SortModal({ current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-gray-900 mb-4">Sort by</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.id}
              onClick={() => { onSelect(o.id); onClose() }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm transition-colors text-left
                ${current === o.id
                  ? 'bg-black text-white border-black'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <span>{o.label}</span>
              {current === o.id && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
        <button
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-700 py-2 transition-colors"
          onClick={onClose}
        >Cancel</button>
      </div>
    </div>
  )
}