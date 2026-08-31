import { useEffect, useId, useRef } from 'react'
import { scrollIntoSidebarView } from './scrollIntoSidebarView.js'

function SessionControls({ canRestore, confirmation, onCancel, onConfirm, onDelete, onRestore, onSave, savedAt, sessionMessage, t }) {
  const confirmationRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const confirmationOpenerRef = useRef(null)
  const restoreFocusRef = useRef(false)
  const confirmationLabelId = useId()
  const confirmationDescriptionId = useId()

  useEffect(() => {
    if (!confirmation) {
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
  }, [confirmation])

  const openConfirmation = (event, action) => {
    confirmationOpenerRef.current = event.currentTarget
    action()
  }

  const closeConfirmation = (action) => {
    restoreFocusRef.current = true
    action()
  }

  return (
    <div className="settings-content session-content">
      <p className="panel-help">{t('session.help')}</p>
      <p className="session-status">{savedAt ? t('session.lastSaved', { timestamp: savedAt }) : canRestore ? t('session.savedWithoutDate') : t('session.none')}</p>
      <div className="session-actions">
        <button onClick={(event) => openConfirmation(event, onSave)} type="button">{t('session.save')}</button>
        <button disabled={!canRestore} onClick={(event) => openConfirmation(event, onRestore)} type="button">{t('session.restore')}</button>
        <button className="danger" disabled={!canRestore} onClick={(event) => openConfirmation(event, onDelete)} type="button">{t('session.delete')}</button>
      </div>
      {confirmation ? (
        <div
          ref={confirmationRef}
          aria-describedby={confirmationDescriptionId}
          aria-labelledby={confirmationLabelId}
          className="template-confirm session-confirm"
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            closeConfirmation(onCancel)
          }}
          role="alertdialog"
        >
          <span className="visually-hidden" id={confirmationLabelId}>{t(`session.confirm.${confirmation}.label`)}</span>
          <p id={confirmationDescriptionId}>{t(`session.confirm.${confirmation}.question`)}</p>
          <div>
            <button onClick={() => closeConfirmation(onConfirm)} type="button">{t(`session.confirm.${confirmation}.action`)}</button>
            <button ref={cancelButtonRef} onClick={() => closeConfirmation(onCancel)} type="button">{t('session.confirm.cancel')}</button>
          </div>
        </div>
      ) : null}
      {sessionMessage ? <p className="session-message" role="status">{sessionMessage}</p> : null}
    </div>
  )
}

export default SessionControls
