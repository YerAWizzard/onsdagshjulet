import { useEffect, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

function CollapsibleSection({ accentClass, children, className = '', collapsed, id, onToggle, title }) {
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
    <section ref={sectionRef} className={`glass-card collapsible-section ${className}${collapsed ? ' is-collapsed' : ''}`}>
      <button
        aria-controls={contentId}
        aria-expanded={!collapsed}
        className="card-header collapsible-trigger"
        onClick={onToggle}
        type="button"
      >
        <span className={`card-accent ${accentClass}`} aria-hidden="true" />
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
