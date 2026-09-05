<script setup>
import { ref, computed, watch, inject } from 'vue'
import ExportShare from './ExportShare.vue'

// Use translations from App.vue provider
const { t } = inject('translations')

const props = defineProps({
  generatedData: {
    type: Object,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  questionnaireData: {
    type: Object,
    default: null
  },
  followUpQuestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit'])

// Platform-specific labels
const platformLabels = computed(() => {
  const platform = props.questionnaireData?.targetPlatform || 'web'
  
  const backendLabels = {
    web: t('backendPromptsLaravel'),
    ios: t('backendPrompts'),
    android: t('backendPrompts'),
    both: t('backendPrompts')
  }
  
  const frontendLabels = {
    web: t('frontendPromptsVue'),
    ios: t('frontendPromptsSwift'),
    android: t('frontendPromptsKotlin'),
    both: t('frontendPromptsCrossPlatform')
  }
  
  return {
    backend: backendLabels[platform] || t('backendPrompts'),
    frontend: frontendLabels[platform] || t('frontendPrompts')
  }
})

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
  frontendPrompts: false,
  all: false
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
        idea: props.questionnaireData?.idea || editedData.value?.data?.idea || editedData.value?.idea || '',
        followUpAnswers: props.questionnaireData?.followUpAnswers || editedData.value?.data?.followUpAnswers || editedData.value?.followUpAnswers || {},
        offlineAccess: props.questionnaireData?.offlineAccess !== undefined ? props.questionnaireData?.offlineAccess : (editedData.value?.data?.offlineAccess ?? editedData.value?.offlineAccess ?? false),
        generated_at: editedData.value?.generated_at || new Date().toISOString()
      }
    }
    const success = await copyToClipboard(JSON.stringify(jsonData, null, 2))
    if (success) {
      copyStates.value.all = true
      setTimeout(() => { copyStates.value.all = false }, 2000)
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
      return prompts.map(prompt => {
        if (typeof prompt === 'string') {
          return prompt
        }
        const title = prompt.title || `Iteration ${prompt.iteration}`
        const tasks = prompt.tasks ? '\nTasks:\n- ' + prompt.tasks.join('\n- ') : ''
        const deps = prompt.dependencies ? '\n\nDependencies:\n- ' + prompt.dependencies.join('\n- ') : ''
        return `${title}\n${prompt.description || ''}${tasks}${deps}`
      }).join('\n\n---\n\n')
    
    default:
      return ''
  }
}
</script>

<template>
  <div v-if="isVisible && generatedData" class="mt-8">
    <!-- Results Header - Modern Minimal -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
        {{ t('generatedResults') }}
      </h3>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        <!-- Export and Share buttons -->
        <ExportShare
          :generatedData="generatedData"
          :questionnaireData="questionnaireData"
          :followUpQuestions="followUpQuestions"
        />
        
        <button
          @click="copyAllAsJson"
          class="px-4 py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center shadow-sm"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span v-if="!copyStates.all">{{ t('copyAll') }}</span>
          <span v-else class="text-gray-300">{{ t('copied') }}</span>
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          {{ t('close') }}
        </button>
      </div>
    </div>

    <!-- Results Container - Modern Minimal -->
    <div v-if="hasData" class="space-y-4">
      
      <!-- User Roles Section - Modern Minimal -->
      <div v-if="getRoles.length > 0" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          @click="toggleSection('roles')"
          class="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h4 class="text-base font-medium text-gray-900">{{ t('userRoles') }}</h4>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{{ getRoles.length }}</span>
          </div>
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg 
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.roles }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.roles" class="p-5">
          <div class="flex items-center justify-end mb-5">
            <button
              @click="copyWithFeedback(formatForCopy('roles'), 'roles')"
              class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.roles">{{ t('copy') }}</span>
              <span v-else class="text-gray-900">{{ t('copied') }}</span>
            </button>
          </div>
          
          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="(role, index) in getRoles" 
              :key="index"
              class="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              <div class="flex items-start justify-between mb-4">
                <h5 class="font-medium text-gray-900">{{ role.name || `Role ${index + 1}` }}</h5>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                  {{ role.type || t('standard') }}
                </span>
              </div>
              <p v-if="role.description" class="text-sm text-gray-600 mb-4">{{ role.description }}</p>
              
              <div v-if="role.permissions && role.permissions.length > 0" class="mb-4">
                <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('permissions') }}</h6>
                <ul class="space-y-2">
                  <li 
                    v-for="(permission, pIndex) in formatList(role.permissions)" 
                    :key="pIndex"
                    class="text-sm text-gray-700 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ permission }}
                  </li>
                </ul>
              </div>
              
              <div v-if="role.actions && role.actions.length > 0">
                <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('actions') }}</h6>
                <ul class="space-y-2">
                  <li 
                    v-for="(action, aIndex) in formatList(role.actions)" 
                    :key="aIndex"
                    class="text-sm text-gray-700 flex items-center"
                  >
                    <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
      <!-- AI Agents Section - Modern Minimal -->
      <div v-if="getAgents.length > 0" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          @click="toggleSection('agents')"
          class="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h4 class="text-base font-medium text-gray-900">{{ t('aiAgents') }}</h4>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{{ getAgents.length }}</span>
          </div>
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg 
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.agents }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.agents" class="p-5">
          <div class="flex items-center justify-end mb-5">
            <button
              @click="copyWithFeedback(formatForCopy('agents'), 'agents')"
              class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.agents">Copy</span>
              <span v-else class="text-gray-900">Copied!</span>
            </button>
          </div>
          
          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="(agent, index) in getAgents" 
              :key="index"
              class="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              <div class="flex items-start justify-between mb-4">
                <h5 class="font-medium text-gray-900">{{ agent.name || `Agent ${index + 1}` }}</h5>
                <span v-if="agent.type" class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                  {{ agent.type }}
                </span>
              </div>
              <p v-if="agent.description" class="text-sm text-gray-600 mb-4">{{ agent.description }}</p>
              
              <div v-if="agent.responsibilities && agent.responsibilities.length > 0" class="mb-4">
                <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('responsibilities') }}</h6>
                <ul class="space-y-2">
                  <li 
                    v-for="(resp, rIndex) in formatList(agent.responsibilities)" 
                    :key="rIndex"
                    class="text-sm text-gray-700"
                  >
                    {{ resp }}
                  </li>
                </ul>
              </div>
              
              <div v-if="agent.skills && agent.skills.length > 0" class="mb-4">
                <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('skills') }}</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(skill, sIndex) in formatList(agent.skills)" 
                    :key="sIndex"
                    class="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
              
              <div v-if="agent.tools && agent.tools.length > 0">
                <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('tools') }}</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(tool, tIndex) in formatList(agent.tools)" 
                    :key="tIndex"
                    class="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                  >
                    {{ tool }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Backend Prompts Section - Modern Minimal -->
      <div v-if="getBackendPrompts.length > 0" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          @click="toggleSection('backendPrompts')"
          class="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h4 class="text-base font-medium text-gray-900">{{ platformLabels.backend }}</h4>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{{ getBackendPrompts.length }}</span>
          </div>
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg 
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.backendPrompts }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.backendPrompts" class="p-5">
          <div class="flex items-center justify-end mb-5">
            <button
              @click="copyWithFeedback(formatForCopy('backendPrompts'), 'backendPrompts')"
              class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.backendPrompts">Copy</span>
              <span v-else class="text-gray-900">Copied!</span>
            </button>
          </div>
          
          <div class="space-y-5">
            <div 
              v-for="(prompt, index) in getBackendPrompts" 
              :key="index"
              class="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              <div class="flex items-start justify-between mb-4">
                <h5 class="font-medium text-gray-900">
                  <span v-if="typeof prompt === 'string'">Prompt {{ index + 1 }}</span>
                  <span v-else>Iteration {{ prompt.iteration }}: {{ prompt.title }}</span>
                </h5>
                <span v-if="typeof prompt !== 'string' && prompt.iteration" class="px-2 py-1 bg-white text-gray-600 text-xs rounded-full border border-gray-200">Iteration {{ prompt.iteration }}</span>
              </div>
              <div class="bg-white rounded-lg p-4 overflow-x-auto border border-gray-200">
                <div v-if="typeof prompt === 'string'">
                  <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ prompt }}</pre>
                </div>
                <div v-else class="text-sm text-gray-800 space-y-3">
                  <p v-if="prompt.description" class="text-gray-700">{{ prompt.description }}</p>
                  <div v-if="prompt.tasks && prompt.tasks.length" class="mt-3">
                    <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('tasks') }}</h6>
                    <ul class="space-y-2">
                      <li v-for="(task, tIndex) in prompt.tasks" :key="tIndex" class="flex items-start">
                        <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-sm">{{ task }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="prompt.dependencies && prompt.dependencies.length" class="mt-3">
                    <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('dependencies') }}</h6>
                    <ul class="space-y-2">
                      <li v-for="(dep, dIndex) in prompt.dependencies" :key="dIndex" class="flex items-start">
                        <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span class="text-sm">{{ dep }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Frontend Prompts Section - Modern Minimal -->
      <div v-if="getFrontendPrompts.length > 0" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          @click="toggleSection('frontendPrompts')"
          class="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h4 class="text-base font-medium text-gray-900">{{ platformLabels.frontend }}</h4>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{{ getFrontendPrompts.length }}</span>
          </div>
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg 
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.frontendPrompts }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div v-show="expandedSections.frontendPrompts" class="p-5">
          <div class="flex items-center justify-end mb-5">
            <button
              @click="copyWithFeedback(formatForCopy('frontendPrompts'), 'frontendPrompts')"
              class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span v-if="!copyStates.frontendPrompts">Copy</span>
              <span v-else class="text-gray-900">Copied!</span>
            </button>
          </div>
          
          <div class="space-y-5">
            <div 
              v-for="(prompt, index) in getFrontendPrompts" 
              :key="index"
              class="bg-gray-50 border border-gray-200 rounded-xl p-5"
            >
              <div class="flex items-start justify-between mb-4">
                <h5 class="font-medium text-gray-900">
                  <span v-if="typeof prompt === 'string'">Prompt {{ index + 1 }}</span>
                  <span v-else>Iteration {{ prompt.iteration }}: {{ prompt.title }}</span>
                </h5>
                <span v-if="typeof prompt !== 'string' && prompt.iteration" class="px-2 py-1 bg-white text-gray-600 text-xs rounded-full border border-gray-200">Iteration {{ prompt.iteration }}</span>
              </div>
              <div class="bg-white rounded-lg p-4 overflow-x-auto border border-gray-200">
                <div v-if="typeof prompt === 'string'">
                  <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ prompt }}</pre>
                </div>
                <div v-else class="text-sm text-gray-800 space-y-3">
                  <p v-if="prompt.description" class="text-gray-700">{{ prompt.description }}</p>
                  <div v-if="prompt.tasks && prompt.tasks.length" class="mt-3">
                    <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('tasks') }}</h6>
                    <ul class="space-y-2">
                      <li v-for="(task, tIndex) in prompt.tasks" :key="tIndex" class="flex items-start">
                        <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-sm">{{ task }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="prompt.dependencies && prompt.dependencies.length" class="mt-3">
                    <h6 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('dependencies') }}</h6>
                    <ul class="space-y-2">
                      <li v-for="(dep, dIndex) in prompt.dependencies" :key="dIndex" class="flex items-start">
                        <svg class="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span class="text-sm">{{ dep }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Raw Response Section (for debugging/fallback) - Modern Minimal -->
      <div 
        v-if="(getRoles.length === 0 && getAgents.length === 0 && getBackendPrompts.length === 0 && getFrontendPrompts.length === 0) || (generatedData.raw_response || generatedData.message)"
        class="bg-white border border-gray-200 rounded-2xl"
      >
        <div class="p-5">
          <div v-if="generatedData.message" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-5">
            <p class="text-sm text-yellow-700">{{ generatedData.message }}</p>
          </div>
          
          <div v-if="generatedData.raw_response" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h6 class="font-medium text-gray-700 mb-3 text-xs uppercase tracking-wider">{{ t('rawResponse') }}</h6>
            <pre class="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">{{ generatedData.raw_response }}</pre>
          </div>
          
          <div v-if="!hasData && !generatedData.raw_response && !generatedData.message" class="p-8 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm">{{ t('noResultsHint') }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State - Modern Minimal -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl p-10 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h4 class="text-lg font-semibold text-gray-700 mb-2">{{ t('noResults') }}</h4>
      <p class="text-gray-500">{{ t('noResultsHint') }}</p>
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

/* Mobile-specific styles */
@media (max-width: 640px) {
  /* Reduce card shadow for better mobile performance */
  .hover\:shadow-md {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  /* Ensure touch targets are adequate */
  button {
    min-height: 36px;
  }
  
  /* Prevent horizontal overflow */
  .overflow-hidden {
    overflow-x: hidden;
  }
}

/* Modern minimal design enhancements */
pre {
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  background: transparent;
  padding: 0;
}

/* Subtle hover effects for cards */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

/* Smooth transitions */
.transition-shadow {
  transition: box-shadow 0.2s ease;
}

.transition-colors {
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
</style>
