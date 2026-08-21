import { useEffect, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

function Templates({ help, onCancel, onConfirm, onSelect, pendingTemplate, selectedTemplate, t, templates }) {
  const confirmationRef = useRef(null)
  const templateRows = []
  for (let index = 0; index < templates.length; index += 3) {
    templateRows.push(templates.slice(index, index + 3))
  }

  useEffect(() => {
    if (!pendingTemplate) return undefined
    const animationFrame = requestAnimationFrame(() => scrollIntoSidebarView(confirmationRef.current))
    return () => cancelAnimationFrame(animationFrame)
  }, [pendingTemplate])

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
                  onClick={() => onSelect(template)}
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
                className={`template-confirm template-confirm--after-${row.findIndex((template) => template.id === pendingTemplate.id)}`}
                role="alertdialog"
                aria-label={t('templates.replaceLabel')}
              >
                <p>{t('templates.replaceQuestion', { name: pendingTemplate.name })}</p>
                <div>
                  <button onClick={onConfirm} type="button">{t('templates.replace')}</button>
                  <button onClick={onCancel} type="button">{t('templates.cancel')}</button>
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
