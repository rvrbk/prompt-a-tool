<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'templateSelected', 'error'])

// State
const templates = ref([])
const selectedTemplate = ref(null)
const selectedCategory = ref('all')
const isLoading = ref(false)
const error = ref(null)

// Computed
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const categories = computed(() => {
  const uniqueCategories = new Set(templates.value.map(t => t.category))
  return ['all', ...Array.from(uniqueCategories).sort()]
})

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(t => t.category === selectedCategory.value)
})

// Icons mapping for template categories
const categoryIcons = {
  AgriTech: '🚜',
  FinTech: '💳',
  EdTech: '🎓',
  HealthTech: '⚕️',
  Logistics: '🚚',
  general: '📄'
}

// Fetch templates
const fetchTemplates = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/templates/metadata')
    templates.value = response.data.data || []
  } catch (err) {
    console.error('Failed to fetch templates:', err)
    error.value = 'Failed to load templates. Please try again.'
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

// Apply template
const applyTemplate = () => {
  if (!selectedTemplate.value) {
    error.value = 'Please select a template first'
    return
  }
  
  emit('templateSelected', selectedTemplate.value)
  showModal.value = false
  resetSelection()
}

// Reset selection
const resetSelection = () => {
  selectedTemplate.value = null
  selectedCategory.value = 'all'
  error.value = null
}

// Watch modal state to fetch templates when opened
watch(showModal, (isOpen) => {
  if (isOpen && templates.value.length === 0) {
    fetchTemplates()
  }
})

// Select template
const selectTemplate = (template) => {
  selectedTemplate.value = template
  error.value = null
}

// Get icon for template
const getIcon = (template) => {
  return categoryIcons[template.category] || categoryIcons.general
}

// Expose methods
defineExpose({
  fetchTemplates,
  resetSelection
})
</script>

<template>
  <div>
    <!-- Button to open modal -->
    <button
      @click="showModal = true"
      class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all flex items-center"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      Start from Template
    </button>

    <!-- Template Selection Modal -->
    <div
      v-if="showModal"
      @click.self="showModal = false"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        @click.stop
        class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Select a Template</h3>
              <p class="text-sm text-gray-500">Jumpstart your project with a pre-built African app template</p>
            </div>
          </div>
          <button
            @click="showModal = false"
            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Category Filter -->
          <div class="mb-6">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = category"
                class="px-3 py-1.5 text-sm font-medium rounded-full transition-all"
                :class="{
                  'bg-purple-600 text-white': selectedCategory === category,
                  'bg-gray-100 text-gray-600 hover:bg-gray-200': selectedCategory !== category
                }"
              >
                <span v-if="category === 'all'" class="mr-1">🌍</span>
                <span v-else>{{ category }}</span>
                <span class="ml-1">({{ filteredTemplates.filter(t => category === 'all' || t.category === category).length }})</span>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>

          <!-- Loading -->
          <div v-if="isLoading && templates.length === 0" class="flex items-center justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <!-- Templates Grid -->
          <div v-else class="max-h-[400px] overflow-y-auto pr-2">
            <div
              v-if="filteredTemplates.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No templates found for this category.</p>
            </div>
            
            <div v-else class="grid gap-4">
              <button
                v-for="template in filteredTemplates"
                :key="template.id"
                @click="selectTemplate(template)"
                class="w-full p-4 bg-gray-50 border-2 border-transparent rounded-lg text-left hover:bg-gray-100 transition-all"
                :class="{
                  'border-purple-500 bg-purple-50': selectedTemplate && selectedTemplate.id === template.id
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <span class="text-2xl mr-3">{{ getIcon(template) }}</span>
                      <div>
                        <h4 class="font-semibold text-gray-800">{{ template.name }}</h4>
                        <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full mt-1 inline-block">
                          {{ template.category }}
                        </span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ template.description }}</p>
                  </div>
                  <svg
                    v-if="selectedTemplate && selectedTemplate.id === template.id"
                    class="w-5 h-5 text-purple-600 flex-shrink-0 mt-1"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            @click="applyTemplate"
            :disabled="!selectedTemplate || isLoading"
            class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Apply Template</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for modal */
.modal-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.modal-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
