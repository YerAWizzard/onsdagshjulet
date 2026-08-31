import { useEffect, useId, useRef, useState } from 'react'
import { calculateProbabilities, formatProbability } from '../../lib/probability.js'

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
  probabilityError,
  t,
}) {
  const [probabilityEditor, setProbabilityEditor] = useState(null)
  const [showProbabilities, setShowProbabilities] = useState(false)
  const [showSubwheelProbabilities, setShowSubwheelProbabilities] = useState(true)
  const [sparklingStarId, setSparklingStarId] = useState(null)
  const [expandedSubWheels, setExpandedSubWheels] = useState({})
  const [minimumChoiceConfirmation, setMinimumChoiceConfirmation] = useState(null)
  const probabilityDescriptionId = useId()
  const probabilityErrorId = useId()
  const probabilityEditorRef = useRef(null)
  const probabilityInputRef = useRef(null)
  const probabilityTriggerRef = useRef(null)
  const restoreProbabilityFocusRef = useRef(false)
  const minimumChoiceCancelRef = useRef(null)
  const optionInputRefs = useRef(new Map())
  const pendingNewOptionFocusRef = useRef(null)
  const sparkleTimerRef = useRef(null)

  useEffect(() => {
    if (probabilityEditor) {
      let revealFrame = 0
      const revealEditor = () => {
        cancelAnimationFrame(revealFrame)
        revealFrame = requestAnimationFrame(() => {
          const editor = probabilityEditorRef.current
          if (!editor || !window.matchMedia('(max-width: 620px)').matches) return
          const viewport = window.visualViewport
          const viewportTop = viewport?.offsetTop ?? 0
          const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight)
          const editorRect = editor.getBoundingClientRect()
          const edgeMargin = 8
          const isFullyVisible = (
            editorRect.top >= viewportTop + edgeMargin
            && editorRect.bottom <= viewportBottom - edgeMargin
          )
          if (isFullyVisible) return
          editor.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'nearest',
          })
        })
      }
      const focusFrame = requestAnimationFrame(() => {
        probabilityInputRef.current?.focus({ preventScroll: true })
        revealEditor()
      })
      window.visualViewport?.addEventListener('resize', revealEditor, { once: true })
      return () => {
        cancelAnimationFrame(focusFrame)
        cancelAnimationFrame(revealFrame)
        window.visualViewport?.removeEventListener('resize', revealEditor)
      }
    }
    if (!restoreProbabilityFocusRef.current) return undefined
    const animationFrame = requestAnimationFrame(() => {
      if (probabilityTriggerRef.current?.isConnected) {
        probabilityTriggerRef.current.focus({ preventScroll: true })
      }
      restoreProbabilityFocusRef.current = false
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [probabilityEditor])

  useEffect(() => () => clearTimeout(sparkleTimerRef.current), [])

  useEffect(() => {
    if (!minimumChoiceConfirmation) return undefined
    const animationFrame = requestAnimationFrame(() => minimumChoiceCancelRef.current?.focus())
    return () => cancelAnimationFrame(animationFrame)
  }, [minimumChoiceConfirmation])

  useEffect(() => {
    const pendingId = pendingNewOptionFocusRef.current
    if (!pendingId) return undefined
    const animationFrame = requestAnimationFrame(() => {
      const input = optionInputRefs.current.get(pendingId)
      if (!input) return
      input.focus({ preventScroll: true })
      input.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
      pendingNewOptionFocusRef.current = null
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [options])

  const closeProbabilityControl = () => {
    restoreProbabilityFocusRef.current = true
    setProbabilityEditor(null)
  }

  const openProbabilityControl = (option, trigger) => {
    probabilityTriggerRef.current = trigger
    if (probabilityEditor?.id === option.id) {
      closeProbabilityControl()
      return
    }
    setProbabilityEditor({
      draft: String(option.percentage ?? ''),
      id: option.id,
      touched: false,
    })
  }

  const setAutomaticProbability = (option, updateOption) => {
    if (String(option.percentage ?? '').trim() !== '') updateOption({ percentage: '' })
    closeProbabilityControl()
  }

  const toggleStarPrize = (option, updateOption) => {
    const nextStar = !option.star
    updateOption({ star: nextStar })
    if (!nextStar) return
    setSparklingStarId(option.id)
    clearTimeout(sparkleTimerRef.current)
    sparkleTimerRef.current = setTimeout(() => setSparklingStarId(null), 650)
  }

  const saveProbability = (option, updateOption) => {
    if (!probabilityEditor || probabilityEditor.id !== option.id) return
    const normalizedValue = String(Number(probabilityEditor.draft.replace(',', '.')))
    const previousValue = String(option.percentage ?? '').replace(',', '.')
    if (normalizedValue !== previousValue) updateOption({ percentage: normalizedValue })
    closeProbabilityControl()
  }

  const updateProbabilityDraft = (value) => {
    if (/^\d{0,3}([.,]\d{0,2})?$/.test(value)) {
      setProbabilityEditor((current) => current ? { ...current, draft: value, touched: true } : current)
    }
  }

  const toggleSubWheel = (option, updateOption, expansionKey = option.id) => {
    if (!option.subWheel) {
      const firstOption = createSubOption()
      const secondOption = createSubOption()
      pendingNewOptionFocusRef.current = firstOption.id
      updateOption({
        ...option,
        subWheel: {
          id: `custom-sub-wheel-${Date.now()}`,
          title: t('settings.defaultSubWheelTitle'),
          options: [firstOption, secondOption],
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
    const nextOption = createSubOption()
    pendingNewOptionFocusRef.current = nextOption.id
    updateSubWheel(option, { options: [...option.subWheel.options, nextOption] }, updateOption)
    setMinimumChoiceConfirmation((current) => current?.parentId === option.id ? null : current)
  }

  const removeSubOption = (option, subOptionIndex, updateOption, expansionKey) => {
    if (option.subWheel.options.length <= 2) {
      setMinimumChoiceConfirmation({ expansionKey, parentId: option.id })
      return
    }
    updateSubWheel(option, {
      options: option.subWheel.options.filter((_, index) => index !== subOptionIndex),
    }, updateOption)
  }

  const removeSubWheel = (option, updateOption, expansionKey = option.id) => {
    updateOption({ ...option, subWheel: null })
    setExpandedSubWheels((current) => ({ ...current, [expansionKey]: false }))
    setMinimumChoiceConfirmation((current) => current?.parentId === option.id ? null : current)
  }

  const getProbabilityDraftState = (option, siblings) => {
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
    const otherExplicitTotal = siblings.reduce((total, sibling) => {
      if (sibling.id === option.id) return total
      if (!String(sibling.label ?? '').trim()) return total
      const value = Number(String(sibling.percentage ?? '').trim().replace(',', '.'))
      return Number.isFinite(value) ? total + value : total
    }, 0)
    const totalExceeds = editorOpen && !invalidDraft && otherExplicitTotal + draftValue > 100.000001
    const draftError = invalidDraft
      ? t('settings.invalidPercentage')
      : totalExceeds
        ? t('settings.totalExceeds')
        : ''
    return {
      draftError,
      editorError: probabilityEditor?.touched ? draftError : '',
      editorOpen,
    }
  }

  const renderProbabilityTrigger = (option, accessibleName, className = '') => {
    const hasExplicitPercentage = String(option.percentage ?? '').trim() !== ''
    const editorOpen = probabilityEditor?.id === option.id
    const triggerLabel = hasExplicitPercentage
      ? `${String(option.percentage).trim().replace(',', '.')}%`
      : '%'
    return (
      <div className={`probability-selector${hasExplicitPercentage ? ' has-explicit-value' : ''}${className ? ` ${className}` : ''}`}>
        <button
          aria-expanded={editorOpen}
          aria-label={accessibleName}
          className={`probability-trigger${hasExplicitPercentage ? ' is-active' : ''}`}
          data-tooltip={t('settings.adjustWinChance')}
          onClick={(event) => openProbabilityControl(option, event.currentTarget)}
          type="button"
        >
          <span aria-hidden="true">{triggerLabel}</span>
        </button>
      </div>
    )
  }

  const renderProbabilityEditor = (option, siblings, updateOption, inputLabel, className = '') => {
    const { draftError, editorError, editorOpen } = getProbabilityDraftState(option, siblings)
    if (!editorOpen) return null
    return (
      <form
        ref={probabilityEditorRef}
        className={`inline-probability-editor${className ? ` ${className}` : ''}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            closeProbabilityControl()
          }
        }}
        onSubmit={(event) => {
          event.preventDefault()
          if (!draftError) saveProbability(option, updateOption)
        }}
      >
        <strong className="probability-editor-heading">{t('settings.customPercentage')}</strong>
        <label className="probability-value-field">
          <input
            ref={probabilityInputRef}
            aria-describedby={`${probabilityDescriptionId}${editorError ? ` ${probabilityErrorId}` : ''}`}
            aria-errormessage={editorError ? probabilityErrorId : undefined}
            aria-invalid={Boolean(editorError)}
            aria-label={inputLabel}
            autoComplete="off"
            inputMode="decimal"
            onChange={(event) => updateProbabilityDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (!draftError) saveProbability(option, updateOption)
              }
            }}
            type="text"
            value={probabilityEditor.draft}
          />
          <span aria-hidden="true">%</span>
        </label>
        <span className="visually-hidden" id={probabilityDescriptionId}>{t('settings.percentageRange')}</span>
        <div className="probability-editor-actions">
          <button disabled={Boolean(draftError)} type="submit">{t('settings.saveProbability')}</button>
          <button onClick={closeProbabilityControl} type="button">{t('settings.cancelProbability')}</button>
        </div>
        <button className="probability-use-auto" onClick={() => setAutomaticProbability(option, updateOption)} type="button">
          {t('settings.useAutomatic')}
        </button>
        {editorError ? <p className="probability-editor-error" id={probabilityErrorId} role="alert">{editorError}</p> : null}
      </form>
    )
  }

  const renderSubWheelEditor = (parentOption, depth, updateParentOption, expansionKey = parentOption.id) => {
    if (!parentOption.subWheel || !expandedSubWheels[expansionKey]) return null
    const showMinimumChoiceConfirmation = minimumChoiceConfirmation?.parentId === parentOption.id
    return (
      <section
        className={`sub-wheel-editor sub-wheel-editor--depth-${depth}`}
        id={`sub-wheel-editor-${expansionKey}`}
        aria-label={t('settings.subWheelHeading', { name: parentOption.label || '…' })}
      >
        <div className="sub-wheel-editor__heading">
          <strong>{t('settings.subWheelHeading', { name: parentOption.label || '…' })}</strong>
          <button className="sub-wheel-remove" onClick={() => removeSubWheel(parentOption, updateParentOption, expansionKey)} type="button">
            {t('settings.removeSubWheel')}
          </button>
        </div>
        <div className="sub-option-list">
          {parentOption.subWheel.options.map((subOption, subOptionIndex) => {
            const childExpansionKey = subOption.id ?? `${expansionKey}-${subOptionIndex}`
            const childOpen = Boolean(subOption.subWheel && expandedSubWheels[childExpansionKey])
            const updateChildOption = (updatedSubOption) => {
              updateSubOption(parentOption, subOptionIndex, updatedSubOption, updateParentOption)
            }
            const updateChildFields = (updates) => updateChildOption({ ...subOption, ...updates })
            const accessibleName = subOption.label || t('settings.unnamedOption', { number: subOptionIndex + 1 })
            return (
              <div className="sub-option-group" key={childExpansionKey}>
                <div className={`sub-option-row${subOption.subWheel ? ' has-sub-wheel' : ''}${childOpen ? ' is-sub-wheel-open' : ''}`}>
                  <span aria-hidden="true">↳</span>
                  <div className="sub-option-fields">
                    <input
                      ref={(node) => {
                        if (node) optionInputRefs.current.set(subOption.id, node)
                        else optionInputRefs.current.delete(subOption.id)
                      }}
                      aria-label={t('settings.subOptionName', { number: subOptionIndex + 1, name: parentOption.label })}
                      maxLength={80}
                      onChange={(event) => updateChildOption({ ...subOption, label: event.target.value })}
                      placeholder={t('settings.subOptionPlaceholder', { number: subOptionIndex + 1 })}
                      value={subOption.label}
                    />
                    {depth < 2 ? (
                      <button
                        aria-controls={subOption.subWheel ? `sub-wheel-editor-${childExpansionKey}` : undefined}
                        aria-expanded={childOpen}
                        aria-label={t(subOption.subWheel ? childOpen ? 'settings.hideSubWheel' : 'settings.showSubWheel' : 'settings.addSubWheel', { name: subOption.label || subOptionIndex + 1 })}
                        className={`sub-wheel-action${subOption.subWheel ? ' has-sub-wheel' : ''}`}
                        data-tooltip={t(subOption.subWheel ? childOpen ? 'settings.hideSubWheelTooltip' : 'settings.showSubWheelTooltip' : 'settings.addSubWheelTooltip')}
                        onClick={() => toggleSubWheel(subOption, updateChildOption, childExpansionKey)}
                        type="button"
                      >
                        <span aria-hidden="true">{subOption.subWheel ? childOpen ? '⌄' : '›' : '+'}</span>
                      </button>
                    ) : null}
                  </div>
                  {renderProbabilityTrigger(
                    subOption,
                    t('settings.editPercentage', { name: accessibleName }),
                    'sub-option-probability',
                  )}
                  <button
                    aria-label={t('settings.markStar', { name: accessibleName })}
                    aria-pressed={Boolean(subOption.star)}
                    className={`row-icon row-icon--star sub-option-star${subOption.star ? ' is-active' : ''}${sparklingStarId === subOption.id ? ' just-activated' : ''}`}
                    data-tooltip={t('settings.markStarWin')}
                    onClick={() => toggleStarPrize(subOption, updateChildFields)}
                    type="button"
                  >
                    ★
                  </button>
                  <button
                    aria-label={t('settings.removeSubOption', { name: subOption.label || subOptionIndex + 1 })}
                    className="sub-option-remove"
                    data-tooltip={t('settings.removeChoice')}
                    onClick={() => removeSubOption(parentOption, subOptionIndex, updateParentOption, expansionKey)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
                {renderProbabilityEditor(
                  subOption,
                  parentOption.subWheel.options,
                  updateChildFields,
                  t('settings.subOptionPercentage', { name: accessibleName, parent: parentOption.label || '…' }),
                  'sub-option-probability-editor',
                )}
                {renderSubWheelEditor(subOption, depth + 1, updateChildOption, childExpansionKey)}
              </div>
            )
          })}
        </div>
        {showMinimumChoiceConfirmation ? (
          <div
            aria-label={t('settings.minimumSubWheelLabel')}
            className="template-confirm sub-wheel-minimum-confirm"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                setMinimumChoiceConfirmation(null)
              }
            }}
            role="alertdialog"
          >
            <p>{t('settings.minimumSubWheelQuestion')}</p>
            <div>
              <button
                onClick={() => removeSubWheel(parentOption, updateParentOption, expansionKey)}
                type="button"
              >
                {t('settings.removeSubWheel')}
              </button>
              <button
                ref={minimumChoiceCancelRef}
                onClick={() => setMinimumChoiceConfirmation(null)}
                type="button"
              >
                {t('settings.cancelProbability')}
              </button>
            </div>
          </div>
        ) : null}
        <div className="sub-wheel-editor__actions">
          <button className="sub-option-add" onClick={() => addSubOption(parentOption, updateParentOption)} type="button">
            {t('settings.addSubOption')}
          </button>
        </div>
      </section>
    )
  }

  const containsSubWheel = (scopeOptions) => scopeOptions.some((option) => Boolean(option.subWheel))

  const renderProbabilityNodes = (scopeOptions, depth = 0, parentLabel = '') => {
    const scopeResult = calculateProbabilities(scopeOptions)
    return scopeOptions.map((option, index) => {
      const label = String(option.label ?? '').trim()
      if (!label) return null
      const formattedProbability = scopeResult.error
        ? '—'
        : formatProbability(scopeResult.probabilities[index])
      const children = showSubwheelProbabilities && option.subWheel
        ? renderProbabilityNodes(option.subWheel.options, depth + 1, label)
        : []
      const hasVisibleChildren = children.some(Boolean)
      return (
        <div className={`probability-summary__node${depth === 0 ? ' is-root' : ''}${hasVisibleChildren ? ' has-children' : ''}`} key={`${option.id}-probability`}>
          <div className={`probability-summary__row${depth === 0 ? ' is-root' : ''}${hasVisibleChildren ? ' has-children' : ''}`}>
          <span>{label}</span>
          <strong aria-label={depth ? t('settings.localProbability', { parent: parentLabel, value: formattedProbability }) : undefined}>
            {formattedProbability}
          </strong>
          </div>
          {hasVisibleChildren ? (
            <div className="probability-summary__children">
              {children}
            </div>
          ) : null}
        </div>
      )
    })
  }

  const hasSubWheels = containsSubWheel(options)

  return (
    <div className="settings-content">
      <div className="panel-help settings-control-help">
        <p>{t('settings.helpIntro')}</p>
        <div className="settings-control-help__list" role="list">
          <div role="listitem">
            <span className="settings-control-help__term settings-control-help__term--probability">%</span>
            <span>{t('settings.helpProbability')}</span>
          </div>
          <div role="listitem">
            <span className="settings-control-help__term settings-control-help__term--star">★</span>
            <span>{t('settings.helpStar')}</span>
          </div>
          <div role="listitem">
            <span className="settings-control-help__term settings-control-help__term--subwheel">+</span>
            <span>{t('settings.helpSubwheel')}</span>
          </div>
        </div>
        <p className="settings-control-help__outro">{t('settings.helpOutro')}</p>
      </div>

      <div className="option-list">
        {options.map((option, index) => {
          const editorOpen = probabilityEditor?.id === option.id
          const subWheelOpen = Boolean(option.subWheel && expandedSubWheels[option.id])
          const updateMainFields = (updates) => onUpdate(option.id, updates)
          const accessibleName = option.label || t('settings.unnamedOption', { number: index + 1 })
          return (
            <div className={`option-row-group${editorOpen ? ' is-editing' : ''}${option.subWheel ? ' has-sub-wheel' : ''}${subWheelOpen ? ' is-sub-wheel-open' : ''}`} key={option.id}>
              <div className="option-row">
                <span className="option-number">{index + 1}</span>
                <div className="option-fields option-fields--with-sub-wheel-action">
                  <input
                    ref={(node) => {
                      if (node) optionInputRefs.current.set(option.id, node)
                      else optionInputRefs.current.delete(option.id)
                    }}
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
                      aria-label={t(option.subWheel ? subWheelOpen ? 'settings.hideSubWheel' : 'settings.showSubWheel' : 'settings.addSubWheel', { name: option.label })}
                      className={`sub-wheel-action${option.subWheel ? ' has-sub-wheel' : ''}`}
                      data-tooltip={t(option.subWheel ? subWheelOpen ? 'settings.hideSubWheelTooltip' : 'settings.showSubWheelTooltip' : 'settings.addSubWheelTooltip')}
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
                {renderProbabilityTrigger(option, t('settings.editPercentage', { name: accessibleName }))}
                <button
                  aria-label={t('settings.markStar', { name: option.label || t('settings.unnamedOption', { number: index + 1 }) })}
                  aria-pressed={option.star}
                  className={`row-icon row-icon--star${option.star ? ' is-active' : ''}${sparklingStarId === option.id ? ' just-activated' : ''}`}
                  data-tooltip={t('settings.markStarWin')}
                  onClick={() => toggleStarPrize(option, updateMainFields)}
                  type="button"
                >
                  ★
                </button>
                <button
                  aria-label={t('settings.remove', { name: option.label || t('settings.unnamedOption', { number: index + 1 }) })}
                  className="row-icon row-icon--remove"
                  data-tooltip={t('settings.removeChoice')}
                  disabled={options.length <= 2}
                  onClick={() => onRemove(option.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
              {renderProbabilityEditor(
                option,
                options,
                updateMainFields,
                t('settings.optionPercentage', { number: index + 1 }),
              )}
              {renderSubWheelEditor(
                option,
                1,
                (updatedOption) => onUpdate(option.id, { subWheel: updatedOption.subWheel }),
              )}
            </div>
          )
        })}
      </div>

      <button
        className="panel-button panel-button--add"
        disabled={options.length >= 30}
        onClick={() => {
          const nextId = onAdd()
          if (nextId) pendingNewOptionFocusRef.current = nextId
        }}
        type="button"
      >
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
          <div className="probability-summary__tree">
            {renderProbabilityNodes(options)}
          </div>
          {hasSubWheels && showSubwheelProbabilities ? (
            <p className="probability-summary__scope-note">{t('settings.subwheelScopeNote')}</p>
          ) : null}
          {hasSubWheels ? (
            <button
              aria-expanded={showSubwheelProbabilities}
              className="probability-summary__subwheel-toggle"
              onClick={() => setShowSubwheelProbabilities((visible) => !visible)}
              type="button"
            >
              {showSubwheelProbabilities ? `− ${t('settings.hideSubwheels')}` : `+ ${t('settings.showSubwheels')}`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default WheelSettings
