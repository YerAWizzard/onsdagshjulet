import { useEffect, useId, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

function Templates({ help, onCancel, onConfirm, onSelect, pendingTemplate, selectedTemplate, t, templates }) {
  const confirmationRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const confirmationOpenerRef = useRef(null)
  const restoreFocusRef = useRef(false)
  const confirmationLabelId = useId()
  const confirmationDescriptionId = useId()
  const templateRows = []
  for (let index = 0; index < templates.length; index += 3) {
    templateRows.push(templates.slice(index, index + 3))
  }

  useEffect(() => {
    if (!pendingTemplate) {
      if (!restoreFocusRef.current) return undefined
      const animationFrame = requestAnimationFrame(() => {
        if (confirmationOpenerRef.current?.isConnected) {
          confirmationOpenerRef.current.focus({ preventScroll: true })
        }
        restoreFocusRef.current = false
      })
      return () => cancelAnimationFrame(animationFrame)
    }
    const animationFrame = requestAnimationFrame(() => {
      scrollIntoSidebarView(confirmationRef.current)
      cancelButtonRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [pendingTemplate])

  const closeConfirmation = (action) => {
    restoreFocusRef.current = true
    action()
  }

  return (
    <div className="templates-content">
      <p className="panel-help">{help}</p>
      <div className="template-list">
        {templateRows.map((row) => (
          <div className="template-row" key={row.map((template) => template.id).join('-')}>
            {row.map((template, index) => {
              const isPending = pendingTemplate?.id === template.id
              const isActive = isPending || (!pendingTemplate && selectedTemplate === template.id)
              return (
                <button
                  aria-pressed={isActive}
                  className={`template-option template-option--${index}${isActive ? ' is-selected' : ''}`}
                  key={template.id}
                  onClick={(event) => {
                    confirmationOpenerRef.current = event.currentTarget
                    onSelect(template)
                  }}
                  type="button"
                >
                  <span aria-hidden="true">{template.emoji}</span>
                  <span>{template.name}</span>
                </button>
              )
            })}
            {row.some((template) => template.id === pendingTemplate?.id) ? (
              <div
                ref={confirmationRef}
                aria-describedby={confirmationDescriptionId}
                aria-labelledby={confirmationLabelId}
                className={`template-confirm template-confirm--after-${row.findIndex((template) => template.id === pendingTemplate.id)}`}
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') return
                  event.preventDefault()
                  closeConfirmation(onCancel)
                }}
                role="alertdialog"
              >
                <span className="visually-hidden" id={confirmationLabelId}>{t('templates.replaceLabel')}</span>
                <p id={confirmationDescriptionId}>{t('templates.replaceQuestion', { name: pendingTemplate.name })}</p>
                <div>
                  <button onClick={() => closeConfirmation(onConfirm)} type="button">{t('templates.replace')}</button>
                  <button ref={cancelButtonRef} onClick={() => closeConfirmation(onCancel)} type="button">{t('templates.cancel')}</button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Templates
