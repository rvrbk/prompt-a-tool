<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import ResultsDisplay from './ResultsDisplay.vue'

// African countries list
const africanCountries = [
  'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Uganda', 'Rwanda', 'Tanzania', 'Ethiopia',
  'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Senegal', 'Mali', 'Burkina Faso',
  'Niger', 'Chad', 'Cameroon', 'DR Congo', 'Angola', 'Mozambique', 'Zambia', 'Zimbabwe',
  'Botswana', 'Namibia', 'Malawi', 'Lesotho', 'Eswatini', 'Mauritius', 'Seychelles',
  'Liberia', 'Sierra Leone', 'Guinea', 'Ivory Coast', 'Benin', 'Togo', 'Gabon', 'Equatorial Guinea',
  'Central African Republic', 'Somalia', 'Djibouti', 'Eritrea', 'Burundi', 'Comoros', 'Cabo Verde',
  'Sao Tome and Principe', 'Mauritania', 'Gambia', 'Guinea-Bissau', 'Madagascar'
]

// Primary user types
const userTypes = [
  'Farmers', 'Teachers', 'Healthcare Workers', 'Small Business Owners', 'Students',
  'Government Officials', 'NGO Workers', 'Tech Professionals', 'Entrepreneurs',
  'Artisans', 'Traders', 'Drivers', 'Fishermen', 'Pastoralists', 'Community Leaders',
  'Youth', 'Women Groups', 'Cooperatives', 'Investors', 'Tourists'
]

// Core features
const coreFeatures = [
  'User profiles', 'Payments', 'Messaging', 'Maps', 'Data analytics', 'Appointments',
  'Content uploads', 'Notifications', 'Search', 'Reviews/Ratings', 'Multi-language support',
  'Document storage', 'Calendar/Events', 'Task management', 'Inventory management',
  'E-commerce', 'Learning modules', 'Health records', 'Weather data', 'Market prices'
]

// AI features
const aiFeatures = [
  'Recommendations', 'Chatbots', 'Predictions', 'Data Analysis', 'Image Recognition',
  'Voice Recognition', 'Natural Language Processing', 'Automated Reports',
  'Personalized Content', 'Fraud Detection', 'Credit Scoring', 'Crop Disease Detection',
  'Language Translation', 'Speech-to-Text', 'Sentiment Analysis'
]

// Form state
const form = ref({
  idea: '',
  countries: [],
  userTypes: [],
  offlineAccess: false,
  features: [],
  aiFeatures: []
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
    errors.value.idea = 'App idea is required'
    isValid = false
  } else {
    errors.value.idea = ''
  }
  
  return isValid
}

// Country selection helpers
const toggleCountry = (country) => {
  const index = form.value.countries.indexOf(country)
  if (index === -1) {
    form.value.countries.push(country)
  } else {
    form.value.countries.splice(index, 1)
  }
}

const toggleUserType = (userType) => {
  const index = form.value.userTypes.indexOf(userType)
  if (index === -1) {
    form.value.userTypes.push(userType)
  } else {
    form.value.userTypes.splice(index, 1)
  }
}

const toggleFeature = (feature) => {
  const index = form.value.features.indexOf(feature)
  if (index === -1) {
    form.value.features.push(feature)
  } else {
    form.value.features.splice(index, 1)
  }
}

const toggleAiFeature = (feature) => {
  const index = form.value.aiFeatures.indexOf(feature)
  if (index === -1) {
    form.value.aiFeatures.push(feature)
  } else {
    form.value.aiFeatures.splice(index, 1)
  }
}

// Check if item is selected
const isCountrySelected = (country) => form.value.countries.includes(country)
const isUserTypeSelected = (userType) => form.value.userTypes.includes(userType)
const isFeatureSelected = (feature) => form.value.features.includes(feature)
const isAiFeatureSelected = (feature) => form.value.aiFeatures.includes(feature)

// Compute selected counts for display
const selectedCountriesCount = computed(() => form.value.countries.length)
const selectedUserTypesCount = computed(() => form.value.userTypes.length)
const selectedFeaturesCount = computed(() => form.value.features.length)
const selectedAiFeaturesCount = computed(() => form.value.aiFeatures.length)

// Show/hide dropdowns
const showCountriesDropdown = ref(false)
const showUserTypesDropdown = ref(false)
const showFeaturesDropdown = ref(false)
const showAiFeaturesDropdown = ref(false)

// Toggle dropdowns
const toggleCountriesDropdown = () => {
  showCountriesDropdown.value = !showCountriesDropdown.value
  showUserTypesDropdown.value = false
  showFeaturesDropdown.value = false
  showAiFeaturesDropdown.value = false
}

const toggleUserTypesDropdown = () => {
  showUserTypesDropdown.value = !showUserTypesDropdown.value
  showCountriesDropdown.value = false
  showFeaturesDropdown.value = false
  showAiFeaturesDropdown.value = false
}

const toggleFeaturesDropdown = () => {
  showFeaturesDropdown.value = !showFeaturesDropdown.value
  showCountriesDropdown.value = false
  showUserTypesDropdown.value = false
  showAiFeaturesDropdown.value = false
}

const toggleAiFeaturesDropdown = () => {
  showAiFeaturesDropdown.value = !showAiFeaturesDropdown.value
  showCountriesDropdown.value = false
  showUserTypesDropdown.value = false
  showFeaturesDropdown.value = false
}

// Close all dropdowns
const closeAllDropdowns = () => {
  showCountriesDropdown.value = false
  showUserTypesDropdown.value = false
  showFeaturesDropdown.value = false
  showAiFeaturesDropdown.value = false
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
    // Make API call to Laravel backend
    const response = await axios.post('/api/generate-prompts', {
      idea: form.value.idea,
      countries: form.value.countries,
      userTypes: form.value.userTypes,
      offlineAccess: form.value.offlineAccess,
      features: form.value.features,
      aiFeatures: form.value.aiFeatures
    })
    
    // Log form data to console (Iteration 1 requirement maintained)
    console.log('Form Data Submitted:', {
      idea: form.value.idea,
      countries: form.value.countries,
      userTypes: form.value.userTypes,
      offlineAccess: form.value.offlineAccess,
      features: form.value.features,
      aiFeatures: form.value.aiFeatures
    })
    
    console.log('API Response:', response.data)
    
    // Store the response data for display
    generatedData.value = response.data
    
    isSuccess.value = true
    showResults.value = true
  } catch (error) {
    console.error('API Error:', error)
    
    if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage.value = `Error: ${error.response.data.message || 'Server error'}`
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage.value = 'Error: No response from server. Please check if the backend is running.'
    } else {
      // Something happened in setting up the request
      errorMessage.value = `Error: ${error.message}`
    }
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    idea: '',
    countries: [],
    userTypes: [],
    offlineAccess: false,
    features: [],
    aiFeatures: []
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
    <!-- Title and Description -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        African App Prompt Generator
      </h2>
      <p class="text-gray-600">
        Answer a few questions about your app idea, and we'll generate tailored prompts, roles, 
        agents, and skills for your African-focused application.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- App Idea -->
      <div class="space-y-2">
        <label for="idea" class="block text-sm font-medium text-gray-700">
          App Idea <span class="text-red-500">*</span>
        </label>
        <textarea
          id="idea"
          v-model="form.idea"
          :class="{
            'border-red-500': errors.idea,
            'border-gray-300': !errors.idea
          }"
          rows="4"
          placeholder="Describe your app idea (e.g., 'A Nigerian fintech app for savings groups', 'A Kenyan agri-tech platform connecting farmers to markets')"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
        />
        <p v-if="errors.idea" class="text-red-500 text-sm">{{ errors.idea }}</p>
        <p class="text-gray-500 text-sm">
          Be specific about your app's purpose and target audience in Africa.
        </p>
      </div>

      <!-- Target Countries -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Target Countries
        </label>
        <div class="relative">
          <button
            type="button"
            @click.stop="toggleCountriesDropdown"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <div class="flex items-center justify-between">
              <span v-if="selectedCountriesCount === 0" class="text-gray-500">
                Select countries...
              </span>
              <span v-else class="text-gray-700">
                {{ selectedCountriesCount }} country{{ selectedCountriesCount > 1 ? 'ies' : '' }} selected
              </span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div
            v-show="showCountriesDropdown"
            @click.stop
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <div v-for="country in africanCountries" :key="country" class="px-3 py-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isCountrySelected(country)"
                    @change="toggleCountry(country)"
                    class="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm text-gray-700">{{ country }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary User Types -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Primary User Types
        </label>
        <div class="relative">
          <button
            type="button"
            @click.stop="toggleUserTypesDropdown"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <div class="flex items-center justify-between">
              <span v-if="selectedUserTypesCount === 0" class="text-gray-500">
                Select user types...
              </span>
              <span v-else class="text-gray-700">
                {{ selectedUserTypesCount }} user type{{ selectedUserTypesCount > 1 ? 's' : '' }} selected
              </span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div
            v-show="showUserTypesDropdown"
            @click.stop
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <div v-for="userType in userTypes" :key="userType" class="px-3 py-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isUserTypeSelected(userType)"
                    @change="toggleUserType(userType)"
                    class="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm text-gray-700">{{ userType }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Offline Access -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Offline Access
        </label>
        <div class="flex space-x-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="true"
              class="mr-3 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-700">Yes</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              type="radio"
              v-model="form.offlineAccess"
              :value="false"
              class="mr-3 h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-700">No</span>
          </label>
        </div>
        <p class="text-gray-500 text-sm">
          Will your app need to work without internet connectivity?
        </p>
      </div>

      <!-- Core Features -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Core Features
        </label>
        <div class="relative">
          <button
            type="button"
            @click.stop="toggleFeaturesDropdown"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <div class="flex items-center justify-between">
              <span v-if="selectedFeaturesCount === 0" class="text-gray-500">
                Select features...
              </span>
              <span v-else class="text-gray-700">
                {{ selectedFeaturesCount }} feature{{ selectedFeaturesCount > 1 ? 's' : '' }} selected
              </span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div
            v-show="showFeaturesDropdown"
            @click.stop
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <div v-for="feature in coreFeatures" :key="feature" class="px-3 py-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isFeatureSelected(feature)"
                    @change="toggleFeature(feature)"
                    class="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm text-gray-700">{{ feature }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Features -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          AI Features
        </label>
        <div class="relative">
          <button
            type="button"
            @click.stop="toggleAiFeaturesDropdown"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <div class="flex items-center justify-between">
              <span v-if="selectedAiFeaturesCount === 0" class="text-gray-500">
                Select AI features...
              </span>
              <span v-else class="text-gray-700">
                {{ selectedAiFeaturesCount }} AI feature{{ selectedAiFeaturesCount > 1 ? 's' : '' }} selected
              </span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div
            v-show="showAiFeaturesDropdown"
            @click.stop
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <div v-for="feature in aiFeatures" :key="feature" class="px-3 py-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isAiFeatureSelected(feature)"
                    @change="toggleAiFeature(feature)"
                    class="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm text-gray-700">{{ feature }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
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
          <span v-if="!isSubmitting">Generate Prompts</span>
          <span v-else>Generating...</span>
        </button>
        
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
        >
          Reset
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
