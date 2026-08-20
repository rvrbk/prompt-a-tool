<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import axios from 'axios'
import useGoogleAnalytics from '../composables/useGoogleAnalytics.js'

// Use translations from App.vue provider
const { t, currentLanguage } = inject('translations')

// Initialize Google Analytics
const { trackButtonClick, trackEvent } = useGoogleAnalytics()

// State
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  country: {
    type: String,
    default: null
  },
  countryName: {
    type: String,
    default: null
  },
  providers: {
    type: Array,
    default: () => []
  },
  defaultPhone: {
    type: String,
    default: ''
  },
  requiresPayment: {
    type: Boolean,
    default: false
  },
  freeGenerationsRemaining: {
    type: Number,
    default: 0
  },
  onClose: {
    type: Function,
    default: () => {}
  },
  onRetry: {
    type: Function,
    default: () => {}
  }
})

const emit = defineEmits(['close', 'retry', 'override-country'])

// Local state
const isLoading = ref(false)
const errorMessage = ref(null)
const paymentStatus = ref(null)
const selectedCountry = ref(props.country || '')
const phoneNumber = ref(props.defaultPhone || '')
const paymentInstructions = ref('')
const availableCountries = ref([])
const showCountryOverride = ref(false)
const overrideCountryCode = ref('')
const showSimulatePayment = ref(false)

// Get country flag
const getCountryFlag = (code) => {
  if (!code) return 'us'
  return code.toLowerCase()
}

// Format phone number for display
const formattedPhone = computed(() => {
  if (!phoneNumber.value) return ''
  let phone = phoneNumber.value.replace(/[^\d+]/g, '')
  
  // If it starts with 00, replace with +
  if (phone.startsWith('00')) {
    phone = '+' + phone.substring(2)
  }
  
  return phone
})

// Check if payment is configured
const isMobileMoneyConfigured = computed(() => {
  return !!props.defaultPhone
})

// Check if user can make payment
const canMakePayment = computed(() => {
  return isMobileMoneyConfigured.value && props.requiresPayment && props.country
})

// Country override options (African countries)
const africanCountries = ref([
  { code: 'NG', name: 'Nigeria', providers: ['MTN', 'Glo', 'Airtel', '9Mobile'] },
  { code: 'GH', name: 'Ghana', providers: ['MTN', 'Vodafone', 'AirtelTigo'] },
  { code: 'KE', name: 'Kenya', providers: ['M-Pesa', 'Airtel Money', 'T-Kash'] },
  { code: 'TZ', name: 'Tanzania', providers: ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa'] },
  { code: 'UG', name: 'Uganda', providers: ['MTN Mobile Money', 'Airtel Money', 'AfraMobile Money'] },
  { code: 'RW', name: 'Rwanda', providers: ['MTN Mobile Money', 'Airtel Money'] },
  { code: 'CM', name: 'Cameroon', providers: ['MTN Mobile Money', 'Orange Money'] },
  { code: 'SN', name: 'Senegal', providers: ['Orange Money', 'Wave'] },
  { code: 'CI', name: 'Cote d\'Ivoire', providers: ['MTN Mobile Money', 'Orange Money', 'Wave'] },
  { code: 'ZA', name: 'South Africa', providers: ['MTN Mobile Money', 'Vodacom M-Pesa'] },
])

// Check payment status on mount
const checkPaymentStatus = async () => {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.get('/api/payments/status')
    paymentStatus.value = response.data
    
    // Update local state based on response
    if (response.data.country) {
      selectedCountry.value = response.data.country
    }
    if (response.data.default_phone) {
      phoneNumber.value = response.data.default_phone
    }
    
    trackEvent('payment_status_check', {
      country: response.data.country,
      has_free: response.data.has_free_generation,
      requires_payment: response.data.requires_payment
    })
    
  } catch (error) {
    console.error('Failed to check payment status:', error)
    errorMessage.value = t('failedToCheckPaymentStatus') || 'Failed to check payment status'
  } finally {
    isLoading.value = false
  }
}

// Simulate payment (for development only)
const simulatePayment = async () => {
  if (!showSimulatePayment.value) return
  
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.post('/api/payments/simulate')
    
    if (response.data.status === 'success') {
      showSimulatePayment.value = false
      emit('retry')
      
      trackEvent('payment_simulated', {
        has_free: response.data.has_free,
        remaining: response.data.remaining
      })
    } else {
      errorMessage.value = response.data.message || 'Payment simulation failed'
    }
  } catch (error) {
    console.error('Payment simulation failed:', error)
    errorMessage.value = error.response?.data?.message || t('paymentSimulationFailed') || 'Payment simulation failed'
  } finally {
    isLoading.value = false
  }
}

// Set country override for testing
const setCountryOverride = async () => {
  if (!overrideCountryCode.value) return
  
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.post('/api/payments/override-country', {
      country_code: overrideCountryCode.value
    })
    
    if (response.data.status === 'success') {
      selectedCountry.value = overrideCountryCode.value
      showCountryOverride.value = false
      overrideCountryCode.value = ''
      
      // Refresh payment status
      await checkPaymentStatus()
      
      trackEvent('country_override_set', {
        country_code: response.data.country_code
      })
    }
  } catch (error) {
    console.error('Failed to set country override:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to set country override'
  } finally {
    isLoading.value = false
  }
}

// Clear country override
const clearCountryOverride = async () => {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.post('/api/payments/clear-override')
    
    if (response.data.status === 'success') {
      // Refresh payment status
      await checkPaymentStatus()
      
      trackEvent('country_override_cleared')
    }
  } catch (error) {
    console.error('Failed to clear country override:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to clear country override'
  } finally {
    isLoading.value = false
  }
}

// Copy phone number to clipboard
const copyPhoneNumber = () => {
  if (!phoneNumber.value) return
  
  navigator.clipboard.writeText(phoneNumber.value)
    .then(() => {
      trackEvent('phone_number_copied', {
        phone: phoneNumber.value
      })
    })
    .catch(err => {
      console.error('Failed to copy:', err)
    })
}

// Close the modal
const handleClose = () => {
  errorMessage.value = null
  emit('close')
}

// Retry generation
const handleRetry = () => {
  emit('retry')
  handleClose()
}

// Toggle country override
const toggleCountryOverride = () => {
  showCountryOverride.value = !showCountryOverride.value
}

// Select a country from the override list
const selectOverrideCountry = (code) => {
  overrideCountryCode.value = code
  setCountryOverride()
}

// Check if app is in development mode
const isDevMode = computed(() => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port !== ''
})

// Get payment instructions
const getPaymentInstructions = computed(() => {
  if (!props.country || !props.providers || props.providers.length === 0) {
    return t('mobileMoneyPaymentInstructionsGeneric') || 
           `Send Mobile Money payment to ${formattedPhone.value} to access more generations.`
  }
  
  const providerList = props.providers.join(', ')
  return t('mobileMoneyPaymentInstructionsWithProvider') || 
         `Send Mobile Money payment via ${providerList} to ${formattedPhone.value} to access more generations.`
})

// Fetch available countries
const fetchAvailableCountries = async () => {
  try {
    const response = await axios.get('/api/payments/countries')
    if (response.data.status === 'success') {
      availableCountries.value = response.data.countries
    }
  } catch (error) {
    console.error('Failed to fetch countries:', error)
  }
}

// Handle component visibility
const shouldShow = computed(() => {
  return props.show && props.requiresPayment
})

// Check if the user is from an African country
const isFromAfricanCountry = computed(() => {
  return props.country && africanCountries.value.some(c => c.code === props.country)
})

// Life cycle hooks
onMounted(() => {
  checkPaymentStatus()
  fetchAvailableCountries()
  
  // Show simulate payment button only in dev mode
  showSimulatePayment.value = isDevMode.value
})
</script>

<template>
  <div v-if="shouldShow" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div 
      @click.self="handleClose"
      class="fixed inset-0"
    ></div>
    
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full p-6 lg:p-8 relative">
      <!-- Close Button -->
      <button
        @click="handleClose"
        class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-xl font-bold text-gray-900 mb-2">
          {{ t('mobileMoneyPaymentRequired') || 'Mobile Money Payment Required' }}
        </h3>
        
        <p v-if="countryName" class="text-gray-600 text-sm">
          <span :class="'fi fi-' + getCountryFlag(country) + ' fis mr-1'" />
          {{ countryName }}
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-700 text-sm">{{ errorMessage }}</p>
        <button @click="errorMessage = null" class="ml-auto text-red-400 hover:text-red-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        
        <!-- Free Generations Info -->
        <div v-if="freeGenerationsRemaining >= 0" class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p v-if="freeGenerationsRemaining > 0" class="text-blue-800 text-sm font-medium">
                {{ freeGenerationsRemaining }} free generation{{ freeGenerationsRemaining > 1 ? 's' : '' }} remaining
              </p>
              <p v-else class="text-blue-800 text-sm">
                {{ t('noFreeGenerationsRemaining') || 'No free generations remaining' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Country Information -->
        <div v-if="country && countryName" class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h4 class="font-semibold text-gray-800 mb-2 text-sm">
            {{ t('yourCountry') || 'Your Country' }}
          </h4>
          <div class="flex items-center gap-3">
            <span :class="'fi fi-' + getCountryFlag(country) + ' fis text-2xl'" />
            <span class="text-gray-700">{{ countryName }}</span>
            <span v-if="providers && providers.length > 0" class="text-gray-500 text-sm">
              ({{ providers.join(', ') }})
            </span>
          </div>
        </div>

        <!-- Mobile Money Not Configured Notice -->
        <div v-if="!isMobileMoneyConfigured" class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p class="text-amber-800 text-sm">
            {{ t('mobileMoneyNotConfigured') || 'Mobile Money payment is not yet configured.' }}
          </p>
        </div>

        <!-- Payment Instructions -->
        <div v-else class="p-4 bg-green-50 border border-green-200 rounded-xl">
          <h4 class="font-semibold text-green-800 mb-3 text-sm">
            {{ t('howToPay') || 'How to Pay' }}
          </h4>
          
          <p class="text-green-800 text-sm mb-3">
            {{ getPaymentInstructions }}
          </p>

          <!-- Phone Number Display -->
          <div v-if="defaultPhone" class="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-green-800 text-sm font-medium">
                {{ t('paymentPhoneNumber') || 'Payment Phone Number' }}
              </p>
              <p class="text-green-700 text-xs">{{ formattedPhone }}</p>
            </div>
            <button 
              @click="copyPhoneNumber"
              class="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              :title="t('copy') || 'Copy'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Providers List -->
        <div v-if="providers && providers.length > 0" class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h4 class="font-semibold text-purple-800 mb-3 text-sm">
            {{ t('supportedProviders') || 'Supported Mobile Money Providers' }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="provider in providers" 
              :key="provider"
              class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {{ provider }}
            </span>
          </div>
        </div>

        <!-- Development: Country Override -->
        <div v-if="isDevMode" class="p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <h4 class="font-semibold text-orange-800 mb-3 text-sm">
            Development Tools
          </h4>
          
          <div class="space-y-3">
            <button
              @click="toggleCountryOverride"
              class="w-full px-4 py-2 border border-orange-300 text-orange-700 text-xs rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              {{ showCountryOverride ? 'Hide' : 'Test Different Country' }}
            </button>

            <div v-if="showCountryOverride" class="space-y-2">
              <select
                v-model="overrideCountryCode"
                class="w-full px-3 py-2 border border-orange-300 rounded-lg text-xs"
                @change="setCountryOverride"
              >
                <option value="">Select Country</option>
                <option v-for="c in africanCountries" :key="c.code" :value="c.code">
                  {{ c.name }} ({{ c.code }}) - {{ c.providers.join(', ') }}
                </option>
              </select>
              
              <button
                v-if="selectedCountry"
                @click="clearCountryOverride"
                class="w-full px-4 py-2 bg-orange-100 text-orange-700 text-xs rounded-lg hover:bg-orange-200 transition-colors"
              >
                Clear Override
              </button>
            </div>

            <button
              v-if="showSimulatePayment && !hasFreeGenerations"
              @click="simulatePayment"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Simulate Payment (Dev Only)</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            @click="handleRetry"
            class="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Try Again
          </button>
          
          <button
            @click="handleClose"
            class="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {{ t('close') || 'Close' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl">
        <svg class="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for country flags */
.fis {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
