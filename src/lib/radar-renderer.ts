// ─── Renderizador de Radar Canvas ──────────────────────────────────────────
// Portado do roda_vida_app_v009.html (função drawWheelOnContext)
// Renderiza o gráfico radar/teia da Roda da Vida em um elemento Canvas

import type { CategoryData, RadarRenderOptions } from '@/types'

interface RadarPoint {
  x: number
  y: number
  value: number
  color: string
}

/**
 * Renderiza o gráfico radar em um elemento canvas.
 * Compatível com o visual do roda_vida_app_v009.html:
 * - Anéis concêntricos com escala 0-10
 * - Legendas em 2 linhas nas bordas
 * - Polígono preenchido com gradiente roxo
 * - Bolinhas com glow por categoria
 */
export function renderRadarToCanvas(
  canvas: HTMLCanvasElement,
  options: RadarRenderOptions
): void {
  const {
    width,
    height,
    scale = 1,
    categories,
    values,
    maxValue = 10,
  } = options

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Configura dimensões com suporte a high-DPI (scale)
  canvas.width = width * scale
  canvas.height = height * scale
  ctx.scale(scale, scale)

  const W = width
  const H = height
  const cx = W / 2
  const cy = H / 2
  const maxRadius = Math.min(W, H) * 0.35
  const rings = 5
  const startAngle = -Math.PI / 2
  const angleStep = (2 * Math.PI) / categories.length

  // ─── Fundo ──────────────────────────────────────────────────────────
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // ─── Anéis concêntricos ────────────────────────────────────────────
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxRadius
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(100, 80, 120, 0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    const val = (r / rings) * maxValue
    ctx.fillStyle = 'rgba(100, 80, 120, 0.25)'
    ctx.font = '10px "Segoe UI", sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(val.toFixed(0), cx - 8, cy - radius)
  }

  // ─── Linhas radiais + legendas em 2 linhas ─────────────────────────
  for (let i = 0; i < categories.length; i++) {
    const angle = startAngle + i * angleStep
    const cat = categories[i]

    // Linha do centro à borda
    const xEdge = cx + maxRadius * Math.cos(angle)
    const yEdge = cy + maxRadius * Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(xEdge, yEdge)
    ctx.strokeStyle = 'rgba(100, 80, 120, 0.10)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Legenda — quebra automática em 2 linhas
    const labelRadius = maxRadius * 1.28
    const lx = cx + labelRadius * Math.cos(angle)
    const ly = cy + labelRadius * Math.sin(angle)

    const palavras = cat.label.split(' ')
    let linha1: string
    let linha2: string

    if (palavras.length <= 2) {
      linha1 = cat.label
      linha2 = ''
    } else {
      const meio = Math.ceil(palavras.length / 2)
      linha1 = palavras.slice(0, meio).join(' ')
      linha2 = palavras.slice(meio).join(' ')
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#2d1b3d'
    ctx.font = `600 11px "Segoe UI", system-ui, sans-serif`

    if (linha2) {
      ctx.fillText(linha1, lx, ly - 6)
      ctx.fillText(linha2, lx, ly + 6)
    } else {
      ctx.fillText(linha1, lx, ly)
    }
  }

  // ─── Polígono dos valores ──────────────────────────────────────────
  const points: RadarPoint[] = []
  for (let i = 0; i < categories.length; i++) {
    const angle = startAngle + i * angleStep
    const val = values[categories[i].id] ?? 0
    const r = (Math.min(maxValue, Math.max(0, val)) / maxValue) * maxRadius
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      value: val,
      color: categories[i].color,
    })
  }

  // Preenchimento do polígono
  ctx.beginPath()
  points.forEach((p, idx) =>
    idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  )
  ctx.closePath()
  ctx.fillStyle = 'rgba(124, 58, 237, 0.13)'
  ctx.fill()
  ctx.strokeStyle = '#7c3aed'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // ─── Bolinhas nos vértices ─────────────────────────────────────────
  points.forEach((p) => {
    // Glow radial
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16)
    glow.addColorStop(0, p.color + '60')
    glow.addColorStop(1, p.color + '00')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, 16, 0, 2 * Math.PI)
    ctx.fill()

    // Círculo sólido
    ctx.beginPath()
    ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI)
    ctx.fillStyle = p.color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Valor numérico
    ctx.fillStyle = '#1a0f26'
    ctx.font = '11px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(p.value.toFixed(0), p.x, p.y - 12)
  })

  // ─── Marca central ─────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(45, 27, 61, 0.20)'
  ctx.font = '12px "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('vida', cx, cy)
}

/**
 * Renderiza o radar em um canvas offscreen e retorna o dataURL.
 * Usa scale=3 para alta resolução (igual ao HTML v009).
 */
export function renderRadarToDataURL(
  options: RadarRenderOptions
): string {
  const { width, height, scale = 3 } = options
  const offscreen = document.createElement('canvas')
  renderRadarToCanvas(offscreen, {
    ...options,
    width,
    height,
    scale,
  })
  return offscreen.toDataURL('image/png')
}
