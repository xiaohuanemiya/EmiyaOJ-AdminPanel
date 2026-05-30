<template>
  <div class="problem-markdown-editor">
    <el-alert
      v-if="editorError"
      :title="editorError"
      type="error"
      :closable="false"
      show-icon
      class="problem-markdown-editor__error"
    />
    <div ref="hostRef" class="problem-markdown-editor__host"></div>
    <div
      v-show="imageResizeHandleVisible"
      ref="imageResizeOverlayRef"
      class="problem-markdown-image-resize-overlay"
    >
      <span class="problem-markdown-image-resize-label">{{ imageResizeLabel }}</span>
      <button
        v-for="handle in imageResizeHandles"
        :key="handle.position"
        type="button"
        class="problem-markdown-image-resize-handle"
        :class="`problem-markdown-image-resize-handle--${handle.position}`"
        :title="handle.title"
        @pointerdown="startImageResize($event, handle)"
      />
    </div>
    <div
      v-show="quickToolbarVisible"
      ref="quickToolbarRef"
      class="problem-markdown-quickbar"
      @mousedown.prevent
    >
      <span class="problem-markdown-heading-menu">
        <button
          type="button"
          class="problem-markdown-quick-button"
          title="标题级别"
          @click.stop="headingMenuVisible = !headingMenuVisible"
        >
          H
        </button>
        <span v-show="headingMenuVisible" class="problem-markdown-heading-menu__options">
          <button
            v-for="level in headingLevels"
            :key="level"
            type="button"
            class="problem-markdown-quick-button"
            :title="`${level} 级标题`"
            @click.stop="insertHeading(level)"
          >
            H{{ level }}
          </button>
        </span>
      </span>
      <button type="button" class="problem-markdown-quick-button" title="加粗" @click="wrapSelection('**', '**', '加粗文字')">B</button>
      <button type="button" class="problem-markdown-quick-button" title="斜体" @click="wrapSelection('*', '*', '斜体文字')">I</button>
      <button type="button" class="problem-markdown-quick-button" title="删除线" @click="wrapSelection('~~', '~~', '删除文字')">S</button>
      <button type="button" class="problem-markdown-quick-button" title="行内代码" @click="wrapSelection('`', '`', 'code')">`</button>
      <button type="button" class="problem-markdown-quick-button" title="行内公式" @click="wrapSelection('$', '$', 'a^2 + b^2 = c^2')">$</button>
      <button type="button" class="problem-markdown-quick-button" title="块级公式" @click="insertBlockMath">$$</button>
      <button type="button" class="problem-markdown-quick-button" title="插入表格" @click="insertTable">表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Vditor from 'vditor'
import { uploadProblemImage } from '@/api/problem'
import type { ProblemPictureVO } from '@/types/api'
import {
  applyProblemImageWidth,
  applyProblemImageWidths,
  clampProblemImageHeight,
  clampProblemImageWidth,
  getProblemImageMarkdown,
  getProblemImageSize,
  getProblemImageWidth,
  PROBLEM_IMAGE_ACCEPT,
  PROBLEM_IMAGE_MAX_HEIGHT,
  PROBLEM_IMAGE_MAX_WIDTH,
  PROBLEM_IMAGE_MAX_SIZE,
  PROBLEM_IMAGE_MIN_HEIGHT,
  PROBLEM_IMAGE_MIN_WIDTH,
  PROBLEM_IMAGE_WIDTH_OPTIONS,
  setProblemImageSize,
  VDITOR_CDN,
  VDITOR_MATH_OPTIONS
} from '@/utils/markdown'
import type { ProblemImageSize } from '@/utils/markdown'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: '请输入 Markdown 内容'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'image-uploaded': [picture: ProblemPictureVO]
}>()

const hostRef = ref<HTMLDivElement>()
const imageResizeOverlayRef = ref<HTMLDivElement>()
const quickToolbarRef = ref<HTMLDivElement>()
const imageResizeHandleVisible = ref(false)
const imageResizeLabel = ref('')
const quickToolbarVisible = ref(false)
const headingMenuVisible = ref(false)
const editorError = ref('')
let editor: Vditor | undefined
let editorReady = false
let componentDestroyed = false
let initializationTimer: ReturnType<typeof setTimeout> | undefined
let imageObserver: MutationObserver | undefined
let imageResizeObserver: ResizeObserver | undefined
let selectedImage: HTMLImageElement | undefined
let imageWidthSelect: HTMLSelectElement | undefined
let activeImageResize: ActiveImageResize | undefined
let resizingImageSize: ProblemImageSize | undefined
let quickToolbarFrame: number | undefined

type ImageResizeMode = 'horizontal' | 'vertical' | 'proportional'
type ImageResizePosition = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'bottom-right'

interface ImageResizeHandle {
  mode: ImageResizeMode
  position: ImageResizePosition
  title: string
}

interface ActiveImageResize extends ImageResizeHandle {
  handleElement: HTMLElement
  pointerId: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  containerWidth: number
}

const imageResizeHandles: ImageResizeHandle[] = [
  { mode: 'horizontal', position: 'left', title: '横向缩放' },
  { mode: 'horizontal', position: 'right', title: '横向缩放' },
  { mode: 'vertical', position: 'top', title: '纵向缩放' },
  { mode: 'vertical', position: 'bottom', title: '纵向缩放' },
  { mode: 'proportional', position: 'top-left', title: '按比例缩放' },
  { mode: 'proportional', position: 'bottom-right', title: '按比例缩放' }
]
const headingLevels = [1, 2, 3, 4, 5, 6] as const

function validateImage(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!PROBLEM_IMAGE_ACCEPT.split(',').includes(extension)) {
    return `${file.name} 格式不支持，仅支持 jpg、jpeg、png、webp、gif`
  }
  if (file.size > PROBLEM_IMAGE_MAX_SIZE) {
    return `${file.name} 超过 10 MB`
  }
  return ''
}

function insertMarkdown(markdown: string) {
  if (!editorReady) return
  editor?.focus()
  editor?.insertMD(markdown)
  scheduleQuickToolbarUpdate()
}

function insertImage(picture: ProblemPictureVO) {
  insertMarkdown(`\n${getProblemImageMarkdown(picture)}\n`)
}

function wrapSelection(prefix: string, suffix: string, placeholder: string) {
  if (!editor || !editorReady) return
  const selection = editor.getSelection()
  if (selection) {
    editor.insertMD(`${prefix}${selection}${suffix}`)
  } else {
    editor.insertMD(`${prefix}${placeholder}${suffix}`)
  }
  scheduleQuickToolbarUpdate()
}

function insertBlockMath() {
  insertMarkdown('\n$$\n\\frac{a}{b}\n$$\n')
}

function insertHeading(level: number) {
  headingMenuVisible.value = false
  insertMarkdown(`${'#'.repeat(level)} `)
}

function insertTable() {
  insertMarkdown('\n| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n')
}

function emitEditorValue() {
  if (editor && editorReady) emit('update:modelValue', editor.getValue())
}

function syncImageWidthSelect(width: number | null) {
  if (!imageWidthSelect?.isConnected) return

  const value = width === null ? '' : String(width)
  if (value && !Array.from(imageWidthSelect.options).some(option => option.value === value)) {
    const option = document.createElement('option')
    option.textContent = `${value}%`
    option.value = value
    imageWidthSelect.appendChild(option)
  }
  imageWidthSelect.value = value
}

function getSelectedImageContainer() {
  if (!selectedImage) return undefined

  return selectedImage.closest('p, li, td, th, blockquote') as HTMLElement | null
    || selectedImage.parentElement
    || hostRef.value
}

function formatImageResizeLabel(size: ProblemImageSize) {
  const width = size.width === null ? '自适应' : `${size.width}%`
  const height = size.height === null ? '自适应' : `${size.height}px`
  return `${width} × ${height}`
}

function updateImageResizeHandlePosition() {
  const overlay = imageResizeOverlayRef.value
  const root = hostRef.value?.parentElement
  if (!overlay || !root || !selectedImage?.isConnected || !selectedImage.closest('.vditor-wysiwyg')) {
    imageResizeHandleVisible.value = false
    return
  }

  const imageRect = selectedImage.getBoundingClientRect()
  if (imageRect.width <= 0 || imageRect.height <= 0) {
    imageResizeHandleVisible.value = false
    return
  }

  const rootRect = root.getBoundingClientRect()
  overlay.style.left = `${imageRect.left - rootRect.left}px`
  overlay.style.top = `${imageRect.top - rootRect.top}px`
  overlay.style.width = `${imageRect.width}px`
  overlay.style.height = `${imageRect.height}px`
  imageResizeHandleVisible.value = true
}

function observeImageResizeLayout() {
  imageResizeObserver?.disconnect()
  if (hostRef.value) imageResizeObserver?.observe(hostRef.value)
  if (selectedImage?.isConnected) imageResizeObserver?.observe(selectedImage)
}

function selectImage(image: HTMLImageElement) {
  selectedImage = image
  const size = getProblemImageSize(image.getAttribute('src'))
  imageResizeLabel.value = formatImageResizeLabel(size)
  syncImageWidthSelect(size.width)
  observeImageResizeLayout()
  requestAnimationFrame(updateImageResizeHandlePosition)
}

function previewSelectedImageSize(size: ProblemImageSize) {
  if (!selectedImage) return

  const normalizedSize = {
    width: size.width === null ? null : clampProblemImageWidth(size.width),
    height: size.height === null ? null : clampProblemImageHeight(size.height)
  }
  selectedImage.style.width = normalizedSize.width === null ? 'auto' : `${normalizedSize.width}%`
  selectedImage.style.height = normalizedSize.height === null ? 'auto' : `${normalizedSize.height}px`
  selectedImage.dataset.emiyaojWidthApplied = 'true'
  resizingImageSize = normalizedSize
  imageResizeLabel.value = formatImageResizeLabel(normalizedSize)
  syncImageWidthSelect(normalizedSize.width)
  requestAnimationFrame(updateImageResizeHandlePosition)
}

function updateSelectedImageSize(size: ProblemImageSize) {
  if (!selectedImage) return

  const normalizedSize = {
    width: size.width === null ? null : clampProblemImageWidth(size.width),
    height: size.height === null ? null : clampProblemImageHeight(size.height)
  }
  const src = selectedImage.getAttribute('src') || ''
  selectedImage.setAttribute('src', setProblemImageSize(src, normalizedSize))
  applyProblemImageWidth(selectedImage)
  imageResizeLabel.value = formatImageResizeLabel(normalizedSize)
  syncImageWidthSelect(normalizedSize.width)
  requestAnimationFrame(updateImageResizeHandlePosition)
  emitEditorValue()
}

function updateSelectedImageWidth(width: number | null) {
  updateSelectedImageSize({ width, height: null })
}

function removeImageResizeListeners() {
  window.removeEventListener('pointermove', handleImageResize)
  window.removeEventListener('pointerup', finishImageResize)
  window.removeEventListener('pointercancel', finishImageResize)
}

function handleImageResize(event: PointerEvent) {
  if (event.pointerId !== activeImageResize?.pointerId || !selectedImage) return

  event.preventDefault()
  const deltaX = event.clientX - activeImageResize.startX
  const deltaY = event.clientY - activeImageResize.startY
  const startWidthPercent = (activeImageResize.startWidth / activeImageResize.containerWidth) * 100
  let width = startWidthPercent
  let height = activeImageResize.startHeight

  if (activeImageResize.mode === 'horizontal') {
    const direction = activeImageResize.position === 'left' ? -1 : 1
    width = ((activeImageResize.startWidth + direction * deltaX) / activeImageResize.containerWidth) * 100
  } else if (activeImageResize.mode === 'vertical') {
    const direction = activeImageResize.position === 'top' ? -1 : 1
    height = activeImageResize.startHeight + direction * deltaY
  } else {
    const direction = activeImageResize.position === 'top-left' ? -1 : 1
    const widthScale = (activeImageResize.startWidth + direction * deltaX) / activeImageResize.startWidth
    const heightScale = (activeImageResize.startHeight + direction * deltaY) / activeImageResize.startHeight
    const requestedScale = Math.abs(widthScale - 1) >= Math.abs(heightScale - 1) ? widthScale : heightScale
    const minScale = Math.max(
      PROBLEM_IMAGE_MIN_WIDTH / startWidthPercent,
      PROBLEM_IMAGE_MIN_HEIGHT / activeImageResize.startHeight
    )
    const maxScale = Math.min(
      PROBLEM_IMAGE_MAX_WIDTH / startWidthPercent,
      PROBLEM_IMAGE_MAX_HEIGHT / activeImageResize.startHeight
    )
    const scale = Math.min(maxScale, Math.max(minScale, requestedScale))
    width = startWidthPercent * scale
    height = activeImageResize.startHeight * scale
  }

  previewSelectedImageSize({ width, height })
}

function finishImageResize(event: PointerEvent) {
  if (event.pointerId !== activeImageResize?.pointerId) return

  const handle = activeImageResize.handleElement
  if (handle?.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId)
  }
  activeImageResize = undefined
  removeImageResizeListeners()
  if (resizingImageSize) {
    updateSelectedImageSize(resizingImageSize)
    resizingImageSize = undefined
  }
}

function startImageResize(event: PointerEvent, handle: ImageResizeHandle) {
  if (!selectedImage) return
  const container = getSelectedImageContainer()
  const imageRect = selectedImage.getBoundingClientRect()
  const containerRect = container?.getBoundingClientRect()
  if (!containerRect || imageRect.width <= 0 || imageRect.height <= 0 || containerRect.width <= 0) return

  event.preventDefault()
  event.stopPropagation()
  activeImageResize = {
    ...handle,
    handleElement: event.currentTarget as HTMLElement,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: imageRect.width,
    startHeight: imageRect.height,
    containerWidth: containerRect.width
  }
  resizingImageSize = undefined
  activeImageResize.handleElement.setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', handleImageResize)
  window.addEventListener('pointerup', finishImageResize)
  window.addEventListener('pointercancel', finishImageResize)
}

function appendImageSizeToolbar(element: HTMLElement) {
  if (!selectedImage || element.querySelector('.problem-markdown-image-size')) return

  const wrapper = document.createElement('span')
  wrapper.className = 'problem-markdown-image-size'

  const label = document.createElement('span')
  label.textContent = '尺寸'

  const select = document.createElement('select')
  select.className = 'vditor-input problem-markdown-image-size__select'
  const options = [
    { label: '自适应', value: '' },
    ...PROBLEM_IMAGE_WIDTH_OPTIONS.map(width => ({ label: `${width}%`, value: String(width) }))
  ]
  options.forEach(option => {
    const optionElement = document.createElement('option')
    optionElement.textContent = option.label
    optionElement.value = option.value
    select.appendChild(optionElement)
  })
  select.value = String(getProblemImageWidth(selectedImage.getAttribute('src')) || '')
  select.addEventListener('change', () => {
    updateSelectedImageWidth(select.value ? Number(select.value) : null)
  })
  imageWidthSelect = select
  syncImageWidthSelect(getProblemImageWidth(selectedImage.getAttribute('src')))

  wrapper.append(label, select)
  element.appendChild(wrapper)
}

function removeNativeBlockToolbarActions(element: HTMLElement) {
  ;['up', 'down', 'remove'].forEach(type => {
    element.querySelector(`[data-type="${type}"]`)?.remove()
  })
}

function syncNativeToolbarVisibility(element: HTMLElement) {
  const isEmpty = element.childElementCount === 0 && !element.textContent?.trim()
  element.classList.toggle('problem-markdown-native-popover--empty', isEmpty)
}

function appendQuickToolbar(type: string, element: HTMLElement) {
  removeNativeBlockToolbarActions(element)
  if (type === 'image') {
    appendImageSizeToolbar(element)
  }
  syncNativeToolbarVisibility(element)
}

function getNodeElement(node: Node) {
  return node instanceof Element ? node : node.parentElement
}

function getCaretRect(range: Range) {
  const rangeRect = range.getBoundingClientRect()
  if (rangeRect.width > 0 || rangeRect.height > 0) return rangeRect

  const clientRect = range.getClientRects()[0]
  if (clientRect) return clientRect

  const element = getNodeElement(range.startContainer)
  const block = element?.closest('p, li, td, th, blockquote, h1, h2, h3, h4, h5, h6, pre')
    || element
  const blockRect = block?.getBoundingClientRect()
  if (!blockRect) return undefined

  return new DOMRect(blockRect.left + 8, blockRect.top, 0, Math.min(blockRect.height, 20))
}

function updateQuickToolbarPosition() {
  const toolbar = quickToolbarRef.value
  const root = hostRef.value?.parentElement
  const wysiwyg = hostRef.value?.querySelector('.vditor-wysiwyg')
  const selection = window.getSelection()
  if (!toolbar || !root || !wysiwyg || !selection || selection.rangeCount === 0) {
    quickToolbarVisible.value = false
    headingMenuVisible.value = false
    return
  }

  const range = selection.getRangeAt(0)
  const selectionElement = getNodeElement(range.commonAncestorContainer)
  if (!selectionElement || !wysiwyg.contains(selectionElement)) {
    quickToolbarVisible.value = false
    headingMenuVisible.value = false
    return
  }

  const caretRect = getCaretRect(range)
  if (!caretRect) {
    quickToolbarVisible.value = false
    headingMenuVisible.value = false
    return
  }

  const rootRect = root.getBoundingClientRect()
  const originalLeft = caretRect.left - rootRect.left
  toolbar.style.left = `${originalLeft}px`
  toolbar.style.top = `${caretRect.top - rootRect.top}px`
  quickToolbarVisible.value = true

  requestAnimationFrame(() => {
    if (!quickToolbarVisible.value || !quickToolbarRef.value) return

    const halfWidth = quickToolbarRef.value.offsetWidth / 2
    const left = Math.min(rootRect.width - halfWidth - 4, Math.max(halfWidth + 4, originalLeft))
    quickToolbarRef.value.style.left = `${left}px`
  })
}

function scheduleQuickToolbarUpdate() {
  if (quickToolbarFrame !== undefined) cancelAnimationFrame(quickToolbarFrame)
  quickToolbarFrame = requestAnimationFrame(() => {
    quickToolbarFrame = undefined
    updateQuickToolbarPosition()
  })
}

async function handleUpload(files: File[]) {
  const file = files[0]
  if (!file) return null

  const validationMessage = validateImage(file)
  if (validationMessage) return validationMessage

  try {
    const response = await uploadProblemImage(file)
    const picture = response.data
    emit('image-uploaded', picture)
    insertImage(picture)
    return null
  } catch {
    return '图片上传失败'
  }
}

function syncEditorValue(value = props.modelValue || '') {
  if (editor && editorReady && editor.getValue() !== value) {
    editor.setValue(value, true)
    if (hostRef.value) applyProblemImageWidths(hostRef.value)
  }
}

function handleEditorClick(event: Event) {
  if (event.target instanceof HTMLImageElement && event.target.closest('.vditor-wysiwyg')) {
    selectImage(event.target)
  } else if (event.target instanceof Element && event.target.closest('.vditor-wysiwyg')) {
    selectedImage = undefined
    imageResizeHandleVisible.value = false
    observeImageResizeLayout()
  }
  scheduleQuickToolbarUpdate()
}

function updateEditorFloatingPositions() {
  updateImageResizeHandlePosition()
  scheduleQuickToolbarUpdate()
}

function handleDocumentPointerDown(event: PointerEvent) {
  const root = hostRef.value?.parentElement
  if (event.target instanceof Node && root?.contains(event.target)) return

  quickToolbarVisible.value = false
  headingMenuVisible.value = false
}

async function assertEditorAssetsAvailable() {
  const assetUrls = [
    `${VDITOR_CDN}/dist/js/i18n/zh_CN.js`,
    `${VDITOR_CDN}/dist/js/lute/lute.min.js`
  ]

  await Promise.all(assetUrls.map(async (url) => {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type') || ''
    if (!response.ok || !/(javascript|ecmascript)/i.test(contentType)) {
      throw new Error(`${url} unavailable`)
    }
  }))
}

async function initializeEditor() {
  if (!hostRef.value) return

  try {
    await assertEditorAssetsAvailable()
  } catch (error) {
    console.error('Vditor 静态资源加载失败:', error)
    editorError.value = 'Markdown 编辑器资源加载失败，请检查 /vendor/vditor 静态资源是否已部署。'
    return
  }

  if (componentDestroyed || !hostRef.value) return

  hostRef.value.addEventListener('click', handleEditorClick, true)
  hostRef.value.addEventListener('keyup', scheduleQuickToolbarUpdate, true)
  hostRef.value.addEventListener('mouseup', scheduleQuickToolbarUpdate, true)
  hostRef.value.addEventListener('scroll', updateEditorFloatingPositions, true)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('selectionchange', scheduleQuickToolbarUpdate)
  window.addEventListener('resize', updateEditorFloatingPositions)
  imageResizeObserver = new ResizeObserver(updateImageResizeHandlePosition)
  observeImageResizeLayout()
  imageObserver = new MutationObserver(() => {
    if (hostRef.value) applyProblemImageWidths(hostRef.value)
    updateImageResizeHandlePosition()
  })
  imageObserver.observe(hostRef.value, {
    attributes: true,
    attributeFilter: ['src'],
    childList: true,
    subtree: true
  })

  initializationTimer = setTimeout(() => {
    if (!editorReady && !componentDestroyed) {
      editorError.value = 'Markdown 编辑器初始化超时，请刷新页面后重试。'
    }
  }, 10000)

  let instance: Vditor
  instance = new Vditor(hostRef.value, {
    cdn: VDITOR_CDN,
    value: props.modelValue || '',
    placeholder: props.placeholder,
    height: 420,
    minHeight: 280,
    mode: 'wysiwyg',
    lang: 'zh_CN',
    cache: {
      enable: false
    },
    toolbarConfig: {
      pin: true
    },
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'quote',
      'list',
      'ordered-list',
      'check',
      '|',
      'inline-code',
      'code',
      'link',
      'table',
      'upload',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'both',
      'preview',
      'fullscreen'
    ],
    preview: {
      math: {
        ...VDITOR_MATH_OPTIONS
      }
    },
    upload: {
      accept: PROBLEM_IMAGE_ACCEPT,
      multiple: false,
      max: PROBLEM_IMAGE_MAX_SIZE,
      // Vditor's declaration splits Promise<string | null> into two Promise types.
      handler: handleUpload as unknown as NonNullable<IUpload['handler']>
    },
    input: (value) => {
      emit('update:modelValue', value)
      scheduleQuickToolbarUpdate()
    },
    customWysiwygToolbar: appendQuickToolbar,
    after: () => {
      editorReady = true
      if (initializationTimer) clearTimeout(initializationTimer)
      editorError.value = ''
      if (componentDestroyed) {
        instance.destroy()
        if (editor === instance) editor = undefined
        return
      }
      syncEditorValue()
      if (hostRef.value) applyProblemImageWidths(hostRef.value)
      scheduleQuickToolbarUpdate()
    }
  })
  editor = instance
}

onMounted(() => {
  void initializeEditor()
})

watch(() => props.modelValue, (value) => {
  syncEditorValue(value || '')
})

onBeforeUnmount(() => {
  componentDestroyed = true
  if (initializationTimer) clearTimeout(initializationTimer)
  imageObserver?.disconnect()
  imageResizeObserver?.disconnect()
  removeImageResizeListeners()
  if (quickToolbarFrame !== undefined) cancelAnimationFrame(quickToolbarFrame)
  hostRef.value?.removeEventListener('click', handleEditorClick, true)
  hostRef.value?.removeEventListener('keyup', scheduleQuickToolbarUpdate, true)
  hostRef.value?.removeEventListener('mouseup', scheduleQuickToolbarUpdate, true)
  hostRef.value?.removeEventListener('scroll', updateEditorFloatingPositions, true)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('selectionchange', scheduleQuickToolbarUpdate)
  window.removeEventListener('resize', updateEditorFloatingPositions)
  if (editorReady) editor?.destroy()
  editor = undefined
})

defineExpose({
  insertImage,
  insertMarkdown
})
</script>

<style scoped>
.problem-markdown-editor {
  position: relative;
  width: 100%;
}

.problem-markdown-editor__error {
  margin-bottom: 12px;
}

.problem-markdown-editor__host {
  width: 100%;
}

.problem-markdown-editor :deep(.problem-markdown-native-popover--empty) {
  display: none !important;
}

.problem-markdown-quickbar {
  position: absolute;
  z-index: 7;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 14%);
  transform: translate(-50%, calc(-100% - 12px));
  white-space: nowrap;
}

.problem-markdown-editor :deep(.problem-markdown-image-size) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.problem-markdown-editor :deep(.problem-markdown-image-size__select) {
  width: 74px;
}

.problem-markdown-heading-menu {
  position: relative;
  display: inline-flex;
}

.problem-markdown-heading-menu__options {
  position: absolute;
  bottom: calc(100% + 6px);
  left: -4px;
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 14%);
}

.problem-markdown-editor :deep(.vditor-wysiwyg img) {
  max-width: 100%;
  height: auto;
}

.problem-markdown-image-resize-overlay {
  position: absolute;
  z-index: 5;
  border: 1px solid #409eff;
  pointer-events: none;
}

.problem-markdown-image-resize-label {
  position: absolute;
  right: 0;
  bottom: calc(100% + 7px);
  padding: 2px 5px;
  border-radius: 3px;
  color: #ffffff;
  background: #409eff;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.problem-markdown-image-resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 2px solid #409eff;
  border-radius: 50%;
  background: #ffffff;
  pointer-events: auto;
  touch-action: none;
  transform: translate(-50%, -50%);
}

.problem-markdown-image-resize-handle--left {
  top: 50%;
  left: 0;
  cursor: ew-resize;
}

.problem-markdown-image-resize-handle--right {
  top: 50%;
  left: 100%;
  cursor: ew-resize;
}

.problem-markdown-image-resize-handle--top {
  top: 0;
  left: 50%;
  cursor: ns-resize;
}

.problem-markdown-image-resize-handle--bottom {
  top: 100%;
  left: 50%;
  cursor: ns-resize;
}

.problem-markdown-image-resize-handle--top-left {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.problem-markdown-image-resize-handle--bottom-right {
  top: 100%;
  left: 100%;
  cursor: nwse-resize;
}

.problem-markdown-quick-button {
  min-width: 24px;
  height: 22px;
  padding: 0 5px;
  border: 0;
  border-radius: 3px;
  color: #606266;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  line-height: 22px;
}

.problem-markdown-quick-button:hover {
  color: #409eff;
  background: #ecf5ff;
}
</style>
