import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapse: boolean
  theme: 'light' | 'dark'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapse: false,
    theme: 'light'
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
    },

    setSidebarCollapse(collapse: boolean) {
      this.sidebarCollapse = collapse
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
    }
  }
})
