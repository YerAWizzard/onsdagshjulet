export const MUSIC_TRACKS = {
  Festival: [
    '/audio/music/Festival 1.mp3',
    '/audio/music/Festival 2.mp3',
  ],
  Fantasy: [
    '/audio/music/Fantasy 1.mp3',
    '/audio/music/Fantasy 2.mp3',
    '/audio/music/Fantasy 3.mp3',
    '/audio/music/Fantasy 4.mp3',
  ],
  Suspense: [
    '/audio/music/Spy 1.mp3',
    '/audio/music/Spy 2.mp3',
  ],
  Christmas: [
    '/audio/music/Christmas 1.mp3',
    '/audio/music/Christmas 2.mp3',
  ],
  Lounge: [
    '/audio/music/Lounge 1.mp3',
    '/audio/music/Lounge 2.mp3',
  ],
}

export const MUSIC_THEMES = Object.keys(MUSIC_TRACKS)
export const DEFAULT_MUSIC = {
  enabled: false,
  effectsVolume: 0.7,
  mode: 'Fantasy',
  trackIndex: 0,
  volume: 0.55,
}

export class AudioEngine {
  constructor() {
    this.context = null
    this.effectsGain = null
    this.enabled = DEFAULT_MUSIC.enabled
    this.effectsVolume = DEFAULT_MUSIC.effectsVolume
    this.mode = DEFAULT_MUSIC.mode
    this.trackIndex = DEFAULT_MUSIC.trackIndex
    this.volume = DEFAULT_MUSIC.volume
    this.musicDuckFactor = 1
    this.volumeAnimationFrame = null
    this.isDestroyed = false
    this.hasInteracted = false
    this.music = new Audio(MUSIC_TRACKS[this.mode][this.trackIndex])
    this.music.loop = true
    this.music.preload = 'auto'
    this.music.volume = this.volume
  }

  activate() {
    this.isDestroyed = false
  }

  ensureContext() {
    if (this.context) return true
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return false
    this.context = new AudioContextClass()
    this.effectsGain = this.context.createGain()
    this.effectsGain.gain.value = 0.24 * this.effectsVolume
    this.effectsGain.connect(this.context.destination)
    return true
  }

  unlock() {
    this.hasInteracted = true
    if (this.ensureContext() && this.context.state === 'suspended') this.context.resume()
    if (this.enabled) this.playMusic()
  }

  playMusic() {
    if (!this.enabled || !this.hasInteracted) return
    this.music.play().catch(() => {})
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled)
    if (!this.enabled) {
      this.music.pause()
      return
    }
    this.playMusic()
  }

  setMode(mode) {
    if (!MUSIC_TRACKS[mode] || mode === this.mode) return
    this.music.pause()
    this.music.currentTime = 0
    this.mode = mode
    this.trackIndex = 0
    this.loadTrack()
    this.playMusic()
  }

  setTrack(trackIndex) {
    const tracks = MUSIC_TRACKS[this.mode]
    const nextIndex = ((Number(trackIndex) % tracks.length) + tracks.length) % tracks.length
    if (nextIndex === this.trackIndex && this.music.src) return
    this.music.pause()
    this.music.currentTime = 0
    this.trackIndex = nextIndex
    this.loadTrack()
    this.playMusic()
  }

  loadTrack() {
    this.music.src = MUSIC_TRACKS[this.mode][this.trackIndex]
    this.music.load()
  }

  setVolume(volume) {
    const parsedVolume = Number(volume)
    this.volume = Number.isFinite(parsedVolume)
      ? Math.min(Math.max(parsedVolume, 0), 1)
      : DEFAULT_MUSIC.volume
    this.setMusicPlaybackVolume(this.volume * this.musicDuckFactor)
  }

  setMusicPlaybackVolume(volume, duration = 0) {
    if (this.isDestroyed) return
    const targetVolume = Math.min(1, Math.max(0, Number(volume) || 0))
    if (this.volumeAnimationFrame) cancelAnimationFrame(this.volumeAnimationFrame)
    this.volumeAnimationFrame = null
    if (!duration) {
      this.music.volume = targetVolume
      return
    }
    const startVolume = this.music.volume
    const startedAt = performance.now()
    const animateVolume = (currentTime) => {
      const progress = Math.min((currentTime - startedAt) / duration, 1)
      this.music.volume = startVolume + (targetVolume - startVolume) * progress
      if (progress < 1) {
        this.volumeAnimationFrame = requestAnimationFrame(animateVolume)
      } else {
        this.volumeAnimationFrame = null
      }
    }
    this.volumeAnimationFrame = requestAnimationFrame(animateVolume)
  }

  duckMusic(factor = 0.85) {
    this.musicDuckFactor = Math.min(1, Math.max(0, Number(factor) || 0))
    this.setMusicPlaybackVolume(this.volume * this.musicDuckFactor, 140)
  }

  restoreMusic() {
    this.musicDuckFactor = 1
    this.setMusicPlaybackVolume(this.volume, 220)
  }

  setEffectsVolume(volume) {
    const parsedVolume = Number(volume)
    this.effectsVolume = Number.isFinite(parsedVolume)
      ? Math.min(Math.max(parsedVolume, 0), 1)
      : DEFAULT_MUSIC.effectsVolume
    if (this.effectsGain) {
      this.effectsGain.gain.setTargetAtTime(0.24 * this.effectsVolume, this.context.currentTime, 0.015)
    }
  }

  tone(frequency, duration, type = 'sine', gain = 0.12, delay = 0) {
    if (!this.ensureContext()) return
    if (this.context.state === 'suspended') this.context.resume()
    const start = this.context.currentTime + delay
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    envelope.gain.setValueAtTime(0.001, start)
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.015)
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration)
    oscillator.connect(envelope)
    envelope.connect(this.effectsGain)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  }

  playTick() {
    this.tone(920, 0.03, 'square', 0.07)
  }

  playCountdown(isFinal = false) {
    if (isFinal) {
      this.tone(784, 0.18, 'triangle', 0.18)
      this.tone(1046.5, 0.24, 'triangle', 0.16, 0.075)
      return
    }
    this.tone(440, 0.13, 'triangle', 0.15)
  }

  playWin(isStarPrize) {
    const notes = isStarPrize
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
      : [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((note, index) => {
      this.tone(
        note,
        isStarPrize ? 0.62 : 0.42,
        isStarPrize ? 'triangle' : 'sine',
        isStarPrize ? 0.25 : 0.18,
        index * (isStarPrize ? 0.085 : 0.1),
      )
    })
  }

  destroy() {
    this.isDestroyed = true
    if (this.volumeAnimationFrame) cancelAnimationFrame(this.volumeAnimationFrame)
    this.volumeAnimationFrame = null
    this.musicDuckFactor = 1
    this.music.pause()
    this.music.removeAttribute('src')
    this.music.load()
    this.context?.close()
    this.context = null
    this.effectsGain = null
  }
}
