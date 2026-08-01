import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import CollapsibleSection from './components/ControlPanel/CollapsibleSection.jsx'
import Templates from './components/ControlPanel/Templates.jsx'
import WheelSettings from './components/ControlPanel/WheelSettings.jsx'
import Wheel from './components/Wheel/Wheel.jsx'
import { createTranslator, templateCatalog } from './i18n.js'
import { AudioEngine, DEFAULT_MUSIC, MUSIC_TRACKS } from './lib/AudioEngine.js'
import { loadMusicPreferences, saveMusicPreferences } from './lib/musicStorage.js'
import { calculateProbabilities } from './lib/probability.js'
import {
  deleteSession,
  hasSavedSession,
  restoreSession,
  saveSession,
} from './lib/sessionStorage.js'

let optionId = 0
const COLLAPSED_SECTIONS_KEY = 'onsdagshjulet:collapsed-sections:v1'
const OPEN_SECTIONS = { settings: false, audio: false, session: false, templates: false }

function loadCollapsedSections() {
  try {
    return { ...OPEN_SECTIONS, ...JSON.parse(sessionStorage.getItem(COLLAPSED_SECTIONS_KEY) || '{}') }
  } catch {
    return OPEN_SECTIONS
  }
}

const createOption = (label, star = false, percentage = '') => ({
  id: `option-${optionId += 1}`,
  label,
  percentage,
  star,
})

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
      String(option.label ?? '').slice(0, 40),
      Boolean(option.star),
      option.percentage ?? '',
    ),
  )
}

function App() {
  const [locale, setLocale] = useState('sv')
  const [collapsedSections, setCollapsedSections] = useState(loadCollapsedSections)
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [audio, setAudio] = useState(loadMusicPreferences)
  const [canRestore, setCanRestore] = useState(() => hasSavedSession())
  const [sessionMessage, setSessionMessage] = useState('')
  const audioEngineRef = useRef(null)
  const initialAudioRef = useRef(audio)

  if (!audioEngineRef.current) audioEngineRef.current = new AudioEngine()

  useEffect(() => {
    const engine = audioEngineRef.current
    const initialAudio = initialAudioRef.current
    engine.setMode(initialAudio.mode)
    engine.setTrack(initialAudio.trackIndex)
    engine.setVolume(initialAudio.volume)
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
      options: template.options[locale],
    })),
    [locale],
  )

  const probabilityResult = useMemo(() => calculateProbabilities(options), [options])
  const localizedProbabilityError = probabilityResult.errorCode
    ? t(`probability.${probabilityResult.errorCode}`, probabilityResult.errorParams)
    : probabilityResult.error

  const updateOption = (id, updates) => {
    setOptions((current) => current.map((option) => (option.id === id ? { ...option, ...updates } : option)))
    setSelectedTemplate(null)
  }

  const addOption = () => {
    setOptions((current) => (current.length >= 30 ? current : [...current, createOption(`${locale === 'sv' ? 'Val' : 'Option'} ${current.length + 1}`)]))
    setSelectedTemplate(null)
  }

  const removeOption = (id) => {
    setOptions((current) => (current.length <= 2 ? current : current.filter((option) => option.id !== id)))
    setSelectedTemplate(null)
  }

  const updateAudio = (updates) => {
    setAudio((current) => {
      const next = { ...current, ...updates }
      if ('mode' in updates && updates.mode !== current.mode) next.trackIndex = 0
      if ('volume' in updates) audioEngineRef.current.setVolume(next.volume)
      if ('mode' in updates) audioEngineRef.current.setMode(next.mode)
      if ('trackIndex' in updates) audioEngineRef.current.setTrack(next.trackIndex)
      if ('enabled' in updates) audioEngineRef.current.setEnabled(next.enabled)
      return next
    })
  }

  const confirmTemplate = () => {
    if (!pendingTemplate) return
    setOptions(pendingTemplate.options.map((label) => createOption(label)))
    setSelectedTemplate(pendingTemplate.id)
    setPendingTemplate(null)
    setSessionMessage('')
  }

  const handleSaveSession = () => {
    const saved = saveSession({
      version: 1,
      audio: {
        enabled: audio.enabled,
        mode: audio.mode,
        trackIndex: audio.trackIndex,
        volume: audio.volume,
      },
      locale,
      options: options.map(({ label, percentage, star }) => ({ label, percentage, star })),
      selectedMusic: audio.mode,
      selectedTemplate,
      volume: audio.volume,
    })
    setCanRestore(saved)
    setSessionMessage(saved ? 'saved' : 'saveFailed')
  }

  const handleRestoreSession = () => {
    const session = restoreSession()
    if (!session) {
      setCanRestore(false)
      setSessionMessage('missing')
      return
    }
    setOptions(hydrateOptions(session.options))
    setSelectedTemplate(session.selectedTemplate ?? null)
    setLocale(session.locale === 'en' ? 'en' : 'sv')
    const restoredAudio = {
      enabled: Boolean(session.audio?.enabled),
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
    audioEngineRef.current.setMode(restoredAudio.mode)
    audioEngineRef.current.setTrack(restoredAudio.trackIndex)
    audioEngineRef.current.setEnabled(restoredAudio.enabled)
    setSessionMessage('restored')
  }

  const handleDeleteSession = () => {
    const deleted = deleteSession()
    setCanRestore(!deleted && hasSavedSession())
    setSessionMessage(deleted ? 'deleted' : 'deleteFailed')
  }

  return (
    <div className="app-shell">
      <div className="background-glow" aria-hidden="true" />

      <header className="app-header">
        <div className="language-switch" aria-label="Language / Språk">
          <button
            aria-pressed={locale === 'sv'}
            className={locale === 'sv' ? 'is-active' : ''}
            onClick={() => { setLocale('sv'); setPendingTemplate(null) }}
            type="button"
          >
            🇸🇪 Svenska
          </button>
          <button
            aria-pressed={locale === 'en'}
            className={locale === 'en' ? 'is-active' : ''}
            onClick={() => { setLocale('en'); setPendingTemplate(null) }}
            type="button"
          >
            🇬🇧 English
          </button>
        </div>
        <div className="brand-line">
          <h1><span aria-hidden="true">🎪</span> Onsdagshjulet</h1>
        </div>
        <p>{t('subtitle')}</p>
      </header>

      <main className="workspace">
        <aside className="sidebar" aria-label={t('controlsLabel')}>
          <CollapsibleSection
            accentClass="card-accent--pink"
            className="settings-card"
            collapsed={collapsedSections.settings}
            id="wheel-settings"
            onToggle={() => toggleSection('settings')}
            title={t('settings.title')}
          >
            <WheelSettings
              audio={audio}
              collapsedSections={collapsedSections}
              canRestore={canRestore}
              onAdd={addOption}
              onAudioChange={updateAudio}
              onDeleteSession={handleDeleteSession}
              onRemove={removeOption}
              onRestoreSession={handleRestoreSession}
              onSaveSession={handleSaveSession}
              onUpdate={updateOption}
              options={options}
              probabilities={probabilityResult.probabilities}
              probabilityError={localizedProbabilityError}
              sessionMessage={sessionMessage ? t(`session.${sessionMessage}`) : ''}
              t={t}
              onToggleSection={toggleSection}
            />
          </CollapsibleSection>

          <CollapsibleSection
            accentClass="card-accent--violet"
            className="templates-card"
            collapsed={collapsedSections.templates}
            id="templates"
            onToggle={() => toggleSection('templates')}
            title={t('templates.title')}
          >
            <Templates
              onCancel={() => setPendingTemplate(null)}
              onConfirm={confirmTemplate}
              onSelect={setPendingTemplate}
              pendingTemplate={pendingTemplate}
              selectedTemplate={selectedTemplate}
              t={t}
              templates={templates}
            />
          </CollapsibleSection>
        </aside>

        <section className="wheel-card" aria-label={t('wheel.label')}>
          <Wheel
            audioEngine={audioEngineRef.current}
            options={options}
            probabilities={probabilityResult.probabilities}
            probabilityError={probabilityResult.error}
            t={t}
          />
        </section>
      </main>

      <footer className="app-footer" aria-label={t('footer.label')}>
        <span>{t('footer.version')}</span>
        <span>{t('footer.local')}</span>
        <span>{t('footer.noAccount')}</span>
      </footer>
    </div>
  )
}

export default App
