export function scrollIntoSidebarView(element, { bottomSpacing = 24, topSpacing = 16 } = {}) {
  const sidebar = element?.closest('.sidebar')
  if (!element || !sidebar) return

  const elementBounds = element.getBoundingClientRect()
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
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    top: scrollDelta,
  })
}
