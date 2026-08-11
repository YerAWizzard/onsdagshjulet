import { MUSIC_THEMES, MUSIC_TRACKS } from '../../lib/AudioEngine.js'

function AudioSettings({ audio, onChange, t }) {
  const trackCount = MUSIC_TRACKS[audio.mode].length

  return (
    <div className="settings-content audio-settings">
      <div className="audio-intro-row">
        <p className="panel-help">{t('audio.help')}</p>
        <div className="audio-state-row">
          <button
            aria-pressed={audio.enabled}
            className={`audio-toggle${audio.enabled ? ' is-on' : ''}`}
            onClick={() => onChange({ enabled: !audio.enabled })}
            type="button"
          >
            {audio.enabled ? t('audio.on') : t('audio.off')}
          </button>
        </div>
      </div>
      <div className="music-modes" aria-label={t('audio.modeLabel')}>
        {MUSIC_THEMES.map((mode) => (
          <button
            aria-pressed={audio.mode === mode}
            className={audio.mode === mode ? 'is-active' : ''}
            key={mode}
            onClick={() => onChange({ mode })}
            type="button"
          >
            {t(`audio.modes.${mode}`)}
          </button>
        ))}
      </div>
      <p className="theme-help" aria-live="polite">{t(`audio.themeHelp.${audio.mode}`)}</p>
      <div className="track-controls">
        <button aria-label={t('audio.previousTrack')} onClick={() => onChange({ trackIndex: (audio.trackIndex - 1 + trackCount) % trackCount })} type="button">‹</button>
        <span aria-live="polite">{t('audio.trackStatus', { current: audio.trackIndex + 1, theme: t(`audio.modes.${audio.mode}`), total: trackCount })}</span>
        <button aria-label={t('audio.nextTrack')} onClick={() => onChange({ trackIndex: (audio.trackIndex + 1) % trackCount })} type="button">›</button>
      </div>
      <label className="volume-control">
        <span>{t('audio.volume')}</span>
        <input aria-label={t('audio.volume')} max="100" min="0" onChange={(event) => onChange({ volume: Number(event.target.value) / 100 })} type="range" value={Math.round(audio.volume * 100)} />
        <span>{Math.round(audio.volume * 100)}%</span>
      </label>
      <label className="volume-control">
        <span>{t('audio.effectsVolume')}</span>
        <input aria-label={t('audio.effectsVolume')} max="100" min="0" onChange={(event) => onChange({ effectsVolume: Number(event.target.value) / 100 })} type="range" value={Math.round(audio.effectsVolume * 100)} />
        <span>{Math.round(audio.effectsVolume * 100)}%</span>
      </label>
    </div>
  )
}

export default AudioSettings
