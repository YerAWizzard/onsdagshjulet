import { useEffect, useRef, useState } from 'react'
import { formatProbability } from '../../lib/probability.js'

let subOptionId = 0

const createSubOption = (label = '') => ({
  id: `sub-option-${Date.now()}-${subOptionId += 1}`,
  label,
  percentage: '',
  star: false,
})

function WheelSettings({
  allowSubWheels = true,
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
  const [expandedSubWheels, setExpandedSubWheels] = useState({})
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
    const normalizedValue = String(Number(probabilityEditor.draft.replace(',', '.')))
    const previousValue = String(option.percentage ?? '').replace(',', '.')
    if (normalizedValue !== previousValue) onUpdate(option.id, { percentage: normalizedValue })
    setProbabilityEditor(null)
  }

  const updateProbabilityDraft = (value) => {
    if (/^\d{0,3}([.,]\d{0,2})?$/.test(value)) {
      setProbabilityEditor((current) => current ? { ...current, draft: value, touched: true } : current)
    }
  }

  const toggleSubWheel = (option, updateOption, expansionKey = option.id) => {
    if (!option.subWheel) {
      updateOption({
        ...option,
        subWheel: {
          id: `custom-sub-wheel-${Date.now()}`,
          title: t('settings.defaultSubWheelTitle'),
          options: [createSubOption()],
        },
      })
      setExpandedSubWheels((current) => ({ ...current, [expansionKey]: true }))
      return
    }
    setExpandedSubWheels((current) => ({ ...current, [expansionKey]: !current[expansionKey] }))
  }

  const updateSubWheel = (option, updates, updateOption) => {
    updateOption({ ...option, subWheel: { ...option.subWheel, ...updates } })
  }

  const updateSubOption = (option, subOptionIndex, updatedSubOption, updateOption) => {
    updateSubWheel(option, {
      options: option.subWheel.options.map((subOption, index) => (
        index === subOptionIndex ? updatedSubOption : subOption
      )),
    }, updateOption)
  }

  const addSubOption = (option, updateOption) => {
    updateSubWheel(option, { options: [...option.subWheel.options, createSubOption()] }, updateOption)
  }

  const removeSubOption = (option, subOptionIndex, updateOption) => {
    updateSubWheel(option, {
      options: option.subWheel.options.filter((_, index) => index !== subOptionIndex),
    }, updateOption)
  }

  const removeSubWheel = (option, updateOption, expansionKey = option.id) => {
    updateOption({ ...option, subWheel: null })
    setExpandedSubWheels((current) => ({ ...current, [expansionKey]: false }))
  }

  const renderSubWheelEditor = (parentOption, depth, updateParentOption, expansionKey = parentOption.id) => {
    if (!parentOption.subWheel || !expandedSubWheels[expansionKey]) return null
    return (
      <section
        className={`sub-wheel-editor sub-wheel-editor--depth-${depth}`}
        id={`sub-wheel-editor-${expansionKey}`}
        aria-label={parentOption.subWheel.title}
      >
        <div className="sub-option-list">
          {parentOption.subWheel.options.map((subOption, subOptionIndex) => {
            const childExpansionKey = subOption.id ?? `${expansionKey}-${subOptionIndex}`
            const childOpen = Boolean(subOption.subWheel && expandedSubWheels[childExpansionKey])
            const updateChildOption = (updatedSubOption) => {
              updateSubOption(parentOption, subOptionIndex, updatedSubOption, updateParentOption)
            }
            return (
              <div className="sub-option-group" key={childExpansionKey}>
                <div className={`sub-option-row${subOption.subWheel ? ' has-sub-wheel' : ''}${childOpen ? ' is-sub-wheel-open' : ''}`}>
                  <span aria-hidden="true">↳</span>
                  <div className="sub-option-fields">
                    <input
                      aria-label={t('settings.subOptionName', { number: subOptionIndex + 1, name: parentOption.label })}
                      maxLength={80}
                      onChange={(event) => updateChildOption({ ...subOption, label: event.target.value })}
                      value={subOption.label}
                    />
                    {depth < 2 ? (
                      <button
                        aria-controls={subOption.subWheel ? `sub-wheel-editor-${childExpansionKey}` : undefined}
                        aria-expanded={childOpen}
                        aria-label={t(subOption.subWheel ? 'settings.toggleSubWheel' : 'settings.addSubWheel', { name: subOption.label || subOptionIndex + 1 })}
                        className={`sub-wheel-action${subOption.subWheel ? ' has-sub-wheel' : ''}`}
                        onClick={() => toggleSubWheel(subOption, updateChildOption, childExpansionKey)}
                        type="button"
                      >
                        <span aria-hidden="true">{subOption.subWheel ? childOpen ? '⌄' : '›' : '+'}</span>
                      </button>
                    ) : null}
                  </div>
                  <button
                    aria-label={t('settings.removeSubOption', { name: subOption.label || subOptionIndex + 1 })}
                    onClick={() => removeSubOption(parentOption, subOptionIndex, updateParentOption)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                {renderSubWheelEditor(subOption, depth + 1, updateChildOption, childExpansionKey)}
              </div>
            )
          })}
        </div>
        <div className="sub-wheel-editor__actions">
          <button className="sub-option-add" onClick={() => addSubOption(parentOption, updateParentOption)} type="button">
            {t('settings.addSubOption')}
          </button>
          <button className="sub-wheel-remove" onClick={() => removeSubWheel(parentOption, updateParentOption, expansionKey)} type="button">
            {t('settings.removeSubWheel')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="settings-content">
      <p className="panel-help">{t('settings.help')}</p>

      <div className="option-list">
        {options.map((option, index) => {
          const hasExplicitPercentage = String(option.percentage ?? '').trim() !== ''
          const editorOpen = probabilityEditor?.id === option.id
          const subWheelOpen = Boolean(option.subWheel && expandedSubWheels[option.id])
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
            <div className={`option-row-group${editorOpen ? ' is-editing' : ''}${option.subWheel ? ' has-sub-wheel' : ''}${subWheelOpen ? ' is-sub-wheel-open' : ''}`} key={option.id}>
              <div className="option-row">
                <span className="option-number">{index + 1}</span>
                <div className="option-fields option-fields--with-sub-wheel-action">
                  <input
                    aria-label={t('settings.optionName', { number: index + 1 })}
                    className="option-name"
                    maxLength={80}
                    onChange={(event) => onUpdate(option.id, { label: event.target.value })}
                    value={option.label}
                  />
                  {allowSubWheels ? (
                    <button
                      aria-controls={option.subWheel ? `sub-wheel-editor-${option.id}` : undefined}
                      aria-expanded={subWheelOpen}
                      aria-label={t(option.subWheel ? 'settings.toggleSubWheel' : 'settings.addSubWheel', { name: option.label })}
                      className={`sub-wheel-action${option.subWheel ? ' has-sub-wheel' : ''}`}
                      onClick={() => toggleSubWheel(
                        option,
                        (updatedOption) => onUpdate(option.id, { subWheel: updatedOption.subWheel }),
                      )}
                      type="button"
                    >
                      <span aria-hidden="true">{option.subWheel ? subWheelOpen ? '⌄' : '›' : '+'}</span>
                    </button>
                  ) : null}
                </div>
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
                      autoComplete="off"
                      inputMode="decimal"
                      onChange={(event) => updateProbabilityDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          if (!draftError) saveProbability(option)
                        }
                      }}
                      type="text"
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
              {renderSubWheelEditor(
                option,
                1,
                (updatedOption) => onUpdate(option.id, { subWheel: updatedOption.subWheel }),
              )}
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
