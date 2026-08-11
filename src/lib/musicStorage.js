import { DEFAULT_MUSIC, MUSIC_TRACKS } from './AudioEngine.js'

const MUSIC_KEY = 'onsdagshjulet:music:v1'

export function loadMusicPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(MUSIC_KEY) || 'null')
    if (!saved || !MUSIC_TRACKS[saved.mode]) return { ...DEFAULT_MUSIC }
    const trackIndex = Math.min(
      Math.max(Number(saved.trackIndex) || 0, 0),
      MUSIC_TRACKS[saved.mode].length - 1,
    )
    const parsedVolume = Number(saved.volume)
    const parsedEffectsVolume = Number(saved.effectsVolume)
    return {
      enabled: Boolean(saved.enabled),
      effectsVolume: Number.isFinite(parsedEffectsVolume)
        ? Math.min(Math.max(parsedEffectsVolume, 0), 1)
        : DEFAULT_MUSIC.effectsVolume,
      mode: saved.mode,
      trackIndex,
      volume: Number.isFinite(parsedVolume)
        ? Math.min(Math.max(parsedVolume, 0), 1)
        : DEFAULT_MUSIC.volume,
    }
  } catch {
    return { ...DEFAULT_MUSIC }
  }
}

export function saveMusicPreferences(preferences) {
  try {
    localStorage.setItem(MUSIC_KEY, JSON.stringify(preferences))
  } catch {
    // Music preferences are optional; playback still works without persistence.
  }
}
