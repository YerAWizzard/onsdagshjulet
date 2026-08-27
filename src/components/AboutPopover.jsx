import { useEffect, useId, useRef, useState } from 'react'

function AboutPopover({ t, version }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const containerRef = useRef(null)
  const panelId = useId()
  const headingId = useId()

  useEffect(() => {
    const closeOutside = (event) => {
      if (containerRef.current?.contains(event.target)) return
      setIsOpen(false)
      setIsPinned(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  const close = () => {
    setIsOpen(false)
    setIsPinned(false)
  }

  return (
    <div
      ref={containerRef}
      className="about-control"
      onBlur={(event) => {
        if (!isPinned && !event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
      onFocus={() => setIsOpen(true)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        close()
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => { if (!isPinned) setIsOpen(false) }}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t('about.open')}
        className="about-button"
        onClick={() => {
          const nextPinned = !isPinned
          setIsPinned(nextPinned)
          setIsOpen(nextPinned)
        }}
        type="button"
      >
        ?
      </button>
      <div
        aria-labelledby={headingId}
        className="about-popover"
        hidden={!isOpen}
        id={panelId}
        role="dialog"
      >
        <h2 id={headingId}>{t('about.title')}</h2>
        <p>{t('about.paragraph1')}</p>
        <p>{t('about.paragraph2')}</p>
        <p>{t('about.paragraph3')}</p>
        <p>{t('about.paragraph4')}</p>
        <small>{t('about.version', { version })}</small>
      </div>
    </div>
  )
}

export default AboutPopover
