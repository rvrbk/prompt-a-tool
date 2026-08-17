<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  generatedData: {
    type: Object,
    default: null
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

const emit = defineEmits(['share-success', 'share-error'])

// State for share functionality
const shareUrl = ref(null)
const isSharing = ref(false)
const shareError = ref(null)
const shareCopied = ref(false)

// State for export notifications
const jsonExported = ref(false)
const markdownExported = ref(false)
const pdfExported = ref(false)

// Compute the data for export
const exportData = computed(() => {
  if (!props.generatedData) return null
  
  // Parse the generated data to extract roles, agents, and prompts
  const roles = props.generatedData.roles || []
  const agents = props.generatedData.agents || []
  const backendPrompts = props.generatedData.backend_prompts || []
  const frontendPrompts = props.generatedData.frontend_prompts || []
  
  return {
    metadata: {
      app_idea: props.questionnaireData?.idea || props.generatedData?.data?.idea || '',
      countries: props.questionnaireData?.countries || props.generatedData?.data?.countries || [],
      userTypes: props.questionnaireData?.userTypes || props.generatedData?.data?.userTypes || [],
      offlineAccess: props.questionnaireData?.offlineAccess || props.generatedData?.data?.offlineAccess || false,
      features: props.questionnaireData?.features || props.generatedData?.data?.features || [],
      aiFeatures: props.questionnaireData?.aiFeatures || props.generatedData?.data?.aiFeatures || [],
      generated_at: props.generatedData?.generated_at || new Date().toISOString(),
      session_id: props.sessionId
    },
    roles,
    agents,
    backend_prompts: backendPrompts,
    frontend_prompts: frontendPrompts
  }
})

// Helper to extract text from raw response
const parseRawResponse = () => {
  if (!props.generatedData?.raw_response) return null
  try {
    return JSON.parse(props.generatedData.raw_response)
  } catch {
    return null
  }
}

// Get roles from either structured data or raw response
const getRolesForExport = computed(() => {
  const parsed = parseRawResponse()
  if (exportData.value?.roles?.length) return exportData.value.roles
  if (parsed?.roles?.length) return parsed.roles
  return []
})

const getAgentsForExport = computed(() => {
  const parsed = parseRawResponse()
  if (exportData.value?.agents?.length) return exportData.value.agents
  if (parsed?.agents?.length) return parsed.agents
  return []
})

const getBackendPromptsForExport = computed(() => {
  const parsed = parseRawResponse()
  if (exportData.value?.backend_prompts?.length) return exportData.value.backend_prompts
  if (parsed?.backend_prompts?.length) return parsed.backend_prompts
  return []
})

const getFrontendPromptsForExport = computed(() => {
  const parsed = parseRawResponse()
  if (exportData.value?.frontend_prompts?.length) return exportData.value.frontend_prompts
  if (parsed?.frontend_prompts?.length) return parsed.frontend_prompts
  return []
})

// Export as JSON file
const exportAsJson = () => {
  if (!exportData.value) return
  
  const data = {
    ...exportData.value,
    roles: getRolesForExport.value,
    agents: getAgentsForExport.value,
    backend_prompts: getBackendPromptsForExport.value,
    frontend_prompts: getFrontendPromptsForExport.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `africa-prompt-export-${props.sessionId || 'session'}-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  jsonExported.value = true
  setTimeout(() => { jsonExported.value = false }, 2000)
}

// Export as Markdown file
const exportAsMarkdown = () => {
  if (!exportData.value) return
  
  const metadata = exportData.value.metadata
  const roles = getRolesForExport.value
  const agents = getAgentsForExport.value
  const backendPrompts = getBackendPromptsForExport.value
  const frontendPrompts = getFrontendPromptsForExport.value
  
  let markdown = `# Africa Prompt Generator Export\n\n`
  
  // Metadata section
  markdown += `## Project Overview\n\n`
  markdown += `**App Idea:** ${metadata.app_idea}\n\n`
  markdown += `**Target Countries:** ${metadata.countries.join(', ') || 'N/A'}\n\n`
  markdown += `**User Types:** ${metadata.userTypes.join(', ') || 'N/A'}\n\n`
  markdown += `**Offline Access:** ${metadata.offlineAccess ? 'Yes' : 'No'}\n\n`
  markdown += `**Core Features:** ${metadata.features.join(', ') || 'N/A'}\n\n`
  markdown += `**AI Features:** ${metadata.aiFeatures.join(', ') || 'N/A'}\n\n`
  markdown += `**Generated:** ${new Date(metadata.generated_at).toLocaleString()}\n\n`
  markdown += `---\n\n`
  
  // Roles section
  if (roles.length > 0) {
    markdown += `## User Roles\n\n`
    roles.forEach((role, index) => {
      markdown += `### ${role.name || `Role ${index + 1}`}\n\n`
      markdown += `**Description:** ${role.description || 'N/A'}\n\n`
      markdown += `**Type:** ${role.type || 'Standard'}\n\n`
      if (role.permissions?.length > 0) {
        markdown += `**Permissions:**\n`
        role.permissions.forEach(p => {
          markdown += `- ${p}\n`
        })
        markdown += `\n`
      }
      if (role.actions?.length > 0) {
        markdown += `**Actions:**\n`
        role.actions.forEach(a => {
          markdown += `- ${a}\n`
        })
        markdown += `\n`
      }
      markdown += `---\n\n`
    })
  }
  
  // Agents section
  if (agents.length > 0) {
    markdown += `## AI Agents\n\n`
    agents.forEach((agent, index) => {
      markdown += `### ${agent.name || `Agent ${index + 1}`}\n\n`
      markdown += `**Description:** ${agent.description || 'N/A'}\n\n`
      markdown += `**Type:** ${agent.type || 'Standard'}\n\n`
      if (agent.responsibilities?.length > 0) {
        markdown += `**Responsibilities:**\n`
        agent.responsibilities.forEach(r => {
          markdown += `- ${r}\n`
        })
        markdown += `\n`
      }
      if (agent.skills?.length > 0) {
        markdown += `**Skills:** ${agent.skills.join(', ')}\n\n`
      }
      if (agent.tools?.length > 0) {
        markdown += `**Tools:** ${agent.tools.join(', ')}\n\n`
      }
      markdown += `---\n\n`
    })
  }
  
  // Backend prompts section
  if (backendPrompts.length > 0) {
    markdown += `## Backend Prompts (Laravel)\n\n`
    backendPrompts.forEach((prompt, index) => {
      markdown += `### Prompt ${index + 1}\n\n`
      markdown += '\`\`\`\n'
      markdown += `${prompt}\n`
      markdown += '\`\`\`\n\n'
      markdown += '---\n\n'
    })
  }
  
  // Frontend prompts section
  if (frontendPrompts.length > 0) {
    markdown += `## Frontend Prompts (Vue.js)\n\n`
    frontendPrompts.forEach((prompt, index) => {
      markdown += `### Prompt ${index + 1}\n\n`
      markdown += '\`\`\`\n'
      markdown += `${prompt}\n`
      markdown += '\`\`\`\n\n'
      markdown += '---\n\n'
    })
  }
  
  markdown += `---\n\n`
  markdown += `*Generated by [Africa Prompt Generator](${window.location.origin})*\n`
  
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `africa-prompt-export-${props.sessionId || 'session'}-${Date.now()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  markdownExported.value = true
  setTimeout(() => { markdownExported.value = false }, 2000)
}

// Share session and generate shareable link
const shareSession = async () => {
  if (!props.sessionId) {
    shareError.value = 'No session ID to share. Please save your session first.'
    return
  }
  
  isSharing.value = true
  shareError.value = null
  shareUrl.value = null
  
  try {
    const response = await axios.post(`/api/sessions/${props.sessionId}/share`)
    
    if (response.data.status === 'success') {
      shareUrl.value = response.data.data.share_url
      emit('share-success', {
        shareUrl: shareUrl.value,
        shareToken: response.data.data.share_token
      })
    } else {
      shareError.value = response.data.message || 'Failed to share session'
      emit('share-error', shareError.value)
    }
  } catch (error) {
    console.error('Share failed:', error)
    if (error.response) {
      shareError.value = error.response.data?.message || 'Failed to share session'
    } else {
      shareError.value = 'Failed to share session. Please try again.'
    }
    emit('share-error', shareError.value)
  } finally {
    isSharing.value = false
  }
}

// Copy share URL to clipboard
const copyShareUrl = async () => {
  if (!shareUrl.value) return
  
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl.value
    textarea.style.position = 'fixed'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2000)
  }
}

// Check if we have data to export/share
const hasExportableData = computed(() => {
  return getRolesForExport.value.length > 0 ||
         getAgentsForExport.value.length > 0 ||
         getBackendPromptsForExport.value.length > 0 ||
         getFrontendPromptsForExport.value.length > 0
})

// Check if sharing is possible
const canShare = computed(() => {
  return props.sessionId !== null && props.sessionId !== ''
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- Export as JSON button -->
    <button
      @click="exportAsJson"
      :disabled="!hasExportableData"
      class="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span v-if="!jsonExported">JSON</span>
      <span v-else class="text-green-300">Downloaded!</span>
    </button>

    <!-- Export as Markdown button -->
    <button
      @click="exportAsMarkdown"
      :disabled="!hasExportableData"
      class="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span v-if="!markdownExported">MD</span>
      <span v-else class="text-green-300">Downloaded!</span>
    </button>

    <!-- Share button -->
    <button
      v-if="canShare"
      @click="shareSession"
      :disabled="isSharing"
      class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg v-if="!isSharing" class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
      <svg v-else class="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Share
    </button>

    <!-- Share URL display (when shared) -->
    <div v-if="shareUrl" class="relative">
      <input
        :value="shareUrl"
        readonly
        class="px-3 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        @click="copyShareUrl"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 transition-colors"
      >
        <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>

    <!-- Share error message -->
    <div v-if="shareError" class="text-red-500 text-xs p-1">
      {{ shareError }}
    </div>

    <!-- Tooltip for share URL copied -->
    <div v-if="shareCopied" class="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
      URL copied!
    </div>
  </div>
</template>

<style scoped>
/* Ensure buttons have consistent sizing */
button {
  min-width: 60px;
}

/* Tooltip animation */
div[class*="absolute top-full"] {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
