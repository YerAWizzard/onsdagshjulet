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
const MUSIC_VOLUME_FLOOR_DB = -30
const isIOSDevice = () => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
const mapMusicVolume = (volume) => {
  if (volume <= 0) return 0
  const decibels = MUSIC_VOLUME_FLOOR_DB * (1 - volume)
  return 10 ** (decibels / 20)
}
const mapDuckedMusicVolume = (volume) => {
  if (volume <= 0) return 0
  if (volume <= 0.1) return volume * 0.8
  if (volume <= 0.2) return 0.08 + (volume - 0.1) * 0.4
  if (volume <= 0.3) return 0.12 + (volume - 0.2) * 0.3
  if (volume <= 0.6) return volume * 0.5
  return volume - 0.3
}

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
    this.musicGain = null
    this.musicSource = null
    this.usesIOSMusicGain = isIOSDevice()
    this.enabled = DEFAULT_MUSIC.enabled
    this.effectsVolume = DEFAULT_MUSIC.effectsVolume
    this.mode = DEFAULT_MUSIC.mode
    this.trackIndex = DEFAULT_MUSIC.trackIndex
    this.volume = DEFAULT_MUSIC.volume
    this.isMusicDucked = false
    this.volumeAnimationFrame = null
    this.musicRestoreTimeout = null
    this.isDestroyed = false
    this.hasInteracted = false
    this.music = new Audio(MUSIC_TRACKS[this.mode][this.trackIndex])
    this.music.loop = true
    this.music.preload = 'auto'
    if (!this.usesIOSMusicGain) this.music.volume = this.volume
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
    this.effectsGain.gain.value = 0.52 * this.effectsVolume
    this.effectsGain.connect(this.context.destination)
    if (this.usesIOSMusicGain) {
      this.musicSource = this.context.createMediaElementSource(this.music)
      this.musicGain = this.context.createGain()
      const playbackVolume = this.isMusicDucked ? mapDuckedMusicVolume(this.volume) : this.volume
      this.musicGain.gain.value = mapMusicVolume(playbackVolume)
      this.musicSource.connect(this.musicGain)
      this.musicGain.connect(this.context.destination)
    }
    return true
  }

  needsIOSUnlockRecovery() {
    return this.usesIOSMusicGain
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
    const playbackVolume = this.isMusicDucked ? mapDuckedMusicVolume(this.volume) : this.volume
    this.setMusicPlaybackVolume(mapMusicVolume(playbackVolume))
  }

  setMusicPlaybackVolume(volume, duration = 0) {
    if (this.isDestroyed) return
    const targetVolume = Math.min(1, Math.max(0, Number(volume) || 0))
    if (this.volumeAnimationFrame) cancelAnimationFrame(this.volumeAnimationFrame)
    this.volumeAnimationFrame = null
    const setPlaybackVolume = (nextVolume) => {
      if (this.usesIOSMusicGain) {
        if (this.musicGain) this.musicGain.gain.value = nextVolume
        return
      }
      this.music.volume = nextVolume
    }
    if (!duration) {
      setPlaybackVolume(targetVolume)
      return
    }
    const startVolume = this.usesIOSMusicGain
      ? (this.musicGain?.gain.value ?? targetVolume)
      : this.music.volume
    const startedAt = performance.now()
    const animateVolume = (currentTime) => {
      const progress = Math.min((currentTime - startedAt) / duration, 1)
      setPlaybackVolume(startVolume + (targetVolume - startVolume) * progress)
      if (progress < 1) {
        this.volumeAnimationFrame = requestAnimationFrame(animateVolume)
      } else {
        this.volumeAnimationFrame = null
      }
    }
    this.volumeAnimationFrame = requestAnimationFrame(animateVolume)
  }

  duckMusic() {
    if (this.musicRestoreTimeout) clearTimeout(this.musicRestoreTimeout)
    this.musicRestoreTimeout = null
    this.isMusicDucked = true
    this.setMusicPlaybackVolume(mapMusicVolume(mapDuckedMusicVolume(this.volume)), 450)
  }

  restoreMusic(delay = 0) {
    if (this.musicRestoreTimeout) clearTimeout(this.musicRestoreTimeout)
    this.musicRestoreTimeout = null
    const restore = () => {
      this.musicRestoreTimeout = null
      this.isMusicDucked = false
      this.setMusicPlaybackVolume(mapMusicVolume(this.volume), 800)
    }
    if (delay > 0) {
      this.musicRestoreTimeout = setTimeout(restore, delay)
      return
    }
    restore()
  }

  setEffectsVolume(volume) {
    const parsedVolume = Number(volume)
    this.effectsVolume = Number.isFinite(parsedVolume)
      ? Math.min(Math.max(parsedVolume, 0), 1)
      : DEFAULT_MUSIC.effectsVolume
    if (this.effectsGain) {
      this.effectsGain.gain.setTargetAtTime(0.52 * this.effectsVolume, this.context.currentTime, 0.015)
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
    this.tone(920, 0.03, 'square', 0.735)
  }

  playCountdown(isFinal = false) {
    if (isFinal) {
      this.tone(784, 0.18, 'triangle', 1.9845)
      this.tone(1046.5, 0.24, 'triangle', 1.764, 0.075)
      return
    }
    this.tone(440, 0.13, 'triangle', 1.65375)
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
        isStarPrize ? 1.56 : 0.966,
        index * (isStarPrize ? 0.085 : 0.1),
      )
    })
  }

  destroy() {
    this.isDestroyed = true
    if (this.musicRestoreTimeout) clearTimeout(this.musicRestoreTimeout)
    this.musicRestoreTimeout = null
    if (this.volumeAnimationFrame) cancelAnimationFrame(this.volumeAnimationFrame)
    this.volumeAnimationFrame = null
    this.isMusicDucked = false
    this.music.pause()
    this.music.removeAttribute('src')
    this.music.load()
    this.musicSource?.disconnect()
    this.musicGain?.disconnect()
    this.context?.close()
    this.context = null
    this.effectsGain = null
    this.musicGain = null
    this.musicSource = null
  }
}
