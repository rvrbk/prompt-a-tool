<script setup>
import { ref } from 'vue'
import Questionnaire from './components/Questionnaire.vue'

// App state
const currentView = ref('questionnaire')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-green-700 to-green-500 text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 class="text-xl font-bold">Africa Prompt Generator</h1>
          </div>
          <div class="text-sm opacity-90 hidden md:block">
            Build African-focused apps with AI-generated prompts
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-md overflow-hidden min-h-[60vh]">
        <component :is="currentView" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-12 py-6 text-center text-gray-500 text-sm">
      <p>Built with Vue.js + Laravel | Mistral AI Integration</p>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles can go here */
</style>
