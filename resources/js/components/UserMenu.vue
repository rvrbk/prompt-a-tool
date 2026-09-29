<script setup>
import { ref, reactive, computed, inject, nextTick, watch, onMounted, onUnmounted } from 'vue'
import useAuth from '../composables/useAuth.js'

const { t } = inject('translations')
const { user, loaded, isAuthenticated, menuOpen: open, fetchUser, loginWithGoogle, loginWithGitHub, login, register, logout } = useAuth()
const menuRef = ref(null)

// Sign-in panel state
const mode = ref('login') // login | register
const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref({})
const submitting = ref(false)
const showPassword = ref(false)

const initials = computed(() => {
  const name = user.value?.name || user.value?.email || '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const canSubmit = computed(() => {
  if (submitting.value || !form.email.trim() || !form.password) return false
  if (mode.value === 'register') return !!form.name.trim() && !!form.password_confirmation
  return true
})

const focusFirstInput = async () => {
  await nextTick()
  // Skip autofocus on touch devices so the keyboard doesn't cover the panel
  if (window.matchMedia('(pointer: fine)').matches) {
    document.getElementById(mode.value === 'register' ? 'auth-name' : 'auth-email')?.focus()
  }
}

const toggleOpen = () => {
  open.value = !open.value
}

const close = () => {
  open.value = false
}

const setMode = (newMode) => {
  mode.value = newMode
  errors.value = {}
  focusFirstInput()
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  errors.value = {}

  const payload = mode.value === 'register'
    ? { ...form, email: form.email.trim(), name: form.name.trim() }
    : { email: form.email.trim(), password: form.password }

  const result = await (mode.value === 'register' ? register(payload) : login(payload))
  submitting.value = false

  if (result) {
    errors.value = result
    return
  }

  // Signed in: clear sensitive fields and close
  Object.assign(form, { name: '', email: '', password: '', password_confirmation: '' })
  showPassword.value = false
  close()
}

const handleLogout = async () => {
  close()
  await logout()
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) close()
}

const handleEscape = (event) => {
  if (event.key === 'Escape') close()
}

// Prevent the page behind the full-width mobile panel from scrolling
const isMobile = () => window.matchMedia('(max-width: 639px)').matches
watch(open, (isOpen) => {
  if (isOpen && !isAuthenticated.value) focusFirstInput()
  document.body.style.overflow = isOpen && !isAuthenticated.value && isMobile() ? 'hidden' : ''
})

onMounted(() => {
  if (!loaded.value) fetchUser()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

const inputClass = (field) => [
  'w-full px-3 py-2.5 border rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400',
  errors.value[field] ? 'border-red-300' : 'border-gray-200',
]
</script>

<template>
  <div ref="menuRef" class="relative">
    <!-- Placeholder while the session check is in flight, avoids a button flash -->
    <div v-if="!loaded" class="w-9 h-9 rounded-full bg-gray-100 animate-pulse" aria-hidden="true"></div>

    <!-- Signed out -->
    <template v-else-if="!isAuthenticated">
      <button
        type="button"
        @click.stop="toggleOpen"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :aria-label="t('authSignIn')"
        class="flex items-center gap-2 p-2 sm:px-3 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
      >
        <svg class="w-5 h-5 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="hidden sm:inline">{{ t('authSignIn') }}</span>
      </button>

      <!-- Mobile backdrop -->
      <div v-show="open" @click="close" class="fixed inset-0 top-16 bg-black/40 z-[90] sm:hidden" aria-hidden="true"></div>

      <!-- Panel: full-width sheet under the header on mobile, dropdown on larger screens -->
      <div
        v-show="open"
        role="dialog"
        aria-modal="true"
        :aria-label="mode === 'login' ? t('authSignIn') : t('authCreateAccount')"
        class="fixed inset-x-0 top-16 z-[100] max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white border-b border-gray-100 shadow-lg p-4
               sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96 sm:max-h-[calc(100dvh-6rem)] sm:rounded-xl sm:border sm:p-5"
      >
        <!-- Tabs -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex flex-1 p-1 bg-gray-100 rounded-lg" role="tablist">
            <button
              v-for="tab in [{ key: 'login', label: t('authSignIn') }, { key: 'register', label: t('authCreateAccount') }]"
              :key="tab.key"
              type="button"
              role="tab"
              :aria-selected="mode === tab.key"
              @click="setMode(tab.key)"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="mode === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              {{ tab.label }}
            </button>
          </div>
          <button type="button" @click="close" :aria-label="t('authClose')" class="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 sm:hidden">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          @click="loginWithGoogle"
          class="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{{ t('authSignInGoogle') }}</span>
        </button>

        <button
          type="button"
          @click="loginWithGitHub"
          class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1C5.92 1 1 5.92 1 12c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.86c-3.06.66-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.69 2.58 1.2 3.2.92.1-.71.39-1.2.7-1.47-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04v3.02c0 .29.2.64.76.53A11 11 0 0 0 23 12c0-6.08-4.92-11-11-11z" />
          </svg>
          <span>{{ t('authSignInGitHub') }}</span>
        </button>

        <div class="flex items-center my-4" aria-hidden="true">
          <div class="flex-1 border-t border-gray-100"></div>
          <span class="px-3 text-xs uppercase tracking-wide text-gray-400">{{ t('authOr') }}</span>
          <div class="flex-1 border-t border-gray-100"></div>
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="space-y-3">
          <p v-if="errors.general" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{{ t(errors.general) }}</p>

          <div v-if="mode === 'register'">
            <label for="auth-name" class="block text-xs font-medium text-gray-600 mb-1">{{ t('authNameLabel') }}</label>
            <input
              id="auth-name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              required
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'auth-name-error' : undefined"
              :class="inputClass('name')"
            />
            <p v-if="errors.name" id="auth-name-error" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="auth-email" class="block text-xs font-medium text-gray-600 mb-1">{{ t('authEmailLabel') }}</label>
            <input
              id="auth-email"
              v-model="form.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              autocapitalize="off"
              spellcheck="false"
              required
              :placeholder="t('authEmailPlaceholder')"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'auth-email-error' : undefined"
              :class="inputClass('email')"
            />
            <p v-if="errors.email" id="auth-email-error" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="auth-password" class="block text-xs font-medium text-gray-600 mb-1">{{ t('authPasswordLabel') }}</label>
            <div class="relative">
              <input
                id="auth-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                required
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'auth-password-error' : (mode === 'register' ? 'auth-password-hint' : undefined)"
                :class="[inputClass('password'), 'pr-10']"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? t('authHidePassword') : t('authShowPassword')"
                :aria-pressed="showPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.46 12C3.73 7.94 7.52 5 12 5c4.48 0 8.27 2.94 9.54 7-1.27 4.06-5.06 7-9.54 7-4.48 0-8.27-2.94-9.54-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.88 18.82A10.05 10.05 0 0112 19c-4.48 0-8.27-2.94-9.54-7a9.97 9.97 0 011.56-3.03m5.86.9a3 3 0 114.24 4.24M9.88 9.88L3 3m6.88 6.88l4.24 4.24M21 21l-6.88-6.88m0 0A9.95 9.95 0 0121.54 12 10.03 10.03 0 0017.1 6.9" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" id="auth-password-error" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
            <p v-else-if="mode === 'register'" id="auth-password-hint" class="mt-1 text-xs text-gray-400">{{ t('authPasswordHint') }}</p>
          </div>

          <div v-if="mode === 'register'">
            <label for="auth-password-confirm" class="block text-xs font-medium text-gray-600 mb-1">{{ t('authPasswordConfirmLabel') }}</label>
            <input
              id="auth-password-confirm"
              v-model="form.password_confirmation"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              :class="inputClass('password_confirmation')"
            />
          </div>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="w-full px-3 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <template v-if="submitting">{{ t('authSubmitting') }}</template>
            <template v-else>{{ mode === 'login' ? t('authSubmitLogin') : t('authSubmitRegister') }}</template>
          </button>
        </form>
      </div>
    </template>

    <!-- Signed in -->
    <template v-else>
      <button
        type="button"
        @click.stop="toggleOpen"
        :aria-expanded="open"
        aria-haspopup="menu"
        :aria-label="t('authAccountMenu')"
        class="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      >
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.name"
          referrerpolicy="no-referrer"
          class="w-9 h-9 rounded-full border border-gray-200 object-cover"
        />
        <span
          v-else
          class="w-9 h-9 rounded-full bg-gray-800 text-white text-sm font-medium flex items-center justify-center"
        >
          {{ initials }}
        </span>
      </button>

      <div
        v-show="open"
        role="menu"
        class="absolute right-0 z-[100] mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
        </div>
        <div class="p-2">
          <router-link
            to="/account/prompts"
            role="menuitem"
            @click="close"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {{ t('myPrompts') }}
          </router-link>
          <button
            type="button"
            role="menuitem"
            @click="handleLogout"
            class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ t('authSignOut') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
