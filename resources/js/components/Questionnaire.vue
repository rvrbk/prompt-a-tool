<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import ResultsDisplay from './ResultsDisplay.vue'
import useTranslations from '../composables/useTranslations.js'
import useGoogleAnalytics from '../composables/useGoogleAnalytics.js'

// Initialize translations
const { t, setLanguage, getLanguageOptions, getCurrentLanguage, getLanguageName, getLanguageFlag } = useTranslations()

// Initialize Google Analytics
const { trackFormSubmission, trackButtonClick, trackEvent } = useGoogleAnalytics()

// Load saved language from localStorage
onMounted(() => {
  const savedLang = localStorage.getItem('africa-prompt-lang')
  if (savedLang) {
    setLanguage(savedLang)
  }
})

// Language selector state
const showLanguageDropdown = ref(false)
const languageOptions = getLanguageOptions()

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const selectLanguage = (langCode) => {
  setLanguage(langCode)
  showLanguageDropdown.value = false
}

const currentLang = computed(() => getCurrentLanguage())
const currentLangDisplay = computed(() => {
  const lang = languageOptions.find(l => l.code === currentLang.value)
  return lang ? lang.display : 'English'
})



// Form state
const form = ref({
  idea: '',
  offlineAccess: false
})

// Validation state
const errors = ref({
  idea: ''
})

// Loading state
const isSubmitting = ref(false)

// Success state
const isSuccess = ref(false)
const generatedData = ref(null)
const showResults = ref(false)

// Error state
const errorMessage = ref(null)

// Validation
const validateForm = () => {
  let isValid = true
  
  if (!form.value.idea.trim()) {
    errors.value.idea = t('ideaRequired')
    isValid = false
  } else {
    errors.value.idea = ''
  }
  
  return isValid
}

// Close all dropdowns
const closeAllDropdowns = () => {
  showLanguageDropdown.value = false
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  isSuccess.value = false
  errorMessage.value = null
  
  try {
    // Track form submission attempt
    trackFormSubmission('questionnaire')
    
    // Make API call to Laravel backend
    const response = await axios.post('/api/generate-prompts', {
      idea: form.value.idea,
      offlineAccess: form.value.offlineAccess
    })
    
    // Track successful form submission
    trackFormSubmission('questionnaire', true)
    
    // Log form data to console (Iteration 1 requirement maintained)
    console.log('Form Data Submitted:', {
      idea: form.value.idea,
      offlineAccess: form.value.offlineAccess
    })
    
    console.log('API Response:', response.data)
    
    // Store the response data for display
    generatedData.value = response.data
    
    isSuccess.value = true
    showResults.value = true
  } catch (error) {
    console.error('API Error:', error)
    
    // Track failed form submission
    trackFormSubmission('questionnaire', false, {
      error_type: error.response ? 'server_error' : (error.request ? 'network_error' : 'client_error'),
      error_message: error.message
    })
    
    if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage.value = `${t('serverError')}: ${error.response.data.message || t('serverError')}`
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage.value = t('noResponse')
    } else {
      // Something happened in setting up the request
      errorMessage.value = `${t('serverError')}: ${error.message}`
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    idea: '',
    offlineAccess: false
  }
  errors.value = { idea: '' }
  isSuccess.value = false
  generatedData.value = null
  errorMessage.value = null
  showResults.value = false
}
</script>

<template>
  <div class="p-6 lg:p-8" @click="closeAllDropdowns">
    <!-- Language Selector -->
    <div class="mb-4 flex justify-end">
      <div class="relative">
        <button
          @click.stop="toggleLanguageDropdown"
          class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <span>{{ currentLangDisplay }}</span>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div
          v-show="showLanguageDropdown"
          @click.stop
          class="absolute z-[100] mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto right-0"
        >
          <div class="p-2">
            <div v-for="lang in languageOptions" :key="lang.code" class="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded">
              <button
                @click="selectLanguage(lang.code)"
                class="flex items-center space-x-2 w-full text-left"
              >
                <span>{{ lang.flag }}</span>
                <span class="text-sm text-gray-700">{{ lang.native }}</span>
                <span class="text-xs text-gray-500">({{ lang.name }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Title and Description -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        {{ t('appTitle') }}
      </h2>
      <p class="text-gray-600">
        {{ t('appDescription') }}
      </p>
    </div>

    <form id="questionnaire-form" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- App Idea -->
      <div class="space-y-2">
        <label for="idea" class="block text-sm font-medium text-gray-700">
          {{ t('appIdeaLabel') }} <span class="text-red-500">*</span>
        </label>
        <textarea
          id="idea"
          v-model="form.idea"
          :class="{
            'border-red-500': errors.idea,
            'border-gray-300': !errors.idea
          }"
          rows="4"
          :placeholder="t('appIdeaPlaceholder')"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
        />
        <p v-if="errors.idea" class="text-red-500 text-sm">{{ errors.idea }}</p>
        <p class="text-gray-500 text-sm">
          {{ t('appIdeaHint') }}
        </p>
      </div>

      <!-- Offline Access -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t('offlineAccessLabel') }}
        </label>
        <div class="flex space-x-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="true"
              class="mr-3 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-700">{{ t('yes') }}</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="false"
              class="mr-3 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-700">{{ t('no') }}</span>
          </label>
        </div>
        <p class="text-gray-500 text-sm">
          {{ t('offlineAccessHint') }}
        </p>
      </div>

      <!-- Submit and Reset Buttons -->
      <div class="flex space-x-4 pt-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span v-if="!isSubmitting">{{ t('generatePrompts') }}</span>
          <span v-else>{{ t('generating') }}</span>
        </button>
        
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
        >
          {{ t('reset') }}
        </button>
      </div>
    </form>

    <!-- Error Display -->
    <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700">{{ errorMessage }}</p>
        <button @click="errorMessage = null" class="ml-auto text-red-500 hover:text-red-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Results Display -->
    <ResultsDisplay 
      v-if="showResults" 
      :generatedData="generatedData" 
      :isVisible="showResults" 
      :questionnaireData="form"
      @close="showResults = false"
    />
    
    <!-- Success Message (falls back to old display if needed) -->
    <div v-if="isSuccess && !showResults && generatedData" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-green-700">{{ generatedData.message || 'Prompts generated successfully!' }}</p>
        <button @click="showResults = true" class="ml-auto px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
          Show Results
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for dropdowns */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
