import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  createVisualOrder,
  drawWheel,
  WHEEL_OUTER_RADIUS_RATIO,
  WHEEL_SIZE,
} from './WheelRenderer.js'
import {
  calculateTargetRotation,
  createSpinPlan,
  getFullRotations,
  getSegmentLandingOffset,
  getSpinProgress,
  getWinnerIndex,
  normalizeAngle,
} from './WheelPhysics.js'

const BUFFER_OVERSAMPLE = 1.5
const MAX_BUFFER_BITMAP_SIZE = 4096

const WheelCanvas = forwardRef(function WheelCanvas(
  { items, label, onSpinComplete, onSpinStateChange, onTick },
  ref,
) {
  const canvasRef = useRef(null)
  const bufferRef = useRef(null)
  const animationFrameRef = useRef(null)
  const celebrationFrameRef = useRef(null)
  const celebrationRef = useRef(null)
  const rotationRef = useRef(0)
  const sizeRef = useRef(0)
  const spinningRef = useRef(false)
  const visualOrderRef = useRef(createVisualOrder(items))
  const itemCountRef = useRef(items.length)
  const lastTickRef = useRef(0)

  const renderWheel = useCallback(() => {
    const canvas = canvasRef.current
    const buffer = bufferRef.current
    const size = sizeRef.current
    if (!canvas || !buffer || !size) return

    const context = canvas.getContext('2d')
    const pixelRatio = canvas.width / size
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.clearRect(0, 0, size, size)
    context.save()
    context.translate(size / 2, size / 2)
    context.rotate(rotationRef.current)
    context.translate(-size / 2, -size / 2)
    context.drawImage(
      buffer,
      0,
      0,
      buffer.width,
      buffer.height,
      0,
      0,
      size,
      size,
    )
    const celebration = celebrationRef.current
    if (celebration) {
      const center = size / 2
      const innerRadius = size * 0.105
      const step = (Math.PI * 2) / visualOrderRef.current.length
      const start = -Math.PI / 2 + celebration.segmentIndex * step
      const progress = Math.min((performance.now() - celebration.startedAt) / 1300, 1)
      const pulse = Math.sin(progress * Math.PI * 3) * (1 - progress)
      context.save()
      context.beginPath()
      context.rect(0, 0, size, size)
      context.moveTo(center + innerRadius, center)
      context.arc(center, center, innerRadius, 0, Math.PI * 2)
      context.clip('evenodd')
      context.beginPath()
      context.moveTo(center, center)
      context.arc(
        center,
        center,
        size * WHEEL_OUTER_RADIUS_RATIO,
        start,
        start + step,
      )
      context.closePath()
      context.fillStyle = celebration.isStarPrize
        ? `rgba(255, 238, 138, ${0.16 + Math.max(0, pulse) * 0.28})`
        : `rgba(255, 255, 255, ${0.1 + Math.max(0, pulse) * 0.2})`
      context.fill()
      context.lineWidth = Math.max(2, size * 0.006)
      context.strokeStyle = celebration.isStarPrize
        ? `rgba(255, 230, 104, ${0.55 + Math.max(0, pulse) * 0.4})`
        : `rgba(255, 255, 255, ${0.45 + Math.max(0, pulse) * 0.35})`
      context.stroke()
      context.restore()
    }
    context.restore()
  }, [])

  const celebrateSegment = useCallback((segmentIndex, isStarPrize) => {
    if (celebrationFrameRef.current) cancelAnimationFrame(celebrationFrameRef.current)
    celebrationRef.current = { isStarPrize, segmentIndex, startedAt: performance.now() }

    const animateCelebration = () => {
      const elapsed = performance.now() - celebrationRef.current.startedAt
      renderWheel()
      if (elapsed < 1300) {
        celebrationFrameRef.current = requestAnimationFrame(animateCelebration)
      } else {
        celebrationFrameRef.current = null
        celebrationRef.current = null
        renderWheel()
      }
    }
    celebrationFrameRef.current = requestAnimationFrame(animateCelebration)
  }, [renderWheel])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    if (itemCountRef.current !== items.length) {
      visualOrderRef.current = createVisualOrder(items)
      itemCountRef.current = items.length
    }
    celebrationRef.current = null

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      const size = Math.max(1, Math.min(bounds.width, bounds.height))
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 4)
      const bitmapSize = Math.round(size * pixelRatio)

      if (canvas.width !== bitmapSize || canvas.height !== bitmapSize) {
        canvas.width = bitmapSize
        canvas.height = bitmapSize
      }

      sizeRef.current = size

      const buffer = document.createElement('canvas')
      const bufferBitmapSize = Math.min(
        MAX_BUFFER_BITMAP_SIZE,
        Math.round(bitmapSize * BUFFER_OVERSAMPLE),
      )
      buffer.width = bufferBitmapSize
      buffer.height = bufferBitmapSize
      const bufferContext = buffer.getContext('2d')
      const renderScale = bufferBitmapSize / WHEEL_SIZE
      bufferContext.setTransform(renderScale, 0, 0, renderScale, 0, 0)
      drawWheel(bufferContext, items, visualOrderRef.current)
      bufferRef.current = buffer
      renderWheel()
    }

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    resizeCanvas()
    document.fonts?.load('700 48px Fredoka').then(resizeCanvas)

    return () => resizeObserver.disconnect()
  }, [items, renderWheel])

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (celebrationFrameRef.current) {
        cancelAnimationFrame(celebrationFrameRef.current)
      }
    },
    [],
  )

  const spin = useCallback((winnerItemIndex, duration) => {
    if (spinningRef.current || items.length < 2) return false

    spinningRef.current = true
    celebrationRef.current = null
    if (celebrationFrameRef.current) {
      cancelAnimationFrame(celebrationFrameRef.current)
      celebrationFrameRef.current = null
    }
    onSpinStateChange(true)

    const segmentCount = visualOrderRef.current.length
    let plan = createSpinPlan(rotationRef.current, segmentCount)
    if (Number.isInteger(winnerItemIndex)) {
      const candidates = visualOrderRef.current
        .map((itemIndex, segmentIndex) => (itemIndex === winnerItemIndex ? segmentIndex : -1))
        .filter((segmentIndex) => segmentIndex >= 0)
      const winnerSegment = candidates[Math.floor(Math.random() * candidates.length)]
      const fullRotations = getFullRotations(duration)
      const landingOffset = getSegmentLandingOffset(segmentCount)
      plan = {
        duration,
        startRotation: rotationRef.current,
        targetRotation: calculateTargetRotation(
          rotationRef.current,
          segmentCount,
          winnerSegment,
          fullRotations,
          landingOffset,
        ),
      }
    }
    const totalDistance = plan.targetRotation - plan.startRotation
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / plan.duration
      const progress = Math.min(elapsed, 1)

      rotationRef.current =
        plan.startRotation + totalDistance * getSpinProgress(progress, plan.duration)
      renderWheel()

      const tickInterval = 65 + progress * 150
      if (currentTime - lastTickRef.current >= tickInterval) {
        lastTickRef.current = currentTime
        onTick?.()
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      rotationRef.current = normalizeAngle(plan.targetRotation)
      renderWheel()
      spinningRef.current = false
      animationFrameRef.current = null
      onSpinStateChange(false)
      const winnerSegment = getWinnerIndex(rotationRef.current, segmentCount)
      const winningItemIndex = visualOrderRef.current[winnerSegment]
      celebrateSegment(winnerSegment, Boolean(items[winningItemIndex]?.star))
      onSpinComplete(winningItemIndex)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return true
  }, [celebrateSegment, items, onSpinComplete, onSpinStateChange, onTick, renderWheel])

  useImperativeHandle(ref, () => ({ spin }), [spin])

  return (
    <canvas
      ref={canvasRef}
      className="wheel-canvas"
      aria-label={label}
      role="img"
    />
  )
})

export default WheelCanvas
