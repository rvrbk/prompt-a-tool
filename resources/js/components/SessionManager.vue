<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import useTranslations from './composables/useTranslations'

// Initialize translations
const { t } = useTranslations()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentSession: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'loadSession', 'sessionSaved'])

// State
const isOpen = ref(props.modelValue)
const sessions = ref([])
const isLoading = ref(false)
const errorMessage = ref(null)
const selectedSessionId = ref(null)
const sessionName = ref('')

// Computed
const hasSessions = computed(() => sessions.value.length > 0)
const hasCurrentSession = computed(() => props.currentSession !== null)

// Watch for prop changes
watch(() => props.modelValue, (value) => {
watch(() => props.modelValue, (value) => {
  isOpen.value = value
  if (value) {
    loadSessions()
  }
})

watch(() => isOpen.value, (value) => {
  emit('update:modelValue', value)
})

// Methods
const loadSessions = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await axios.get('/api/sessions')
    if (response.data.status === 'success') {
      sessions.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load sessions:', error)
    errorMessage.value = 'Failed to load sessions. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    // Safely unwrap refs if `currentSession` contains refs (supports being passed refs or plain objects)
    const unwrap = (v) => (v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'value')) ? v.value : v

    const payload = {
      questionnaire_data: unwrap(props.currentSession?.form) || null,
      generated_data: unwrap(props.currentSession?.generatedData) || null,
      name: sessionName.value || null,
      session_id: unwrap(props.currentSession?.sessionId) || null
    }

    const response = await axios.post('/api/sessions', payload)
    if (response.data.status === 'success') {
      emit('sessionSaved', response.data.data)
      sessionName.value = ''
      loadSessions()
      // Close the modal
      isOpen.value = false
    } else {
      errorMessage.value = response.data.message || 'Failed to save session'
    }
  } catch (error) {
    console.error('Failed to save session:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Failed to save session. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleLoad = async () => {
  if (!selectedSessionId.value) return

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await axios.get(`/api/sessions/${selectedSessionId.value}`)
    if (response.data.status === 'success') {
      emit('loadSession', response.data.data)
      isOpen.value = false
    } else {
      errorMessage.value = response.data.message || 'Failed to load session'
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Failed to load session. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (sessionId) => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await axios.delete(`/api/sessions/${sessionId}`)
    if (response.data.status === 'success') {
      loadSessions()
    } else {
      errorMessage.value = response.data.message || 'Failed to delete session'
    }
  } catch (error) {
    console.error('Failed to delete session:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Failed to delete session. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const truncateName = (name, length = 40) => {
  if (!name) return 'Untitled'
  return name.length > length ? name.substring(0, length) + '...' : name
}

// Auto-select first session if available
const selectFirstSession = () => {
  if (sessions.value.length > 0) {
    selectedSessionId.value = sessions.value[0].session_id
  }
}

// Load sessions when modal opens
watch(() => isOpen.value, (value) => {
  if (value) {
    loadSessions()
  }
})

// Select first session when sessions load
watch(() => sessions.value, (value) => {
  if (value.length > 0) {
    selectedSessionId.value = value[0].session_id
  }
}, { deep: true })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="isOpen = false"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-xl font-bold text-gray-900" id="modal-title">
                {{ t('manageSessions') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ t('saveOrLoadSession') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="px-4 sm:px-6 pb-4">
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Session List -->
        <div class="px-4 sm:px-6 pb-4 max-h-96 overflow-y-auto">
          <div v-if="isLoading && sessions.length === 0" class="flex items-center justify-center py-8">
            <svg class="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <div v-if="!isLoading && !hasSessions" class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-2 text-sm">{{ t('noSessions') }}</p>
          </div>

          <div v-if="hasSessions" class="space-y-3">
            <div
              v-for="session in sessions"
              :key="session.session_id"
              @click="selectedSessionId = session.session_id"
              :class="{
                'bg-green-50 border-green-200': selectedSessionId === session.session_id,
                'bg-white border-gray-200': selectedSessionId !== session.session_id
              }"
              class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center">
                    <input
                      type="radio"
                      :id="'session-' + session.session_id"
                      v-model="selectedSessionId"
                      :value="session.session_id"
                      class="mr-3 h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label :for="'session-' + session.session_id" class="text-sm font-medium text-gray-900 cursor-pointer">
                      {{ truncateName(session.name) }}
                    </label>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    <span>Created: {{ formatDate(session.created_at) }}</span>
                    <span v-if="session.has_generated_data" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                      With Results
                    </span>
                  </div>
                </div>
                <button
                  @click.stop="handleDelete(session.session_id)"
                  class="text-red-500 hover:text-red-700 text-xs flex items-center"
                  title="Delete session"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Save form for current session -->
        <div v-if="hasCurrentSession" class="px-4 sm:px-6 pb-4 border-t border-gray-200">
          <div class="mt-4">
            <label for="sessionName" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('sessionName') }} ({{ t('optional') }})
            </label>
            <input
              type="text"
              id="sessionName"
              v-model="sessionName"
              :placeholder="t('sessionNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
          <button
            v-if="hasCurrentSession"
            @click="handleSave"
            :disabled="isLoading"
            class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:ml-3"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{{ t('saveProgress') }}</span>
          </button>
          <button
            v-if="hasSessions"
            @click="handleLoad"
            :disabled="isLoading || !selectedSessionId"
            class="w-full sm:w-auto px-4 py-2 mt-2 sm:mt-0 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span>{{ t('loadSession') }}</span>
          </button>
          <button
            @click="isOpen = false"
            class="w-full sm:w-auto px-4 py-2 mt-2 sm:mt-0 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
          >
            {{ t('cancelButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
