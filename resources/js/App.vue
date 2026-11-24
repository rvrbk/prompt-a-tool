<script setup>
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import CookieBanner from './components/CookieBanner.vue'
import UserMenu from './components/UserMenu.vue'
import BadgeToast from './components/BadgeToast.vue'
import useAchievements from './composables/useAchievements.js'
import useAuth from './composables/useAuth.js'
import useTranslations from './composables/useTranslations.js'
import useGoogleAnalytics, { ANALYTICS_CONSENT_KEY } from './composables/useGoogleAnalytics.js'
import { setupLightningInterceptor, triggerInitialLightning } from './utils/axiosLightningInterceptor.js'

// Initialize translations with auto-detection and cookie support
const { 
  t, 
  currentLanguage,
  setLanguage, 
  getLanguageOptions, 
  getLanguageName, 
  getLanguageFlag, 
  SUPPORTED_LANGUAGES,
  getLanguageFromCookie
} = useTranslations(undefined, { 
  useCookies: true, 
  useLocalStorage: true,
  autoDetect: true 
})

// Provide translations to all child components
provide('translations', { 
  t, 
  currentLanguage,
  setLanguage, 
  getLanguageName, 
  getLanguageFlag 
})

// Language selector state
const showLanguageDropdown = ref(false)
const languageOptions = getLanguageOptions()

// Cookie banner state
const showCookieBanner = ref(false)
const cookieConsentGiven = ref(false)

// Set up lightning animation interceptor for AI requests
onMounted(() => {
    setupLightningInterceptor()
    triggerInitialLightning()
})

// Show the banner until the visitor has answered the analytics question
const checkCookieConsent = () => {
  const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY)
  cookieConsentGiven.value = consent === 'granted'
  showCookieBanner.value = consent === null
}

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const selectLanguage = (langCode) => {
  setLanguage(langCode)
  showLanguageDropdown.value = false
}

// Use computed properties for real-time reactivity
const currentLang = computed(() => currentLanguage.value)
const currentLangNative = computed(() => getLanguageName(currentLang.value))

// Title class - use text-md for Oromo (or) to prevent overflow
const titleClass = computed(() => {
  return currentLang.value === 'or' ? 'text-md' : 'text-lg'
})

// Compute language display values
const currentLangFlag = computed(() => SUPPORTED_LANGUAGES[currentLang.value]?.countryCode || 'us')
const currentLangDisplay = computed(() => (SUPPORTED_LANGUAGES[currentLang.value]?.countryCode || 'EN').toUpperCase())

// Close dropdown when clicking outside
const closeLanguageDropdown = () => {
  showLanguageDropdown.value = false
}

// Close language dropdown when clicking outside
const handleClickOutside = (event) => {
  const languageDropdown = document.querySelector('.language-dropdown')
  const languageButton = document.querySelector('.language-button')
  if (languageDropdown && languageButton) {
    if (!languageDropdown.contains(event.target) && !languageButton.contains(event.target)) {
      showLanguageDropdown.value = false
    }
  }
}

onMounted(() => {
  checkCookieConsent()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Cookie banner handlers
const handleCookieAccept = () => {
  showCookieBanner.value = false
  cookieConsentGiven.value = true
  localStorage.setItem('prompt-generator-cookie-consent', 'true')
  localStorage.setItem(ANALYTICS_CONSENT_KEY, 'granted')
  initGA()
}

// Declining only turns analytics off; the language cookie stays because the site needs it.
const handleCookieDismiss = () => {
  showCookieBanner.value = false
  localStorage.setItem('prompt-generator-cookie-consent', 'dismissed')
  localStorage.setItem(ANALYTICS_CONSENT_KEY, 'denied')
}

// Watch for language changes to update cookie consent state
watch(currentLang, () => {
  if (cookieConsentGiven.value) {
    showCookieBanner.value = false
  }
})

// Google Analytics only starts once the visitor accepted it
const { initGA } = useGoogleAnalytics()

const route = useRoute()
const { user } = useAuth()
const { streak } = useAchievements()

// Mobile menu state
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Sign-in failure notice (OAuth callbacks redirect to /?auth=failed or /?auth=no_email)
const AUTH_NOTICES = { failed: 'authFailed', no_email: 'authNoEmail' }
const authNotice = ref(null)
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const notice = AUTH_NOTICES[params.get('auth')]
  if (notice) {
    authNotice.value = notice
    params.delete('auth')
    const query = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''))
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-2">
          <div class="flex items-center min-w-0 space-x-4 sm:space-x-6">
            <div class="flex items-center min-w-0 space-x-2 sm:space-x-3">
              <router-link to="/" class="shrink-0" aria-hidden="true" tabindex="-1" @click.stop="closeMobileMenu">
                <svg class="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" class="lightning-bolt origin-center" />
                </svg>
              </router-link>
              <div class="min-w-0 leading-tight">
                <router-link to="/" class="block" @click.stop="closeMobileMenu">
                  <h1 :class="[titleClass, 'font-semibold text-gray-900 tracking-tight truncate']">{{ t('appTitle') }}</h1>
                </router-link>
                <a href="https://verbeek.ug/" target="_blank" rel="noopener noreferrer" class="block truncate text-[11px] text-gray-400 hover:text-gray-600 transition-colors">a verbeek.ug platform</a>
              </div>
            </div>
            <nav class="hidden md:flex items-center space-x-6">
              <router-link
                to="/"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                :class="{ 'text-gray-900': route.path === '/' }"
                @click.stop
              >
                {{ t('navHome') }}
              </router-link>
              <router-link
                to="/about"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                :class="{ 'text-gray-900': route.path === '/about' }"
                @click.stop
              >
                {{ t('navAbout') }}
              </router-link>
              <router-link
                v-if="user"
                to="/account/prompts"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                :class="{ 'text-gray-900': route.path.startsWith('/account/prompts') }"
                @click.stop
              >
                {{ t('myPrompts') }}
              </router-link>
              <router-link
                to="/achievements"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                :class="{ 'text-gray-900': route.path === '/achievements' }"
                @click.stop
              >
                {{ t('navAchievements') }}
              </router-link>
            </nav>
          </div>

          <div class="flex items-center shrink-0 space-x-1.5 sm:space-x-2 ml-auto">
            <!-- Streak -->
            <router-link
              v-if="streak > 0"
              to="/achievements"
              class="flex items-center space-x-1 px-2 sm:px-3 py-2 border border-orange-100 rounded-lg bg-orange-50 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-all"
              :title="`${streak} ${t('streakDaysLabel')}`"
              :aria-label="`${streak} ${t('streakDaysLabel')}`"
            >
              <span aria-hidden="true">🔥</span>
              <span>{{ streak }}</span>
            </router-link>
            <!-- Language Selector -->
            <div class="relative">
              <button
                @click.stop="toggleLanguageDropdown"
                class="language-button flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
              >
                <span :class="'fi fi-' + currentLangFlag + ' fis'"></span>
                <span class="text-sm font-medium">{{ currentLangDisplay }}</span>
                <svg class="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div
                v-show="showLanguageDropdown"
                @click.stop
                class="language-dropdown fixed inset-x-4 top-16 z-[100] bg-white border border-gray-100 rounded-xl shadow-lg max-h-80 overflow-y-auto sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-64"
              >
                <div class="p-2">
                  <div v-for="lang in languageOptions" :key="lang.code" class="px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                    <button
                      @click="selectLanguage(lang.code)"
                      class="flex items-center space-x-2 w-full text-left"
                    >
                      <span :class="'fi fi-' + lang.countryCode + ' fis'"></span>
                      <span class="text-sm font-medium text-gray-800">{{ lang.countryCode.toUpperCase() }}</span>
                      <span class="text-sm text-gray-700">{{ lang.native }}</span>
                      <span class="text-xs text-gray-400">({{ lang.name }})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Account -->
            <UserMenu />
            <!-- Menu button -->
            <button
              @click.stop="toggleMobileMenu"
              class="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div
      v-show="showMobileMenu"
      @click="closeMobileMenu"
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
    ></div>
    <div
      v-show="showMobileMenu"
      @click.stop
      class="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-100 z-50 p-4"
    >
      <nav class="flex flex-col space-y-3">
        <router-link
          to="/"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          {{ t('navHome') }}
        </router-link>
        <router-link
          to="/about"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          {{ t('navAbout') }}
        </router-link>
        <router-link
          v-if="user"
          to="/account/prompts"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          {{ t('myPrompts') }}
        </router-link>
        <router-link
          to="/achievements"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          {{ t('navAchievements') }}
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div
        v-if="authNotice"
        role="alert"
        class="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <span>{{ t(authNotice) }}</span>
        <button type="button" @click="authNotice = null" class="text-red-400 hover:text-red-600" aria-label="Close">&times;</button>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[60vh]">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-6 text-center text-gray-400 text-sm">
      <p>a <a href="https://verbeek.ug/" target="_blank" rel="noopener noreferrer">verbeek.ug</a> platform</p>
    </footer>

    <!-- Badge unlocked toasts -->
    <BadgeToast />

    <!-- Cookie Banner -->
    <CookieBanner
      :show="showCookieBanner"
      :language="currentLang"
      @accept="handleCookieAccept"
      @dismiss="handleCookieDismiss"
    />

  </div>
</template>

<style scoped>
/* Additional custom styles can go here */
</style>
