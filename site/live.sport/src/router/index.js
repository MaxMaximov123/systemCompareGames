import { createRouter, createWebHistory } from 'vue-router'
import TablesView from '../views/TablesView.vue'
import GraphicView from '../views/GraphicView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/pairs/:page',
      name: 'tables',
      component: TablesView
    },
    {
      path: '/graphic/:id',
      name: 'graphic',
      component: GraphicView
    },
  ]
})

export default router
