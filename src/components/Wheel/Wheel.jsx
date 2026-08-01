import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pickWeightedIndex } from '../../lib/probability.js'
import WheelCanvas from './WheelCanvas.jsx'
import WheelPointer from './WheelPointer.jsx'
import WheelResult from './WheelResult.jsx'
import { FESTIVAL_PALETTE } from './WheelRenderer.js'
import './Wheel.css'

const BULBS = Array.from({ length: 44 }, (_, index) => ({
  angle: `${(index * 360) / 44}deg`,
  color: FESTIVAL_PALETTE[index % FESTIVAL_PALETTE.length],
  delay: `${(index % 7) * 0.07}s`,
}))

function Wheel({ audioEngine, options, probabilities, probabilityError, t }) {
  const wheelRef = useRef(null)
  const countdownTimersRef = useRef([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownText, setCountdownText] = useState('')
  const [winner, setWinner] = useState(null)

  const wheelItems = useMemo(
    () => options.map((option, index) => ({ ...option, id: index })),
    [options],
  )

  useEffect(() => {
    setWinner(null)
  }, [options])

  useEffect(() => () => {
    countdownTimersRef.current.forEach(clearTimeout)
  }, [])

  const handleSpinComplete = useCallback(
    (winnerIndex) => {
      const winningOption = options[winnerIndex]
      const result = { ...winningOption, winId: `${Date.now()}-${Math.random()}` }
      setWinner(result)
      audioEngine.playWin(result.star)
    },
    [audioEngine, options],
  )

  const handleSpin = useCallback(() => {
    if (isCountingDown || isSpinning || probabilityError) return
    setWinner(null)
    setIsCountingDown(true)
    const winnerIndex = pickWeightedIndex(probabilities)
    const steps = [
      { at: 0, text: '3' },
      { at: 375, text: '2' },
      { at: 750, text: '1' },
      { at: 1125, text: t('wheel.countdownSpin') },
    ]

    countdownTimersRef.current.forEach(clearTimeout)
    countdownTimersRef.current = steps.map(({ at, text }, index) => setTimeout(() => {
      setCountdownText(text)
      audioEngine.playCountdown(index === steps.length - 1)
    }, at))
    countdownTimersRef.current.push(setTimeout(() => {
      setCountdownText('')
      setIsCountingDown(false)
      wheelRef.current?.spin(winnerIndex)
    }, 1500))
  }, [audioEngine, isCountingDown, isSpinning, probabilities, probabilityError, t])

  const isBusy = isCountingDown || isSpinning

  return (
    <div className="wheel-engine">
      <div className={`wheel-visual${winner ? winner.star ? ' wheel-visual--star-win' : ' wheel-visual--normal-win' : ''}`}>
        <div className="wheel-bulbs" aria-hidden="true">
          {BULBS.map((bulb, index) => (
            <i
              key={index}
              className="wheel-bulb"
              style={{
                '--bulb-color': bulb.color,
                '--bulb-delay': bulb.delay,
                '--bulb-angle': bulb.angle,
              }}
            />
          ))}
        </div>
        <div className="wheel-canvas-wrap">
          <WheelCanvas
            ref={wheelRef}
            items={wheelItems}
            label={t('wheel.canvasLabel', { items: wheelItems.map((item) => item.label).join(', ') })}
            onSpinComplete={handleSpinComplete}
            onSpinStateChange={setIsSpinning}
            onTick={() => audioEngine.playTick()}
          />
        </div>
        <button
          aria-label={t('wheel.spinFromCenter')}
          className="wheel-center-trigger"
          disabled={isBusy || Boolean(probabilityError)}
          onClick={handleSpin}
          type="button"
        />
        <WheelPointer isSpinning={isSpinning} />
        {isCountingDown ? (
          <div className="wheel-countdown" key={countdownText} aria-live="assertive">
            <strong>{countdownText}</strong>
          </div>
        ) : null}
      </div>

      <button
        className="spin-button"
        type="button"
        aria-busy={isBusy}
        disabled={isBusy || Boolean(probabilityError)}
        onClick={handleSpin}
      >
        {t('wheel.spin')}
      </button>

      <WheelResult t={t} winner={winner} />
    </div>
  )
}

export default memo(Wheel)
