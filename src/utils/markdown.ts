import type { ProblemPictureVO } from '@/types/api'

export const VDITOR_CDN = '/vendor/vditor'
export const PROBLEM_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif'
export const PROBLEM_IMAGE_MAX_SIZE = 10 * 1024 * 1024
export const PROBLEM_IMAGE_MIN_WIDTH = 10
export const PROBLEM_IMAGE_MAX_WIDTH = 100
export const PROBLEM_IMAGE_MIN_HEIGHT = 10
export const PROBLEM_IMAGE_MAX_HEIGHT = 10000
export const PROBLEM_IMAGE_WIDTH_OPTIONS = [25, 50, 75, 100] as const
export const VDITOR_MATH_OPTIONS = {
  engine: 'KaTeX' as const,
  // Vditor disables numeric-leading inline formulas by default to avoid currency ambiguity.
  inlineDigit: true
}

const PROBLEM_IMAGE_WIDTH_HASH_KEY = 'emiyaoj-width'
const PROBLEM_IMAGE_HEIGHT_HASH_KEY = 'emiyaoj-height'
const markdownImagePattern = /!\[[^\]]*\]\(\s*(\S+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g

export interface ProblemImageSize {
  width: number | null
  height: number | null
}

function splitUrlHash(url: string) {
  const hashIndex = url.indexOf('#')
  if (hashIndex === -1) return { baseUrl: url, hashParts: [] as string[] }

  return {
    baseUrl: url.slice(0, hashIndex),
    hashParts: url.slice(hashIndex + 1).split('&').filter(Boolean)
  }
}

export function getProblemImageWidth(url: string | null | undefined) {
  if (!url) return null

  const { hashParts } = splitUrlHash(url)
  const widthPart = hashParts.find(part => part.startsWith(`${PROBLEM_IMAGE_WIDTH_HASH_KEY}=`))
  if (!widthPart) return null

  const width = Number(widthPart.slice(PROBLEM_IMAGE_WIDTH_HASH_KEY.length + 1))
  return Number.isInteger(width) && width >= PROBLEM_IMAGE_MIN_WIDTH && width <= PROBLEM_IMAGE_MAX_WIDTH
    ? width
    : null
}

export function clampProblemImageWidth(width: number) {
  return Math.min(PROBLEM_IMAGE_MAX_WIDTH, Math.max(PROBLEM_IMAGE_MIN_WIDTH, Math.round(width)))
}

export function getProblemImageHeight(url: string | null | undefined) {
  if (!url) return null

  const { hashParts } = splitUrlHash(url)
  const heightPart = hashParts.find(part => part.startsWith(`${PROBLEM_IMAGE_HEIGHT_HASH_KEY}=`))
  if (!heightPart) return null

  const height = Number(heightPart.slice(PROBLEM_IMAGE_HEIGHT_HASH_KEY.length + 1))
  return Number.isInteger(height) && height >= PROBLEM_IMAGE_MIN_HEIGHT && height <= PROBLEM_IMAGE_MAX_HEIGHT
    ? height
    : null
}

export function clampProblemImageHeight(height: number) {
  return Math.min(PROBLEM_IMAGE_MAX_HEIGHT, Math.max(PROBLEM_IMAGE_MIN_HEIGHT, Math.round(height)))
}

export function getProblemImageSize(url: string | null | undefined): ProblemImageSize {
  return {
    width: getProblemImageWidth(url),
    height: getProblemImageHeight(url)
  }
}

export function setProblemImageSize(url: string, size: ProblemImageSize) {
  const { baseUrl, hashParts } = splitUrlHash(url)
  const nextHashParts = hashParts.filter(part => (
    !part.startsWith(`${PROBLEM_IMAGE_WIDTH_HASH_KEY}=`)
    && !part.startsWith(`${PROBLEM_IMAGE_HEIGHT_HASH_KEY}=`)
  ))

  if (size.width !== null) {
    nextHashParts.push(`${PROBLEM_IMAGE_WIDTH_HASH_KEY}=${clampProblemImageWidth(size.width)}`)
  }
  if (size.height !== null) {
    nextHashParts.push(`${PROBLEM_IMAGE_HEIGHT_HASH_KEY}=${clampProblemImageHeight(size.height)}`)
  }

  return `${baseUrl}${nextHashParts.length > 0 ? `#${nextHashParts.join('&')}` : ''}`
}

export function setProblemImageWidth(url: string, width: number | null) {
  return setProblemImageSize(url, {
    width,
    height: getProblemImageHeight(url)
  })
}

export function applyProblemImageWidth(image: HTMLImageElement) {
  const { width, height } = getProblemImageSize(image.getAttribute('src'))
  if (width === null && height === null) {
    if (image.dataset.emiyaojWidthApplied === 'true') {
      image.style.removeProperty('width')
      image.style.removeProperty('height')
      delete image.dataset.emiyaojWidthApplied
    }
    return
  }

  image.style.width = width === null ? 'auto' : `${width}%`
  image.style.height = height === null ? 'auto' : `${height}px`
  image.dataset.emiyaojWidthApplied = 'true'
}

export function applyProblemImageWidths(container: ParentNode) {
  container.querySelectorAll('img').forEach(image => applyProblemImageWidth(image))
}

export function getProblemImageMarkdown(picture: ProblemPictureVO) {
  const alt = picture.originalFilename.replace(/[[\]\\]/g, '\\$&')
  return `![${alt}](${picture.url})`
}

export function removeProblemImageMarkdown(markdown: string | undefined, url: string) {
  if (!markdown) return ''

  return markdown
    .replace(markdownImagePattern, (imageMarkdown, imageUrl: string) => (
      setProblemImageSize(imageUrl, { width: null, height: null })
        === setProblemImageSize(url, { width: null, height: null })
        ? ''
        : imageMarkdown
    ))
    .replace(/\n{3,}/g, '\n\n')
}
