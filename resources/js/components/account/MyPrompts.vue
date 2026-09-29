<script setup>
import { ref, inject, watch } from 'vue'
import axios from 'axios'
import useAuth from '../../composables/useAuth.js'
import SignInRequired from './SignInRequired.vue'
import { PLATFORM_LABEL_KEYS, formatDate } from './formatters.js'

const { t, currentLanguage } = inject('translations')
const { user, loaded } = useAuth()

const items = ref([])
const meta = ref(null)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(false)
const confirmingId = ref(null)
const deletingId = ref(null)

const fetchPage = async (page = 1) => {
  const { data } = await axios.get('/api/prompts', { params: { page } })
  meta.value = data.meta
  return data.data
}

const load = async () => {
  loading.value = true
  error.value = false
  try {
    items.value = await fetchPage(1)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!meta.value || meta.value.current_page >= meta.value.last_page) return
  loadingMore.value = true
  try {
    const next = await fetchPage(meta.value.current_page + 1)
    // Skip anything already shown (the list can shift after deletes)
    const seen = new Set(items.value.map((item) => item.id))
    items.value.push(...next.filter((item) => !seen.has(item.id)))
  } catch {
    error.value = true
  } finally {
    loadingMore.value = false
  }
}

const remove = async (id) => {
  deletingId.value = id
  try {
    await axios.delete(`/api/prompts/${id}`)
    items.value = items.value.filter((item) => item.id !== id)
    if (meta.value) meta.value.total -= 1
  } catch {
    error.value = true
  } finally {
    deletingId.value = null
    confirmingId.value = null
  }
}

// (Re)load whenever someone signs in; clear when they sign out
watch(
  () => user.value?.id,
  (id) => {
    items.value = []
    meta.value = null
    if (id) load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="p-4 sm:p-6">
    <div class="px-0 sm:px-2 py-4 border-b border-gray-100 mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('myPrompts') }}</h1>
        <p class="text-gray-600 mt-1 text-sm">{{ t('myPromptsSubtitle') }}</p>
      </div>
      <router-link
        v-if="user"
        to="/"
        class="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        {{ t('myPromptsNew') }}
      </router-link>
    </div>

    <!-- Waiting for the session check -->
    <div v-if="!loaded" class="space-y-3" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-gray-100 animate-pulse"></div>
    </div>

    <SignInRequired v-else-if="!user" />

    <template v-else>
      <div v-if="loading" class="space-y-3" aria-busy="true">
        <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-gray-100 animate-pulse"></div>
      </div>

      <div v-else-if="error && items.length === 0" role="alert" class="text-center py-12">
        <p class="text-sm text-gray-600">{{ t('myPromptsLoadError') }}</p>
        <button type="button" @click="load" class="mt-3 text-sm font-medium text-gray-900 underline">{{ t('myPromptsRetry') }}</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="flex flex-col items-center text-center py-16 px-4">
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-900">{{ t('myPromptsEmptyTitle') }}</h2>
        <p class="mt-1 text-sm text-gray-500 max-w-sm">{{ t('myPromptsEmptyBody') }}</p>
        <router-link to="/" class="mt-6 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
          {{ t('myPromptsNew') }}
        </router-link>
      </div>

      <template v-else>
        <ul class="space-y-3">
          <li
            v-for="item in items"
            :key="item.id"
            class="group relative rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
          >
            <router-link
              :to="`/account/prompts/${item.id}`"
              class="block p-4 sm:p-5 pr-14 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <p class="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 break-words">{{ item.idea_excerpt }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                  {{ t(PLATFORM_LABEL_KEYS[item.target_platform] || 'webApp') }}
                </span>
                <time :datetime="item.created_at">{{ formatDate(item.created_at, currentLanguage) }}</time>
                <span>{{ t('myPromptsCounts').replace(':roles', item.counts.roles).replace(':agents', item.counts.agents).replace(':prompts', item.counts.prompts) }}</span>
              </div>
            </router-link>

            <!-- Delete, with inline confirmation -->
            <div class="absolute top-3 right-3">
              <button
                v-if="confirmingId !== item.id"
                type="button"
                @click="confirmingId = item.id"
                :aria-label="t('myPromptsDelete')"
                class="p-2 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div v-else class="flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                <button
                  type="button"
                  @click="remove(item.id)"
                  :disabled="deletingId === item.id"
                  class="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {{ t('myPromptsDeleteConfirm') }}
                </button>
                <button
                  type="button"
                  @click="confirmingId = null"
                  class="px-2.5 py-1.5 rounded-md text-gray-600 text-xs font-medium hover:bg-gray-100"
                >
                  {{ t('myPromptsCancel') }}
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="meta && meta.current_page < meta.last_page" class="mt-6 text-center">
          <button
            type="button"
            @click="loadMore"
            :disabled="loadingMore"
            class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {{ loadingMore ? t('authSubmitting') : t('myPromptsLoadMore') }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>
