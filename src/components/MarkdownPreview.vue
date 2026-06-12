<template>
  <div ref="previewRef" class="markdown-preview" @dblclick="handleDoubleClick"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import VditorPreview from 'vditor/dist/method'
import { applyProblemImageWidths, VDITOR_CDN, VDITOR_MATH_OPTIONS } from '@/utils/markdown'

const props = withDefaults(defineProps<{
  content?: string
}>(), {
  content: ''
})

const previewRef = ref<HTMLDivElement>()
let renderId = 0

function handleDoubleClick(event: MouseEvent) {
  if (event.target instanceof HTMLImageElement) {
    VditorPreview.previewImage(event.target, 'zh_CN', 'classic')
  }
}

async function renderMarkdown() {
  const target = previewRef.value
  if (!target) return

  const currentRenderId = ++renderId
  await nextTick()
  if (currentRenderId !== renderId || !previewRef.value) return

  await VditorPreview.preview(previewRef.value, props.content || '', {
    mode: 'light',
    cdn: VDITOR_CDN,
    lang: 'zh_CN',
    hljs: {
      enable: true,
      lineNumber: false,
      style: 'github'
    },
    math: {
      ...VDITOR_MATH_OPTIONS
    }
  })
  if (currentRenderId === renderId && previewRef.value) {
    applyProblemImageWidths(previewRef.value)
  }
}

watch(() => props.content, () => {
  void renderMarkdown()
})

onMounted(() => {
  void renderMarkdown()
})
</script>

<style scoped>
.markdown-preview {
  min-width: 0;
  line-height: 1.7;
  word-break: break-word;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  cursor: zoom-in;
}

.markdown-preview :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}
</style>
