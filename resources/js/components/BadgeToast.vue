<script setup>
import { inject, watch } from 'vue'
import useAchievements, { BADGES } from '../composables/useAchievements.js'

const { t } = inject('translations')
const { toasts, dismissToast } = useAchievements()

const AUTO_DISMISS_MS = 6000
const timers = new Map()
const iconFor = (id) => BADGES.find((badge) => badge.id === id)?.icon

// Each new toast removes itself after a few seconds
watch(toasts, (ids) => {
  ids.forEach((id) => {
    if (!timers.has(id)) timers.set(id, setTimeout(() => { timers.delete(id); dismissToast(id) }, AUTO_DISMISS_MS))
  })
}, { deep: true, immediate: true })

</script>

<template>
  <div class="fixed bottom-4 start-4 end-4 sm:end-auto sm:w-80 z-[90] flex flex-col gap-3 pointer-events-none" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="id in toasts"
        :key="id"
        class="pointer-events-auto flex items-start gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-lg"
        role="status"
      >
        <span class="text-2xl" aria-hidden="true">{{ iconFor(id) }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-amber-600 uppercase tracking-wider">{{ t('badgeUnlockedToast') }}</p>
          <p class="text-sm font-semibold text-gray-900">{{ t(`badge_${id}`) }}</p>
          <router-link to="/achievements" class="text-xs text-gray-500 underline hover:text-gray-900" @click="dismissToast(id)">
            {{ t('navAchievements') }}
          </router-link>
        </div>
        <button type="button" @click="dismissToast(id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none" :aria-label="t('authClose')">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active { transition: none; }
}
</style>
