<template>
  <router-view />
  <DevTools />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import DevTools from '@/components/DevTools.vue'

const userStore = useUserStore()

onMounted(() => {
  // 从 localStorage 恢复用户信息
  userStore.restoreUserInfo()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>
