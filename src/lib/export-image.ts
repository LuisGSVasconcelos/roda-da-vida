// ─── Utilitário de Exportação de Imagem ────────────────────────────────────
// Portado do roda_vida_app_v009.html (exportImage + offscreen canvas 3x)
// Oferece download do gráfico radar como PNG em alta resolução

import {
  renderRadarToDataURL,
} from './radar-renderer'
import type { RadarRenderOptions, ExportImageOptions } from '@/types'

/**
 * Exporta o gráfico radar como imagem PNG em alta resolução.
 *
 * Portado do roda_vida_app_v009.html:
 * - Renderiza em canvas offscreen com scale=3
 * - Gera blob e dispara download via link temporário
 *
 * @param radarOptions - Opções de renderização do radar
 * @param options - Opções de exportação (nome do arquivo)
 */
export function exportRadarImage(
  radarOptions: RadarRenderOptions,
  options: ExportImageOptions = {}
): void {
  const dataURL = renderRadarToDataURL(radarOptions)

  const link = document.createElement('a')
  link.href = dataURL
  link.download = options.fileName ?? `roda_vida_${Date.now()}.png`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Gera o dataURL do radar com nome de arquivo padronizado.
 * Útil para salvar automaticamente ou compartilhar.
 */
export function generateRadarFilename(nome?: string): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const safeName = (nome ?? 'anonimo').replace(/\s+/g, '_')
  return `roda_vida_${safeName}_${dateStr}.png`
}

/**
 * Converte o dataURL para Blob (útil para upload ou envio por email).
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'image/png'
  const byteString = atob(parts[1])
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8 = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8[i] = byteString.charCodeAt(i)
  }

  return new Blob([arrayBuffer], { type: mime })
}
