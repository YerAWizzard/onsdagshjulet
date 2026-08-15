const CONFETTI = Array.from({ length: 34 }, (_, index) => ({
  color: ['#ff4fa3', '#29d7ff', '#ffd166', '#8b5cf6', '#33d69f'][index % 5],
  delay: `${(index % 9) * 0.045}s`,
  drift: `${((index * 37) % 100) - 50}px`,
  left: `${4 + ((index * 29) % 92)}%`,
  rotation: `${(index * 47) % 180}deg`,
}))

function WheelResult({ onDone, onSpinAgain, showSubWheelActions, t, winner }) {
  return (
    <div
      className={`wheel-result${winner?.star ? ' wheel-result--star' : ''}${winner ? ' wheel-result--winner' : ''}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {winner ? (
        <div className="wheel-result__content" key={winner.winId}>
          <div className={`winner-confetti${winner.star ? ' winner-confetti--star' : ''}`} aria-hidden="true">
            {CONFETTI.map((piece, index) => (
              <i
                key={index}
                style={{
                  '--confetti-delay': piece.delay,
                  '--confetti-color': piece.color,
                  '--confetti-drift': piece.drift,
                  '--confetti-left': piece.left,
                  '--confetti-rotation': piece.rotation,
                }}
              />
            ))}
          </div>
          {winner.star ? <div className="star-burst" aria-hidden="true">★　★　★</div> : null}
          <span className="wheel-result__label">
            {winner.star ? t('wheel.starPrize') : t('wheel.winner')}
          </span>
          <strong>{winner.label}</strong>
          {showSubWheelActions ? (
            <div className="wheel-result__actions">
              <button className="wheel-result__continue" onClick={onSpinAgain} type="button">
                {t('wheel.spinAgain')}
              </button>
              <button className="wheel-result__done" onClick={onDone} type="button">
                {t('wheel.done')}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="wheel-result__placeholder">
          <span>{t('wheel.waiting')}</span>
          <strong>{t('wheel.goodLuck')}</strong>
        </div>
      )}
    </div>
  )
}

export default WheelResult
