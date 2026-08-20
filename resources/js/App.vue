<script setup>
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import CookieBanner from './components/CookieBanner.vue'
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'
import useTranslations from './composables/useTranslations.js'
import useGoogleAnalytics from './composables/useGoogleAnalytics.js'
import usePWA from './composables/usePWA.js'

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
}

const handleCookieDismiss = () => {
  showCookieBanner.value = false
  // User dismissed without accepting - we still keep the cookie for language
  // but mark that they dismissed the banner
  localStorage.setItem('prompt-generator-cookie-consent', 'dismissed')
}

// Watch for language changes to update cookie consent state
watch(currentLang, () => {
  if (cookieConsentGiven.value) {
    showCookieBanner.value = false
  }
})

// Initialize Google Analytics
useGoogleAnalytics()

// Initialize PWA
const {
  isPWAInstalled,
  canInstallPWA,
  showInstallPrompt,
  isOffline,
  hasUpdates,
  newVersionAvailable,
  showInstallationPrompt,
  checkPWAInstalled,
  updateServiceWorker,
  requestNotificationPermission,
} = usePWA();

// PWA state for UI
const showPWAInstallPrompt = ref(false);
const showUpdatePrompt = ref(false);
const showOfflineToast = ref(false);

// Watch for PWA installation prompt
watch(showInstallPrompt, (newVal) => {
  if (newVal) {
    showPWAInstallPrompt.value = true;
  }
});

// Watch for updates
watch(newVersionAvailable, (newVal) => {
  if (newVal) {
    showUpdatePrompt.value = true;
  }
});

// Watch for offline/online status
watch(isOffline, (newVal) => {
  if (newVal) {
    showOfflineToast.value = true;
    setTimeout(() => {
      showOfflineToast.value = false;
    }, 3000);
  }
});

// Handle PWA install
const handlePWAInstall = () => {
  showInstallationPrompt();
  showPWAInstallPrompt.value = false;
};

// Handle PWA dismiss
const handlePWADismiss = () => {
  showPWAInstallPrompt.value = false;
};

// Handle update now
const handleUpdateNow = async () => {
  const success = await updateServiceWorker();
  if (!success) {
    // Fallback: just reload
    window.location.reload();
  }
  showUpdatePrompt.value = false;
};

// Dismiss update prompt
const handleUpdateDismiss = () => {
  showUpdatePrompt.value = false;
};

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
              <h1 :class="[titleClass, 'font-semibold text-gray-900 tracking-tight']">{{ t('appTitle') }}</h1>
            </router-link>
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
            </nav>
          </div>

          <div class="flex items-center space-x-2 ml-auto">
            <!-- Language Selector -->
            <div class="relative">
              <button
                @click.stop="toggleLanguageDropdown"
                class="language-button flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
              >
                <span :class="'fi fi-' + currentLangFlag + ' fis'"></span>
                <span class="text-sm font-medium">{{ currentLangDisplay }}</span>
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
            <!-- Menu button -->
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

    <!-- PWA Install Prompt -->
    <PWAInstallPrompt
      :show="showPWAInstallPrompt"
      :language="currentLang"
      @install="handlePWAInstall"
      @dismiss="handlePWADismiss"
    />

    <!-- Update Available Toast -->
    <div
      v-if="showUpdatePrompt"
      class="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-xs z-[1000]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">{{ t('pwaUpdateAvailable') || 'Update Available' }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ t('pwaUpdateDescription') || 'A new version is available' }}</p>
          <div class="flex gap-2 mt-3">
            <button
              @click="handleUpdateNow"
              class="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {{ t('pwaUpdateButton') || 'Update Now' }}
            </button>
            <button
              @click="handleUpdateDismiss"
              class="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {{ t('pwaDismissButton') || 'Later' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Offline Toast -->
    <div
      v-if="showOfflineToast"
      class="fixed bottom-6 left-6 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-xs z-[1000]"
    >
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">{{ t('pwaOfflineMessage') || 'You are offline' }}</p>
        </div>
      </div>
    </div>

    <!-- PWA Installation Badge (for browsers that support it) -->
    <div
      v-if="canInstallPWA && !isPWAInstalled"
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-[999] cursor-pointer hover:bg-gray-800 transition-colors"
      @click="showPWAInstallPrompt = true"
    >
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        {{ t('pwaInstallButton') || 'Install App' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles can go here */
</style>
