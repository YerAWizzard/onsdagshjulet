export const PERFORMANCE_MODE_KEY = 'onsdagshjulet:performance-mode:v1'

export const PERFORMANCE_MODES = Object.freeze([
  'full',
  'balanced',
  'energy-saver',
])

export const DEFAULT_PERFORMANCE_MODE = 'balanced'

export function normalizePerformanceMode(value) {
  return PERFORMANCE_MODES.includes(value) ? value : DEFAULT_PERFORMANCE_MODE
}

export function loadPerformanceMode() {
  try {
    return normalizePerformanceMode(localStorage.getItem(PERFORMANCE_MODE_KEY))
  } catch {
    return DEFAULT_PERFORMANCE_MODE
  }
}

export function savePerformanceMode(mode) {
  const normalizedMode = normalizePerformanceMode(mode)
  try {
    localStorage.setItem(PERFORMANCE_MODE_KEY, normalizedMode)
  } catch {
    // Performance preferences are optional; Balanced remains the safe fallback.
  }
  return normalizedMode
}
