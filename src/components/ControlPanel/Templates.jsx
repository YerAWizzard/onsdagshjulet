function Templates({ onCancel, onConfirm, onSelect, pendingTemplate, selectedTemplate, t, templates }) {
  return (
    <div className="templates-content">
      <p className="panel-help">{t('templates.help')}</p>
      <div className="template-list">
        {templates.map((template) => (
          <button
            className={selectedTemplate === template.id ? 'is-selected' : ''}
            key={template.id}
            onClick={() => onSelect(template)}
            type="button"
          >
            <span aria-hidden="true">{template.emoji}</span>
            <span>{template.name}</span>
          </button>
        ))}
      </div>
      {pendingTemplate ? (
        <div className="template-confirm" role="alertdialog" aria-label={t('templates.replaceLabel')}>
          <p>{t('templates.replaceQuestion', { name: pendingTemplate.name })}</p>
          <div>
            <button onClick={onConfirm} type="button">{t('templates.replace')}</button>
            <button onClick={onCancel} type="button">{t('templates.cancel')}</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Templates
