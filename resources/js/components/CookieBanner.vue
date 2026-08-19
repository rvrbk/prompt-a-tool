<script setup>
import { ref, onMounted, inject } from 'vue'

// Use translations from App.vue provider
const { t } = inject('translations')

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['accept', 'dismiss'])

const showBanner = ref(props.show)

// Cookie translations - since these are shown before language is set, we need basic translations
const cookieTranslations = {
  en: {
    title: 'We use cookies',
    message: 'We use cookies to remember your language preference.',
    accept: 'Accept',
    dismiss: 'Dismiss'
  },
  am: {
    title: 'ኩኪዎችን አገልግሎት።',
    message: 'ኩኪዎችን አገልግሎት አድርገን ቋንቋዎች መለወጥ።',
    accept: 'አቀበል',
    dismiss: 'አጽዳ'
  },
  ar: {
    title: 'نستخدم ملفات تعريف الارتباط',
    message: 'نستخدم ملفات تعريف الارتباط لتذكر تفضيلات اللغة الخاصة بك.',
    accept: 'قبول',
    dismiss: 'رفض'
  },
  fr: {
    title: 'Nous utilisons des cookies',
    message: 'Nous utilisons des cookies pour mémoriser votre préférence de langue.',
    accept: 'Accepter',
    dismiss: 'Refuser'
  },
  ha: {
    title: 'Muna amfani da cookies',
    message: 'Muna amfani da cookies don haddwa sabunta harshen da kuka zaɓi.',
    accept: 'Yi amfani',
    dismiss: 'Ḋauki'
  },
  ig: {
    title: 'Anyị na ibe cookie',
    message: 'Anyị na ibe cookie iji cheta asụsụ gị chọrọ.',
    accept: 'Kwado',
    dismiss: 'Mechịe'
  },
  lg: {
    title: 'Tukyanya ebyokulwa',
    message: 'Tukyanya ebyokulwa okuyita olwino lwo lwanga olwino lwo lwanga.',
    accept: 'Kweyeta',
    dismiss: 'Ggwa'
  },
  or: {
    title: 'Cookiesii tikuu',
    message: 'Cookiesii afaan qophaawwan kii galmee afaan qophaawwan kii galmeessu.',
    accept: 'Qabxii',
    dismiss: 'Haala Gaaffii'
  },
  sw: {
    title: 'Tumia biscuit',
    message: 'Tumia biscuit kumbuka chaguo la lugha yako.',
    accept: 'Kubali',
    dismiss: 'Kataa'
  },
  yo: {
    title: 'Àwọn cookies à ń lò',
    message: 'Àwọn cookies à ń lò dàta àtúnṣe àwiọn èdè tí a fẹ́.',
    accept: 'Jẹ́wọ́',
    dismiss: 'Dàgbà'
  }
}

const getTranslation = (key) => {
  const lang = props.language || 'en'
  const translations = cookieTranslations[lang] || cookieTranslations.en
  return translations[key] || cookieTranslations.en[key]
}

const acceptCookies = () => {
  showBanner.value = false
  emit('accept')
}

const dismissBanner = () => {
  showBanner.value = false
  emit('dismiss')
}

// Watch for prop changes
import { watch } from 'vue'
watch(() => props.show, (newVal) => {
  showBanner.value = newVal
})

// Watch for language changes to trigger re-render
watch(() => props.language, () => {
  // Language changed, component will re-render with new translations
})
</script>

<template>
  <div
    v-if="showBanner"
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50"
    data-testid="cookie-banner"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900">{{ getTranslation('title') }}</h3>
        <p class="text-sm text-gray-600">{{ getTranslation('message') }}</p>
      </div>
      <div class="flex items-center space-x-3 flex-shrink-0">
        <button
          @click="dismissBanner"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          data-testid="cookie-dismiss"
        >
          {{ getTranslation('dismiss') }}
        </button>
        <button
          @click="acceptCookies"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="cookie-accept"
        >
          {{ getTranslation('accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Banner enters from bottom */
[data-testid="cookie-banner"] {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
