<script setup>
import { ref, inject } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en'
  }
})

// Use translations from App.vue provider if available
const translations = inject('translations')
const t = translations?.t || ((key) => getTranslation(key))

// Buy Me a Coffee widget URL - configured via environment variable
const buyMeACoffeeUsername = import.meta.env.VITE_BUY_ME_A_COFFEE_USERNAME || 'rvrbkdev4'
const buyMeACoffeeUrl = ref(`https://www.buymeacoffee.com/${buyMeACoffeeUsername}`)

// Buy Me a Coffee translations
const buyMeACoffeeTranslations = {
  en: {
    buyMeACoffee: 'Buy me a coffee',
    buyMeACoffeeDescription: 'Support my work'
  },
  am: {
    buyMeACoffee: 'በማዕከላት ኩኪ ይገዙኝ',
    buyMeACoffeeDescription: 'ሂደቱን ይደርግብኝ'
  },
  ar: {
    buyMeACoffee: 'اشتر لي قهوة',
    buyMeACoffeeDescription: 'دعم عملي'
  },
  fr: {
    buyMeACoffee: 'Offrez-moi un café',
    buyMeACoffeeDescription: 'Soutenez mon travail'
  },
  ha: {
    buyMeACoffee: 'Saya kofa',
    buyMeACoffeeDescription: 'Taimaka mini'
  },
  ig: {
    buyMeACoffee: 'Gọara m kofi',
    buyMeACoffeeDescription: 'Kpọtụrụ m ọrụ'
  },
  lg: {
    buyMeACoffee: 'Nkunyuma coffee',
    buyMeACoffeeDescription: 'Kusasula obul Your work'
  },
  or: {
    buyMeACoffee: 'Kofii hafiif',
    buyMeACoffeeDescription: 'Barnoota wayita sanu'
  },
  sw: {
    buyMeACoffee: 'Nunua kahawa',
    buyMeACoffeeDescription: 'Usaidie kazi yangu'
  },
  yo: {
    buyMeACoffee: 'Ran mi lowo kofa',
    buyMeACoffeeDescription: 'Ṣe aṣe mi lọwọ'
  }
}

const getTranslation = (key) => {
  const lang = props.language || 'en'
  const translationsForLang = buyMeACoffeeTranslations[lang] || buyMeACoffeeTranslations.en
  return translationsForLang[key] || buyMeACoffeeTranslations.en[key]
}

// Simple floating button that redirects to Buy Me a Coffee
const handleBuyMeACoffeeClick = () => {
  window.open(buyMeACoffeeUrl.value, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div v-if="show" class="w-full bg-yellow-500 py-2">
    <!-- Buy Me a Coffee banner -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button 
        @click="handleBuyMeACoffeeClick"
        class="w-full text-white font-medium text-sm flex items-center justify-center hover:bg-yellow-600 transition-all duration-200 py-2"
        :aria-label="getTranslation('buyMeACoffee')"
      >
        <svg
          class="w-4 h-4 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path class="steam steam-1" d="M6 1.5v3" />
          <path class="steam steam-2" d="M10 1.5v3" />
          <path class="steam steam-3" d="M14 1.5v3" />
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        </svg>
        <span>{{ getTranslation('buyMeACoffee') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
button:hover {
  transform: scale(1.05);
}

.steam {
  transform-origin: center bottom;
  animation: steamRise 2s ease-in-out infinite;
  opacity: 0;
}

.steam-1 {
  animation-delay: 0s;
}

.steam-2 {
  animation-delay: 0.4s;
}

.steam-3 {
  animation-delay: 0.8s;
}

@keyframes steamRise {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-4px);
    opacity: 0;
  }
}
</style>