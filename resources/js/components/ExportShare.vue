<script setup>
import { ref, computed, inject } from 'vue'
import useGoogleAnalytics from '../composables/useGoogleAnalytics.js'

const props = defineProps({
  generatedData: {
    type: Object,
    default: null
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

const emit = defineEmits([])

// Use translations from App.vue provider
const { t } = inject('translations')

// Google Analytics tracking
const { trackExport } = useGoogleAnalytics()



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
  
  // Safely extract questionnaire data
  const qData = props.questionnaireData || props.generatedData?.data || {}
  
  return {
    metadata: {
      app_idea: qData?.idea || '',
      followUpAnswers: qData?.followUpAnswers || {},
      offlineAccess: qData?.offlineAccess !== undefined ? qData.offlineAccess : false,
      generated_at: props.generatedData?.generated_at || new Date().toISOString()
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
    frontend_prompts: getFrontendPromptsForExport.value,
    follow_up_questions: props.followUpQuestions
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `prompt-export-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  // Track export
  trackExport('json')
  
  jsonExported.value = true
  setTimeout(() => { jsonExported.value = false }, 2000)
}

// Export as Markdown file
const exportAsMarkdown = () => {
  if (!exportData.value) return
  
  const metadata = exportData.value?.metadata || {}
  const roles = getRolesForExport.value
  const agents = getAgentsForExport.value
  const backendPrompts = getBackendPromptsForExport.value
  const frontendPrompts = getFrontendPromptsForExport.value
  
  let markdown = `# ${t('promptGeneratorExport')}\n\n`
  
  // Metadata section
  markdown += `## ${t('projectOverview')}\n\n`
  markdown += `**${t('appIdeaExport')}:** ${metadata.app_idea || ''}\n\n`
  
  // Include follow-up questions with answers
  if (props.followUpQuestions.length > 0) {
    markdown += `**${t('followUpQuestions')}:**\n\n`
    props.followUpQuestions.forEach((question, index) => {
      const answer = metadata.followUpAnswers?.[question.id]
      markdown += `${index + 1}. **Q${question.id}:** ${question.question}\n`
      markdown += `   **${t('answer')}:** ${answer !== undefined ? answer : t('notAnswered')}\n\n`
    })
  }
  
  markdown += `**Offline Access:** ${metadata.offlineAccess === true ? t('yes') : t('no')}\n\n`
  markdown += `**${t('generated')}:** ${new Date(metadata.generated_at).toLocaleString()}\n\n`
  markdown += `---\n\n`
  
  // Roles section
  if (roles.length > 0) {
    markdown += `## ${t('userRoles')}\n\n`
    roles.forEach((role, index) => {
      markdown += `### ${role.name || `Role ${index + 1}`}\n\n`
      markdown += `**${t('description')}:** ${role.description || t('na')}\n\n`
      markdown += `**${t('type')}:** ${role.type || t('standard')}\n\n`
      if (role.permissions?.length > 0) {
        markdown += `**${t('permissions')}:**\n`
        role.permissions.forEach(p => {
          markdown += `- ${p}\n`
        })
        markdown += `\n`
      }
      if (role.actions?.length > 0) {
        markdown += `**${t('actions')}:**\n`
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
    markdown += `## ${t('aiAgents')}\n\n`
    agents.forEach((agent, index) => {
      markdown += `### ${agent.name || `Agent ${index + 1}`}\n\n`
      markdown += `**${t('description')}:** ${agent.description || t('na')}\n\n`
      markdown += `**${t('type')}:** ${agent.type || t('standard')}\n\n`
      if (agent.responsibilities?.length > 0) {
        markdown += `**${t('responsibilities')}:**\n`
        agent.responsibilities.forEach(r => {
          markdown += `- ${r}\n`
        })
        markdown += `\n`
      }
      if (agent.skills?.length > 0) {
        markdown += `**${t('skills')}:** ${agent.skills.join(', ')}\n\n`
      }
      if (agent.tools?.length > 0) {
        markdown += `**${t('tools')}:** ${agent.tools.join(', ')}\n\n`
      }
      markdown += `---\n\n`
    })
  }
  
  // Backend prompts section
  if (backendPrompts.length > 0) {
    markdown += `## ${t('backendPromptsLaravel')}\n\n`
    backendPrompts.forEach((prompt, index) => {
      markdown += `### ${t('promptLabel')} ${index + 1}\n\n`
      markdown += '\`\`\`\n'
      // Handle both string and object prompts
      if (typeof prompt === 'string') {
        markdown += `${prompt}\n`
      } else {
        markdown += `${JSON.stringify(prompt, null, 2)}\n`
      }
      markdown += '\`\`\`\n\n'
      markdown += '---\n\n'
    })
  }
  
  // Frontend prompts section
  if (frontendPrompts.length > 0) {
    markdown += `## ${t('frontendPromptsVue')}\n\n`
    frontendPrompts.forEach((prompt, index) => {
      markdown += `### ${t('promptLabel')} ${index + 1}\n\n`
      markdown += '\`\`\`\n'
      // Handle both string and object prompts
      if (typeof prompt === 'string') {
        markdown += `${prompt}\n`
      } else {
        markdown += `${JSON.stringify(prompt, null, 2)}\n`
      }
      markdown += '\`\`\`\n\n'
      markdown += '---\n\n'
    })
  }
  
  markdown += `---\n\n`
  markdown += `*Generated by [${t('appTitle')}](${window.location.origin})*\n`
  
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `prompt-export-${Date.now()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  // Track export
  trackExport('markdown')
  
  markdownExported.value = true
  setTimeout(() => { markdownExported.value = false }, 2000)
}

// Check if we have data to export
const hasExportableData = computed(() => {
  return getRolesForExport.value.length > 0 ||
         getAgentsForExport.value.length > 0 ||
         getBackendPromptsForExport.value.length > 0 ||
         getFrontendPromptsForExport.value.length > 0
})
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Export as JSON button - Modern Minimal -->
    <button
      @click="exportAsJson"
      :disabled="!hasExportableData"
      class="px-4 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span v-if="!jsonExported">{{ t('exportJson') }}</span>
      <span v-else class="text-gray-300">{{ t('jsonDownloaded') }}</span>
    </button>

    <!-- Export as Markdown button - Modern Minimal -->
    <button
      @click="exportAsMarkdown"
      :disabled="!hasExportableData"
      class="px-4 py-2.5 bg-gray-700 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span v-if="!markdownExported">{{ t('exportMarkdown') }}</span>
      <span v-else class="text-gray-300">{{ t('markdownDownloaded') }}</span>
    </button>
  </div>
</template>

<style scoped>
/* Ensure buttons have consistent sizing */
button {
  min-width: 60px;
}

/* Smooth transitions */
button {
  transition: background-color 0.15s ease, transform 0.1s ease;
}

button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
