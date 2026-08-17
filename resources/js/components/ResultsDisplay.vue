<script setup>
import { ref, computed, watch } from 'vue'
import ExportShare from './ExportShare.vue'

const props = defineProps({
  generatedData: {
    type: Object,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    default: null
  },
  questionnaireData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit'])

// Native clipboard functionality
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'  // Prevent scrolling to bottom
      document.body.appendChild(textarea)
      textarea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textarea)
      return result
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}

// Local state for edited data
const editedData = ref(null)
const isEditing = ref(false)
const activeSection = ref(null)

// Track which sections are expanded
const expandedSections = ref({
  roles: true,
  agents: true,
  backendPrompts: true,
  frontendPrompts: true
})

// Copy states for feedback
const copyStates = ref({
  roles: false,
  agents: false,
  backendPrompts: false,
  frontendPrompts: false
})

// Initialize edited data when generated data changes
watch(() => props.generatedData, (newData) => {
  if (newData) {
    editedData.value = JSON.parse(JSON.stringify(newData))
    isEditing.value = false
  }
}, { immediate: true, deep: true })

// Helper to parse data safely
const getRoles = computed(() => {
  if (!editedData.value) return []
  
  // Handle different response formats
  if (Array.isArray(editedData.value.roles)) {
    return editedData.value.roles
  }
  
  // If roles is in the raw response
  if (editedData.value.raw_response && typeof editedData.value.raw_response === 'string') {
    try {
      const parsed = JSON.parse(editedData.value.raw_response)
      return parsed.roles || []
    } catch {
      return []
    }
  }
  
  return []
})

const getAgents = computed(() => {
  if (!editedData.value) return []
  
  if (Array.isArray(editedData.value.agents)) {
    return editedData.value.agents
  }
  
  if (editedData.value.raw_response && typeof editedData.value.raw_response === 'string') {
    try {
      const parsed = JSON.parse(editedData.value.raw_response)
      return parsed.agents || []
    } catch {
      return []
    }
  }
  
  return []
})

const getBackendPrompts = computed(() => {
  if (!editedData.value) return []
  
  if (Array.isArray(editedData.value.backend_prompts)) {
    return editedData.value.backend_prompts
  }
  
  if (editedData.value.raw_response && typeof editedData.value.raw_response === 'string') {
    try {
      const parsed = JSON.parse(editedData.value.raw_response)
      return parsed.backend_prompts || []
    } catch {
      return []
    }
  }
  
  return []
})

const getFrontendPrompts = computed(() => {
  if (!editedData.value) return []
  
  if (Array.isArray(editedData.value.frontend_prompts)) {
    return editedData.value.frontend_prompts
  }
  
  if (editedData.value.raw_response && typeof editedData.value.raw_response === 'string') {
    try {
      const parsed = JSON.parse(editedData.value.raw_response)
      return parsed.frontend_prompts || []
    } catch {
      return []
    }
  }
  
  return []
})

// Check if we have any data to display
const hasData = computed(() => {
  return getRoles.value.length > 0 || 
         getAgents.value.length > 0 || 
         getBackendPrompts.value.length > 0 || 
         getFrontendPrompts.value.length > 0
})

// Toggle section expansion
const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// Copy to clipboard with feedback
const copyWithFeedback = async (content, section) => {
  const success = await copyToClipboard(content)
  if (success) {
    copyStates.value[section] = true
    setTimeout(() => {
      copyStates.value[section] = false
    }, 2000)
  }
}

// Copy entire response as JSON
const copyAllAsJson = async () => {
  try {
    const jsonData = {
      roles: getRoles.value,
      agents: getAgents.value,
      backend_prompts: getBackendPrompts.value,
      frontend_prompts: getFrontendPrompts.value,
      metadata: {
        idea: editedData.value?.data?.idea || editedData.value?.idea || '',
        countries: editedData.value?.data?.countries || editedData.value?.countries || [],
        userTypes: editedData.value?.data?.userTypes || editedData.value?.userTypes || [],
        generated_at: editedData.value?.generated_at || new Date().toISOString()
      }
    }
    const success = await copyToClipboard(JSON.stringify(jsonData, null, 2))
    if (success) {
      // Show a temporary notification
      const allCopied = ref(true)
      setTimeout(() => { allCopied.value = false }, 2000)
    }
  } catch (error) {
    console.error('Failed to copy all:', error)
  }
}

// Start editing a section
const startEditing = (section) => {
  activeSection.value = section
  isEditing.value = true
}

// Save edits
const saveEdits = () => {
  isEditing.value = false
  activeSection.value = null
}

// Cancel edits
const cancelEdits = () => {
  if (props.generatedData) {
    editedData.value = JSON.parse(JSON.stringify(props.generatedData))
  }
  isEditing.value = false
  activeSection.value = null
}

// Helper to format role permissions/actions as list
const formatList = (items) => {
  if (!items || !Array.isArray(items)) return []
  return items
}

// Helper to format as readable text for copy
const formatForCopy = (section) => {
  switch (section) {
    case 'roles':
      return getRoles.value.map(role => {
        const permissions = formatList(role.permissions || role.permissionsList || []).join(', ')
        const actions = formatList(role.actions || role.actionsList || []).join(', ')
        return `Role: ${role.name}\nDescription: ${role.description || 'N/A'}\nPermissions: ${permissions}\nActions: ${actions}`
      }).join('\n\n')
    
    case 'agents':
      return getAgents.value.map(agent => {
        const skills = formatList(agent.skills || agent.skillsList || []).join(', ')
        const tools = formatList(agent.tools || agent.toolsList || []).join(', ')
        return `Agent: ${agent.name}\nDescription: ${agent.description || 'N/A'}\nSkills: ${skills}\nTools: ${tools}`
      }).join('\n\n')
    
    case 'backendPrompts':
    case 'frontendPrompts':
      const prompts = section === 'backendPrompts' ? getBackendPrompts.value : getFrontendPrompts.value
      return prompts.join('\n\n---\n\n')
    
    default:
      return ''
  }
}
</script>

<template>
  <div v-if="isVisible && generatedData" class="mt-8">
    <!-- Results Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-800">
        Generated Results
      </h3>
      <div class="flex items-center space-x-3">
        <!-- Export and Share buttons -->
        <ExportShare
          :generatedData="generatedData"
          :sessionId="sessionId"
          :questionnaireData="questionnaireData"
        />
        
        <button
          @click="copyAllAsJson"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy All
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Results Container -->
    <div v-if="hasData" class="space-y-6">
      
      <!-- User Roles Section -->
      <div v-if="getRoles.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div 
          @click="toggleSection('roles')"
          class="flex items-center justify-between p-4 bg-blue-50 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div class="flex items-center">
            <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h4 class="text-lg font-semibold text-blue-800">User Roles</h4>
            <span class="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">{{ getRoles.length }}</span>
          </div>
          <button class="p-1 rounded-lg hover:bg-blue-200 transition-colors">
            <svg 
              class="w-5 h-5 text-blue-600 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.roles }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.roles" class="p-4">
          <div class="flex items-center justify-end mb-4 space-x-2">
            <button
              @click="copyWithFeedback(formatForCopy('roles'), 'roles')"
              class="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-all flex items-center"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.roles">Copy</span>
              <span v-else class="text-green-600">Copied!</span>
            </button>
          </div>
          
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="(role, index) in getRoles" 
              :key="index"
              class="bg-blue-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between mb-2">
                <h5 class="font-semibold text-blue-800">{{ role.name || `Role ${index + 1}` }}</h5>
                <span class="text-xs text-blue-500 bg-blue-200 px-2 py-1 rounded-full">
                  {{ role.type || 'Standard' }}
                </span>
              </div>
              <p v-if="role.description" class="text-sm text-blue-700 mb-3">{{ role.description }}</p>
              
              <div v-if="role.permissions && role.permissions.length > 0" class="mb-3">
                <h6 class="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1.5">Permissions</h6>
                <ul class="space-y-1">
                  <li 
                    v-for="(permission, pIndex) in formatList(role.permissions)" 
                    :key="pIndex"
                    class="text-sm text-blue-700 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ permission }}
                  </li>
                </ul>
              </div>
              
              <div v-if="role.actions && role.actions.length > 0">
                <h6 class="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1.5">Actions</h6>
                <ul class="space-y-1">
                  <li 
                    v-for="(action, aIndex) in formatList(role.actions)" 
                    :key="aIndex"
                    class="text-sm text-blue-700 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {{ action }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Agents Section -->
      <div v-if="getAgents.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div 
          @click="toggleSection('agents')"
          class="flex items-center justify-between p-4 bg-purple-50 border-b border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
        >
          <div class="flex items-center">
            <svg class="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h4 class="text-lg font-semibold text-purple-800">AI Agents</h4>
            <span class="ml-2 px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">{{ getAgents.length }}</span>
          </div>
          <button class="p-1 rounded-lg hover:bg-purple-200 transition-colors">
            <svg 
              class="w-5 h-5 text-purple-600 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.agents }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.agents" class="p-4">
          <div class="flex items-center justify-end mb-4 space-x-2">
            <button
              @click="copyWithFeedback(formatForCopy('agents'), 'agents')"
              class="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200 transition-all flex items-center"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.agents">Copy</span>
              <span v-else class="text-green-600">Copied!</span>
            </button>
          </div>
          
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="(agent, index) in getAgents" 
              :key="index"
              class="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between mb-2">
                <h5 class="font-semibold text-purple-800">{{ agent.name || `Agent ${index + 1}` }}</h5>
                <span v-if="agent.type" class="text-xs text-purple-500 bg-purple-200 px-2 py-1 rounded-full">
                  {{ agent.type }}
                </span>
              </div>
              <p v-if="agent.description" class="text-sm text-purple-700 mb-3">{{ agent.description }}</p>
              
              <div v-if="agent.responsibilities && agent.responsibilities.length > 0" class="mb-3">
                <h6 class="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1.5">Responsibilities</h6>
                <ul class="space-y-1">
                  <li 
                    v-for="(resp, rIndex) in formatList(agent.responsibilities)" 
                    :key="rIndex"
                    class="text-sm text-purple-700"
                  >
                    {{ resp }}
                  </li>
                </ul>
              </div>
              
              <div v-if="agent.skills && agent.skills.length > 0" class="mb-3">
                <h6 class="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1.5">Skills</h6>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(skill, sIndex) in formatList(agent.skills)" 
                    :key="sIndex"
                    class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
              
              <div v-if="agent.tools && agent.tools.length > 0">
                <h6 class="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1.5">Tools</h6>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(tool, tIndex) in formatList(agent.tools)" 
                    :key="tIndex"
                    class="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full"
                  >
                    {{ tool }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Backend Prompts Section -->
      <div v-if="getBackendPrompts.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div 
          @click="toggleSection('backendPrompts')"
          class="flex items-center justify-between p-4 bg-green-50 border-b border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
        >
          <div class="flex items-center">
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h4 class="text-lg font-semibold text-green-800">Backend Prompts (Laravel)</h4>
            <span class="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">{{ getBackendPrompts.length }}</span>
          </div>
          <button class="p-1 rounded-lg hover:bg-green-200 transition-colors">
            <svg 
              class="w-5 h-5 text-green-600 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.backendPrompts }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.backendPrompts" class="p-4">
          <div class="flex items-center justify-end mb-4 space-x-2">
            <button
              @click="copyWithFeedback(formatForCopy('backendPrompts'), 'backendPrompts')"
              class="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-all flex items-center"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.backendPrompts">Copy</span>
              <span v-else class="text-green-600">Copied!</span>
            </button>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(prompt, index) in getBackendPrompts" 
              :key="index"
              class="bg-green-50 border border-green-100 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <h5 class="font-medium text-green-800">Prompt {{ index + 1 }}</h5>
              </div>
              <div class="bg-white rounded p-3 overflow-x-auto">
                <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ prompt }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Frontend Prompts Section -->
      <div v-if="getFrontendPrompts.length > 0" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div 
          @click="toggleSection('frontendPrompts')"
          class="flex items-center justify-between p-4 bg-orange-50 border-b border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div class="flex items-center">
            <svg class="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h4 class="text-lg font-semibold text-orange-800">Frontend Prompts (Vue.js)</h4>
            <span class="ml-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">{{ getFrontendPrompts.length }}</span>
          </div>
          <button class="p-1 rounded-lg hover:bg-orange-200 transition-colors">
            <svg 
              class="w-5 h-5 text-orange-600 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.frontendPrompts }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.frontendPrompts" class="p-4">
          <div class="flex items-center justify-end mb-4 space-x-2">
            <button
              @click="copyWithFeedback(formatForCopy('frontendPrompts'), 'frontendPrompts')"
              class="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg hover:bg-orange-200 transition-all flex items-center"
            >
              <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.frontendPrompts">Copy</span>
              <span v-else class="text-green-600">Copied!</span>
            </button>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(prompt, index) in getFrontendPrompts" 
              :key="index"
              class="bg-orange-50 border border-orange-100 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <h5 class="font-medium text-orange-800">Prompt {{ index + 1 }}</h5>
              </div>
              <div class="bg-white rounded p-3 overflow-x-auto">
                <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ prompt }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Raw Response Section (for debugging/fallback) -->
      <div 
        v-if="(getRoles.length === 0 && getAgents.length === 0 && getBackendPrompts.length === 0 && getFrontendPrompts.length === 0) || (generatedData.raw_response || generatedData.message)"
        class="bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
      >
        <div class="p-4">
          <div v-if="generatedData.message" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p class="text-yellow-700 text-sm">{{ generatedData.message }}</p>
          </div>
          
          <div v-if="generatedData.raw_response" class="p-3 bg-gray-100 rounded-lg">
            <h6 class="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wider">Raw AI Response</h6>
            <pre class="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">{{ generatedData.raw_response }}</pre>
          </div>
          
          <div v-if="!hasData && !generatedData.raw_response && !generatedData.message" class="p-6 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No results to display. Try generating prompts with different inputs.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h4 class="text-lg font-semibold text-gray-700 mb-2">No Results Yet</h4>
      <p class="text-gray-500">Fill out the questionnaire and click "Generate Prompts" to see results here.</p>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
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

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease;
}

/* Ensure pre blocks are readable */
pre {
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  background: rgba(0, 0, 0, 0.02);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
</style>
