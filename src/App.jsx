import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import AboutPopover from './components/AboutPopover.jsx'
import CollapsibleSection from './components/ControlPanel/CollapsibleSection.jsx'
import AudioSettings from './components/ControlPanel/AudioSettings.jsx'
import SessionControls from './components/ControlPanel/SessionControls.jsx'
import SpinSettings from './components/ControlPanel/SpinSettings.jsx'
import Templates from './components/ControlPanel/Templates.jsx'
import WheelSettings from './components/ControlPanel/WheelSettings.jsx'
import { scrollToSidebarSectionTop } from './components/ControlPanel/scrollIntoSidebarView.js'
import Wheel from './components/Wheel/Wheel.jsx'
import { createTranslator, templateCatalog } from './i18n.js'
import { AudioEngine, DEFAULT_MUSIC, MUSIC_TRACKS } from './lib/AudioEngine.js'
import { loadMusicPreferences, saveMusicPreferences } from './lib/musicStorage.js'
import { calculateProbabilities } from './lib/probability.js'
import {
  loadPerformanceMode,
  savePerformanceMode,
} from './lib/performanceStorage.js'
import { APP_VERSION } from './version.js'
import {
  deleteSession,
  hasSavedSession,
  restoreSession,
  saveSession,
} from './lib/sessionStorage.js'

let optionId = 0
const COLLAPSED_SECTIONS_KEY = 'onsdagshjulet:collapsed-sections:v1'
const FOCUS_MODE_KEY = 'onsdagshjulet:focus-mode:v1'
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

function loadFocusMode() {
  try {
    return sessionStorage.getItem(FOCUS_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

const createOption = (
  label,
  star = false,
  percentage = '',
  subWheel = null,
  winnerNote = '',
  winnerNotePool = [],
) => ({
  id: `option-${optionId += 1}`,
  label,
  percentage,
  star,
  ...(subWheel ? { subWheel } : {}),
  ...(winnerNote ? { winnerNote } : {}),
  ...(winnerNotePool.length ? { winnerNotePool } : {}),
})

function normalizeWinnerNotePool(winnerNotePool) {
  if (!Array.isArray(winnerNotePool)) return []
  return winnerNotePool.map((note) => String(note ?? '').trim()).filter(Boolean)
}

function hydrateSubWheel(subWheel) {
  if (!subWheel || !Array.isArray(subWheel.options)) return null
  const hydratedOptions = subWheel.options.slice(0, 30).map((option) => createOption(
    String(option.label ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
    Boolean(option.star),
    option.percentage ?? '',
    hydrateSubWheel(option.subWheel),
    String(option.winnerNote ?? ''),
    normalizeWinnerNotePool(option.winnerNotePool),
  ))
  while (hydratedOptions.length < 2) hydratedOptions.push(createOption(''))
  return {
    id: String(subWheel.id ?? `sub-wheel-${Date.now()}-${Math.random()}`),
    title: String(subWheel.title ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
    options: hydratedOptions,
  }
}

function serializeSubWheel(subWheel) {
  if (!subWheel) return null
  return {
    id: subWheel.id,
    title: subWheel.title,
    options: subWheel.options.map(({
      label,
      percentage = '',
      star = false,
      subWheel: nestedSubWheel,
      winnerNote = '',
      winnerNotePool = [],
    }) => ({
      label,
      percentage,
      star,
      ...(nestedSubWheel ? { subWheel: serializeSubWheel(nestedSubWheel) } : {}),
      ...(winnerNote ? { winnerNote } : {}),
      ...(winnerNotePool.length ? { winnerNotePool } : {}),
    })),
  }
}

function findSubWheelById(options, subWheelId) {
  for (const option of options) {
    if (option.subWheel?.id === subWheelId) return option.subWheel
    const nestedMatch = option.subWheel
      ? findSubWheelById(option.subWheel.options, subWheelId)
      : null
    if (nestedMatch) return nestedMatch
  }
  return null
}

function localizeWinnerNote(winnerNote, locale) {
  return typeof winnerNote === 'object' ? winnerNote?.[locale] : winnerNote
}

function localizeWinnerNotePool(winnerNotePool, locale) {
  const localizedPool = Array.isArray(winnerNotePool)
    ? winnerNotePool
    : winnerNotePool?.[locale]
  return normalizeWinnerNotePool(localizedPool)
}

function localizeSubWheel(subWheel, locale) {
  if (!subWheel) return null
  return {
    id: subWheel.id,
    title: subWheel.title[locale],
    options: subWheel.options[locale].map((label, index) => {
      const optionSettings = subWheel.optionSettings?.[index] ?? {}
      const {
        winnerNote: winnerNoteConfig,
        winnerNotePool: winnerNotePoolConfig,
        ...localizedSettings
      } = optionSettings
      const nestedSubWheel = localizeSubWheel(optionSettings.subWheel, locale)
      const winnerNote = localizeWinnerNote(winnerNoteConfig, locale)
      const winnerNotePool = localizeWinnerNotePool(winnerNotePoolConfig, locale)
      return {
        label,
        ...localizedSettings,
        ...(winnerNote ? { winnerNote } : {}),
        ...(winnerNotePool.length ? { winnerNotePool } : {}),
        ...(nestedSubWheel ? { subWheel: nestedSubWheel } : {}),
      }
    }),
  }
}

const DEFAULT_TEMPLATE = templateCatalog.find((template) => template.id === 'do')
const DEFAULT_OPTIONS = DEFAULT_TEMPLATE.options.sv.map((label, index) => {
  const optionSettings = DEFAULT_TEMPLATE.optionSettings?.[index] ?? {}
  return createOption(
    label,
    Boolean(optionSettings.star),
    optionSettings.percentage ?? '',
    hydrateSubWheel(localizeSubWheel(optionSettings.subWheel, 'sv')),
    localizeWinnerNote(optionSettings.winnerNote, 'sv'),
    localizeWinnerNotePool(optionSettings.winnerNotePool, 'sv'),
  )
})

function hydrateOptions(options) {
  return options.slice(0, 30).map((option) =>
    createOption(
      String(option.label ?? '').slice(0, MAX_OPTION_LABEL_LENGTH),
      Boolean(option.star),
      option.percentage ?? '',
      hydrateSubWheel(option.subWheel),
      String(option.winnerNote ?? ''),
      normalizeWinnerNotePool(option.winnerNotePool),
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
  const [isFocusMode, setIsFocusMode] = useState(loadFocusMode)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [runtimePath, setRuntimePath] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [templateScrollRequest, setTemplateScrollRequest] = useState(0)
  const [inspirationIndex] = useState(() => Math.floor(Math.random() * 5) + 1)
  const [audio, setAudio] = useState(loadMusicPreferences)
  const [initialSession] = useState(() => restoreSession())
  const [canRestore, setCanRestore] = useState(() => Boolean(initialSession))
  const [savedAt, setSavedAt] = useState(() => formatSavedAt(initialSession?.savedAt))
  const [sessionConfirmation, setSessionConfirmation] = useState(null)
  const [sessionMessage, setSessionMessage] = useState('')
  const [spinSettings, setSpinSettings] = useState({ minSeconds: 3, maxSeconds: 11 })
  const [performanceMode, setPerformanceMode] = useState(loadPerformanceMode)
  const [isDocumentHidden, setIsDocumentHidden] = useState(() => document.hidden)
  const [focusModality, setFocusModality] = useState('keyboard')
  const audioEngineRef = useRef(null)
  const initialAudioRef = useRef(audio)
  const settingsSectionRef = useRef(null)

  if (!audioEngineRef.current) audioEngineRef.current = new AudioEngine()

  useEffect(() => {
    const handlePointerDown = () => setFocusModality('pointer')
    const handleKeyDown = (event) => {
      if (['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) return
      setFocusModality('keyboard')
    }
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

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
    window.addEventListener('pointerdown', unlockAudio, engine.needsIOSUnlockRecovery() ? undefined : { once: true })
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

  useEffect(() => {
    sessionStorage.setItem(FOCUS_MODE_KEY, String(isFocusMode))
  }, [isFocusMode])

  useLayoutEffect(() => {
    const syncDocumentVisibility = () => setIsDocumentHidden(document.hidden)
    syncDocumentVisibility()
    document.addEventListener('visibilitychange', syncDocumentVisibility)
    window.addEventListener('focus', syncDocumentVisibility)
    window.addEventListener('pageshow', syncDocumentVisibility)
    return () => {
      document.removeEventListener('visibilitychange', syncDocumentVisibility)
      window.removeEventListener('focus', syncDocumentVisibility)
      window.removeEventListener('pageshow', syncDocumentVisibility)
    }
  }, [])

  useEffect(() => {
    if (!templateScrollRequest) return undefined
    const animationFrame = requestAnimationFrame(() => {
      scrollToSidebarSectionTop(settingsSectionRef.current)
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [templateScrollRequest])

  const toggleSection = useCallback((section) => {
    setCollapsedSections((current) => ({ ...current, [section]: !current[section] }))
  }, [])

  const t = useMemo(() => createTranslator(locale), [locale])
  const templates = useMemo(
    () => templateCatalog.map((template) => ({
      id: template.id,
      emoji: template.emoji,
      name: template.name[locale],
      options: template.options[locale].map((label, index) => {
        const optionSettings = template.optionSettings?.[index] ?? {}
        const {
          winnerNote: winnerNoteConfig,
          winnerNotePool: winnerNotePoolConfig,
          ...localizedSettings
        } = optionSettings
        const winnerNote = localizeWinnerNote(winnerNoteConfig, locale)
        const winnerNotePool = localizeWinnerNotePool(winnerNotePoolConfig, locale)
        return {
          label,
          ...localizedSettings,
          ...(winnerNote ? { winnerNote } : {}),
          ...(winnerNotePool.length ? { winnerNotePool } : {}),
          subWheel: localizeSubWheel(optionSettings.subWheel, locale),
        }
      }),
    })),
    [locale],
  )

  const activeRuntimeWheel = runtimePath[runtimePath.length - 1] ?? null
  const activeSubWheel = useMemo(
    () => activeRuntimeWheel ? findSubWheelById(options, activeRuntimeWheel.id) : null,
    [activeRuntimeWheel, options],
  )
  const activeOptions = activeRuntimeWheel ? activeSubWheel?.options ?? options : options
  const probabilityResult = useMemo(() => calculateProbabilities(activeOptions), [activeOptions])
  const rootProbabilityResult = useMemo(() => calculateProbabilities(options), [options])

  useEffect(() => {
    if (!activeRuntimeWheel || activeSubWheel) return
    setRuntimePath((current) => current.slice(0, -1))
  }, [activeRuntimeWheel, activeSubWheel])
  const updateOption = (id, updates) => {
    setOptions((current) => current.map((option) => (option.id === id ? { ...option, ...updates } : option)))
    setSelectedTemplate(null)
  }

  const addOption = () => {
    if (options.length >= 30) return null
    const nextOption = createOption(`${locale === 'sv' ? 'Val' : 'Option'} ${options.length + 1}`)
    setOptions((current) => (current.length >= 30 ? current : [...current, nextOption]))
    setSelectedTemplate(null)
    return nextOption.id
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

  const updatePerformanceMode = useCallback((mode) => {
    setPerformanceMode(savePerformanceMode(mode))
  }, [])

  const confirmTemplate = () => {
    if (!pendingTemplate) return
    setOptions(pendingTemplate.options.map(({
      label,
      percentage = '',
      star = false,
      subWheel,
      winnerNote = '',
      winnerNotePool = [],
    }) => createOption(
      label,
      star,
      percentage,
      hydrateSubWheel(subWheel),
      winnerNote,
      normalizeWinnerNotePool(winnerNotePool),
    )))
    setRuntimePath([])
    setSelectedTemplate(pendingTemplate.id)
    setPendingTemplate(null)
    setSessionMessage('')
    setCollapsedSections((current) => ({ ...current, settings: false }))
    setTemplateScrollRequest((current) => current + 1)
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
      options: options.map(({
        label,
        percentage,
        star,
        subWheel,
        winnerNote = '',
        winnerNotePool = [],
      }) => ({
        label,
        percentage,
        star,
        ...(subWheel ? { subWheel: serializeSubWheel(subWheel) } : {}),
        ...(winnerNote ? { winnerNote } : {}),
        ...(winnerNotePool.length ? { winnerNotePool } : {}),
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
    <div
      className={`app-shell${isFocusMode ? ' app-shell--focus' : ''}`}
      data-document-hidden={isDocumentHidden ? 'true' : 'false'}
      data-focus-modality={focusModality}
      data-performance-mode={performanceMode}
    >
      <div className="background-glow" aria-hidden="true" />

      <main className={`workspace${isFocusMode ? ' workspace--focus' : ''}`}>
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

        <div className="focus-mode-control">
          <button
            aria-controls="control-panel"
            aria-expanded={!isFocusMode}
            aria-label={t(isFocusMode ? 'focusMode.showLabel' : 'focusMode.hideLabel')}
            className={`focus-mode-toggle${isFocusMode ? ' is-active' : ''}`}
            onClick={() => setIsFocusMode((current) => !current)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <rect height="16" rx="2" width="18" x="3" y="4" />
              <path d="M9 4v16" />
              <path d={isFocusMode ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} />
            </svg>
            <span>{t(isFocusMode ? 'focusMode.show' : 'focusMode.enter')}</span>
          </button>
          {isFocusMode ? (
            <span className="focus-mode-helper">{t('focusMode.helper')}</span>
          ) : null}
        </div>

        <aside
          aria-hidden={isFocusMode}
          aria-label={t('controlsLabel')}
          className="sidebar"
          id="control-panel"
          inert={isFocusMode ? true : undefined}
        >
          <CollapsibleSection
            accentClass="card-accent--pink"
            className="settings-card"
            collapsed={collapsedSections.settings}
            icon="choices"
            id="wheel-settings"
            onToggle={() => toggleSection('settings')}
            sectionRef={settingsSectionRef}
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
            <SpinSettings
              {...spinSettings}
              onChange={(updates) => setSpinSettings((current) => ({ ...current, ...updates }))}
              onPerformanceModeChange={updatePerformanceMode}
              performanceMode={performanceMode}
              t={t}
            />
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
        <span className="app-footer__version">{t('footer.version', { version: APP_VERSION })}</span>
        <span className="app-footer__storage">{t('footer.storage')}</span>
        <span className="app-footer__mobile-copy">{t('footer.mobile')}</span>
      </footer>
    </div>
  )
}

export default App
