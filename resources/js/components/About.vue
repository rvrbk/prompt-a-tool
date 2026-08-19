<script setup>
import { ref } from 'vue'
import useTranslations from '../composables/useTranslations.js'

const { t } = useTranslations()
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="px-2 py-4 border-b border-gray-100 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('aboutTitle') }}</h1>
      <p class="text-gray-600 mt-1">{{ t('aboutSubtitle') }}</p>
    </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- What it does -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ t('aboutWhatItDoes') }}</h2>
          <p class="text-gray-600 leading-relaxed">
            {{ t('aboutDescription1') }}
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            {{ t('aboutDescription2') }}
          </p>
        </section>

        <!-- Simple steps -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ t('aboutHowItWorks') }}</h2>
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-medium">1</span>
              </div>
              <div>
                <p class="text-gray-600">{{ t('aboutStep1') }}</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-medium">2</span>
              </div>
              <div>
                <p class="text-gray-600">{{ t('aboutStep2') }}</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-medium">3</span>
              </div>
              <div>
                <p class="text-gray-600">{{ t('aboutStep3') }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- What you get -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ t('aboutWhatYouGet') }}</h2>
          <p class="text-gray-600 leading-relaxed mb-4">{{ t('aboutWhatYouGetDesc') }}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">{{ t('aboutUserRoles') }}</h3>
              <p class="text-gray-600 text-sm">{{ t('aboutUserRolesDesc') }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">{{ t('aboutAIAgents') }}</h3>
              <p class="text-gray-600 text-sm">{{ t('aboutAIAgentsDesc') }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">{{ t('aboutBackendPrompts') }}</h3>
              <p class="text-gray-600 text-sm">{{ t('aboutBackendPromptsDesc') }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">{{ t('aboutFrontendPrompts') }}</h3>
              <p class="text-gray-600 text-sm">{{ t('aboutFrontendPromptsDesc') }}</p>
            </div>
          </div>
        </section>

        <!-- Why it's useful -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">{{ t('aboutWhyUseful') }}</h2>
          <p class="text-gray-600 leading-relaxed">
            {{ t('aboutWhyUsefulDesc') }}
          </p>
        </section>

        <!-- Back link -->
        <div class="pt-6 border-t border-gray-100">
          <router-link to="/" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('backToGenerator') }}
          </router-link>
        </div>
      </div>
    </div>
</template>
