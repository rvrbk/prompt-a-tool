<script setup>
import { inject } from 'vue'
import useAuth from '../../composables/useAuth.js'

const { t } = inject('translations')
const { openSignIn } = useAuth()
</script>

<template>
  <div class="flex flex-col items-center text-center py-16 px-4">
    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h2 class="text-lg font-semibold text-gray-900">{{ t('myPromptsSignInTitle') }}</h2>
    <p class="mt-1 text-sm text-gray-500 max-w-sm">{{ t('myPromptsSignInBody') }}</p>
    <!-- .stop so the header's click-outside handler doesn't immediately close the panel -->
    <button
      type="button"
      @click.stop="openSignIn"
      class="mt-6 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      {{ t('authSignIn') }}
    </button>
  </div>
</template>
