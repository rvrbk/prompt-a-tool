/**
 * Build an AGENTS.md file from a generation, so AI coding agents (Claude Code,
 * Cursor, Codex, ...) pick up the project context straight from the repo root.
 */

const STACKS = {
  web: ['Laravel (PHP) API backend', 'Vue.js 3 (Composition API) + Tailwind CSS frontend', 'PWA: service worker, manifest and offline caching'],
  ios: ['Swift / SwiftUI app', 'Backend: Node.js, Laravel or Firebase (see the backend plan)'],
  android: ['Kotlin / Jetpack Compose app', 'Backend: see the backend plan'],
  both: ['Cross-platform mobile app (Flutter or React Native)', 'Backend: see the backend plan'],
}

const asList = (items) => (Array.isArray(items) ? items.filter(Boolean) : [])

const bullets = (items) => asList(items).map((item) => `- ${item}`).join('\n')

// Prompts are objects with iteration/title/description/tasks/dependencies, but older data can be plain strings
const formatIteration = (prompt, index, t) => {
  if (typeof prompt === 'string') {
    return `#### ${index + 1}\n\n${prompt}\n`
  }

  const number = prompt.iteration ?? index + 1
  let out = `#### ${number}${prompt.title ? `. ${prompt.title}` : ''}\n\n`
  if (prompt.description) out += `${prompt.description}\n\n`
  if (asList(prompt.tasks).length) out += `**${t('tasks')}:**\n${bullets(prompt.tasks)}\n\n`
  if (asList(prompt.dependencies).length) out += `**${t('dependencies')}:**\n${bullets(prompt.dependencies)}\n\n`
  return out
}

/**
 * @param {object} args
 * @param {string} args.idea
 * @param {string} args.platform web | ios | android | both
 * @param {Array} args.roles
 * @param {Array} args.agents
 * @param {Array} args.backendPrompts
 * @param {Array} args.frontendPrompts
 * @param {(key: string) => string} args.t translation function
 */
export function buildAgentsMd({ idea, platform, roles, agents, backendPrompts, frontendPrompts, t }) {
  let md = `# AGENTS.md\n\n${t('agentsMdIntro')}\n\n`

  md += `## ${t('agentsMdOverview')}\n\n${idea || ''}\n\n`

  md += `## ${t('agentsMdStack')}\n\n${bullets(STACKS[platform] || STACKS.web)}\n\n`

  md += `## ${t('agentsMdGuidelines')}\n\n${bullets([
    t('agentsMdGuideOrder'),
    t('agentsMdGuideSmall'),
    t('agentsMdGuideAsk'),
  ])}\n\n`

  if (asList(roles).length) {
    md += `## ${t('userRoles')}\n\n`
    roles.forEach((role, i) => {
      md += `### ${role.name || `${i + 1}`}\n\n`
      if (role.description) md += `${role.description}\n\n`
      if (asList(role.permissions).length) md += `**${t('permissions')}:**\n${bullets(role.permissions)}\n\n`
      if (asList(role.actions).length) md += `**${t('actions')}:**\n${bullets(role.actions)}\n\n`
    })
  }

  if (asList(agents).length) {
    md += `## ${t('aiAgents')}\n\n`
    agents.forEach((agent, i) => {
      md += `### ${agent.name || `${i + 1}`}\n\n`
      if (agent.description) md += `${agent.description}\n\n`
      if (asList(agent.responsibilities).length) md += `**${t('responsibilities')}:**\n${bullets(agent.responsibilities)}\n\n`
      if (asList(agent.skills).length) md += `**${t('skills')}:** ${agent.skills.join(', ')}\n\n`
      if (asList(agent.tools).length) md += `**${t('tools')}:** ${agent.tools.join(', ')}\n\n`
    })
  }

  const plan = [
    [t('backendPrompts'), backendPrompts],
    [t('frontendPrompts'), frontendPrompts],
  ].filter(([, prompts]) => asList(prompts).length)

  if (plan.length) {
    md += `## ${t('agentsMdPlan')}\n\n`
    plan.forEach(([heading, prompts]) => {
      md += `### ${heading}\n\n`
      prompts.forEach((prompt, i) => {
        md += formatIteration(prompt, i, t)
      })
    })
  }

  return `${md.trimEnd()}\n`
}
