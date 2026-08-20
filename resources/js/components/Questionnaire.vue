<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import axios from 'axios'
import ResultsDisplay from './ResultsDisplay.vue'
import MobileMoneyPayment from './MobileMoneyPayment.vue'
import useGoogleAnalytics from '../composables/useGoogleAnalytics.js'

// Use translations from App.vue provider
const { t, currentLanguage } = inject('translations')

// Initialize Google Analytics
const { trackFormSubmission, trackButtonClick, trackEvent } = useGoogleAnalytics()

// Form state
const form = ref({
  idea: '',
  followUpAnswers: {},
  offlineAccess: false
})

// Follow-up questions state
const followUpQuestions = ref([])
const currentQuestionIndex = ref(0)
const isLoadingQuestions = ref(false)
const questionsError = ref(null)
const showQuestionsWizard = ref(false)
const questionsGenerationComplete = ref(false)

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

// Payment state
const showPaymentModal = ref(false)
const paymentCountry = ref(null)
const paymentCountryName = ref(null)
const paymentProviders = ref([])
const paymentDefaultPhone = ref('')
const requiresPayment = ref(false)
const freeGenerationsRemaining = ref(0)
const paymentError = ref(null)

// Validation
const validateForm = () => {
  let isValid = true
  
  if (!form.value?.idea?.trim()) {
    errors.value.idea = t('ideaRequired')
    isValid = false
  } else {
    errors.value.idea = ''
  }
  
  return isValid
}

// Abort controller for canceling pending requests
let abortController = null

// Generate follow-up questions from AI
const generateFollowUpQuestions = async () => {
  if (!form.value?.idea?.trim()) {
    followUpQuestions.value = []
    showQuestionsWizard.value = false
    return
  }
  
  // Cancel any pending request
  if (abortController) {
    abortController.abort()
  }
  
  abortController = new AbortController()
  isLoadingQuestions.value = true
  questionsError.value = null
  
  try {
    const response = await axios.post('/api/generate-questions', {
      idea: form.value?.idea,
      language: currentLanguage.value
    }, {
      signal: abortController.signal
    })
    
    if (response.data.status === 'success' && response.data.questions) {
      followUpQuestions.value = response.data.questions
      currentQuestionIndex.value = 0
      if (form.value) form.value.followUpAnswers = {}
      showQuestionsWizard.value = true
    } else {
      followUpQuestions.value = []
      showQuestionsWizard.value = false
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to generate follow-up questions:', error)
      questionsError.value = t('failedToGenerateQuestions')
      followUpQuestions.value = []
      showQuestionsWizard.value = false
    }
  } finally {
    if (!abortController.signal.aborted) {
      isLoadingQuestions.value = false
      questionsGenerationComplete.value = true
    }
    abortController = null
  }
}

// Watch idea changes to generate questions with debounce
let debounceTimer = null

watch(() => form.value.idea, (newIdea) => {
  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  // Clear existing questions immediately when idea changes
  followUpQuestions.value = []
  showQuestionsWizard.value = false
  questionsGenerationComplete.value = false
  
  if (newIdea?.trim()) {
    // Debounce with 2000ms delay
    debounceTimer = setTimeout(() => {
      generateFollowUpQuestions()
      debounceTimer = null
    }, 2000)
  } else {
    // No idea, so questions generation is complete (no questions to generate)
    questionsGenerationComplete.value = true
  }
})

// Navigate between wizard questions
const nextQuestion = () => {
  if (currentQuestionIndex.value < followUpQuestions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// Get current question
const currentQuestion = computed(() => {
  return followUpQuestions.value[currentQuestionIndex.value] || null
})

// Check if all questions are answered
const allQuestionsAnswered = computed(() => {
  return followUpQuestions.value.length === 0 || 
         followUpQuestions.value.every(q => q?.id !== undefined && form.value?.followUpAnswers?.[q.id] !== undefined)
})

// Check if user can generate prompts
const canGenerate = computed(() => {
  return form.value.idea?.trim() &&
         !isSubmitting.value &&
         questionsGenerationComplete.value &&
         (!showQuestionsWizard.value || allQuestionsAnswered.value)
})

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  isSuccess.value = false
  errorMessage.value = null
  paymentError.value = null
  
  try {
    // Check payment status first
    const paymentData = await checkPaymentStatus()
    
    // If payment is required, show payment modal instead
    if (paymentData && paymentData.requires_payment) {
      isSubmitting.value = false
      showPaymentModal.value = true
      return
    }
    
    // Track form submission attempt
    trackFormSubmission('questionnaire')
    
    // Make API call to Laravel backend
    const response = await axios.post('/api/generate-prompts', {
      idea: form.value?.idea,
      followUpAnswers: form.value?.followUpAnswers,
      offlineAccess: form.value?.offlineAccess,
      language: currentLanguage.value
    })
    
    // Track successful form submission
    trackFormSubmission('questionnaire', true)
    
    // Log form data to console (Iteration 1 requirement maintained)
    console.log('Form Data Submitted:', {
      idea: form.value?.idea,
      followUpAnswers: form.value?.followUpAnswers,
      offlineAccess: form.value?.offlineAccess
    })
    
    console.log('API Response:', response.data)
    
    // Store the response data for display
    generatedData.value = response.data
    
    // Update free generations remaining from response
    if (response.data.free_generations_remaining !== undefined) {
      freeGenerationsRemaining.value = response.data.free_generations_remaining
    }
    
    isSuccess.value = true
    showResults.value = true
    
    // Track free generations
    trackEvent('generation_success', {
      free_generations_remaining: freeGenerationsRemaining.value
    })
    
  } catch (error) {
    console.error('API Error:', error)
    
    // Check if it's a payment required error (HTTP 402)
    if (error.response && error.response.status === 402) {
      // Show payment modal for payment required
      if (error.response.data.requires_payment) {
        paymentCountry.value = error.response.data.country
        paymentCountryName.value = error.response.data.country_name
        paymentProviders.value = error.response.data.providers || []
        paymentDefaultPhone.value = error.response.data.default_phone || ''
        requiresPayment.value = true
        
        isSubmitting.value = false
        showPaymentModal.value = true
        return
      }
    }
    
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
    followUpAnswers: {},
    offlineAccess: false
  }
  errors.value = { idea: '' }
  isSuccess.value = false
  generatedData.value = null
  errorMessage.value = null
  showResults.value = false
  followUpQuestions.value = []
  currentQuestionIndex.value = 0
  showQuestionsWizard.value = false
  questionsError.value = null
  questionsGenerationComplete.value = false
  
  // Reset payment state
  showPaymentModal.value = false
  paymentError.value = null
}

// Check payment status before submission
const checkPaymentStatus = async () => {
  try {
    const response = await axios.get('/api/payments/status')
    const data = response.data
    
    paymentCountry.value = data.country
    paymentCountryName.value = data.country_name
    paymentProviders.value = data.providers || []
    paymentDefaultPhone.value = data.default_phone || ''
    requiresPayment.value = data.requires_payment || false
    freeGenerationsRemaining.value = data.free_generations_remaining || 0
    
    trackEvent('payment_status_pre_submit', {
      has_free: data.has_free_generation,
      requires_payment: data.requires_payment,
      country: data.country
    })
    
    return data
  } catch (error) {
    console.error('Failed to check payment status:', error)
    paymentError.value = t('failedToCheckPaymentStatus') || 'Failed to check payment status'
    // Continue without blocking - payment check is optional
    return null
  }
}

// Retry after payment
const handleRetryAfterPayment = () => {
  showPaymentModal.value = false
  paymentError.value = null
  // The form submission will be retried
}
</script>

<template>
  <div class="p-6 lg:p-8">
    <div v-show="!showResults">
      <!-- Title and Description -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {{ t('appTitle') }}
        </h2>
        <p class="text-gray-500 leading-relaxed text-xs">
          {{ t('appDescription') }}
        </p>
      </div>

      <form id="questionnaire-form" @submit.prevent="handleSubmit" class="space-y-8">
      <!-- App Idea -->
      <div class="space-y-3">
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
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white"
        />
        <p v-if="errors.idea" class="text-red-500 text-sm">{{ errors.idea }}</p>
        <p class="text-gray-400 text-sm">
          {{ t('appIdeaHint') }}
        </p>
        <p v-if="isLoadingQuestions" class="text-gray-600 text-sm flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ t('generatingQuestions') }}
        </p>
      </div>

      <!-- AI Follow-up Questions Wizard -->
      <div v-if="showQuestionsWizard && followUpQuestions.length > 0" class="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base font-semibold text-gray-800">
            {{ t('followUpQuestions') }}
          </h4>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">
              {{ currentQuestionIndex + 1 }} / {{ followUpQuestions.length }}
            </span>
          </div>
        </div>
        
        <!-- Question Display -->
        <div v-if="currentQuestion" class="bg-white p-5 rounded-xl border border-gray-200">
          <p class="text-gray-700 font-medium mb-4">
            {{ currentQuestion?.question }}
          </p>
          
          <!-- Multiple Choice -->
          <div v-if="currentQuestion?.type === 'multiple_choice' && currentQuestion?.options" class="space-y-3">
            <label 
              v-for="option in currentQuestion?.options" 
              :key="option"
              class="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
              :class="{
                'border-gray-900 bg-gray-50': form.followUpAnswers?.[currentQuestion?.id] === option
              }"
            >
              <input
                type="radio"
                :name="'q-' + currentQuestion?.id"
                :value="option"
                v-model="form.followUpAnswers[currentQuestion?.id]"
                class="mr-3 h-4 w-4 text-gray-900"
              />
              <span class="text-gray-700">{{ option }}</span>
            </label>
          </div>
          
          <!-- Text Input -->
          <div v-else-if="currentQuestion?.type === 'text'" class="mt-2">
            <textarea
              v-model="form.followUpAnswers[currentQuestion?.id]"
              :placeholder="currentQuestion?.placeholder || t('enterYourAnswer')"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all bg-white"
            />
          </div>
          
          <!-- Yes/No -->
          <div v-else-if="currentQuestion?.type === 'boolean'" class="flex gap-4 mt-2">
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                :name="'q-' + currentQuestion?.id"
                :value="true"
                v-model="form.followUpAnswers[currentQuestion?.id]"
                class="mr-2 h-4 w-4 text-gray-900"
              />
              <span class="text-gray-700">{{ t('yes') }}</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                :name="'q-' + currentQuestion?.id"
                :value="false"
                v-model="form.followUpAnswers[currentQuestion?.id]"
                class="mr-2 h-4 w-4 text-gray-900"
              />
              <span class="text-gray-700">{{ t('no') }}</span>
            </label>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="isLoadingQuestions" class="flex items-center justify-center py-6">
          <svg class="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="ml-2 text-gray-600">{{ t('generatingQuestions') }}...</span>
        </div>
        
        <!-- Error state -->
        <div v-if="questionsError" class="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ questionsError }}</p>
        </div>
        
        <!-- Navigation -->
        <div v-if="!isLoadingQuestions && !questionsError" class="flex justify-between items-center pt-4">
          <button
            type="button"
            @click="prevQuestion"
            :disabled="currentQuestionIndex === 0"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('previous') }}
          </button>
          <button
            type="button"
            @click="nextQuestion"
            :disabled="currentQuestionIndex >= followUpQuestions.length - 1"
            class="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('next') }}
          </button>
        </div>
      </div>
      
      <!-- Offline Access -->
      <div class="space-y-3 pt-4 border-t border-gray-200">
        <label class="block text-sm font-medium text-gray-700">
          {{ t('offlineAccessLabel') }}
        </label>
        <div class="flex space-x-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="true"
              class="mr-3 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span class="text-sm text-gray-700">{{ t('yes') }}</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="false"
              class="mr-3 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span class="text-sm text-gray-700">{{ t('no') }}</span>
          </label>
        </div>
        <p class="text-gray-400 text-sm">
          {{ t('offlineAccessHint') }}
        </p>
      </div>

      <!-- Submit and Reset Buttons -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">
        <div class="flex items-center gap-4">
          <button
            type="submit"
            :disabled="!canGenerate"
            class="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
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
            class="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all"
          >
            {{ t('reset') }}
          </button>
        </div>
        
        <p v-if="showQuestionsWizard && !allQuestionsAnswered" class="text-orange-500 text-sm">
          {{ t('pleaseAnswerAllQuestions') }}
        </p>
      </div>
    </form>

    <!-- Error Display -->
    <div v-if="errorMessage" class="mt-6 p-5 bg-red-50 border border-red-200 rounded-xl">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700">{{ errorMessage }}</p>
        <button @click="errorMessage = null" class="ml-auto text-red-400 hover:text-red-600 p-1">
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
      :followUpQuestions="followUpQuestions"
      @close="showResults = false"
    />
    
    <!-- Success Message (falls back to old display if needed) -->
    <div v-if="isSuccess && !showResults && generatedData" class="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-green-700">{{ generatedData.message || t('promptsGenerated') }}</p>
        <button @click="showResults = true" class="ml-auto px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
          Show Results
        </button>
      </div>
    </div>
    </div>

    <!-- Results Display -->
    <ResultsDisplay 
      v-if="showResults" 
      :generatedData="generatedData" 
      :isVisible="showResults" 
      :questionnaireData="form"
      :followUpQuestions="followUpQuestions"
      @close="showResults = false"
    />

    <!-- Mobile Money Payment Modal -->
    <MobileMoneyPayment
      :show="showPaymentModal"
      :country="paymentCountry"
      :countryName="paymentCountryName"
      :providers="paymentProviders"
      :defaultPhone="paymentDefaultPhone"
      :requiresPayment="requiresPayment"
      :freeGenerationsRemaining="freeGenerationsRemaining"
      @close="showPaymentModal = false"
      @retry="handleSubmit"
    />
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
