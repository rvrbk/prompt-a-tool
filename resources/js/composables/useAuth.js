/**
 * Authentication composable
 *
 * Shares the signed-in user across components. Users sign in either via a
 * full page redirect to Google or GitHub (Socialite) or with email and password; in
 * both cases the session cookie does the rest.
 */
import { ref, computed } from 'vue'
import axios from 'axios'

// Module-level state so every component sees the same user
const user = ref(null)
const loading = ref(false)
const loaded = ref(false)
// Whether the header's account panel is open; shared so pages can open it
const menuOpen = ref(false)

export default function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const { data } = await axios.get('/auth/user')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const openSignIn = () => {
    menuOpen.value = true
  }

  // provider: 'google' | 'github'
  const loginWithProvider = (provider) => {
    window.location.href = `/auth/${provider}/redirect`
  }
  const loginWithGoogle = () => loginWithProvider('google')
  const loginWithGitHub = () => loginWithProvider('github')

  /**
   * Turn an axios error into { field: message } so forms can show errors
   * next to the right input. Falls back to a general translation key.
   */
  const toFormErrors = (error) => {
    const status = error.response?.status
    if (status === 422) {
      return Object.fromEntries(
        Object.entries(error.response.data.errors || {}).map(([field, messages]) => [field, messages[0]]),
      )
    }
    if (status === 429) return { general: 'authThrottled' }
    return { general: 'authError' }
  }

  const submit = async (url, payload) => {
    try {
      const { data } = await axios.post(url, payload)
      user.value = data.user
      return null
    } catch (error) {
      return toFormErrors(error)
    }
  }

  // Both resolve to null on success, or an errors object on failure
  const login = (credentials) => submit('/auth/login', credentials)
  const register = (details) => submit('/auth/register', details)

  const logout = async () => {
    try {
      await axios.post('/auth/logout')
    } finally {
      user.value = null
    }
  }

  return { user, loading, loaded, isAuthenticated, menuOpen, openSignIn, fetchUser, loginWithGoogle, loginWithGitHub, login, register, logout }
}
