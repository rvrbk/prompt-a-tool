<script setup>
import { ref, watch } from 'vue';
import useTranslations from '../composables/useTranslations.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: 'en',
  },
});

const emit = defineEmits(['install', 'dismiss']);

// Initialize translations
const { t } = useTranslations(props.language, { 
  useCookies: false, 
  useLocalStorage: false 
});

// Local state for dismissed prompt
const dismissed = ref(false);

// Watch for show changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    dismissed.value = false;
  }
});

const handleInstall = () => {
  emit('install');
  dismissed.value = true;
};

const handleDismiss = () => {
  emit('dismiss');
  dismissed.value = true;
};

// PWA translations - these will be merged with the existing translations
const pwaTranslations = {
  en: {
    pwaInstallTitle: 'Install App',
    pwaInstallDescription: 'Get the full experience by installing this app on your device.',
    pwaInstallButton: 'Install',
    pwaDismissButton: 'Not Now',
    pwaOfflineReady: 'App is ready for offline use!',
    pwaUpdateAvailable: 'Update Available',
    pwaUpdateDescription: 'A new version of the app is available.',
    pwaUpdateButton: 'Update Now',
    pwaOfflineMessage: 'You are offline. Some features may be limited.',
    pwaBackOnline: 'You are back online!',
  },
  es: {
    pwaInstallTitle: 'Instalar Aplicación',
    pwaInstallDescription: 'Obtén la experiencia completa instalando esta aplicación en tu dispositivo.',
    pwaInstallButton: 'Instalar',
    pwaDismissButton: 'Ahora No',
    pwaOfflineReady: '¡La aplicación está lista para usar sin conexión!',
    pwaUpdateAvailable: 'Actualización Disponible',
    pwaUpdateDescription: 'Hay una nueva versión de la aplicación disponible.',
    pwaUpdateButton: 'Actualizar Ahora',
    pwaOfflineMessage: 'Estás desconectado. Algunas funciones pueden estar limitadas.',
    pwaBackOnline: '¡Has vuelto a estar en línea!',
  },
  fr: {
    pwaInstallTitle: 'Installer l\'application',
    pwaInstallDescription: 'Obtenez une expérience complète en installant cette application sur votre appareil.',
    pwaInstallButton: 'Installer',
    pwaDismissButton: 'Pas Maintenant',
    pwaOfflineReady: 'L\'application est prête pour une utilisation hors ligne !',
    pwaUpdateAvailable: 'Mise à jour Disponible',
    pwaUpdateDescription: 'Une nouvelle version de l\'application est disponible.',
    pwaUpdateButton: 'Mettre à jour Maintenant',
    pwaOfflineMessage: 'Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.',
    pwaBackOnline: 'Vous êtes de retour en ligne !',
  },
  de: {
    pwaInstallTitle: 'App Installieren',
    pwaInstallDescription: 'Erhalten Sie das volle Erlebnis, indem Sie diese App auf Ihrem Gerät installieren.',
    pwaInstallButton: 'Installieren',
    pwaDismissButton: 'Nicht Jetzt',
    pwaOfflineReady: 'Die App ist für die Offline-Nutzung bereit!',
    pwaUpdateAvailable: 'Update Verfügbar',
    pwaUpdateDescription: 'Eine neue Version der App ist verfügbar.',
    pwaUpdateButton: 'Jetzt Aktualisieren',
    pwaOfflineMessage: 'Sie sind offline. Einige Funktionen könnten eingeschränkt sein.',
    pwaBackOnline: 'Sie sind wieder online!',
  },
  it: {
    pwaInstallTitle: 'Installa App',
    pwaInstallDescription: 'Ottieni la piena esperienza installando questa app sul tuo dispositivo.',
    pwaInstallButton: 'Installa',
    pwaDismissButton: 'Non Ora',
    pwaOfflineReady: 'L\'app è pronta per l\'uso offline!',
    pwaUpdateAvailable: 'Aggiornamento Disponibile',
    pwaUpdateDescription: 'È disponibile una nuova versione dell\'app.',
    pwaUpdateButton: 'Aggiorna Ora',
    pwaOfflineMessage: 'Sei offline. Alcune funzionalità potrebbero essere limitate.',
    pwaBackOnline: 'Sei di nuovo online!',
  },
  pt: {
    pwaInstallTitle: 'Instalar Aplicativo',
    pwaInstallDescription: 'Obtenha a experiência completa instalando este aplicativo em seu dispositivo.',
    pwaInstallButton: 'Instalar',
    pwaDismissButton: 'Agora Não',
    pwaOfflineReady: 'O aplicativo está pronto para uso offline!',
    pwaUpdateAvailable: 'Atualização Disponível',
    pwaUpdateDescription: 'Uma nova versão do aplicativo está disponível.',
    pwaUpdateButton: 'Atualizar Agora',
    pwaOfflineMessage: 'Você está offline. Alguns recursos podem estar limitados.',
    pwaBackOnline: 'Você está online novamente!',
  },
  nl: {
    pwaInstallTitle: 'App Installeren',
    pwaInstallDescription: 'Krijg de volledige ervaring door deze app op uw apparaat te installeren.',
    pwaInstallButton: 'Installeren',
    pwaDismissButton: 'Niet Nu',
    pwaOfflineReady: 'De app is klaar voor offline gebruik!',
    pwaUpdateAvailable: 'Update Beschikbaar',
    pwaUpdateDescription: 'Er is een nieuwe versie van de app beschikbaar.',
    pwaUpdateButton: 'Nu Updaten',
    pwaOfflineMessage: 'U bent offline. Sommige functies kunnen beperkt zijn.',
    pwaBackOnline: 'U bent weer online!',
  },
  ru: {
    pwaInstallTitle: 'Установить Приложение',
    pwaInstallDescription: 'Получите полный опыт, установив это приложение на свое устройство.',
    pwaInstallButton: 'Установить',
    pwaDismissButton: 'Не Сейчас',
    pwaOfflineReady: 'Приложение готово к офлайн-использованию!',
    pwaUpdateAvailable: 'Доступно Обновление',
    pwaUpdateDescription: 'Доступна новая версия приложения.',
    pwaUpdateButton: 'Обновить Сейчас',
    pwaOfflineMessage: 'Вы офлайн. Некоторые функции могут быть ограничены.',
    pwaBackOnline: 'Вы снова в сети!',
  },
  zh: {
    pwaInstallTitle: '安装应用',
    pwaInstallDescription: '在您的设备上安装此应用以获得完整体验。',
    pwaInstallButton: '安装',
    pwaDismissButton: '稍后',
    pwaOfflineReady: '应用已准备好离线使用！',
    pwaUpdateAvailable: '有可用更新',
    pwaUpdateDescription: '有新版本的应用可用。',
    pwaUpdateButton: '现在更新',
    pwaOfflineMessage: '您已离线。某些功能可能受限。',
    pwaBackOnline: '您已重新在线！',
  },
  ja: {
    pwaInstallTitle: 'アプリをインストール',
    pwaInstallDescription: '端末にこのアプリをインストールして、フル体験を得ましょう。',
    pwaInstallButton: 'インストール',
    pwaDismissButton: '今じゃない',
    pwaOfflineReady: 'アプリはオフライン使用の準備ができています！',
    pwaUpdateAvailable: '更新が利用可能',
    pwaUpdateDescription: 'アプリの新しいバージョンが利用可能です。',
    pwaUpdateButton: '今すぐ更新',
    pwaOfflineMessage: 'オフラインです。一部の機能が制限される可能性があります。',
    pwaBackOnline: '再びオンラインになりました！',
  },
  ar: {
    pwaInstallTitle: 'تثبيت التطبيق',
    pwaInstallDescription: 'احصل على التجربة الكاملة من خلال تثبيت هذا التطبيق على جهازك.',
    pwaInstallButton: 'تثبيت',
    pwaDismissButton: 'ليس الآن',
    pwaOfflineReady: 'التطبيق جاهز للاستخدام بدون اتصال!',
    pwaUpdateAvailable: 'تحديث متاح',
    pwaUpdateDescription: 'ناك نسخة جديدة من التطبيق متاحة.',
    pwaUpdateButton: 'تحديث الآن',
    pwaOfflineMessage: 'أنت غير متصل بالإنترنت. قد تكون بعض الميزات محدودة.',
    pwaBackOnline: 'أنت متصل مرة أخرى!',
  },
  sw: {
    pwaInstallTitle: 'Sakinisha App',
    pwaInstallDescription: 'Pata uzoefu kamili kwa kuweka app hii kwenye kifaa chako.',
    pwaInstallButton: 'Sakinisha',
    pwaDismissButton: 'Sio Sasa',
    pwaOfflineReady: 'App imetengenezwa kwa kutumia offline!',
    pwaUpdateAvailable: 'Sasa Upopo',
    pwaUpdateDescription: 'Toleo jipya la app limewashi.',
    pwaUpdateButton: 'Sasa',
    pwaOfflineMessage: 'Uko offline. Baadhi ya utendaji unaweza kuwa na kipimo.',
    pwaBackOnline: 'Umerudi mtandao!',
  },
  am: {
    pwaInstallTitle: 'አፕ አገልግሎት',
    pwaInstallDescription: 'በሙሉ ክረምት ትክክል እንደገና ነገር ለማግኘት እንደአፕን በእጅዎ ላይ አገለግልጥ።',
    pwaInstallButton: 'አገለግል',
    pwaDismissButton: 'አሁን አይ',
    pwaOfflineReady: 'አፕ ለአይነት ክፍል ጊዜ ይገንዘብ!',
    pwaUpdateAvailable: 'አዲስ ማሻሻያ',
    pwaUpdateDescription: 'አዲስ እንደ አፕ ችግር አለ።',
    pwaUpdateButton: 'አሁን አሻማሽ',
    pwaOfflineMessage: 'አይነት ነው። ብዙ ህሊናዎች አሉት ሊቀለቀሉ ችለዋል።',
    pwaBackOnline: 'አንደሚነት አሉ!',
  },
  or: {
    pwaInstallTitle: 'App Fudhatuu',
    pwaInstallDescription: 'Dhaabbata guutuu taeef taaun isaa akka barbaachisuuf gaafii app kun akka alaa liqee qaba.',
    pwaInstallButton: 'Fudhatuu',
    pwaDismissButton: 'Eessatu',
    pwaOfflineReady: 'App tiin ofiinii taauuf waggaa kanneen yookaa!',
    pwaUpdateAvailable: 'Dhihoo Dhaabbataa',
    pwaUpdateDescription: 'Dhihoo app dhaabbataa taeef taee jira.',
    pwaUpdateButton: 'Dhiibbaa Eessaa',
    pwaOfflineMessage: 'Ofiin jirtu. Qaamolee qajeelama haalaa irra jirru ni dabaru.',
    pwaBackOnline: 'Yeroo ofiin jireenyi ofii jirtu!',
  },
};

// Helper to get translation
const getTranslation = (key) => {
  const lang = props.language || 'en';
  
  // First try the main translations (using the already-imported t function)
  try {
    const value = t(key);
    if (value && value !== key) return value;
  } catch {
    // Fallback to PWA translations
  }
  
  // Fallback to PWA-specific translations
  const pwaTrans = pwaTranslations[lang] || pwaTranslations.en;
  return pwaTrans[key] || pwaTranslations.en[key] || key;
};
</script>

<template>
  <!-- Install Prompt Modal -->
  <div
    v-if="show && !dismissed"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
    @click.self="handleDismiss"
  >
    <div
      class="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 text-center"
      @click.stop
    >
      <div class="flex justify-center mb-4">
        <svg class="w-14 h-14 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ getTranslation('pwaInstallTitle') }}
      </h3>
      
      <p class="text-gray-600 text-sm mb-6">
        {{ getTranslation('pwaInstallDescription') }}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="handleInstall"
          class="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          {{ getTranslation('pwaInstallButton') }}
        </button>
        
        <button
          @click="handleDismiss"
          class="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {{ getTranslation('pwaDismissButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth fade-in animation */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
