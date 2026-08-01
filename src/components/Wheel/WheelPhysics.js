export const FULL_TURN = Math.PI * 2

const ACCELERATION_PORTION = 0.18
const DECELERATION_POWER = 4
const ACCELERATION_DISTANCE =
  (DECELERATION_POWER * ACCELERATION_PORTION) /
  (2 * (1 - ACCELERATION_PORTION) +
    DECELERATION_POWER * ACCELERATION_PORTION)

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

export function getSpinProgress(elapsed) {
  const progress = Math.min(Math.max(elapsed, 0), 1)

  if (progress < ACCELERATION_PORTION) {
    const accelerationProgress = progress / ACCELERATION_PORTION
    return ACCELERATION_DISTANCE * accelerationProgress ** 2
  }

  const decelerationProgress =
    (progress - ACCELERATION_PORTION) / (1 - ACCELERATION_PORTION)

  return (
    ACCELERATION_DISTANCE +
    (1 - ACCELERATION_DISTANCE) *
      (1 - (1 - decelerationProgress) ** DECELERATION_POWER)
  )
}
