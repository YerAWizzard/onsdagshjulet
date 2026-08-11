import { useEffect, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

function SessionControls({ canRestore, confirmation, onCancel, onConfirm, onDelete, onRestore, onSave, savedAt, sessionMessage, t }) {
  const confirmationRef = useRef(null)

  useEffect(() => {
    if (!confirmation) return undefined
    const animationFrame = requestAnimationFrame(() => scrollIntoSidebarView(confirmationRef.current))
    return () => cancelAnimationFrame(animationFrame)
  }, [confirmation])

  return (
    <div className="settings-content session-content">
      <p className="panel-help">{t('session.help')}</p>
      <p className="session-status">{savedAt ? t('session.lastSaved', { timestamp: savedAt }) : canRestore ? t('session.savedWithoutDate') : t('session.none')}</p>
      <div className="session-actions">
        <button onClick={onSave} type="button">{t('session.save')}</button>
        <button disabled={!canRestore} onClick={onRestore} type="button">{t('session.restore')}</button>
        <button className="danger" disabled={!canRestore} onClick={onDelete} type="button">{t('session.delete')}</button>
      </div>
      {confirmation ? (
        <div ref={confirmationRef} className="template-confirm session-confirm" role="alertdialog" aria-label={t(`session.confirm.${confirmation}.label`)}>
          <p>{t(`session.confirm.${confirmation}.question`)}</p>
          <div>
            <button onClick={onConfirm} type="button">{t(`session.confirm.${confirmation}.action`)}</button>
            <button onClick={onCancel} type="button">{t('session.confirm.cancel')}</button>
          </div>
        </div>
      ) : null}
      {sessionMessage ? <p className="session-message" role="status">{sessionMessage}</p> : null}
    </div>
  )
}

export default SessionControls
