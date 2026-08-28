export function scrollIntoSidebarView(element, { bottomSpacing = 24, topSpacing = 16 } = {}) {
  const sidebar = element?.closest('.sidebar')
  if (!element || !sidebar) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior = reducedMotion ? 'auto' : 'smooth'
  const elementBounds = element.getBoundingClientRect()
  const sidebarStyle = window.getComputedStyle(sidebar)
  const sidebarScrolls = /(auto|scroll)/.test(sidebarStyle.overflowY)
    && sidebar.scrollHeight > sidebar.clientHeight + 1

  if (!sidebarScrolls) {
    const viewportTop = window.visualViewport?.offsetTop ?? 0
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const viewportBottom = viewportTop + viewportHeight
    if (
      elementBounds.top >= viewportTop + topSpacing
      && elementBounds.bottom <= viewportBottom - bottomSpacing
    ) return

    const availableHeight = viewportHeight - topSpacing - bottomSpacing
    const scrollDelta = elementBounds.height > availableHeight || elementBounds.top < viewportTop + topSpacing
      ? elementBounds.top - viewportTop - topSpacing
      : elementBounds.bottom - viewportBottom + bottomSpacing

    window.scrollBy({ behavior, top: scrollDelta })
    return
  }

  const sidebarBounds = sidebar.getBoundingClientRect()
  if (elementBounds.top >= sidebarBounds.top && elementBounds.bottom <= sidebarBounds.bottom) return

  const availableHeight = sidebarBounds.height - topSpacing - bottomSpacing
  let scrollDelta
  if (elementBounds.height > availableHeight || elementBounds.top < sidebarBounds.top) {
    scrollDelta = elementBounds.top - sidebarBounds.top - topSpacing
  } else {
    scrollDelta = elementBounds.bottom - sidebarBounds.bottom + bottomSpacing
  }

  sidebar.scrollBy({
    behavior,
    top: scrollDelta,
  })
}

export function scrollToSidebarSectionTop(element, { topSpacing = 8 } = {}) {
  const sidebar = element?.closest('.sidebar')
  if (!element || !sidebar) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior = reducedMotion ? 'auto' : 'smooth'
  const sidebarStyle = window.getComputedStyle(sidebar)
  const sidebarScrolls = /(auto|scroll)/.test(sidebarStyle.overflowY)
    && sidebar.scrollHeight > sidebar.clientHeight + 1

  if (sidebarScrolls) {
    const elementBounds = element.getBoundingClientRect()
    const sidebarBounds = sidebar.getBoundingClientRect()
    sidebar.scrollTo({
      behavior,
      top: Math.max(0, sidebar.scrollTop + elementBounds.top - sidebarBounds.top - topSpacing),
    })
    return
  }

  element.scrollIntoView({ behavior, block: 'start' })
}
