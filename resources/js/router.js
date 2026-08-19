import { createRouter, createWebHistory } from 'vue-router'
import Questionnaire from './components/Questionnaire.vue'
import About from './components/About.vue'
import { SUPPORTED_LANGUAGES, translations } from './composables/useTranslations.js'

// Helper function to get current language from storage
const getCurrentLanguage = () => {
  const storedLang = localStorage.getItem('prompt-generator-lang')
  if (storedLang && SUPPORTED_LANGUAGES[storedLang]) {
    return storedLang
  }
  
  // Try to get from cookie
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})
  
  if (cookies['prompt-generator-lang'] && SUPPORTED_LANGUAGES[cookies['prompt-generator-lang']]) {
    return cookies['prompt-generator-lang']
  }
  
  // Default to English
  return 'en'
}

// Helper function to translate a key
const translate = (key) => {
  const langCode = getCurrentLanguage()
  const langTranslations = translations[langCode]
  
  if (langTranslations && langTranslations[key]) {
    return langTranslations[key]
  }
  
  // Fallback to English
  if (translations.en && translations.en[key]) {
    return translations.en[key]
  }
  
  return key
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Questionnaire,
    meta: { title: 'appTitle' }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: 'aboutTitleWithApp' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title with translation
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    const titleKey = to.meta.title
    
    if (titleKey === 'aboutTitleWithApp') {
      const appTitle = translate('appTitle')
      const aboutTitle = translate('aboutTitle')
      document.title = `${aboutTitle} - ${appTitle}`
    } else {
      document.title = translate(titleKey)
    }
  }
})

export default router
