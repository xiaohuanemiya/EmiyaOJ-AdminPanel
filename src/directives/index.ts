import type { App } from 'vue'
import { permission, permissionAny, permissionAll } from './permission'

export default {
  install(app: App) {
    app.directive('permission', permission)
    app.directive('permission-any', permissionAny)
    app.directive('permission-all', permissionAll)
  }
}
