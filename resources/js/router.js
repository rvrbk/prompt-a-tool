import { createRouter, createWebHistory } from 'vue-router'
import Questionnaire from './components/Questionnaire.vue'
import About from './components/About.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Questionnaire,
    meta: { title: 'Prompt Generator' }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: 'About - Prompt Generator' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
})

export default router
