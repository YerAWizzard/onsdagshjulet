import { useEffect, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

const ICON_PATHS = {
  audio: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
  inspiration: <><path d="m12 3 1.15 3.35L16.5 7.5l-3.35 1.15L12 12l-1.15-3.35L7.5 7.5l3.35-1.15L12 3Z" /><path d="m18 13 .75 2.25L21 16l-2.25.75L18 19l-.75-2.25L15 16l2.25-.75L18 13Z" /><path d="m5 12 .65 1.85L7.5 14.5l-1.85.65L5 17l-.65-1.85-1.85-.65 1.85-.65L5 12Z" /></>,
  save: <><path d="M5 3h12l2 2v16H5V3Z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
  settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" /></>,
  choices: <><path d="M4 6h10M4 12h7M4 18h10M18 14v8M14 18h8" /></>,
}

function SectionIcon({ accentClass, name }) {
  return (
    <svg aria-hidden="true" className={`section-icon ${accentClass}`} fill="none" viewBox="0 0 24 24">
      {ICON_PATHS[name]}
    </svg>
  )
}

function CollapsibleSection({ accentClass, children, className = '', collapsed, icon, id, onToggle, sectionRef: externalSectionRef, title }) {
  const contentId = `${id}-content`
  const sectionRef = useRef(null)
  const wasCollapsedRef = useRef(collapsed)

  useEffect(() => {
    const wasCollapsed = wasCollapsedRef.current
    wasCollapsedRef.current = collapsed
    if (!wasCollapsed || collapsed) return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(
      () => scrollIntoSidebarView(sectionRef.current),
      reducedMotion ? 0 : 280,
    )
    return () => clearTimeout(timer)
  }, [collapsed])

  return (
    <section
      ref={(node) => {
        sectionRef.current = node
        if (externalSectionRef) externalSectionRef.current = node
      }}
      className={`glass-card collapsible-section ${className}${collapsed ? ' is-collapsed' : ''}`}
    >
      <button
        aria-controls={contentId}
        aria-expanded={!collapsed}
        className="card-header collapsible-trigger"
        onClick={onToggle}
        type="button"
      >
        <SectionIcon accentClass={accentClass.replace('card-accent', 'section-icon')} name={icon} />
        <h2>{title}</h2>
        <span className="collapse-chevron" aria-hidden="true">⌄</span>
      </button>
      <div className="collapsible-region" id={contentId} aria-hidden={collapsed} inert={collapsed ? true : undefined}>
        <div className="collapsible-inner">{children}</div>
      </div>
    </section>
  )
}

export default CollapsibleSection
