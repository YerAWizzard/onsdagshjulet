export const FULL_TURN = Math.PI * 2

const MIN_SPIN_SECONDS = 2
const MAX_SPIN_SECONDS = 11

function clampDurationSeconds(value, fallback) {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue)
    ? Math.min(MAX_SPIN_SECONDS, Math.max(MIN_SPIN_SECONDS, parsedValue))
    : fallback
}

export function getRandomSpinDuration(minSeconds, maxSeconds, randomValue = Math.random()) {
  const minimum = clampDurationSeconds(minSeconds, MIN_SPIN_SECONDS)
  const maximum = Math.max(minimum, clampDurationSeconds(maxSeconds, MAX_SPIN_SECONDS))
  return (minimum + (maximum - minimum) * randomValue) * 1000
}

export function getFullRotations(duration, randomValue = Math.random()) {
  const seconds = clampDurationSeconds(Number(duration) / 1000, 5.5)
  const variation = (randomValue - 0.5) * 1.5
  return Math.min(14, Math.max(3, Math.round(2 + seconds + variation)))
}

export function normalizeAngle(angle) {
  return ((angle % FULL_TURN) + FULL_TURN) % FULL_TURN
}

export function getWinnerIndex(rotation, segmentCount) {
  if (segmentCount <= 0) return -1

  const segmentAngle = FULL_TURN / segmentCount
  return Math.round(normalizeAngle(-rotation) / segmentAngle) % segmentCount
}

export function calculateTargetRotation(
  currentRotation,
  segmentCount,
  winnerIndex,
  fullRotations,
) {
  const segmentAngle = FULL_TURN / segmentCount
  const targetAlignment = normalizeAngle(-winnerIndex * segmentAngle)
  const currentAlignment = normalizeAngle(currentRotation)
  const alignmentDistance = normalizeAngle(targetAlignment - currentAlignment)

  return currentRotation + fullRotations * FULL_TURN + alignmentDistance
}

export function createSpinPlan(currentRotation, segmentCount) {
  const winnerIndex = Math.floor(Math.random() * segmentCount)
  const fullRotations = 7 + Math.floor(Math.random() * 3)
  const duration = 5200 + Math.random() * 900
  const targetRotation = calculateTargetRotation(
    currentRotation,
    segmentCount,
    winnerIndex,
    fullRotations,
  )

  return {
    duration,
    startRotation: currentRotation,
    targetRotation,
    winnerIndex,
  }
}

export function getSpinProgress(elapsed, duration = 5500) {
  const progress = Math.min(Math.max(elapsed, 0), 1)
  const durationRange = MAX_SPIN_SECONDS - MIN_SPIN_SECONDS
  const durationRatio = (clampDurationSeconds(duration / 1000, 5.5) - MIN_SPIN_SECONDS) / durationRange
  const accelerationPortion = 0.22 - durationRatio * 0.1
  const decelerationPower = 3.6 - durationRatio * 0.7
  const accelerationDistance =
    (decelerationPower * accelerationPortion) /
    (2 * (1 - accelerationPortion) + decelerationPower * accelerationPortion)

  if (progress < accelerationPortion) {
    const accelerationProgress = progress / accelerationPortion
    return accelerationDistance * accelerationProgress ** 2
  }

  const decelerationProgress =
    (progress - accelerationPortion) / (1 - accelerationPortion)

  return (
    accelerationDistance +
    (1 - accelerationDistance) *
      (1 - (1 - decelerationProgress) ** decelerationPower)
  )
}
