import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pickWeightedIndex } from '../../lib/probability.js'
import { getRandomSpinDuration } from './WheelPhysics.js'
import WheelCanvas from './WheelCanvas.jsx'
import WheelPointer from './WheelPointer.jsx'
import WheelResult from './WheelResult.jsx'
import {
  FESTIVAL_PALETTE,
  WHEEL_OUTER_RADIUS_RATIO,
} from './WheelRenderer.js'
import './Wheel.css'

const BULBS = Array.from({ length: 44 }, (_, index) => ({
  angle: `${(index * 360) / 44}deg`,
  color: FESTIVAL_PALETTE[index % FESTIVAL_PALETTE.length],
  delay: `${(index % 7) * 0.07}s`,
}))

function Wheel({ audioEngine, onOpenSubWheel, options, probabilities, probabilityError, spinSettings, t }) {
  const wheelRef = useRef(null)
  const countdownTimersRef = useRef([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownText, setCountdownText] = useState('')
  const [winner, setWinner] = useState(null)
  const [winnerActionsDismissed, setWinnerActionsDismissed] = useState(false)

  const playableOptions = useMemo(
    () => options.filter((option) => String(option.label ?? '').trim()),
    [options],
  )
  const playableProbabilities = useMemo(
    () => options.reduce((result, option, index) => (
      String(option.label ?? '').trim() ? [...result, probabilities[index]] : result
    ), []),
    [options, probabilities],
  )
  const wheelItems = useMemo(
    () => playableOptions.map((option, index) => ({ ...option, id: index })),
    [playableOptions],
  )

  useEffect(() => {
    setWinner(null)
    setWinnerActionsDismissed(false)
  }, [options])

  useEffect(() => () => {
    countdownTimersRef.current.forEach(clearTimeout)
    audioEngine.restoreMusic()
  }, [audioEngine])

  const handleSpinComplete = useCallback(
    (winnerIndex) => {
      const winningOption = playableOptions[winnerIndex]
      const winnerNotePool = Array.isArray(winningOption.winnerNotePool)
        ? winningOption.winnerNotePool
        : []
      const winnerNote = winnerNotePool.length
        ? winnerNotePool[Math.floor(Math.random() * winnerNotePool.length)]
        : winningOption.winnerNote
      const result = {
        ...winningOption,
        ...(winnerNote ? { winnerNote } : {}),
        winId: `${Date.now()}-${Math.random()}`,
      }
      setWinner(result)
      audioEngine.restoreMusic(2000)
      audioEngine.playWin(result.star)
    },
    [audioEngine, playableOptions],
  )

  const handleSpin = useCallback(() => {
    if (isCountingDown || isSpinning || probabilityError) return
    setWinner(null)
    setWinnerActionsDismissed(false)
    setIsCountingDown(true)
    const winnerIndex = pickWeightedIndex(playableProbabilities)
    const spinDuration = getRandomSpinDuration(
      spinSettings.minSeconds,
      spinSettings.maxSeconds,
    )
    audioEngine.duckMusic()
    const steps = [
      { at: 0, text: '3' },
      { at: 525, text: '2' },
      { at: 1050, text: '1' },
      { at: 1575, text: t('wheel.countdownSpin') },
    ]

    countdownTimersRef.current.forEach(clearTimeout)
    countdownTimersRef.current = steps.map(({ at, text }, index) => setTimeout(() => {
      setCountdownText(text)
      audioEngine.playCountdown(index === steps.length - 1)
    }, at))
    countdownTimersRef.current.push(setTimeout(() => {
      setCountdownText('')
      setIsCountingDown(false)
      const started = wheelRef.current?.spin(winnerIndex, spinDuration)
      if (!started) audioEngine.restoreMusic()
    }, 2400))
  }, [audioEngine, isCountingDown, isSpinning, playableProbabilities, probabilityError, spinSettings, t])

  const isBusy = isCountingDown || isSpinning

  return (
    <div className="wheel-engine">
      <div className="wheel-stage">
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
        <div
          className="wheel-canvas-wrap"
          style={{
            '--wheel-segment-edge': `${(0.5 - WHEEL_OUTER_RADIUS_RATIO) * 100}%`,
          }}
        >
          <WheelCanvas
            ref={wheelRef}
            items={wheelItems}
            label={t('wheel.canvasLabel', { items: wheelItems.map((item) => item.label).join(', ') })}
            onSpinComplete={handleSpinComplete}
            onSpinStateChange={setIsSpinning}
            onTick={() => audioEngine.playTick()}
          />
          <WheelPointer isSpinning={isSpinning} />
        </div>
        <button
          aria-busy={isBusy}
          aria-label={t('wheel.spinFromCenter')}
          className="wheel-center-trigger"
          disabled={isBusy || Boolean(probabilityError)}
          onClick={handleSpin}
          type="button"
        />
          {isCountingDown ? (
            <div className={`wheel-countdown${countdownText === '1' ? ' wheel-countdown--final-number' : ''}`} key={countdownText} aria-live="assertive">
              <strong>{countdownText}</strong>
            </div>
          ) : null}
        </div>
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

      <WheelResult
        onDone={() => setWinnerActionsDismissed(true)}
        onSpinAgain={onOpenSubWheel ? () => onOpenSubWheel(winner) : null}
        showSubWheelActions={Boolean(winner?.subWheel) && !winnerActionsDismissed && Boolean(onOpenSubWheel)}
        t={t}
        winner={winner}
      />
    </div>
  )
}

export default memo(Wheel)
