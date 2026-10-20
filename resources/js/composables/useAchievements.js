/**
 * Streaks and badges
 *
 * Progress lives in this browser's localStorage, so it works for guests and
 * signed-in users alike. Components report what the user did with `record()`;
 * everything else (streaks, unlocked badges, toasts) is derived from that.
 */
import { ref, computed } from 'vue'

const STORAGE_KEY = 'prompt-generator-achievements'
const MAX_GENERATIONS = 100
const MAX_DAYS = 400
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const emptyState = () => ({
  total: 0,
  generations: [], // timestamps (ms), newest last
  days: [], // local dates (YYYY-MM-DD) with at least one generation
  languages: [],
  personalities: [],
  roasts: 0,
  surprises: 0,
  agentsExports: 0,
  best: 0,
  unlocked: {}, // badge id -> ISO timestamp
})

const load = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored && typeof stored === 'object') return { ...emptyState(), ...stored }
  } catch {
    // Storage unavailable or corrupt: start fresh
  }
  return emptyState()
}

const save = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Private mode or quota: progress just won't persist
  }
}

// Module-level state so every component sees the same progress
const state = ref(load())
// Badge ids waiting to be shown as toasts
const toasts = ref([])

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const shiftDay = (date, delta) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + delta)
  return copy
}

/**
 * Length of the run of consecutive days ending today. A run that ended
 * yesterday still counts, so the streak is not lost before the day is over.
 */
const currentStreak = (days, now = new Date()) => {
  const set = new Set(days)
  let cursor = now
  if (!set.has(dayKey(cursor))) cursor = shiftDay(cursor, -1)
  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak++
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

// Id doubles as the translation key suffix: badge_<id> and badge_<id>_desc
export const BADGES = [
  { id: 'firstPrompt', icon: '🚀', earned: (s) => s.total >= 1 },
  { id: 'fiveInWeek', icon: '🔥', earned: (s, now) => s.generations.filter((ts) => now - ts <= WEEK_MS).length >= 5 },
  { id: 'streak3', icon: '📅', earned: (s) => s.best >= 3 },
  { id: 'streak7', icon: '🏆', earned: (s) => s.best >= 7 },
  { id: 'polyglot', icon: '🌍', earned: (s) => s.languages.length >= 3 },
  { id: 'shapeshifter', icon: '🎭', earned: (s) => s.personalities.length >= 3 },
  { id: 'roaster', icon: '🍖', earned: (s) => s.roasts >= 1 },
  { id: 'diceRoller', icon: '🎲', earned: (s) => s.surprises >= 1 },
  { id: 'shipper', icon: '📦', earned: (s) => s.agentsExports >= 1 },
]

const unique = (list, value) => (value && !list.includes(value) ? [...list, value] : list)

/**
 * Apply an event to the progress and unlock any badges it earned.
 * Exported for tests; components use `record` from the composable.
 */
export const applyEvent = (current, event, payload = {}, now = new Date()) => {
  const next = { ...current }

  if (event === 'generation') {
    next.total += 1
    next.generations = [...next.generations, now.getTime()].slice(-MAX_GENERATIONS)
    next.days = unique(next.days, dayKey(now)).slice(-MAX_DAYS)
    next.languages = unique(next.languages, payload.language)
    next.personalities = unique(next.personalities, payload.personality || 'default')
    next.best = Math.max(next.best, currentStreak(next.days, now))
  } else if (event === 'roast') {
    next.roasts += 1
  } else if (event === 'surprise') {
    next.surprises += 1
  } else if (event === 'agentsExport') {
    next.agentsExports += 1
  } else {
    return { state: current, newlyUnlocked: [] }
  }

  const newlyUnlocked = BADGES
    .filter((badge) => !next.unlocked[badge.id] && badge.earned(next, now.getTime()))
    .map((badge) => badge.id)
  next.unlocked = {
    ...next.unlocked,
    ...Object.fromEntries(newlyUnlocked.map((id) => [id, now.toISOString()])),
  }

  return { state: next, newlyUnlocked }
}

export default function useAchievements() {
  const streak = computed(() => currentStreak(state.value.days))
  const badges = computed(() => BADGES.map((badge) => ({
    ...badge,
    unlockedAt: state.value.unlocked[badge.id] || null,
  })))
  const unlockedCount = computed(() => badges.value.filter((badge) => badge.unlockedAt).length)

  const record = (event, payload) => {
    const result = applyEvent(state.value, event, payload)
    state.value = result.state
    save(state.value)
    toasts.value.push(...result.newlyUnlocked)
  }

  const dismissToast = (id) => {
    toasts.value = toasts.value.filter((toastId) => toastId !== id)
  }

  return { state, streak, badges, unlockedCount, toasts, record, dismissToast }
}

export { currentStreak, dayKey }
