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

function fitCanvasText(context, text, maximumWidth, maximumHeight) {
  let size = Math.min(48, maximumHeight)
  context.font = `700 ${size}px Fredoka, sans-serif`
  while (size > 10 && context.measureText(text).width > maximumWidth) {
    size -= 1
    context.font = `700 ${size}px Fredoka, sans-serif`
  }
  return size
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
    const radialStart = innerRadius + 42
    const radialEnd = outerRadius - 42
    const radialLength = radialEnd - radialStart
    const textRadius = (radialStart + radialEnd) / 2
    const wedgeWidth = 2 * textRadius * Math.sin(step / 2)
    const maximumTextHeight = Math.max(12, wedgeWidth * 0.55)
    const fontSize = fitCanvasText(
      context,
      label,
      radialLength,
      maximumTextHeight,
    )

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
    const textX = direction * textRadius
    context.strokeText(label, textX, 0, radialLength)
    context.fillText(label, textX, 0, radialLength)

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
