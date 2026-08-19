<script setup>
import Questionnaire from './components/Questionnaire.vue'
import useGoogleAnalytics from './composables/useGoogleAnalytics.js'

// Initialize Google Analytics
useGoogleAnalytics()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <svg class="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 class="text-lg font-semibold text-gray-900 tracking-tight">Prompt Generator</h1>
          </div>
          <div class="text-sm text-gray-500 hidden md:block">
            Build apps with AI-generated prompts
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[60vh]">
        <Questionnaire />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-6 text-center text-gray-400 text-sm">
      <p>Built with Vue.js + Laravel | Mistral AI Integration</p>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles can go here */
</style>
