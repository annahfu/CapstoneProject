import { useState } from 'react'

const ICON_OPTIONS = ['📍', '🍸', '🌙', '🎵', '💃', '🌆', '❤️', '🎉', '🍽️', '☕', '🌿', '✨']

export default function NewListModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📍')

  function handleCreate() {
    if (!name.trim()) return
    onCreate({ name: name.trim(), icon })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-gray-900 mb-4">New list</h3>
        {/* Icon picker */}
        <div className="flex gap-2 flex-wrap mb-4">
          {ICON_OPTIONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-colors
                ${icon === ic ? 'bg-black' : 'bg-gray-100 hover:bg-gray-200'}`}
            >{ic}</button>
          ))}
        </div>
        {/* Name input */}
        <input
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 outline-none focus:border-black transition-colors mb-4"
          placeholder="List name (e.g. Date Night, Brunch Spots)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
        <div className="flex gap-3">
          <button
            className="flex-1 border border-gray-200 text-sm font-medium py-3 rounded-2xl hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >Cancel</button>
          <button
            className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-900 disabled:opacity-40 transition-colors"
            onClick={handleCreate}
            disabled={!name.trim()}
          >Create list</button>
        </div>
      </div>
    </div>
  )
}