import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import AboutPopover from './components/AboutPopover.jsx'
import CollapsibleSection from './components/ControlPanel/CollapsibleSection.jsx'
import AudioSettings from './components/ControlPanel/AudioSettings.jsx'
import SessionControls from './components/ControlPanel/SessionControls.jsx'
import SpinSettings from './components/ControlPanel/SpinSettings.jsx'
import Templates from './components/ControlPanel/Templates.jsx'
import WheelSettings from './components/ControlPanel/WheelSettings.jsx'
import Wheel from './components/Wheel/Wheel.jsx'
import { createTranslator, templateCatalog } from './i18n.js'
import { AudioEngine, DEFAULT_MUSIC, MUSIC_TRACKS } from './lib/AudioEngine.js'
import { loadMusicPreferences, saveMusicPreferences } from './lib/musicStorage.js'
import { calculateProbabilities } from './lib/probability.js'
import { APP_VERSION } from './version.js'
import {
  deleteSession,
  hasSavedSession,
  restoreSession,
  saveSession,
} from './lib/sessionStorage.js'

let optionId = 0
const COLLAPSED_SECTIONS_KEY = 'onsdagshjulet:collapsed-sections:v1'
const OPEN_SECTIONS = { settings: false, audio: false, spin: true, session: true, templates: true }
const MAX_OPTION_LABEL_LENGTH = 80

function togglePendingSelection(current, next, getId = (value) => value) {
  return getId(current) === getId(next) ? null : next
}

function loadCollapsedSections() {
  try {
    return { ...OPEN_SECTIONS, ...JSON.parse(sessionStorage.getItem(COLLAPSED_SECTIONS_KEY) || '{}') }
  } catch {
    return OPEN_SECTIONS
  }
}

const createOption = (label, star = false, percentage = '', subWheel = null) => ({
  id: `option-${optionId += 1}`,
  label,
  percentage,
  star,
  ...(subWheel ? { subWheel } : {}),
})

function hydrateSubWheel(subWheel) {
  if (!subWheel || !Array.isArray(subWheel.options)) return null
  return {
    id: String(subWheel.id ?? `sub-wheel-${Date.now()}-${Math.random()}`),
    title: String(subWheel.title ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
    options: subWheel.options.slice(0, 30).map((option) => createOption(
      String(option.label ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
      Boolean(option.star),
      option.percentage ?? '',
      hydrateSubWheel(option.subWheel),
    )),
  }
}

function serializeSubWheel(subWheel) {
  if (!subWheel) return null
  return {
    id: subWheel.id,
    title: subWheel.title,
    options: subWheel.options.map(({ label, percentage = '', star = false, subWheel: nestedSubWheel }) => ({
      label,
      percentage,
      star,
      ...(nestedSubWheel ? { subWheel: serializeSubWheel(nestedSubWheel) } : {}),
    })),
  }
}

function localizeSubWheel(subWheel, locale) {
  if (!subWheel) return null
  return {
    id: subWheel.id,
    title: subWheel.title[locale],
    options: subWheel.options[locale].map((label, index) => {
      const optionSettings = subWheel.optionSettings?.[index] ?? {}
      const nestedSubWheel = localizeSubWheel(optionSettings.subWheel, locale)
      return {
        label,
        ...optionSettings,
        ...(nestedSubWheel ? { subWheel: nestedSubWheel } : {}),
      }
    }),
  }
}

const DEFAULT_OPTIONS = [
  createOption('Pizza'),
  createOption('Hamburgare'),
  createOption('Sushi'),
  createOption('Tacos'),
  createOption('Pasta'),
  createOption('Kyckling'),
  createOption('Sallad'),
  createOption('Kebab'),
]

function hydrateOptions(options) {
  return options.slice(0, 30).map((option) =>
    createOption(
      String(option.label ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
      Boolean(option.star),
      option.percentage ?? '',
      hydrateSubWheel(option.subWheel),
    ),
  )
}

function formatSavedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('sv-SE', {
    day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {})
  return `${parts.year}-${parts.month}-${parts.day} - ${parts.hour}:${parts.minute}`
}

function App() {
  const [locale, setLocale] = useState('sv')
  const [collapsedSections, setCollapsedSections] = useState(loadCollapsedSections)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [runtimePath, setRuntimePath] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [inspirationIndex] = useState(() => Math.floor(Math.random() * 5) + 1)
  const [audio, setAudio] = useState(loadMusicPreferences)
  const [initialSession] = useState(() => restoreSession())
  const [canRestore, setCanRestore] = useState(() => Boolean(initialSession))
  const [savedAt, setSavedAt] = useState(() => formatSavedAt(initialSession?.savedAt))
  const [sessionConfirmation, setSessionConfirmation] = useState(null)
  const [sessionMessage, setSessionMessage] = useState('')
  const [spinSettings, setSpinSettings] = useState({ minSeconds: 3, maxSeconds: 11 })
  const audioEngineRef = useRef(null)
  const initialAudioRef = useRef(audio)

  if (!audioEngineRef.current) audioEngineRef.current = new AudioEngine()

  useEffect(() => {
    const engine = audioEngineRef.current
    const initialAudio = initialAudioRef.current
    engine.activate()
    engine.setMode(initialAudio.mode)
    engine.setTrack(initialAudio.trackIndex)
    engine.setVolume(initialAudio.volume)
    engine.setEffectsVolume(initialAudio.effectsVolume)
    engine.setEnabled(initialAudio.enabled)

    const unlockAudio = () => engine.unlock()
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      engine.destroy()
    }
  }, [])

  useEffect(() => {
    saveMusicPreferences(audio)
  }, [audio])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    sessionStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(collapsedSections))
  }, [collapsedSections])

  const toggleSection = useCallback((section) => {
    setCollapsedSections((current) => ({ ...current, [section]: !current[section] }))
  }, [])

  const t = useMemo(() => createTranslator(locale), [locale])
  const templates = useMemo(
    () => templateCatalog.map((template) => ({
      id: template.id,
      emoji: template.emoji,
      name: template.name[locale],
      options: template.options[locale].map((label, index) => ({
        label,
        ...(template.optionSettings?.[index] ?? {}),
        subWheel: localizeSubWheel(template.optionSettings?.[index]?.subWheel, locale),
      })),
    })),
    [locale],
  )

  const activeRuntimeWheel = runtimePath[runtimePath.length - 1] ?? null
  const activeOptions = activeRuntimeWheel?.options ?? options
  const probabilityResult = useMemo(() => calculateProbabilities(activeOptions), [activeOptions])
  const rootProbabilityResult = useMemo(() => calculateProbabilities(options), [options])
  const updateOption = (id, updates) => {
    setOptions((current) => current.map((option) => (option.id === id ? { ...option, ...updates } : option)))
    setSelectedTemplate(null)
  }

  const addOption = () => {
    const addToOptions = (current) => (current.length >= 30 ? current : [...current, createOption(`${locale === 'sv' ? 'Val' : 'Option'} ${current.length + 1}`)])
    setOptions(addToOptions)
    setSelectedTemplate(null)
  }

  const removeOption = (id) => {
    const removeFromOptions = (current) => (current.length <= 2 ? current : current.filter((option) => option.id !== id))
    setOptions(removeFromOptions)
    setSelectedTemplate(null)
  }

  const updateAudio = (updates) => {
    if ('volume' in updates) {
      audioEngineRef.current.setVolume(updates.volume)
    }
    setAudio((current) => {
      const next = { ...current, ...updates }
      if ('mode' in updates && updates.mode !== current.mode) next.trackIndex = 0
      if ('effectsVolume' in updates) audioEngineRef.current.setEffectsVolume(next.effectsVolume)
      if ('mode' in updates) audioEngineRef.current.setMode(next.mode)
      if ('trackIndex' in updates) audioEngineRef.current.setTrack(next.trackIndex)
      if ('enabled' in updates) audioEngineRef.current.setEnabled(next.enabled)
      return next
    })
  }

  const confirmTemplate = () => {
    if (!pendingTemplate) return
    setOptions(pendingTemplate.options.map(({ label, percentage = '', star = false, subWheel }) =>
      createOption(label, star, percentage, hydrateSubWheel(subWheel))))
    setRuntimePath([])
    setSelectedTemplate(pendingTemplate.id)
    setPendingTemplate(null)
    setSessionMessage('')
  }

  const togglePendingTemplate = (template) => {
    setPendingTemplate((current) => togglePendingSelection(current, template, (value) => value?.id))
  }

  const toggleSessionConfirmation = (action) => {
    setSessionConfirmation((current) => togglePendingSelection(current, action))
  }

  const saveCurrentSession = () => {
    const nextSavedAt = new Date().toISOString()
    const saved = saveSession({
      version: 1,
      audio: {
        enabled: audio.enabled,
        effectsVolume: audio.effectsVolume,
        mode: audio.mode,
        trackIndex: audio.trackIndex,
        volume: audio.volume,
      },
      locale,
      options: options.map(({ label, percentage, star, subWheel }) => ({
        label,
        percentage,
        star,
        ...(subWheel ? { subWheel: serializeSubWheel(subWheel) } : {}),
      })),
      selectedMusic: audio.mode,
      savedAt: nextSavedAt,
      spinSettings,
      volume: audio.volume,
    })
    setCanRestore(saved)
    if (saved) setSavedAt(formatSavedAt(nextSavedAt))
    setSessionMessage(saved ? 'saved' : 'saveFailed')
    setSessionConfirmation(null)
  }

  const handleSaveSession = () => {
    if (canRestore) {
      toggleSessionConfirmation('overwrite')
      return
    }
    saveCurrentSession()
  }

  const restoreSavedSession = () => {
    const session = restoreSession()
    if (!session) {
      setCanRestore(false)
      setSessionMessage('missing')
      setSavedAt('')
      setSessionConfirmation(null)
      return
    }
    setOptions(hydrateOptions(session.options))
    setRuntimePath([])
    setSelectedTemplate(null)
    setPendingTemplate(null)
    setLocale(session.locale === 'en' ? 'en' : 'sv')
    const restoredAudio = {
      enabled: Boolean(session.audio?.enabled),
      effectsVolume: Math.min(1, Math.max(0, Number(session.audio?.effectsVolume ?? DEFAULT_MUSIC.effectsVolume))),
      mode: MUSIC_TRACKS[session.selectedMusic || session.audio?.mode]
        ? (session.selectedMusic || session.audio?.mode)
        : DEFAULT_MUSIC.mode,
      trackIndex: Number(session.audio?.trackIndex) || 0,
      volume: Math.min(1, Math.max(0, Number(session.volume ?? session.audio?.volume ?? 0.55))),
    }
    restoredAudio.trackIndex = Math.min(
      Math.max(restoredAudio.trackIndex, 0),
      MUSIC_TRACKS[restoredAudio.mode].length - 1,
    )
    setAudio(restoredAudio)
    audioEngineRef.current.setVolume(restoredAudio.volume)
    audioEngineRef.current.setEffectsVolume(restoredAudio.effectsVolume)
    audioEngineRef.current.setMode(restoredAudio.mode)
    audioEngineRef.current.setTrack(restoredAudio.trackIndex)
    audioEngineRef.current.setEnabled(restoredAudio.enabled)
    if (session.spinSettings) {
      const minSeconds = Math.min(11, Math.max(2, Number(session.spinSettings.minSeconds) || 3))
      const maxSeconds = Math.min(11, Math.max(minSeconds, Number(session.spinSettings.maxSeconds) || 11))
      setSpinSettings({ minSeconds, maxSeconds })
    }
    setSavedAt(formatSavedAt(session.savedAt))
    setSessionMessage('restored')
    setSessionConfirmation(null)
  }

  const deleteSavedSession = () => {
    const deleted = deleteSession()
    setCanRestore(!deleted && hasSavedSession())
    if (deleted) setSavedAt('')
    setSessionMessage(deleted ? 'deleted' : 'deleteFailed')
    setSessionConfirmation(null)
  }

  const confirmSessionAction = () => {
    if (sessionConfirmation === 'overwrite') saveCurrentSession()
    if (sessionConfirmation === 'restore') restoreSavedSession()
    if (sessionConfirmation === 'delete') deleteSavedSession()
  }

  return (
    <div className="app-shell">
      <div className="background-glow" aria-hidden="true" />

      <main className="workspace">
        <header className="app-header">
          <div className="language-switch" aria-label={t('headerControlsLabel')}>
            <button
              aria-label="🇸🇪 Svenska"
              aria-pressed={locale === 'sv'}
              className={locale === 'sv' ? 'is-active' : ''}
              onClick={() => { setLocale('sv'); setPendingTemplate(null) }}
              type="button"
            >
              <span className="language-flag language-flag--sv" aria-hidden="true" />
              <span>Svenska</span>
            </button>
            <button
              aria-label="🇬🇧 English"
              aria-pressed={locale === 'en'}
              className={locale === 'en' ? 'is-active' : ''}
              onClick={() => { setLocale('en'); setPendingTemplate(null) }}
              type="button"
            >
              <span className="language-flag language-flag--en" aria-hidden="true" />
              <span>English</span>
            </button>
            <AboutPopover t={t} version={APP_VERSION} />
          </div>
          <div className="brand-line">
            <h1><span aria-hidden="true">🎪</span> Onsdagshjulet</h1>
          </div>
          <p className="header-title">{t('headerTitle')}</p>
          <p>{t('subtitle')}</p>
        </header>

        <aside className="sidebar" aria-label={t('controlsLabel')}>
          <CollapsibleSection
            accentClass="card-accent--pink"
            className="settings-card"
            collapsed={collapsedSections.settings}
            icon="choices"
            id="wheel-settings"
            onToggle={() => toggleSection('settings')}
            title={t('settings.title')}
          >
            <WheelSettings
              allowSubWheels
              onAdd={addOption}
              onRemove={removeOption}
              onUpdate={updateOption}
              options={options}
              probabilityError={rootProbabilityResult.errorCode
                ? t(`probability.${rootProbabilityResult.errorCode}`, rootProbabilityResult.errorParams)
                : rootProbabilityResult.error}
              t={t}
            />
          </CollapsibleSection>

          <CollapsibleSection accentClass="card-accent--blue" className="audio-card" collapsed={collapsedSections.audio} icon="audio" id="audio-settings" onToggle={() => toggleSection('audio')} title={t('audio.title')}>
            <AudioSettings audio={audio} onChange={updateAudio} t={t} />
          </CollapsibleSection>

          <CollapsibleSection accentClass="card-accent--pink" className="spin-card" collapsed={collapsedSections.spin} icon="settings" id="spin-settings" onToggle={() => toggleSection('spin')} title={t('spinSettings.title')}>
            <SpinSettings {...spinSettings} onChange={(updates) => setSpinSettings((current) => ({ ...current, ...updates }))} t={t} />
          </CollapsibleSection>

          <CollapsibleSection
            accentClass="card-accent--violet"
            className="templates-card"
            collapsed={collapsedSections.templates}
            icon="inspiration"
            id="templates"
            onToggle={() => toggleSection('templates')}
            title={t('templates.title')}
          >
            <Templates
              onCancel={() => setPendingTemplate(null)}
              onConfirm={confirmTemplate}
              onSelect={togglePendingTemplate}
              pendingTemplate={pendingTemplate}
              selectedTemplate={selectedTemplate}
              t={t}
              templates={templates}
              help={t(`templates.help${inspirationIndex}`)}
            />
          </CollapsibleSection>

          <CollapsibleSection accentClass="card-accent--blue" className="session-card secondary-section" collapsed={collapsedSections.session} icon="save" id="session" onToggle={() => toggleSection('session')} title={t('session.title')}>
            <SessionControls
              canRestore={canRestore}
              confirmation={sessionConfirmation}
              onCancel={() => setSessionConfirmation(null)}
              onConfirm={confirmSessionAction}
              onDelete={() => toggleSessionConfirmation('delete')}
              onRestore={() => toggleSessionConfirmation('restore')}
              onSave={handleSaveSession}
              savedAt={savedAt}
              sessionMessage={sessionMessage ? t(`session.${sessionMessage}`) : ''}
              t={t}
            />
          </CollapsibleSection>
        </aside>

        <section className="wheel-card" aria-label={t('wheel.label')}>
          {activeRuntimeWheel ? (
            <nav className="wheel-context" aria-label={runtimePath.map((entry) => entry.parentLabel).join(' › ')}>
              <span className="wheel-context__title">
                <span className="wheel-context__label">{t('wheel.subwheelContext')}:</span>
                {runtimePath.map((entry, index) => (
                  <span className="wheel-context__crumb" key={entry.pathId}>
                    {index ? <span aria-hidden="true">›</span> : null}
                    <strong>{entry.parentLabel}</strong>
                  </span>
                ))}
              </span>
              <button className="wheel-context__back" onClick={() => setRuntimePath((current) => current.slice(0, -1))} type="button">
                <span aria-hidden="true">←</span> {t(runtimePath.length === 1 ? 'wheel.backToMain' : 'wheel.back')}
              </button>
            </nav>
          ) : null}
          <Wheel
            key={activeRuntimeWheel?.pathId ?? 'root'}
            audioEngine={audioEngineRef.current}
            onOpenSubWheel={runtimePath.length < 2 ? (winner) => {
              const nextWheel = hydrateSubWheel(winner.subWheel)
              setRuntimePath((current) => [...current, {
                ...nextWheel,
                parentLabel: winner.label,
                pathId: `${nextWheel.id}-${current.length}-${Date.now()}`,
              }])
            } : null}
            options={activeOptions}
            probabilities={probabilityResult.probabilities}
            probabilityError={probabilityResult.errorCode
              ? t(`probability.${probabilityResult.errorCode}`, probabilityResult.errorParams)
              : probabilityResult.error}
            spinSettings={spinSettings}
            t={t}
          />
        </section>
      </main>

      <footer className="app-footer" aria-label={t('footer.label')}>
        <span>{t('footer.version', { version: APP_VERSION })}</span>
        <span>{t('footer.storage')}</span>
      </footer>
    </div>
  )
}

export default App
