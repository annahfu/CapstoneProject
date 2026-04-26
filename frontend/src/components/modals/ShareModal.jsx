import { useState } from 'react'

export default function ShareModal({ place, onClose }) {
  const name         = place.Name_of_place || place.name
  const neighborhood = place.Neighborhood  || place.neighborhood || ''
  const type         = place.Type          || place.type         || ''
  const vibe         = place.Vibe_Type     || place.note         || ''
  const address      = place.Address       || ''

  // Build share text line by line so it reads naturally
  const lines = [
    `Check out ${name} in ${neighborhood}${type ? ` — a great ${type} spot` : ''}.`,
    vibe    ? `"${vibe}"` : null,
    address ? `📍 ${address}` : null,
    address
      ? `🗺 https://maps.google.com/?q=${encodeURIComponent(address)}`
      : `🗺 https://maps.google.com/?q=${encodeURIComponent(`${name}, ${neighborhood}, New York City`)}`,
  ].filter(Boolean)

  const shareTitle = `${name} — DROP'IN`
  const shareText  = lines.join('\n')

  const [copied,   setCopied]   = useState(false)
  const [shareErr, setShareErr] = useState(false)

  // Native share sheet — opens WhatsApp, Messages, Instagram, etc.
  async function handleNativeShare() {
    if (!navigator.share) {
      handleCopy()
      return
    }
    try {
      await navigator.share({ title: shareTitle, text: shareText })
    } catch (e) {
      if (e.name !== 'AbortError') setShareErr(true)
    }
  }

  const encodedText = encodeURIComponent(shareText)

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  }

  function shareMessages() {
    window.open(`sms:?body=${encodedText}`, '_blank')
  }

  function shareInstagram() {
    // Instagram has no share URL — copy so user can paste into DM or Story
    handleCopy()
    setShareErr(false)
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const SHARE_OPTIONS = [
    {
      id:      'native',
      label:   'Share via…',
      emoji:   '📤',
      desc:    'Messages, WhatsApp, and more',
      onClick: handleNativeShare,
      show:    hasNativeShare,
    },
    {
      id:      'whatsapp',
      label:   'WhatsApp',
      emoji:   '💬',
      desc:    'Send in a chat',
      onClick: shareWhatsApp,
      show:    true,
    },
    {
      id:      'messages',
      label:   'Messages',
      emoji:   '✉️',
      desc:    'Send as a text',
      onClick: shareMessages,
      show:    true,
    },
    {
      id:      'instagram',
      label:   'Instagram',
      emoji:   '📸',
      desc:    'Copy text to paste in DM or Story',
      onClick: shareInstagram,
      show:    true,
    },
    {
      id:      'twitter',
      label:   'X / Twitter',
      emoji:   '🐦',
      desc:    'Post a tweet',
      onClick: shareTwitter,
      show:    true,
    },
    {
      id:      'copy',
      label:   copied ? 'Copied!' : 'Copy text',
      emoji:   copied ? '✓' : '📋',
      desc:    'Paste anywhere',
      onClick: handleCopy,
      show:    true,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
        {/* Header */}
        <div className="px-5 pb-3">
          <h3 className="text-base font-bold text-gray-900">Share this place</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{name} · {neighborhood}</p>
        </div>
        {/* Preview — shows exactly what will be sent */}
        <div className="mx-5 mb-4 bg-gray-50 rounded-2xl px-4 py-3 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed break-all">{line}</p>
          ))}
        </div>
        {/* Feedback banners */}
        {copied && (
          <div className="mx-5 mb-3 bg-green-50 text-green-700 text-xs rounded-xl px-3 py-2">
            Copied! Paste it into your Instagram DM or Story ✓
          </div>
        )}
        {shareErr && (
          <div className="mx-5 mb-3 bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
            Sharing failed — try copying the text instead.
          </div>
        )}
        {/* Share options */}
        <div className="px-5 pb-6 space-y-2">
          {SHARE_OPTIONS.filter(o => o.show).map(o => (
            <button
              key={o.id}
              onClick={o.onClick}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-colors text-left
                ${o.id === 'copy' && copied
                  ? 'bg-green-50 border-green-200'
                  : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <span className="text-2xl w-8 text-center leading-none">{o.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{o.label}</p>
                <p className="text-xs text-gray-400">{o.desc}</p>
              </div>
              <span className="text-gray-300 text-sm shrink-0">›</span>
            </button>
          ))}
          <button
            className="w-full text-sm text-gray-400 hover:text-gray-700 py-3 transition-colors"
            onClick={onClose}
          >Cancel</button>
        </div>
      </div>
    </div>
  )
}