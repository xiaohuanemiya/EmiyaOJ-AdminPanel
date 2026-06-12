<template />

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

type DifyChatbotConfig = {
  token: string
  baseUrl: string
  dynamicScript: boolean
  containerProps: {
    style: {
      bottom: string
    }
  }
  inputs: Record<string, unknown>
  systemVariables: Record<string, unknown>
  userVariables: Record<string, unknown>
}

declare global {
  interface Window {
    difyChatbotConfig?: DifyChatbotConfig
  }
}

const DIFY_CHATBOT_TOKEN = '4Qp78ffPZnoahvRG'
const DIFY_CHATBOT_STYLE_ID = 'dify-chatbot-style'
const DIFY_CHATBOT_BUBBLE_BUTTON_ID = 'dify-chatbot-bubble-button'
const DIFY_CHATBOT_BUBBLE_WINDOW_ID = 'dify-chatbot-bubble-window'
const DIFY_CHATBOT_RESIZE_HANDLE_CLASS = 'dify-chatbot-resize-handle'
const MIN_CHATBOT_WIDTH = 320
const MIN_CHATBOT_HEIGHT = 320
const RESIZE_HANDLE_SIZE = 12
const RESIZE_CORNER_SIZE = 18
const VIEWPORT_MARGIN = 16

type ResizeAxis = 'horizontal' | 'vertical' | 'both'
type ChatbotSize = {
  width?: number
  height?: number
}

let chatbotScript: HTMLScriptElement | undefined
let chatbotStyle: HTMLStyleElement | undefined
let chatbotBodyObserver: MutationObserver | undefined
let chatbotIframeObserver: MutationObserver | undefined
let chatbotResizeObserver: ResizeObserver | undefined
let observedChatbotIframe: HTMLIFrameElement | undefined
let resizeFrameId: number | undefined
let stopActiveResize: (() => void) | undefined
let customChatbotSize: ChatbotSize = {}
let resizeHandles: Partial<Record<ResizeAxis, HTMLDivElement>> = {}

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '')

const getDefaultDifyBaseUrl = () => {
  // The user's browser loads Dify directly, so a container-local localhost is not usable remotely.
  const url = new URL(window.location.origin)
  url.port = ''
  return url.origin
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const getChatbotIframe = () => {
  return document.getElementById(DIFY_CHATBOT_BUBBLE_WINDOW_ID) as HTMLIFrameElement | null
}

const setResizeHandlesVisible = (visible: boolean) => {
  Object.values(resizeHandles).forEach(handle => {
    handle.style.display = visible ? 'block' : 'none'
  })
}

const syncResizeHandles = () => {
  resizeFrameId = undefined
  const iframe = getChatbotIframe()

  if (!iframe || iframe.style.display === 'none') {
    setResizeHandlesVisible(false)
    return
  }

  const rect = iframe.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    setResizeHandlesVisible(false)
    return
  }

  const horizontalHandle = resizeHandles.horizontal
  const verticalHandle = resizeHandles.vertical
  const bothHandle = resizeHandles.both

  if (horizontalHandle) {
    Object.assign(horizontalHandle.style, {
      display: 'block',
      left: `${rect.left - RESIZE_HANDLE_SIZE / 2}px`,
      top: `${rect.top + RESIZE_CORNER_SIZE}px`,
      width: `${RESIZE_HANDLE_SIZE}px`,
      height: `${Math.max(0, rect.height - RESIZE_CORNER_SIZE)}px`
    })
  }

  if (verticalHandle) {
    Object.assign(verticalHandle.style, {
      display: 'block',
      left: `${rect.left + RESIZE_CORNER_SIZE}px`,
      top: `${rect.top - RESIZE_HANDLE_SIZE / 2}px`,
      width: `${Math.max(0, rect.width - RESIZE_CORNER_SIZE)}px`,
      height: `${RESIZE_HANDLE_SIZE}px`
    })
  }

  if (bothHandle) {
    Object.assign(bothHandle.style, {
      display: 'block',
      left: `${rect.left - RESIZE_HANDLE_SIZE / 2}px`,
      top: `${rect.top - RESIZE_HANDLE_SIZE / 2}px`,
      width: `${RESIZE_CORNER_SIZE}px`,
      height: `${RESIZE_CORNER_SIZE}px`
    })
  }
}

const scheduleResizeHandleSync = () => {
  if (resizeFrameId !== undefined) return
  resizeFrameId = window.requestAnimationFrame(syncResizeHandles)
}

const setImportantSize = (iframe: HTMLIFrameElement, property: 'width' | 'height', value: number) => {
  const cssValue = `${Math.round(value)}px`
  if (
    iframe.style.getPropertyValue(property) !== cssValue ||
    iframe.style.getPropertyPriority(property) !== 'important'
  ) {
    iframe.style.setProperty(property, cssValue, 'important')
  }
}

const applyCustomChatbotSize = (iframe = observedChatbotIframe) => {
  if (!iframe) return

  if (customChatbotSize.width !== undefined) {
    const maxWidth = Math.max(MIN_CHATBOT_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
    customChatbotSize.width = clamp(customChatbotSize.width, MIN_CHATBOT_WIDTH, maxWidth)
    setImportantSize(iframe, 'width', customChatbotSize.width)
  }

  if (customChatbotSize.height !== undefined) {
    const maxHeight = Math.max(MIN_CHATBOT_HEIGHT, window.innerHeight - VIEWPORT_MARGIN * 2)
    customChatbotSize.height = clamp(customChatbotSize.height, MIN_CHATBOT_HEIGHT, maxHeight)
    setImportantSize(iframe, 'height', customChatbotSize.height)
  }

  scheduleResizeHandleSync()
}

const observeChatbotIframe = () => {
  const iframe = getChatbotIframe() || undefined
  if (iframe === observedChatbotIframe) return

  chatbotIframeObserver?.disconnect()
  chatbotResizeObserver?.disconnect()
  observedChatbotIframe = iframe

  if (!iframe) {
    setResizeHandlesVisible(false)
    return
  }

  chatbotIframeObserver = new MutationObserver(() => {
    applyCustomChatbotSize(iframe)
    scheduleResizeHandleSync()
  })
  chatbotIframeObserver.observe(iframe, { attributes: true, attributeFilter: ['style'] })

  chatbotResizeObserver = new ResizeObserver(scheduleResizeHandleSync)
  chatbotResizeObserver.observe(iframe)
  applyCustomChatbotSize(iframe)
}

const startChatbotResize = (axis: ResizeAxis, event: PointerEvent) => {
  if (event.button !== 0) return

  const iframe = getChatbotIframe()
  if (!iframe) return

  event.preventDefault()
  event.stopPropagation()
  stopActiveResize?.()

  const handle = event.currentTarget as HTMLDivElement
  const rect = iframe.getBoundingClientRect()
  const startX = event.clientX
  const startY = event.clientY
  const maxWidth = Math.max(MIN_CHATBOT_WIDTH, rect.right - VIEWPORT_MARGIN)
  const maxHeight = Math.max(MIN_CHATBOT_HEIGHT, rect.bottom - VIEWPORT_MARGIN)

  handle.setPointerCapture(event.pointerId)
  document.body.classList.add('dify-chatbot-resizing')

  const handlePointerMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return

    if (axis === 'horizontal' || axis === 'both') {
      customChatbotSize.width = clamp(rect.width + startX - moveEvent.clientX, MIN_CHATBOT_WIDTH, maxWidth)
    }

    if (axis === 'vertical' || axis === 'both') {
      customChatbotSize.height = clamp(rect.height + startY - moveEvent.clientY, MIN_CHATBOT_HEIGHT, maxHeight)
    }

    applyCustomChatbotSize(iframe)
  }

  const handlePointerUp = (pointerEvent: PointerEvent) => {
    if (pointerEvent.pointerId === event.pointerId) {
      stopActiveResize?.()
    }
  }

  stopActiveResize = () => {
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId)
    }
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
    document.body.classList.remove('dify-chatbot-resizing')
    stopActiveResize = undefined
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
}

const createResizeHandle = (axis: ResizeAxis, title: string) => {
  const handle = document.createElement('div')
  handle.className = `${DIFY_CHATBOT_RESIZE_HANDLE_CLASS} ${DIFY_CHATBOT_RESIZE_HANDLE_CLASS}--${axis}`
  handle.title = title
  handle.addEventListener('pointerdown', event => startChatbotResize(axis, event))
  document.body.appendChild(handle)
  resizeHandles[axis] = handle
}

const handleViewportResize = () => {
  applyCustomChatbotSize()
}

const setupChatbotResize = () => {
  createResizeHandle('horizontal', '拖拽调整对话窗口宽度')
  createResizeHandle('vertical', '拖拽调整对话窗口高度')
  createResizeHandle('both', '拖拽调整对话窗口大小')

  chatbotBodyObserver = new MutationObserver(() => {
    observeChatbotIframe()
    scheduleResizeHandleSync()
  })
  chatbotBodyObserver.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', handleViewportResize)
}

const removeChatbotResize = () => {
  stopActiveResize?.()
  chatbotBodyObserver?.disconnect()
  chatbotIframeObserver?.disconnect()
  chatbotResizeObserver?.disconnect()
  window.removeEventListener('resize', handleViewportResize)

  if (resizeFrameId !== undefined) {
    window.cancelAnimationFrame(resizeFrameId)
  }

  Object.values(resizeHandles).forEach(handle => handle.remove())
  chatbotBodyObserver = undefined
  chatbotIframeObserver = undefined
  chatbotResizeObserver = undefined
  observedChatbotIframe = undefined
  resizeFrameId = undefined
  customChatbotSize = {}
  resizeHandles = {}
}

const removeChatbotElements = () => {
  document.getElementById(DIFY_CHATBOT_BUBBLE_BUTTON_ID)?.remove()
  document.getElementById(DIFY_CHATBOT_BUBBLE_WINDOW_ID)?.remove()
}

const removeChatbot = () => {
  removeChatbotResize()
  chatbotScript?.remove()
  chatbotStyle?.remove()
  document.getElementById(DIFY_CHATBOT_TOKEN)?.remove()
  document.getElementById(DIFY_CHATBOT_STYLE_ID)?.remove()
  removeChatbotElements()

  if (window.difyChatbotConfig?.token === DIFY_CHATBOT_TOKEN) {
    delete window.difyChatbotConfig
  }
}

onMounted(() => {
  removeChatbot()

  const configuredBaseUrl = import.meta.env.VITE_DIFY_BASE_URL?.trim()
  const difyBaseUrl = trimTrailingSlash(configuredBaseUrl || getDefaultDifyBaseUrl())

  window.difyChatbotConfig = {
    token: DIFY_CHATBOT_TOKEN,
    baseUrl: difyBaseUrl,
    dynamicScript: true,
    containerProps: {
      style: {
        bottom: import.meta.env.DEV ? '5rem' : '1rem'
      }
    },
    inputs: {},
    systemVariables: {},
    userVariables: {}
  }

  chatbotStyle = document.createElement('style')
  chatbotStyle.id = DIFY_CHATBOT_STYLE_ID
  chatbotStyle.textContent = `
    #${DIFY_CHATBOT_BUBBLE_BUTTON_ID} {
      --dify-chatbot-bubble-button-bg-color: #1C64F2;
      background-color: #1C64F2 !important;
    }

    #${DIFY_CHATBOT_BUBBLE_WINDOW_ID} {
      min-width: ${MIN_CHATBOT_WIDTH}px !important;
      min-height: ${MIN_CHATBOT_HEIGHT}px !important;
      max-width: calc(100vw - ${VIEWPORT_MARGIN * 2}px) !important;
      max-height: calc(100vh - 6rem) !important;
    }

    .${DIFY_CHATBOT_RESIZE_HANDLE_CLASS} {
      position: fixed;
      display: none;
      z-index: 2147483646;
      background-color: transparent;
      touch-action: none;
      user-select: none;
    }

    .${DIFY_CHATBOT_RESIZE_HANDLE_CLASS}:hover {
      background-color: rgba(28, 100, 242, 0.16);
    }

    .${DIFY_CHATBOT_RESIZE_HANDLE_CLASS}--horizontal {
      cursor: ew-resize;
    }

    .${DIFY_CHATBOT_RESIZE_HANDLE_CLASS}--vertical {
      cursor: ns-resize;
    }

    .${DIFY_CHATBOT_RESIZE_HANDLE_CLASS}--both {
      border-top: 3px solid #1C64F2;
      border-left: 3px solid #1C64F2;
      border-top-left-radius: 8px;
      cursor: nwse-resize;
    }

    .dify-chatbot-resizing,
    .dify-chatbot-resizing * {
      user-select: none !important;
    }

    .dify-chatbot-resizing #${DIFY_CHATBOT_BUBBLE_WINDOW_ID} {
      pointer-events: none;
    }
  `
  document.head.appendChild(chatbotStyle)
  setupChatbotResize()

  chatbotScript = document.createElement('script')
  chatbotScript.id = DIFY_CHATBOT_TOKEN
  chatbotScript.src = `${difyBaseUrl}/embed.min.js`
  chatbotScript.defer = true
  document.body.appendChild(chatbotScript)
})

onUnmounted(removeChatbot)
</script>
