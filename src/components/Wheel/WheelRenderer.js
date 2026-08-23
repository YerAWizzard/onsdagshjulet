export const WHEEL_SIZE = 900
export const WHEEL_OUTER_RADIUS_RATIO = 0.465

export const FESTIVAL_PALETTE = [
  '#FF4FA3',
  '#29D7FF',
  '#33D69F',
  '#FFD166',
  '#8B5CF6',
  '#FF7A59',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
  '#F59E0B',
  '#A855F7',
  '#22C55E',
]

function segmentCountFor(itemCount) {
  if (itemCount <= 3) return 9
  if (itemCount <= 5) return 12
  if (itemCount <= 8) return 16
  if (itemCount <= 12) return 20
  if (itemCount <= 18) return 24
  return Math.min(30, itemCount)
}

export function createVisualOrder(items) {
  const count = segmentCountFor(items.length)
  const ids = items.map((item, index) => item.id ?? index)

  if (!ids.length) return []
  if (ids.length === 1) return Array(count).fill(ids[0])

  const output = []
  let bag = []

  while (output.length < count) {
    if (!bag.length) bag = [...ids].sort(() => Math.random() - 0.5)
    let possible = bag.filter((id) => id !== output[output.length - 1])
    if (!possible.length) {
      possible = ids.filter((id) => id !== output[output.length - 1])
    }
    const pick = possible[Math.floor(Math.random() * possible.length)]
    output.push(pick)
    const index = bag.indexOf(pick)
    if (index >= 0) bag.splice(index, 1)
  }

  if (output.length > 1 && output[0] === output[output.length - 1]) {
    const swap = output.findIndex(
      (id, index) =>
        index > 0 &&
        index < output.length - 1 &&
        id !== output[0] &&
        output[index - 1] !== output[0] &&
        output[index + 1] !== output[0],
    )
    if (swap > 0) {
      ;[output[swap], output[output.length - 1]] = [
        output[output.length - 1],
        output[swap],
      ]
    }
  }

  return output
}

function segmentPath(context, centerX, centerY, radius, start, end) {
  context.beginPath()
  context.moveTo(centerX, centerY)
  context.arc(centerX, centerY, radius, start, end, false)
  context.closePath()
}

function balancedLines(context, words, lineCount) {
  if (lineCount === 1) return [words.join(' ')]
  let best = null

  const visit = (startIndex, lines) => {
    const remainingLines = lineCount - lines.length
    if (remainingLines === 1) {
      const candidate = [...lines, words.slice(startIndex).join(' ')]
      const widths = candidate.map((line) => context.measureText(line).width)
      const widest = Math.max(...widths)
      const unevenness = widths.reduce((total, width) => total + (widest - width) ** 2, 0)
      const score = widest * 1000 + unevenness
      if (!best || score < best.score) best = { lines: candidate, score }
      return
    }

    const lastSplit = words.length - (remainingLines - 1)
    for (let split = startIndex + 1; split <= lastSplit; split += 1) {
      visit(split, [...lines, words.slice(startIndex, split).join(' ')])
    }
  }

  visit(0, [])
  return best?.lines ?? [words.join(' ')]
}

function splitTrailingEmoji(text) {
  const parts = String(text).trim().split(/\s+/).filter(Boolean)
  const possibleEmoji = parts.at(-1) ?? ''
  const emojiOnly = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\uFE0F|\u200D)+$/u

  if (parts.length > 1 && emojiOnly.test(possibleEmoji)) {
    return {
      words: parts.slice(0, -1),
      trailingEmoji: possibleEmoji,
    }
  }

  return { words: parts, trailingEmoji: '' }
}

function measureLabelLayout(context, lines, trailingEmoji, fontSize) {
  const strokeWidth = Math.max(2, fontSize * 0.1)
  const emojiFontSize = fontSize * 0.82
  const emojiGap = trailingEmoji ? fontSize * 0.16 : 0

  context.font = `700 ${fontSize}px Fredoka, sans-serif`
  const lineWidths = lines.map((line) => context.measureText(line).width)
  let emojiWidth = 0
  if (trailingEmoji) {
    context.font = `700 ${emojiFontSize}px Fredoka, sans-serif`
    emojiWidth = context.measureText(trailingEmoji).width
    lineWidths[lineWidths.length - 1] += emojiGap + emojiWidth
  }

  return {
    blockHeight: lines.length * fontSize * 1.16 + strokeWidth + 4,
    contentWidth: Math.max(...lineWidths) + strokeWidth + 4,
    emojiFontSize,
    emojiGap,
  }
}

function fitLineCount(context, words, trailingEmoji, lineCount, geometry) {
  context.font = '700 100px Fredoka, sans-serif'
  const lines = balancedLines(context, words, lineCount)

  for (let fontSize = 76; fontSize >= 2; fontSize -= 0.5) {
    const measurements = measureLabelLayout(
      context,
      lines,
      trailingEmoji,
      fontSize,
    )
    const halfHeight = measurements.blockHeight / 2
    const outerEdgeSquared = geometry.outerSafeRadius ** 2 - halfHeight ** 2
    if (outerEdgeSquared <= 0) continue

    // Anchor each candidate against the wheel arc. The wedge is narrowest at
    // the candidate's inner edge, so that corner determines slice containment.
    const outerEdge = Math.sqrt(outerEdgeSquared)
    const innerEdge = outerEdge - measurements.contentWidth
    const availableHalfHeight = innerEdge * geometry.halfStepTangent

    if (
      innerEdge >= geometry.innerSafeRadius
      && halfHeight + geometry.sliceMargin <= availableHalfHeight
    ) {
      return {
        ...measurements,
        fontSize,
        lines,
        textRadius: outerEdge - measurements.contentWidth / 2,
        trailingEmoji,
      }
    }
  }

  return null
}

function fitCanvasLabel(context, text, geometry) {
  const { words, trailingEmoji } = splitTrailingEmoji(text)
  if (!words.length) {
    return {
      fontSize: 10,
      lines: [''],
      textRadius: geometry.innerSafeRadius + 24,
      trailingEmoji,
      emojiFontSize: 10,
      emojiGap: 0,
    }
  }

  const candidates = []
  const maximumLines = Math.min(3, words.length)
  for (let lineCount = 1; lineCount <= maximumLines; lineCount += 1) {
    const candidate = fitLineCount(
      context,
      words,
      trailingEmoji,
      lineCount,
      geometry,
    )
    if (candidate) candidates.push(candidate)
  }

  const singleLine = candidates.find((candidate) => candidate.lines.length === 1)
  const twoLines = candidates.find((candidate) => candidate.lines.length === 2)
  const threeLines = candidates.find((candidate) => candidate.lines.length === 3)

  if (!singleLine) return twoLines ?? threeLines
  if (!twoLines || singleLine.fontSize >= 38) return singleLine
  if (twoLines.fontSize >= singleLine.fontSize * 1.14) {
    if (
      threeLines
      && twoLines.fontSize < 16
      && threeLines.fontSize >= twoLines.fontSize * 1.1
    ) {
      return threeLines
    }
    return twoLines
  }
  return singleLine
}

export function drawWheel(context, items, visualOrder) {
  const size = WHEEL_SIZE
  const centerX = size / 2
  const centerY = size / 2
  const outerRadius = size * WHEEL_OUTER_RADIUS_RATIO
  const innerRadius = size * 0.105
  const segmentCount = visualOrder.length
  const step = (Math.PI * 2) / segmentCount

  context.clearRect(0, 0, size, size)

  visualOrder.forEach((id, index) => {
    const start = -Math.PI / 2 + index * step
    const end = start + step
    const middle = start + step / 2
    const item = items[id]

    context.save()

    segmentPath(context, centerX, centerY, outerRadius, start, end)
    context.fillStyle = FESTIVAL_PALETTE[index % FESTIVAL_PALETTE.length]
    context.fill()
    context.lineWidth = 3
    context.strokeStyle = 'rgba(255,255,255,.72)'
    context.stroke()

    segmentPath(context, centerX, centerY, outerRadius, start, end)
    context.clip()

    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      innerRadius,
      centerX,
      centerY,
      outerRadius,
    )
    gradient.addColorStop(0, 'rgba(0,0,0,.18)')
    gradient.addColorStop(0.58, 'rgba(255,255,255,.03)')
    gradient.addColorStop(1, 'rgba(255,255,255,.17)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    const label = item.label
    const labelLayout = fitCanvasLabel(context, label, {
      halfStepTangent: Math.tan(step / 2),
      innerSafeRadius: innerRadius + 18,
      outerSafeRadius: outerRadius - 14,
      sliceMargin: 5,
    })
    const fontSize = Math.round(labelLayout.fontSize * 10) / 10

    context.translate(centerX, centerY)

    let drawAngle = middle
    const normalized =
      ((drawAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    if (normalized > Math.PI / 2 && normalized < Math.PI * 1.5) {
      drawAngle += Math.PI
    }
    context.rotate(drawAngle)

    context.font = `700 ${fontSize}px Fredoka, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineJoin = 'round'
    context.lineWidth = Math.max(2, fontSize * 0.1)
    context.strokeStyle = 'rgba(0,0,0,.58)'
    context.fillStyle = '#fff'

    const direction =
      normalized > Math.PI / 2 && normalized < Math.PI * 1.5 ? -1 : 1
    const textX = direction * labelLayout.textRadius
    const lineHeight = fontSize * 1.16
    const firstLineY = -((labelLayout.lines.length - 1) * lineHeight) / 2
    labelLayout.lines.forEach((line, lineIndex) => {
      const lineY = firstLineY + lineIndex * lineHeight
      const isEmojiLine = Boolean(labelLayout.trailingEmoji)
        && lineIndex === labelLayout.lines.length - 1
      if (!isEmojiLine) {
        context.strokeText(line, textX, lineY)
        context.fillText(line, textX, lineY)
        return
      }

      const textWidth = context.measureText(line).width
      context.font = `700 ${labelLayout.emojiFontSize}px Fredoka, sans-serif`
      const emojiWidth = context.measureText(labelLayout.trailingEmoji).width
      const combinedWidth = textWidth + labelLayout.emojiGap + emojiWidth
      const lineStart = textX - combinedWidth / 2

      context.font = `700 ${fontSize}px Fredoka, sans-serif`
      context.textAlign = 'left'
      context.strokeText(line, lineStart, lineY)
      context.fillText(line, lineStart, lineY)

      context.font = `700 ${labelLayout.emojiFontSize}px Fredoka, sans-serif`
      const emojiX = lineStart + textWidth + labelLayout.emojiGap
      context.strokeText(labelLayout.trailingEmoji, emojiX, lineY)
      context.fillText(labelLayout.trailingEmoji, emojiX, lineY)
      context.font = `700 ${fontSize}px Fredoka, sans-serif`
      context.textAlign = 'center'
    })

    context.restore()
  })

  context.beginPath()
  context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
  const hubGradient = context.createRadialGradient(
    centerX - innerRadius * 0.25,
    centerY - innerRadius * 0.3,
    5,
    centerX,
    centerY,
    innerRadius,
  )
  hubGradient.addColorStop(0, '#fffbe1')
  hubGradient.addColorStop(0.4, '#ffd166')
  hubGradient.addColorStop(1, '#ff4fa3')
  context.fillStyle = hubGradient
  context.fill()
  context.lineWidth = 10
  context.strokeStyle = '#fff0a3'
  context.stroke()

  context.fillStyle = '#fff'
  context.font = `700 ${innerRadius * 0.78}px Fredoka, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('★', centerX, centerY + 3)
}
