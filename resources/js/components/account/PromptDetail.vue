<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import useAuth from '../../composables/useAuth.js'
import ResultsDisplay from '../ResultsDisplay.vue'
import SignInRequired from './SignInRequired.vue'
import { PLATFORM_LABEL_KEYS, formatDate } from './formatters.js'

const { t, currentLanguage } = inject('translations')
const { user, loaded } = useAuth()
const route = useRoute()
const router = useRouter()

const generation = ref(null)
const status = ref('idle') // idle | loading | ready | not-found | error

const load = async () => {
  status.value = 'loading'
  try {
    const { data } = await axios.get(`/api/prompts/${route.params.id}`)
    generation.value = data.data
    status.value = 'ready'
  } catch (error) {
    status.value = error.response?.status === 404 ? 'not-found' : 'error'
  }
}

// ResultsDisplay expects the shape of a fresh /api/generate-prompts response
const generatedData = computed(() => generation.value && { ...generation.value.result })
const questionnaireData = computed(() => generation.value && {
  idea: generation.value.idea,
  targetPlatform: generation.value.target_platform,
  followUpAnswers: generation.value.follow_up_answers,
})

watch(
  () => [user.value?.id, route.params.id],
  ([id]) => {
    generation.value = null
    if (id) load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="p-4 sm:p-6">
    <router-link
      to="/account/prompts"
      class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('myPromptsBack') }}
    </router-link>

    <div v-if="!loaded || status === 'loading'" class="mt-6 space-y-3" aria-busy="true">
      <div class="h-8 w-2/3 rounded-lg bg-gray-100 animate-pulse"></div>
      <div class="h-4 w-1/3 rounded bg-gray-100 animate-pulse"></div>
      <div class="h-64 rounded-xl bg-gray-100 animate-pulse mt-6"></div>
    </div>

    <SignInRequired v-else-if="!user" />

    <div v-else-if="status === 'not-found'" class="text-center py-16">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('myPromptsNotFound') }}</h2>
      <router-link to="/account/prompts" class="mt-3 inline-block text-sm font-medium text-gray-900 underline">{{ t('myPromptsBack') }}</router-link>
    </div>

    <div v-else-if="status === 'error'" role="alert" class="text-center py-16">
      <p class="text-sm text-gray-600">{{ t('myPromptsLoadError') }}</p>
      <button type="button" @click="load" class="mt-3 text-sm font-medium text-gray-900 underline">{{ t('myPromptsRetry') }}</button>
    </div>

    <template v-else-if="generation">
      <header class="mt-4 pb-4 border-b border-gray-100">
        <h1 class="text-lg sm:text-xl font-semibold text-gray-900 break-words whitespace-pre-line">{{ generation.idea }}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
            {{ t(PLATFORM_LABEL_KEYS[generation.target_platform] || 'webApp') }}
          </span>
          <time :datetime="generation.created_at">{{ formatDate(generation.created_at, currentLanguage) }}</time>
        </div>
      </header>

      <ResultsDisplay
        :generatedData="generatedData"
        :isVisible="true"
        :questionnaireData="questionnaireData"
        @close="router.push('/account/prompts')"
      />
    </template>
  </div>
</template>
