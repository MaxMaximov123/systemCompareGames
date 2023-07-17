import { createRouter, createWebHistory } from 'vue-router'
import TablesView from '../views/TablesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/pairs/:page',
      name: 'tables',
      component: TablesView
    },
  ]
})

export default router
