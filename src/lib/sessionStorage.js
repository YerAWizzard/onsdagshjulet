const SESSION_KEY = 'onsdagshjulet:session:v1'

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return localStorage.getItem(SESSION_KEY) !== null
  } catch {
    return false
  }
}

export function restoreSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY)
    if (!rawSession) return null
    const session = JSON.parse(rawSession)
    if (!Array.isArray(session.options) || session.options.length < 2) return null
    return session
  } catch {
    return null
  }
}

export function deleteSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    return localStorage.getItem(SESSION_KEY) === null
  } catch {
    return false
  }
}

export function hasSavedSession() {
  return restoreSession() !== null
}
