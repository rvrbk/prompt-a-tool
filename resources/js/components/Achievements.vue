<script setup>
import { inject } from 'vue'
import useAchievements from '../composables/useAchievements.js'
import { formatDate } from './account/formatters.js'

const { t, currentLanguage } = inject('translations')
const { state, streak, badges, unlockedCount } = useAchievements()
</script>

<template>
  <div class="p-6 lg:p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{{ t('achievementsTitle') }}</h2>
      <p class="text-gray-500 leading-relaxed text-xs">{{ t('achievementsSubtitle') }}</p>
    </div>

    <!-- Stats -->
    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('streakCurrent') }}</dt>
        <dd class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold text-gray-900">{{ streak }}</span>
          <span class="text-sm text-gray-500">{{ t('streakDaysLabel') }}</span>
          <span v-if="streak > 0" aria-hidden="true">🔥</span>
        </dd>
      </div>
      <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('streakBest') }}</dt>
        <dd class="mt-2 flex items-baseline gap-2">
          <span class="text-3xl font-bold text-gray-900">{{ state.best }}</span>
          <span class="text-sm text-gray-500">{{ t('streakDaysLabel') }}</span>
        </dd>
      </div>
      <div class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('achievementsTotal') }}</dt>
        <dd class="mt-2 text-3xl font-bold text-gray-900">{{ state.total }}</dd>
      </div>
    </dl>

    <!-- Badges -->
    <div class="flex items-baseline justify-between mb-4">
      <h3 class="text-base font-semibold text-gray-800">{{ t('badgesTitle') }}</h3>
      <span class="text-sm text-gray-500">{{ unlockedCount }} / {{ badges.length }}</span>
    </div>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li
        v-for="badge in badges"
        :key="badge.id"
        class="flex items-start gap-4 rounded-2xl border p-4 transition-all"
        :class="badge.unlockedAt ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50'"
      >
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          :class="badge.unlockedAt ? 'bg-amber-50' : 'bg-gray-100 grayscale opacity-50'"
          aria-hidden="true"
        >{{ badge.icon }}</span>
        <div class="min-w-0">
          <h4 class="text-sm font-semibold" :class="badge.unlockedAt ? 'text-gray-900' : 'text-gray-500'">
            {{ t(`badge_${badge.id}`) }}
          </h4>
          <p class="mt-1 text-xs text-gray-500 leading-relaxed">{{ t(`badge_${badge.id}_desc`) }}</p>
          <p v-if="badge.unlockedAt" class="mt-2 text-xs font-medium text-green-700">
            ✓ {{ formatDate(badge.unlockedAt, currentLanguage) }}
          </p>
        </div>
      </li>
    </ul>

    <p class="mt-8 text-xs text-gray-400">{{ t('achievementsNote') }}</p>
  </div>
</template>
