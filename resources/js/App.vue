<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CookieBanner from './components/CookieBanner.vue'
import useTranslations from './composables/useTranslations.js'
import useGoogleAnalytics from './composables/useGoogleAnalytics.js'

// Initialize translations with auto-detection and cookie support
const { 
  t, 
  setLanguage, 
  getLanguageOptions, 
  getCurrentLanguage, 
  getLanguageName, 
  getLanguageFlag, 
  SUPPORTED_LANGUAGES,
  getLanguageFromCookie
} = useTranslations(undefined, { 
  useCookies: true, 
  useLocalStorage: true,
  autoDetect: true 
})

// Language selector state
const showLanguageDropdown = ref(false)
const languageOptions = getLanguageOptions()

// Cookie banner state
const showCookieBanner = ref(false)
const cookieConsentGiven = ref(false)

// Check if cookie was just set by auto-detection
const checkCookieConsent = () => {
  const cookieLang = getLanguageFromCookie()
  
  // If a cookie exists and we haven't shown consent yet, don't show banner
  // Show banner only when we auto-detect and set a new cookie
  if (cookieLang) {
    cookieConsentGiven.value = true
    showCookieBanner.value = false
  } else {
    // Check localStorage for consent
    const consent = localStorage.getItem('prompt-generator-cookie-consent')
    if (!consent) {
      // No consent recorded, but we might have set a cookie via auto-detect
      // Only show banner if language was auto-detected (not from localStorage)
      const storedLang = localStorage.getItem('prompt-generator-lang')
      if (!storedLang) {
        showCookieBanner.value = true
      }
    } else {
      cookieConsentGiven.value = true
    }
  }
}

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const selectLanguage = (langCode) => {
  setLanguage(langCode)
  showLanguageDropdown.value = false
  // Update cookie consent when user explicitly changes language
  if (showCookieBanner.value) {
    handleCookieAccept()
  }
}

const currentLang = computed(() => getCurrentLanguage())
const currentLangNative = computed(() => getLanguageName(currentLang.value))

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
}

const handleCookieDismiss = () => {
  showCookieBanner.value = false
  // User dismissed without accepting - we still keep the cookie for language
  // but mark that they dismissed the banner
  localStorage.setItem('prompt-generator-cookie-consent', 'dismissed')
}

// Initialize on mount
onMounted(() => {
  checkCookieConsent()
})

// Watch for language changes to update cookie consent state
watch(currentLang, () => {
  if (cookieConsentGiven.value) {
    showCookieBanner.value = false
  }
})

// Initialize Google Analytics
useGoogleAnalytics()

const route = useRoute()

// Mobile menu state
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 flex-wrap gap-2">
          <div class="flex items-center space-x-4 sm:space-x-6 flex-wrap">
            <router-link to="/" class="flex items-center space-x-3" @click.stop="closeMobileMenu">
              <svg class="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 class="text-lg font-semibold text-gray-900 tracking-tight">Prompt Generator</h1>
            </router-link>
            <nav class="hidden md:flex items-center space-x-6">
              <router-link
                to="/about"
                class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                :class="{ 'text-gray-900': route.path === '/about' }"
                @click.stop
              >
                About
              </router-link>
            </nav>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Language Selector -->
            <div class="relative">
              <button
                @click.stop="toggleLanguageDropdown"
                class="language-button flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
              >
                <span :class="'fi fi-' + (SUPPORTED_LANGUAGES[currentLang]?.countryCode || 'us') + ' fis'"></span>
                <span class="text-sm font-medium">{{ (SUPPORTED_LANGUAGES[currentLang]?.countryCode || 'EN').toUpperCase() }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div
                v-show="showLanguageDropdown"
                @click.stop
                class="language-dropdown absolute z-[100] mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg max-h-80 overflow-y-auto right-0"
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

            <!-- Mobile menu button - visible only on screens below 768px -->
            <button
              @click.stop="toggleMobileMenu"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
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
        <div class="border-b border-gray-100 pb-3 mb-3">
          <div v-for="lang in languageOptions" :key="lang.code" class="py-2">
            <button
              @click="selectLanguage(lang.code); closeMobileMenu()"
              class="flex items-center space-x-2 w-full text-left text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <span :class="'fi fi-' + lang.countryCode + ' fis'"></span>
              <span>{{ lang.native }} ({{ lang.name }})</span>
            </button>
          </div>
        </div>
        <router-link
          to="/"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          Home
        </router-link>
        <router-link
          to="/about"
          class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors py-2"
          @click="closeMobileMenu"
        >
          About
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[60vh]">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-6 text-center text-gray-400 text-sm">
      <p>a verbeek.ug platform</p>
    </footer>

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
