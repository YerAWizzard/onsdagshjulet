export function calculateProbabilities(options) {
  if (options.length < 2) {
    return { error: 'Add at least two options.', errorCode: 'atLeastTwo', probabilities: [] }
  }

  let explicitTotal = 0
  const automaticIndexes = []
  const probabilities = options.map((option, index) => {
    const rawValue = String(option.percentage ?? '').trim().replace(',', '.')
    if (rawValue === '') {
      automaticIndexes.push(index)
      return null
    }

    const value = Number(rawValue)
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return Number.NaN
    }
    explicitTotal += value
    return value
  })

  if (probabilities.some(Number.isNaN)) {
    return {
      error: 'Percentages must be numbers between 0 and 100.',
      errorCode: 'invalid',
      probabilities: [],
    }
  }

  if (explicitTotal > 100.000001) {
    return {
      error: `Explicit percentages total ${explicitTotal.toFixed(1)}%. The total cannot exceed 100%.`,
      errorCode: 'overTotal',
      errorParams: { total: explicitTotal.toFixed(1) },
      probabilities: [],
    }
  }

  if (!automaticIndexes.length && Math.abs(explicitTotal - 100) > 0.001) {
    return {
      error: 'When every option has a percentage, the values must total 100%.',
      errorCode: 'exactTotal',
      probabilities: [],
    }
  }

  const automaticShare = automaticIndexes.length
    ? (100 - explicitTotal) / automaticIndexes.length
    : 0

  automaticIndexes.forEach((index) => {
    probabilities[index] = automaticShare
  })

  return { error: null, probabilities }
}

export function pickWeightedIndex(probabilities, randomValue = Math.random()) {
  let remaining = randomValue * 100
  for (let index = 0; index < probabilities.length; index += 1) {
    remaining -= probabilities[index]
    if (remaining <= 0) return index
  }
  return probabilities.length - 1
}

export function formatProbability(value) {
  return `${Number(value.toFixed(1))}%`
}
