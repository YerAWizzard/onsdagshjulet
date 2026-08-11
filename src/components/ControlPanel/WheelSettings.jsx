import { useEffect, useRef, useState } from 'react'
import { formatProbability } from '../../lib/probability.js'

function WheelSettings({
  onAdd,
  onRemove,
  onUpdate,
  options,
  probabilities,
  probabilityError,
  t,
}) {
  const [probabilityEditor, setProbabilityEditor] = useState(null)
  const [showProbabilities, setShowProbabilities] = useState(false)
  const [sparklingStarId, setSparklingStarId] = useState(null)
  const probabilityInputRef = useRef(null)
  const sparkleTimerRef = useRef(null)

  useEffect(() => {
    if (probabilityEditor) probabilityInputRef.current?.focus()
  }, [probabilityEditor])

  useEffect(() => () => clearTimeout(sparkleTimerRef.current), [])

  const openProbabilityControl = (option) => {
    if (probabilityEditor?.id === option.id) {
      setProbabilityEditor(null)
      return
    }
    setProbabilityEditor({
      draft: String(option.percentage ?? ''),
      id: option.id,
      touched: false,
    })
  }

  const setAutomaticProbability = (option) => {
    if (String(option.percentage ?? '').trim() !== '') onUpdate(option.id, { percentage: '' })
    setProbabilityEditor(null)
  }

  const toggleStarPrize = (option) => {
    const nextStar = !option.star
    onUpdate(option.id, { star: nextStar })
    if (!nextStar) return
    setSparklingStarId(option.id)
    clearTimeout(sparkleTimerRef.current)
    sparkleTimerRef.current = setTimeout(() => setSparklingStarId(null), 650)
  }

  const saveProbability = (option) => {
    if (!probabilityEditor || probabilityEditor.id !== option.id) return
    const normalizedValue = probabilityEditor.draft.replace(',', '.')
    const previousValue = String(option.percentage ?? '').replace(',', '.')
    if (normalizedValue !== previousValue) onUpdate(option.id, { percentage: normalizedValue })
    setProbabilityEditor(null)
  }

  const updateProbabilityDraft = (value) => {
    if (/^\d{0,3}([.,]\d{0,2})?$/.test(value)) {
      setProbabilityEditor((current) => current ? { ...current, draft: value, touched: true } : current)
    }
  }

  return (
    <div className="settings-content">
      <p className="panel-help">{t('settings.help')}</p>

      <div className="option-list">
        {options.map((option, index) => {
          const hasExplicitPercentage = String(option.percentage ?? '').trim() !== ''
          const editorOpen = probabilityEditor?.id === option.id
          const draftValue = editorOpen
            ? Number(probabilityEditor.draft.replace(',', '.'))
            : Number.NaN
          const invalidDraft = editorOpen && (
            probabilityEditor.draft.trim() === ''
            || !Number.isFinite(draftValue)
            || draftValue < 0
            || draftValue > 100
          )
          const otherExplicitTotal = options.reduce((total, currentOption) => {
            if (currentOption.id === option.id) return total
            const value = Number(String(currentOption.percentage ?? '').trim().replace(',', '.'))
            return Number.isFinite(value) ? total + value : total
          }, 0)
          const totalExceeds = editorOpen && !invalidDraft && otherExplicitTotal + draftValue > 100.000001
          const draftError = invalidDraft
            ? t('settings.invalidPercentage')
            : totalExceeds
              ? t('settings.totalExceeds')
              : ''
          const editorError = probabilityEditor?.touched ? draftError : ''
          return (
            <div className={`option-row-group${editorOpen ? ' is-editing' : ''}`} key={option.id}>
              <div className="option-row">
                <span className="option-number">{index + 1}</span>
                <input
                  aria-label={t('settings.optionName', { number: index + 1 })}
                  className="option-name"
                  maxLength={40}
                  onChange={(event) => onUpdate(option.id, { label: event.target.value })}
                  value={option.label}
                />
                <div className="probability-selector">
                  <button
                    aria-expanded={editorOpen}
                    aria-label={t('settings.editPercentage', { name: option.label || t('settings.unnamedOption', { number: index + 1 }) })}
                    className={`probability-trigger${hasExplicitPercentage ? ' is-active' : ''}`}
                    onClick={() => openProbabilityControl(option)}
                    type="button"
                  >
                    <span>{hasExplicitPercentage ? `${option.percentage} %` : t('settings.auto')}</span>
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>
                <button
                  aria-label={t('settings.markStar', { name: option.label || t('settings.unnamedOption', { number: index + 1 }) })}
                  aria-pressed={option.star}
                  className={`row-icon row-icon--star${option.star ? ' is-active' : ''}${sparklingStarId === option.id ? ' just-activated' : ''}`}
                  onClick={() => toggleStarPrize(option)}
                  type="button"
                >
                  ★
                </button>
                <button
                  aria-label={t('settings.remove', { name: option.label || t('settings.unnamedOption', { number: index + 1 }) })}
                  className="row-icon row-icon--remove"
                  disabled={options.length <= 2}
                  onClick={() => onRemove(option.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
              {editorOpen ? (
                <form
                  className="inline-probability-editor"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      setProbabilityEditor(null)
                    }
                  }}
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!draftError) saveProbability(option)
                  }}
                >
                  <strong className="probability-editor-heading">{t('settings.customPercentage')}</strong>
                  <label className="probability-value-field">
                    <input
                      ref={probabilityInputRef}
                      aria-invalid={Boolean(editorError)}
                      aria-label={t('settings.optionPercentage', { number: index + 1 })}
                      inputMode="decimal"
                      max="100"
                      min="0"
                      onChange={(event) => updateProbabilityDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault()
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          if (!draftError) saveProbability(option)
                        }
                      }}
                      step="0.1"
                      type="number"
                      value={probabilityEditor.draft}
                    />
                    <span aria-hidden="true">%</span>
                  </label>
                  <div className="probability-editor-actions">
                    <button
                      disabled={Boolean(draftError)}
                      type="submit"
                    >
                      {t('settings.saveProbability')}
                    </button>
                    <button onClick={() => setProbabilityEditor(null)} type="button">
                      {t('settings.cancelProbability')}
                    </button>
                  </div>
                  <button
                    className="probability-use-auto"
                    onClick={() => setAutomaticProbability(option)}
                    type="button"
                  >
                    {t('settings.useAutomatic')}
                  </button>
                  {editorError ? <p className="probability-editor-error" role="alert">{editorError}</p> : null}
                </form>
              ) : null}
            </div>
          )
        })}
      </div>

      <button className="panel-button panel-button--add" disabled={options.length >= 30} onClick={onAdd} type="button">
        {t('settings.addRow')}
      </button>

      {probabilityError ? <p className="validation-message" role="alert">{probabilityError}</p> : null}

      <button
        className="probability-toggle"
        onClick={() => setShowProbabilities((visible) => !visible)}
        type="button"
      >
        {showProbabilities ? t('settings.hideProbabilities') : t('settings.showProbabilities')}
      </button>
      {showProbabilities ? (
        <div className="probability-summary">
          {options.map((option, index) => (
            <div key={option.id}>
              <span>{option.label || t('settings.unnamedOption', { number: index + 1 })}</span>
              <strong>{probabilityError ? '—' : formatProbability(probabilities[index])}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default WheelSettings
