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
    analytics: 'With your permission we also use Google Analytics cookies to understand how the site is used.',
    accept: 'Accept',
    dismiss: 'Decline'
  },
  am: {
    title: 'ኩኪዎችን አገልግሎት።',
    message: 'ኩኪዎችን አገልግሎት አድርገን ቋንቋዎች መለወጥ።',
    analytics: 'በእርስዎ ፈቃድ፣ ጣቢያው እንዴት እንደሚጠቀም ለመረዳት የGoogle Analytics ኩኪዎችንም እንጠቀማለን።',
    accept: 'አቀበል',
    dismiss: 'አጽዳ'
  },
  ar: {
    title: 'نستخدم ملفات تعريف الارتباط',
    message: 'نستخدم ملفات تعريف الارتباط لتذكر تفضيلات اللغة الخاصة بك.',
    analytics: 'بموافقتك، نستخدم أيضًا ملفات تعريف ارتباط Google Analytics لفهم كيفية استخدام الموقع.',
    accept: 'قبول',
    dismiss: 'رفض'
  },
  fr: {
    title: 'Nous utilisons des cookies',
    message: 'Nous utilisons des cookies pour mémoriser votre préférence de langue.',
    analytics: 'Avec votre accord, nous utilisons aussi des cookies Google Analytics pour comprendre comment le site est utilisé.',
    accept: 'Accepter',
    dismiss: 'Refuser'
  },
  ha: {
    title: 'Muna amfani da cookies',
    message: 'Muna amfani da cookies don haddwa sabunta harshen da kuka zaɓi.',
    analytics: 'Da izininku, muna kuma amfani da cookies na Google Analytics don fahimtar yadda ake amfani da shafin.',
    accept: 'Yi amfani',
    dismiss: 'Ḋauki'
  },
  ig: {
    title: 'Anyị na ibe cookie',
    message: 'Anyị na ibe cookie iji cheta asụsụ gị chọrọ.',
    analytics: 'Site n\'ikike gị, anyị na-ejikwa cookies Google Analytics iji ghọta otú esi eji saịtị a.',
    accept: 'Kwado',
    dismiss: 'Mechịe'
  },
  lg: {
    title: 'Tukyanya ebyokulwa',
    message: 'Tukyanya ebyokulwa okuyita olwino lwo lwanga olwino lwo lwanga.',
    analytics: 'Bw\'oba otuwadde olukusa, tukozesa ne kuki za Google Analytics okutegeera engeri omukutu gye gukozesebwamu.',
    accept: 'Kweyeta',
    dismiss: 'Ggwa'
  },
  or: {
    title: 'Cookiesii tikuu',
    message: 'Cookiesii afaan qophaawwan kii galmee afaan qophaawwan kii galmeessu.',
    analytics: 'Hayyama keessan wajjin, kukiiwwan Google Analytics illee fayyadamna akka marsariitiin kun akkamitti fayyadamamu hubachuuf.',
    accept: 'Qabxii',
    dismiss: 'Haala Gaaffii'
  },
  sw: {
    title: 'Tumia biscuit',
    message: 'Tumia biscuit kumbuka chaguo la lugha yako.',
    analytics: 'Kwa ruhusa yako, tunatumia pia vidakuzi vya Google Analytics kuelewa jinsi tovuti inavyotumika.',
    accept: 'Kubali',
    dismiss: 'Kataa'
  },
  yo: {
    title: 'Àwọn cookies à ń lò',
    message: 'Àwọn cookies à ń lò dàta àtúnṣe àwiọn èdè tí a fẹ́.',
    analytics: 'Pẹ̀lú ìyọ̀ǹda yín, a tún ń lo àwọn cookies Google Analytics láti mọ bí a ṣe ń lo ojú-òpó yìí.',
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
    role="dialog"
    :aria-label="getTranslation('title')"
    :dir="language === 'ar' ? 'rtl' : 'ltr'"
    class="cookie-banner fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-xl border border-gray-100 border-t-4 border-t-orange-400 bg-white p-4 shadow-lg sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0 rtl:sm:left-6 rtl:sm:right-auto"
    data-testid="cookie-banner"
  >
    <h3 class="font-semibold text-gray-900">{{ getTranslation('title') }}</h3>
    <p class="mt-1 text-sm text-gray-600">{{ getTranslation('message') }} {{ getTranslation('analytics') }}</p>
    <div class="mt-4 flex gap-2">
      <button
        @click="dismissBanner"
        class="flex-1 rounded-xl border border-gray-900 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        data-testid="cookie-dismiss"
      >
        {{ getTranslation('dismiss') }}
      </button>
      <button
        @click="acceptCookies"
        class="flex-1 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        data-testid="cookie-accept"
      >
        {{ getTranslation('accept') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner {
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(0.75rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cookie-banner {
    animation: none;
  }
}
</style>
