/**
 * Translations for Africa Prompt Generator
 * Major African languages with ISO 639-1 codes
 */

import { ref } from 'vue'

// Supported languages with native names
const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native: 'English', flag: '🇬🇧' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  pt: { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  es: { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  // Sub-Saharan African languages
  sw: { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿' },
  ha: { name: 'Hausa', native: 'Harshen Hausa', flag: '🇳🇬' },
  yo: { name: 'Yoruba', native: 'Èdè Yorùbá', flag: '🇳🇬' },
  ig: { name: 'Igbo', native: 'Asụsụ Igbo', flag: '🇳🇬' },
  am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  or: { name: 'Oromo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  zu: { name: 'Zulu', native: 'isiZulu', flag: '🇿🇦' },
  xh: { name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦' },
  af: { name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦' },
  so: { name: 'Somali', native: 'Soomaaliga', flag: '🇸🇴' },
  sn: { name: 'Shona', native: 'chiShona', flag: '🇿🇼' },
  ny: { name: 'Chichewa', native: 'ChiCheŵa', flag: '🇲🇼' },
  lg: { name: 'Luganda', native: 'Oluganda', flag: '🇺🇬' },
  rw: { name: 'Kinyarwanda', native: 'Ikinyarwanda', flag: '🇷🇼' },
  kg: { name: 'Kongo', native: 'Kikongo', flag: '🇨🇩' },
  ln: { name: 'Lingala', native: 'Lingála', flag: '🇨🇩' },
  mg: { name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬' },
  bm: { name: 'Bambara', native: 'Bamanankan', flag: '🇲🇱' },
  wo: { name: 'Wolof', native: 'Wolof', flag: '🇸🇳' },
  ff: { name: 'Fulani', native: 'Fulfulde', flag: '🇳🇪' },
  ti: { name: 'Tigrinya', native: 'ትግርኛ', flag: '🇪🇷' },
  st: { name: 'Southern Sotho', native: 'Sesotho', flag: '🇱🇸' },
  tn: { name: 'Tswana', native: 'Setswana', flag: '🇧🇼' },
  ss: { name: 'Swati', native: 'SiSwati', flag: '🇸🇿' },
  nd: { name: 'Northern Ndebele', native: 'isiNdebele', flag: '🇿🇼' },
  th: { name: 'Twi', native: 'Twi', flag: '🇬🇭' },
  ee: { name: 'Ewe', native: 'Èʋegbe', flag: '🇹🇴' },
  ga: { name: 'Irish (Gaelic)', native: 'Gaeilge', flag: '🇮🇪' },
}

// Get language options for dropdown
const getLanguageOptions = () => {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
    code,
    name: lang.name,
    native: lang.native,
    flag: lang.flag,
    display: `${lang.flag} ${lang.native} (${lang.name})`
  }))
}

// Translations database
const translations = {
  en: {
    // App title and description
    appTitle: 'African App Prompt Generator',
    appDescription: 'Answer a few questions about your app idea, and we\'ll generate tailored prompts, roles, agents, and skills for your African-focused application.',
    
    // Form labels
    appIdeaLabel: 'App Idea',
    appIdeaPlaceholder: 'Describe your app idea (e.g., \'A Nigerian fintech app for savings groups\', \'A Kenyan agri-tech platform connecting farmers to markets\')',
    appIdeaHint: 'Be specific about your app\'s purpose and target audience in Africa.',
    
    targetCountriesLabel: 'Target Countries',
    targetCountriesPlaceholder: 'Select countries...',
    
    userTypesLabel: 'Primary User Types',
    userTypesPlaceholder: 'Select user types...',
    
    offlineAccessLabel: 'Offline Access',
    offlineAccessHint: 'Will your app need to work without internet connectivity?',
    offlineYes: 'Yes',
    offlineNo: 'No',
    
    coreFeaturesLabel: 'Core Features',
    coreFeaturesPlaceholder: 'Select features...',
    
    aiFeaturesLabel: 'AI Features',
    aiFeaturesPlaceholder: 'Select AI features...',
    
    // Buttons
    generatePrompts: 'Generate Prompts',
    generating: 'Generating...',
    reset: 'Reset',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    copyAll: 'Copy All',
    saveProgress: 'Save Progress',
    quickSave: 'Quick Save',
    saveAndLoad: 'Save & Load',
    resumeSession: 'Resume Session',
    loadPrevious: 'Load Previous',
    
    // Results sections
    generatedResults: 'Generated Results',
    userRoles: 'User Roles',
    aiAgents: 'AI Agents',
    backendPrompts: 'Backend Prompts (Laravel)',
    frontendPrompts: 'Frontend Prompts (Vue.js)',
    rawResponse: 'Raw AI Response',
    noResults: 'No Results Yet',
    noResultsHint: 'Fill out the questionnaire and click "Generate Prompts" to see results here.',
    
    // Export/Share
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    share: 'Share',
    shareUrlCopied: 'URL copied!',
    
    // Validation
    ideaRequired: 'App idea is required',
    
    // Success/Error messages
    promptsGenerated: 'Prompts generated successfully!',
    progressSaved: 'Progress saved! You can resume later.',
    sessionSaved: 'Session saved successfully! You can resume later.',
    sessionLoaded: 'Session loaded successfully!',
    failedToSave: 'Failed to save progress. Please try again.',
    failedToLoad: 'Failed to load session. Please try again.',
    noResponse: 'Error: No response from server. Please check if the backend is running.',
    serverError: 'Server error',
    
    // Templates
    templates: 'Templates',
    selectTemplate: 'Select a template to get started quickly',
    clearTemplate: 'Clear',
    
    // Session management
    manageSessions: 'Manage Sessions',
    saveOrLoadSession: 'Save your progress or load a previous session.',
    saveSession: 'Save Session',
    loadSession: 'Load Session',
    deleteSession: 'Delete Session',
    noSessions: 'No saved sessions found.',
    loadingSessions: 'Loading sessions...',
    sessionName: 'Session Name',
    sessionNamePlaceholder: 'Give this session a name...',
    saveButton: 'Save',
    cancelButton: 'Cancel',
    optional: '(optional)',
    
    // Templates
    allCategories: 'All',
    noTemplates: 'No templates found for this category.',
    loadingTemplates: 'Loading templates...',
    
    // Metadata for export
    metadata: 'Project Overview',
    appIdea: 'App Idea',
    targetCountries: 'Target Countries',
    userTypes: 'User Types',
    offlineAccess: 'Offline Access',
    coreFeatures: 'Core Features',
    aiFeatures: 'AI Features',
    generatedAt: 'Generated',
    na: 'N/A',
    yes: 'Yes',
    no: 'No'
  },
  
  ar: {
    appTitle: 'مولد المطالبات على الغرار الأفريقي',
    appDescription: 'أجب عن بعض الأسئلة حول فكرة تطبيقك، وسنولد مطالبات ودوراً ووكالات ومهارات مخصصة لتطبيقك الموجه لأفريقيا.',
    appIdeaLabel: 'فكرة التطبيق',
    appIdeaPlaceholder: 'وصف فكرة التطبيق (مثال: "تطبيق فنتك نيجيري لمجموعات التوفير", "منصة تكنولوجيا زراعية كينية تربط المزارعين بالسوق")',
    appIdeaHint: 'كن محددًا بشأن هدف التطبيق وجمهورك المستهدف في أفريقيا.',
    targetCountriesLabel: 'الدول المستهدفة',
    targetCountriesPlaceholder: 'حدد الدول...',
    userTypesLabel: 'أنواع المستخدمين الرئيسية',
    userTypesPlaceholder: 'حدد أنواع المستخدمين...',
    offlineAccessLabel: 'الوصول بدون اتصال',
    offlineAccessHint: 'هل تحتاج تطبيقاتك للعمل بدون اتصال بالانترنت؟',
    offlineYes: 'نعم',
    offlineNo: 'لا',
    coreFeaturesLabel: 'الميزات الأساسية',
    coreFeaturesPlaceholder: 'حدد الميزات...',
    aiFeaturesLabel: 'ميزات الذكاء الاصطناعي',
    aiFeaturesPlaceholder: 'حدد ميزات الذكاء الاصطناعي...',
    generatePrompts: 'إنشاء المطالبات',
    generating: 'جاري الإنشاء...',
    reset: 'إعادة تعيين',
    close: 'إغلاق',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    copyAll: 'نسخ الكل',
    saveProgress: 'حفظ التقدم',
    quickSave: 'حفظ سريع',
    saveAndLoad: 'حفظ واسترجاع',
    resumeSession: 'استئناف الجلسة',
    generatedResults: 'النتائج المولدة',
    userRoles: 'أدوار المستخدمين',
    aiAgents: 'وكلاء الذكاء الاصطناعي',
    backendPrompts: 'مطالبات backend (Laravel)',
    frontendPrompts: 'مطالبات frontend (Vue.js)',
    ideaRequired: 'فكرة التطبيق مطلوبة',
    promptsGenerated: 'تم إنشاء المطالبات بنجاح!',
    progressSaved: 'تم حفظ التقدم! يمكنك استئنافه لاحقا.',
    na: 'غير متوفر',
    yes: 'نعم',
    no: 'لا'
  },
  
  fr: {
    appTitle: 'Générateur de Prompts pour Applications Africaines',
    appDescription: 'Répondez à quelques questions sur votre idée d\'application, et nous générerons des prompts, rôles, agents et compétences adaptés pour votre application axée sur l\'Afrique.',
    appIdeaLabel: 'Idée de l\'application',
    appIdeaPlaceholder: 'Décrivez votre idée d\'application (ex: "Une application fintech nigériane pour les groupes d\'épargne", "Une plateforme agri-tech kényane connectant les agriculteurs aux marchés")',
    appIdeaHint: 'Soyez précis concernant le but de votre application et votre public cible en Afrique.',
    targetCountriesLabel: 'Pays cibles',
    targetCountriesPlaceholder: 'Sélectionnez des pays...',
    userTypesLabel: 'Types d\'utilisateurs principaux',
    userTypesPlaceholder: 'Sélectionnez des types d\'utilisateurs...',
    offlineAccessLabel: 'Accès hors ligne',
    offlineAccessHint: 'Votre application doit-elle fonctionner sans connexion internet ?',
    offlineYes: 'Oui',
    offlineNo: 'Non',
    coreFeaturesLabel: 'Fonctionnalités principales',
    coreFeaturesPlaceholder: 'Sélectionnez des fonctionnalités...',
    aiFeaturesLabel: 'Fonctionnalités IA',
    aiFeaturesPlaceholder: 'Sélectionnez des fonctionnalités IA...',
    generatePrompts: 'Générer des Prompts',
    generating: 'Génération en cours...',
    reset: 'Réinitialiser',
    close: 'Fermer',
    copy: 'Copier',
    copied: 'Copié !',
    copyAll: 'Copier tout',
    saveProgress: 'Sauvegarder la progression',
    quickSave: 'Sauvegarde rapide',
    saveAndLoad: 'Sauvegarder & Charger',
    resumeSession: 'Reprendre la session',
    generatedResults: 'Résultats générés',
    userRoles: 'Rôles utilisateurs',
    aiAgents: 'Agents IA',
    backendPrompts: 'Prompts Backend (Laravel)',
    frontendPrompts: 'Prompts Frontend (Vue.js)',
    ideaRequired: 'L\'idée de l\'application est requise',
    promptsGenerated: 'Prompts générés avec succès !',
    progressSaved: 'Progression sauvegardée ! Vous pouvez reprendre plus tard.',
    na: 'N/D',
    yes: 'Oui',
    no: 'Non'
  },
  
  pt: {
    appTitle: 'Gerador de Prompts para Aplicativos Africanos',
    appDescription: 'Responda a algumas perguntas sobre sua ideia de aplicativo, e geraremos prompts, funções, agentes e habilidades personalizados para seu aplicativo focado na África.',
    appIdeaLabel: 'Ideia do Aplicativo',
    appIdeaPlaceholder: 'Descreva sua ideia de aplicativo (ex: "Um aplicativo fintech nigeriano para grupos de poupança", "Uma plataforma agri-tech queniana conectando agricultores aos mercados")',
    appIdeaHint: 'Seja específico sobre o propósito do seu aplicativo e público-alvo na África.',
    targetCountriesLabel: 'Países Alvo',
    targetCountriesPlaceholder: 'Selecione países...',
    userTypesLabel: 'Tipos de Usuários Principais',
    userTypesPlaceholder: 'Selecione tipos de usuários...',
    offlineAccessLabel: 'Acesso Offline',
    offlineAccessHint: 'Seu aplicativo precisa funcionar sem conexão com a internet?',
    offlineYes: 'Sim',
    offlineNo: 'Não',
    coreFeaturesLabel: 'Recursos Principais',
    coreFeaturesPlaceholder: 'Selecione recursos...',
    aiFeaturesLabel: 'Recursos de IA',
    aiFeaturesPlaceholder: 'Selecione recursos de IA...',
    generatePrompts: 'Gerar Prompts',
    generating: 'Gerando...',
    reset: 'Redefinir',
    close: 'Fechar',
    copy: 'Copiar',
    copied: 'Copiado!',
    copyAll: 'Copiar Tudo',
    saveProgress: 'Salvar Progresso',
    quickSave: 'Salvar Rápido',
    saveAndLoad: 'Salvar & Carregar',
    resumeSession: 'Retomar Sessão',
    generatedResults: 'Resultados Gerados',
    userRoles: 'Funções de Usuário',
    aiAgents: 'Agentes de IA',
    backendPrompts: 'Prompts de Backend (Laravel)',
    frontendPrompts: 'Prompts de Frontend (Vue.js)',
    ideaRequired: 'A ideia do aplicativo é obrigatória',
    promptsGenerated: 'Prompts gerados com sucesso!',
    progressSaved: 'Progresso salvo! Você pode retomar depois.',
    na: 'N/D',
    yes: 'Sim',
    no: 'Não'
  },
  
  sw: {
    appTitle: 'Mtengenezi wa Maombi ya programu za Afrika',
    appDescription: 'Jibu maswali machache kuhusu wazo la programu yako, na tutaunda maombi, majukumu, waajiri, na ujuzi wa kioshvi cha Afrika.',
    appIdeaLabel: 'Wazo la programu',
    appIdeaPlaceholder: 'Eleza wazo la programu yako (mfano: "Programu ya fedha ya Kijo Nijeria kwa makundi ya uokoaji", "Jukwaa la Teknologia ya kilimo Kenya linaunganisha wakulima na soko")',
    appIdeaHint: 'Weweka kwa ufafanu wa lengo la programu yako na watazamaji wako Afrika.',
    targetCountriesLabel: 'Nchi malengo',
    targetCountriesPlaceholder: 'Chagua nchi...',
    userTypesLabel: 'Aina ya watumiaji',
    userTypesPlaceholder: 'Chagua aina ya watumiaji...',
    offlineAccessLabel: 'Ufikatili wa mtandaoni',
    offlineAccessHint: 'Je, programu yako inahitaji kufanya kazi bila mtandao?',
    offlineYes: 'Ndiyo',
    offlineNo: 'Hapana',
    coreFeaturesLabel: 'Utendaji mkuu',
    coreFeaturesPlaceholder: 'Chagua utendaji...',
    aiFeaturesLabel: 'Utendaji wa AI',
    aiFeaturesPlaceholder: 'Chagua utendaji wa AI...',
    generatePrompts: 'Unda Maombi',
    generating: 'Inaundwa...',
    reset: 'Weka upya',
    close: 'Funga',
    copy: 'Nakili',
    copied: 'Imenakiliwa!',
    copyAll: 'Nakili Yote',
    saveProgress: 'Hifadhi Maendeleo',
    quickSave: 'Hifadhi Haraka',
    generatedResults: 'Matokeo Yaliotengenezwa',
    userRoles: 'Majukumu ya Mtumiaji',
    aiAgents: 'Waajiri wa AI',
    backendPrompts: 'Maombi ya Backend (Laravel)',
    frontendPrompts: 'Maombi ya Frontend (Vue.js)',
    ideaRequired: 'Wazo la programu linahitaji',
    promptsGenerated: 'Maombi yameundwa kwenye mafanikio!',
    progressSaved: 'Maendeleo yamehifadhiwa! Unaweza kurudisha baadaye.',
    na: 'Haipo',
    yes: 'Ndiyo',
    no: 'Hapana'
  },
  
  ha: {
    appTitle: 'ɗan ƙirar Ayyuka na Afirka',
    appDescription: 'Amsa wasu tambayoyi game da fatan ayyukarka, zai ƙirƙira ayyuka, asusun, waɗanda suka fi duniya da aiki masu alhaki don ayyukar Afirka.',
    appIdeaLabel: 'Fatan Ayyuka',
    appIdeaPlaceholder: 'Bayyana fata na ayyukarka (misali: "Ayyukan fintech na Nijeriya don ƙungiyoyin kudade", "Sashin agri-tech na Kenya mai haɗuwa wa masu kula da asuwanni")',
    appIdeaHint: 'Ka bayyana fata na ayyukarka da yaushe da alhakin mutane da ayyukarka a Afirka.',
    targetCountriesLabel: 'Yankuna Masu Alƙawari',
    targetCountriesPlaceholder: 'Zaɓi yankuna...',
    userTypesLabel: 'Awa li ta mutane masu amfani',
    userTypesPlaceholder: 'Zaɓi awi...',
    offlineAccessLabel: 'Amfani a tsagin intanet',
    offlineAccessHint: 'Ayyukarka zai iya aiki a tsagin intanet?',
    offlineYes: 'Iya',
    offlineNo: 'A\'a',
    coreFeaturesLabel: 'Fusokin Sabuwar',
    coreFeaturesPlaceholder: 'Zaɓi fusoki...',
    aiFeaturesLabel: 'Fusokin AI',
    aiFeaturesPlaceholder: 'Zaɓi fusokin AI...',
    generatePrompts: 'Ƙirƙiri Ayyuka',
    generating: 'Ana ƙirƙira...',
    reset: 'Ƙirƙir daidai',
    close: 'Rufe',
    copy: 'Kwafawa',
    copied: 'An kwafa!',
    copyAll: 'Kwafawa Duka',
    saveProgress: 'Saka Sabuwa',
    generatedResults: 'Sabbabin Hasashe',
    userRoles: 'Awa li na Masu Amfani',
    aiAgents: 'Masu Aiki da AI',
    ideaRequired: 'Fata na ayyuka an bukata',
    promptsGenerated: 'An ƙirƙira ayyuka a cefane!',
    progressSaved: 'An saka sabuwa! Za ka iya ƙarawa a bayan ya gabata.',
    na: 'Babban lafiya',
    yes: 'Iya',
    no: 'A\'a'
  },
  
  yo: {
    appTitle: 'Àgbàlàwọ́ Àwọn Àmò̩lùwípò Àgbéyẹ̀ Àfríkà',
    appDescription: 'Dá àgbéyẹ̀ àwọn ìbàwọ́lẹ̀ àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ àwọn àmò̩lùwípò, àwọn ìdí, àwọn àgẹ̀ntí, àti àwọn ìlà àwújọ̀ fún àwọn àmò̩lùwípò àgbéyẹ̀ Àfríkà.',
    appIdeaLabel: 'Àwọn Ìtẹ̀wọ́ Àmò̩lùwípò',
    appIdeaPlaceholder: 'Ṣàlà àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ (Àwújọ̀: "Àmò̩lùwípò Fínánṣí Nàìjíríà fún àwọn àgùtàn àkọ́jọ̀", "Àgbàlàwọ́ Àgri-tech Kẹ́níyà tó máa shàfí àwọn ònílẹ̀dẹ́ àwọn àwòòràn")',
    appIdeaHint: 'Jẹ́ àgbàlàwọ́ àwọn àwújọ̀ àti àwọn olùkọ́ àwọn àmò̩lùwípò nínú Àfríkà.',
    targetCountriesLabel: 'Àwọn Orílẹ̀dẹ́ àwújọ̀',
    targetCountriesPlaceholder: 'Yàànà àwọn orílẹ̀dẹ́...',
    userTypesLabel: 'Àwọn Ìdí Olùkọ́ Àwújọ̀',
    userTypesPlaceholder: 'Yàànà àwọn ìdí olùkọ́...',
    offlineAccessLabel: 'Àwújọ̀ Ìtànkálẹ̀',
    offlineAccessHint: 'Ṣé àmò̩lùwípò yẹ́n í lẹ̀ àlààfin àkọ́jọ̀ àwọn ìtànkálẹ̀?',
    offlineYes: 'Bẹ́ẹ̀',
    offlineNo: 'Rará',
    coreFeaturesLabel: 'Àwọn Àgbárà Àwújọ̀',
    coreFeaturesPlaceholder: 'Yàànà àwọn àgbárà...',
    aiFeaturesLabel: 'Àwọn Àgbárà AI',
    aiFeaturesPlaceholder: 'Yàànà àwọn àgbárà AI...',
    generatePrompts: 'Ḥà àwọn Àmò̩lùwípò',
    generating: 'Àwọn Àmò̩lùwípò ó n ṣàfíhàn...',
    reset: 'Tún àwọn Àkó̩sílẹ̀',
    close: 'Mú',
    copy: 'Kópipí',
    copied: 'À ti kó!',
    copyAll: 'Kópipí Gbogbo',
    saveProgress: 'Sààgbà Àyò̩kú',
    generatedResults: 'Àwọn Àkó̩sílẹ̀ Tó Di Ìtúù',
    userRoles: 'Àwọn Ìdí Olùkọ́',
    aiAgents: 'Àwọn Àgẹ̀ntí AI',
    ideaRequired: 'Àwọn Ìtẹ̀wọ́ Àmò̩lùwípò wúlà',
    promptsGenerated: 'Àwọn Àmò̩lùwípò ti di Ìtúù!',
    progressSaved: 'Àyò̩kú à ti sààgbà! Ṣé à lẹ̀ ètò̀ sì àkọ́kọ́.',
    na: 'Kò sí',
    yes: 'Bẹ́ẹ̀',
    no: 'Rará'
  }
}

// Get translation for current language
const useTranslations = (language = 'en') => {
  const currentLanguage = ref(language)
  
  const setLanguage = (langCode) => {
    if (SUPPORTED_LANGUAGES[langCode]) {
      currentLanguage.value = langCode
      // Save to localStorage for persistence
      localStorage.setItem('africa-prompt-lang', langCode)
    }
  }
  
  const t = (key, lang = null) => {
    const langCode = lang || currentLanguage.value
    const langTranslations = translations[langCode]
    
    if (langTranslations && langTranslations[key]) {
      return langTranslations[key]
    }
    
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key]
    }
    
    return key
  }
  
  const getCurrentLanguage = () => {
    return currentLanguage.value
  }
  
  const getLanguageName = (langCode) => {
    return SUPPORTED_LANGUAGES[langCode]?.native || langCode
  }
  
  const getLanguageFlag = (langCode) => {
    return SUPPORTED_LANGUAGES[langCode]?.flag || ''
  }
  
  return {
    currentLanguage,
    setLanguage,
    t,
    getCurrentLanguage,
    getLanguageName,
    getLanguageFlag,
    getLanguageOptions,
    SUPPORTED_LANGUAGES,
    translations
  }
}

export default useTranslations
