import { useState } from 'react'

export default function ShareModal({ place, onClose }) {
  const [copied, setCopied] = useState(false)
  const name      = place.Name_of_place || place.name
  const shareText = `Check out ${name} in ${place.Neighborhood||place.neighborhood}! ${place.Vibe_Type||place.note||''} ${place.price_tier||''}`
  const shareUrl  = window.location.href

  async function handleNativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: name, text: shareText, url: shareUrl }) }
      catch(e) {}
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  const enc = encodeURIComponent(shareText)
  const shareOptions = [
    { label:'Copy link',    icon:'🔗', action: copyLink },
    { label:'iMessage',     icon:'💬', action: ()=>window.open(`sms:?body=${enc}`) },
    { label:'WhatsApp',     icon:'🟢', action: ()=>window.open(`https://wa.me/?text=${enc}`) },
    { label:'Instagram',    icon:'📸', action: ()=>window.open('https://instagram.com') },
    { label:'X / Twitter',  icon:'🐦', action: ()=>window.open(`https://twitter.com/intent/tweet?text=${enc}`) },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <h3 className="modal-title">Share this place</h3>
        <div className="share-preview">
          <p className="share-preview-name">{name}</p>
          <p className="share-preview-sub">{place.Neighborhood||place.neighborhood} • {place.Type||place.type}</p>
        </div>
        {navigator.share && (
          <button className="share-native-btn" onClick={handleNativeShare}>📤 Share via…</button>
        )}
        <div className="share-options">
          {shareOptions.map(opt=>(
            <button key={opt.label} className="share-option" onClick={opt.action}>
              <span className="share-option-icon">{opt.label==='Copy link'&&copied?'✅':opt.icon}</span>
              <span className="share-option-label">{opt.label==='Copy link'&&copied?'Copied!':opt.label}</span>
            </button>
          ))}
        </div>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
