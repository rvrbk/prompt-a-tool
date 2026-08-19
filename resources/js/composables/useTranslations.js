/**
 * Translations for Prompt Generator
 * Multiple languages with ISO 639-1 codes
 */

import { ref } from 'vue'

// Supported languages with native names
const SUPPORTED_LANGUAGES = {
  am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', countryCode: 'et' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦', countryCode: 'sa' },
  en: { name: 'English', native: 'English', flag: '🇬🇧', countryCode: 'gb' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷', countryCode: 'fr' },
  ha: { name: 'Hausa', native: 'Harshen Hausa', flag: '🇳🇬', countryCode: 'ng' },
  ig: { name: 'Igbo', native: 'Asụsụ Igbo', flag: '🇳🇬', countryCode: 'ng' },
  lg: { name: 'Luganda', native: 'Oluganda', flag: '🇺🇬', countryCode: 'ug' },
  or: { name: 'Oromo', native: 'Afaan Oromoo', flag: '🇪🇹', countryCode: 'et' },
  sw: { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿', countryCode: 'tz' },
  yo: { name: 'Yoruba', native: 'Èdè Yorùbá', flag: '🇳🇬', countryCode: 'ng' },
}

// Get language options for dropdown
const getLanguageOptions = () => {
  return Object.entries(SUPPORTED_LANGUAGES)
    .sort(([codeA, langA], [codeB, langB]) => langA.name.localeCompare(langB.name))
    .map(([code, lang]) => ({
    code,
    name: lang.name,
    native: lang.native,
    flag: lang.flag,
    countryCode: lang.countryCode,
    display: `${lang.flag} ${lang.native} (${lang.name})`
  }))
}

// Translations database
const translations = {
  en: {
    // App title and description
    appTitle: 'App Prompt Generator',
    appDescription: 'Answer a few questions about your app idea, and we\'ll generate tailored prompts, roles, agents, and skills for your application.',
    
    // Form labels
    appIdeaLabel: 'App Idea',
    appIdeaPlaceholder: 'Describe your app idea (e.g., \'A fintech app for savings groups\', \'An agri-tech platform connecting farmers to markets\')',
    appIdeaHint: 'Be specific about your app\'s purpose and target audience.',
    
    offlineAccessLabel: 'Offline Access',
    offlineAccessHint: 'Will your app need to work without internet connectivity?',
    offlineYes: 'Yes',
    offlineNo: 'No',
    
    // Buttons
    generatePrompts: 'Generate Prompts',
    generating: 'Generating...',
    reset: 'Reset',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    copy: 'Copy',
    copied: 'Copied!',
    copyAll: 'Copy All',
    loadPrevious: 'Load Previous',
    
    // Results sections
    generatedResults: 'Generated Results',
    userRoles: 'User Roles',
    aiAgents: 'AI Agents',
    backendPrompts: 'Backend Prompts (Laravel)',
    frontendPrompts: 'Frontend Prompts (Vue.js)',
    rawResponse: 'Raw AI Response',
    noResults: 'No Results Yet',
    noResultsHint: 'Fill the questionnaire and click Generate to see results.',
    
    // Export/Share
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL copied!',
    jsonDownloaded: 'Downloaded!',
    markdownDownloaded: 'Downloaded!',
    
    // Validation
    ideaRequired: 'App idea is required',
    
    // Follow-up Questions
    followUpQuestions: 'AI Follow-up Questions',
    generatingQuestions: 'Generating questions',
    failedToGenerateQuestions: 'Failed to generate questions. Please try again.',
    enterYourAnswer: 'Enter your answer',
    pleaseAnswerAllQuestions: 'Please answer all follow-up questions before generating prompts.',
    
    // Success/Error messages
    promptsGenerated: 'Prompts generated successfully!',
    failedToSave: 'Failed to save. Please try again.',
    failedToLoad: 'Failed to load. Please try again.',
    noResponse: 'Error: No server response. Please check backend.',
    serverError: 'Server error',
    
    cancelButton: 'Cancel',
    optional: '(optional)',
    
    // About page
    aboutTitle: 'About Prompt Generator',
    aboutSubtitle: 'A simple tool to help you plan your app',
    aboutWhatItDoes: 'What does this tool do?',
    aboutDescription1: 'This tool helps you turn your app idea into a clear plan. Whether you are building a mobile app, a website, or any digital product, we make the planning process simple and straightforward.',
    aboutDescription2: 'You answer a few questions about what you want to build, and we provide you with everything you need to get started on the right foot.',
    aboutHowItWorks: 'How it works',
    aboutStep1: 'Describe your app idea in plain language',
    aboutStep2: 'Answer a few follow-up questions to help us understand your needs',
    aboutStep3: 'Get a complete set of roles, agents, and development prompts tailored to your project',
    aboutWhatYouGet: 'What you get',
    aboutWhatYouGetDesc: 'The generated prompts include detailed instructions to guide your development process.',
    aboutUserRoles: 'User Roles',
    aboutUserRolesDesc: 'Different types of users and what they can do in your app',
    aboutAIAgents: 'AI Agents',
    aboutAIAgentsDesc: 'Smart helpers that can perform tasks and use tools in your app',
    aboutBackendPrompts: 'Backend Prompts (with instructions)',
    aboutBackendPromptsDesc: 'Guidance and instructions for building the server and database for your app',
    aboutFrontendPrompts: 'Frontend Prompts (with instructions)',
    aboutFrontendPromptsDesc: 'Guidance and instructions for building the user interface of your app',
    aboutWhyUseful: 'Why is this useful?',
    aboutWhyUsefulDesc: 'Instead of starting from scratch and trying to figure out everything yourself, this tool gives you a solid foundation. You can use the generated results as a starting point, modify them as needed, and save time on the planning phase.',
    backToGenerator: 'Back to Generator',
    
    // Category names
  },
  
  ar: {
    appTitle: 'مولد المطالبات',
    appDescription: 'أجب عن بعض الأسئلة حول فكرة تطبيقك، وسنولد مطالبات ودوراً ووكالات ومهارات مخصصة لتطبيقك.',
    appIdeaLabel: 'فكرة التطبيق',
    appIdeaPlaceholder: 'وصف فكرة التطبيق (مثال: "تطبيق فنتك لمجموعات التوفير", "منصة تكنولوجيا زراعية تربط المزارعين بالسوق")',
    appIdeaHint: 'كن محددًا بشأن هدف التطبيق وجمهورك المستهدف.',
    offlineAccessLabel: 'الوصول بدون اتصال',
    offlineAccessHint: 'هل يحتاج تطبيقك للعمل بدون اتصال بالانترنت؟',
    offlineYes: 'نعم',
    offlineNo: 'لا',
    generatePrompts: 'إنشاء المطالبات',
    generating: 'جاري الإنشاء...',
    reset: 'إعادة تعيين',
    close: 'إغلاق',
    previous: 'سابق',
    next: 'التالي',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    copyAll: 'نسخ الكل',
    loadPrevious: 'تحميل السابق',
    generatedResults: 'النتائج المولدة',
    userRoles: 'أدوار المستخدمين',
    aiAgents: 'وكلاء الذكاء الاصطناعي',
    backendPrompts: 'مطالبات backend (Laravel)',
    frontendPrompts: 'مطالبات frontend (Vue.js)',
    rawResponse: 'استجابة الذكاء الاصطناعي الخام',
    noResults: 'لا يوجد نتائج بعد',
    noResultsHint: 'املأ الاستبيان وانقر على إنشاء للمشاهدة النتائج.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'تم نسخ الرابط!',
    jsonDownloaded: 'تم التنزيل!',
    markdownDownloaded: 'تم التنزيل!',
    ideaRequired: 'فكرة التطبيق مطلوبة',
    followUpQuestions: 'أسئلة المتابعة من الذكاء الاصطناعي',
    generatingQuestions: 'جاري إنشاء الأسئلة',
    failedToGenerateQuestions: 'فشل في إنشاء الأسئلة. الرجاء المحاولة مرة أخرى.',
    enterYourAnswer: 'ادخل إجابتك',
    pleaseAnswerAllQuestions: 'الرجاء الإجابة على جميع أسئلة المتابعة قبل إنشاء المطالبات.',
    promptsGenerated: 'تم إنشاء المطالبات بنجاح!',
    failedToSave: 'فشل الحفظ. الرجاء المحاولة مرة أخرى.',
    failedToLoad: 'فشل التحميل. الرجاء المحاولة مرة أخرى.',
    noResponse: 'خطأ: لا يوجد استجابة من الخادم. الرجاء التحقق من الخلفية.',
    serverError: 'خطأ في الخادم',
    cancelButton: 'إلغاء',
    optional: '(اختياري)',
    yes: 'نعم',
    no: 'لا',
    
    // About page
    aboutTitle: 'عن مولد المطالبات',
    aboutSubtitle: 'أداة بسيطة لمساعدتك على التخطيط لتطبيقك',
    aboutWhatItDoes: 'ماذا تفيد هذه الأداة؟',
    aboutDescription1: 'تساعدك هذه الأداة على تحويل فكرة تطبيقك إلى خطة واضحة. سواء كنت تبني تطبيق جوال أو موقع ويب أو أي منتج رقمي، فنحن نجعل عملية التخطيط بسيطة ومباشرة.',
    aboutDescription2: 'تجيب عن بعض الأسئلة حول ما تريد بناؤه، ونزودك بكل ما تحتاجه للبدء بشكل صحيح.',
    aboutHowItWorks: 'كيف تعمل',
    aboutStep1: 'وصف فكرة تطبيقك بلغة بسيطة',
    aboutStep2: 'أجب عن بعض أسئلة المتابعة لمساعدتنا على فهم احتياجاتك',
    aboutStep3: 'احصل على مجموعة كاملة من الأدوار والوكلاء ومطالبات تطوير مخصصة لمشروعك',
    aboutWhatYouGet: 'ماذا تحصل عليه',
    aboutWhatYouGetDesc: 'المطالبات المولدة تحتوي على تعليمات مفصلة لإرشاد عملية التطوير الخاصة بك.',
    aboutUserRoles: 'أدوار المستخدمين',
    aboutUserRolesDesc: 'أنواع مختلفة من المستخدمين وما يمكنهم القيام به في تطبيقك',
    aboutAIAgents: 'وكلاء الذكاء الاصطناعي',
    aboutAIAgentsDesc: 'المساعدون الذكيون الذين يمكنهم أداء المهام واستخدام الأدوات في تطبيقك',
    aboutBackendPrompts: 'مطالبات Backend (مع تعليمات)',
    aboutBackendPromptsDesc: 'إرشادات وتعليمات لبناء الخادم وقاعدة البيانات لتطبيقك',
    aboutFrontendPrompts: 'مطالبات Frontend (مع تعليمات)',
    aboutFrontendPromptsDesc: 'إرشادات وتعليمات لبناء واجهة المستخدم لتطبيقك',
    aboutWhyUseful: 'لماذا هي مفيدة؟',
    aboutWhyUsefulDesc: 'بدلاً من البدء من الصفر ومحاولة اكتشاف كل شيء بنفسك، فإن هذه الأداة تعطيك أساسًا متينًا. يمكنك استخدام النتائج المولدة كنقطة بداية وتعديلها حسب الحاجة وتوفير الوقت في مرحلة التخطيط.',
    backToGenerator: 'العودة إلى المولد',
    
    // Category names
  },
  
  fr: {
    appTitle: 'Générateur de Prompts pour Applications',
    appDescription: 'Répondez à quelques questions sur votre idée d\'application, et nous générerons des prompts, rôles, agents et compétences adaptés pour votre application.',
    appIdeaLabel: 'Idée de l\'application',
    appIdeaPlaceholder: 'Décrivez votre idée d\'application (ex: "Une application fintech pour les groupes d\'épargne", "Une plateforme agri-tech connectant les agriculteurs aux marchés")',
    appIdeaHint: 'Soyez précis concernant le but de votre application et votre public cible.',
    offlineAccessLabel: 'Accès hors ligne',
    offlineAccessHint: 'Votre application doit-elle fonctionner sans connexion internet ?',
    offlineYes: 'Oui',
    offlineNo: 'Non',
    generatePrompts: 'Générer des Prompts',
    generating: 'Génération en cours...',
    reset: 'Réinitialiser',
    close: 'Fermer',
    previous: 'Précédent',
    next: 'Suivant',
    copy: 'Copier',
    copied: 'Copié !',
    copyAll: 'Copier tout',
    loadPrevious: 'Charger le précédent',
    generatedResults: 'Résultats générés',
    userRoles: 'Rôles utilisateurs',
    aiAgents: 'Agents IA',
    backendPrompts: 'Prompts Backend (Laravel)',
    frontendPrompts: 'Prompts Frontend (Vue.js)',
    rawResponse: 'Réponse brute de l\'IA',
    noResults: 'Aucun résultat pour l\'instant',
    noResultsHint: 'Remplissez le questionnaire et cliquez sur Générer pour voir les résultats.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL copiée !',
    jsonDownloaded: 'Téléchargé !',
    markdownDownloaded: 'Téléchargé !',
    ideaRequired: 'L\'idée de l\'application est requise',
    followUpQuestions: 'Questions de suivi de l\'IA',
    generatingQuestions: 'Génération des questions en cours',
    failedToGenerateQuestions: 'Échec de la génération des questions. Veuillez réessayer.',
    enterYourAnswer: 'Entrez votre réponse',
    pleaseAnswerAllQuestions: 'Veuillez répondre à toutes les questions de suivi avant de générer les prompts.',
    promptsGenerated: 'Prompts générés avec succès !',
    failedToSave: 'Échec de l\'enregistrement. Veuillez réessayer.',
    failedToLoad: 'Échec du chargement. Veuillez réessayer.',
    noResponse: 'Erreur : Aucune réponse du serveur. Veuillez vérifier le backend.',
    serverError: 'Erreur serveur',
    cancelButton: 'Annuler',
    optional: '(facultatif)',
    yes: 'Oui',
    no: 'Non',
    
    // About page
    aboutTitle: 'À propos du Générateur de Prompts',
    aboutSubtitle: 'Un outil simple pour vous aider à planifier votre application',
    aboutWhatItDoes: 'Que fait cet outil ?',
    aboutDescription1: 'Cet outil vous aide à transformer votre idée d\'application en un plan clair. Que vous construisiez une application mobile, un site web ou tout autre produit numérique, nous simplifions le processus de planification.',
    aboutDescription2: 'Vous répondez à quelques questions sur ce que vous souhaitez construire, et nous vous fournissons tout ce dont vous avez besoin pour bien démarrer.',
    aboutHowItWorks: 'Comment ça marche',
    aboutStep1: 'Décrivez votre idée d\'application en langage simple',
    aboutStep2: 'Répondez à quelques questions de suivi pour nous aider à comprendre vos besoins',
    aboutStep3: 'Obtenez un ensemble complet de rôles, d\'agents et de prompts de développement adaptés à votre projet',
    aboutWhatYouGet: 'Ce que vous obtenez',
    aboutWhatYouGetDesc: 'Les prompts générés incluent des instructions détaillées pour guider votre processus de développement.',
    aboutUserRoles: 'Rôles utilisateurs',
    aboutUserRolesDesc: 'Différents types d\'utilisateurs et ce qu\'ils peuvent faire dans votre application',
    aboutAIAgents: 'Agents IA',
    aboutAIAgentsDesc: 'Des assistants intelligents qui peuvent accomplir des tâches et utiliser des outils dans votre application',
    aboutBackendPrompts: 'Prompts Backend (avec instructions)',
    aboutBackendPromptsDesc: 'Conseils et instructions pour construire le serveur et la base de données de votre application',
    aboutFrontendPrompts: 'Prompts Frontend (avec instructions)',
    aboutFrontendPromptsDesc: 'Conseils et instructions pour construire l\'interface utilisateur de votre application',
    aboutWhyUseful: 'Pourquoi est-ce utile ?',
    aboutWhyUsefulDesc: 'Au lieu de partir de zéro et d\'essayer de tout comprendre par vous-même, cet outil vous donne une base solide. Vous pouvez utiliser les résultats générés comme point de départ, les modifier selon vos besoins et gagner du temps sur la phase de planification.',
    backToGenerator: 'Retour au Générateur',
    
    // Category names
  },
  
  sw: {
    appTitle: 'Mtengenezi wa Maombi',
    appDescription: 'Jibu maswali machache kuhusu wazo la programu yako, na tutaunda maombi, majukumu, waajiri, na ujuzi.',
    appIdeaLabel: 'Wazo la programu',
    appIdeaPlaceholder: 'Eleza wazo la programu yako (mfano: "Programu ya fedha kwa makundi ya uokoaji", "Jukwaa la Teknologia ya kilimo linaunganisha wakulima na soko")',
    appIdeaHint: 'Weweka kwa ufafanu wa lengo la programu yako na watazamaji wako.',
    offlineAccessLabel: 'Ufikatili wa mtandaoni',
    offlineAccessHint: 'Je, programu yako inahitaji kufanya kazi bila mtandao?',
    offlineYes: 'Ndiyo',
    offlineNo: 'Hapana',
    generatePrompts: 'Unda Maombi',
    generating: 'Inaundwa...',
    reset: 'Weka upya',
    close: 'Funga',
    previous: 'Rudi',
    next: 'Endelea',
    copy: 'Nakili',
    copied: 'Imenakiliwa!',
    copyAll: 'Nakili Yote',
    loadPrevious: 'Pakia Iliyotanguliwa',
    generatedResults: 'Matokeo Yaliotengenezwa',
    userRoles: 'Majukumu ya Mtumiaji',
    aiAgents: 'Waajiri wa AI',
    backendPrompts: 'Maombi ya Backend (Laravel)',
    frontendPrompts: 'Maombi ya Frontend (Vue.js)',
    rawResponse: 'Jibu Kamili ya AI',
    noResults: 'Bado Hakuna Matokeo',
    noResultsHint: 'Jaza fomuli na bonyeza Unda kuona matokeo.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL Imenakiliwa!',
    jsonDownloaded: 'Imepakuliwa!',
    markdownDownloaded: 'Imepakuliwa!',
    ideaRequired: 'Wazo la programu linahitaji',
    followUpQuestions: 'Maswali ya Mfuasi wa AI',
    generatingQuestions: 'Inaundwa Maswali',
    failedToGenerateQuestions: 'Haikuweza kuunda maswali. Tafadhali jaribu tena.',
    enterYourAnswer: 'Ingiza jibu lako',
    pleaseAnswerAllQuestions: 'Tafadhali jibu maswali yote ya mfuasi kabla ya kuunda maombi.',
    promptsGenerated: 'Maombi yameundwa kwenye mafanikio!',
    failedToSave: 'Haikuweza kuhifadhi. Tafadhali jaribu tena.',
    failedToLoad: 'Haikuweza kupakia. Tafadhali jaribu tena.',
    noResponse: 'Kosa: Hakuna jibu kutoka kwenye server. Tafadhali angalia backend.',
    serverError: 'Kosa ya server',
    cancelButton: 'Batilisha',
    optional: '(Hiari)',
    yes: 'Ndiyo',
    no: 'Hapana',
    
    // About page
    aboutTitle: 'Kuhusu Mtengenezi wa Maombi',
    aboutSubtitle: 'Chombo rahisi kuwasaidia kupanga programu yako',
    aboutWhatItDoes: 'Chombo hiki kinatenda nini?',
    aboutDescription1: 'Chombo hiki kinakusaidia kubadili wazo lako la programu kuwa mpango wa kawaida. Ukiwa unajenga programu ya simu, tovuti au bidhaa yoyote ya dijiti, tunafanya mchakato wa kupanga kuwa rahisi na wa moja kwa moja.',
    aboutDescription2: 'Utajibu maswali machache kuhusu unachotaka kujenga, na tutakupeleka kila kitu unachohitaji kuanza vizuri.',
    aboutHowItWorks: 'Inafanyika vipi',
    aboutStep1: 'Eleza wazo lako la programu kwa lugha rahisi',
    aboutStep2: 'Jibu maswali machache ya mfuasi kutusaidia kuelewa mahitaji yako',
    aboutStep3: 'Pata kikosi cha majukumu, waajiri na maombi ya ujenzi yakitengenezwa kwa ajili ya mradi wako',
    aboutWhatYouGet: 'Unapata nini',
    aboutWhatYouGetDesc: 'Maombi yaliyotengenezwa yana jumuisha maelekezo ya kina kukuongoza katika mchakato wa maendeleo.',
    aboutUserRoles: 'Majukumu ya Mtumiaji',
    aboutUserRolesDesc: 'Aina tofauti za watumiaji na yatuweza kufanya katika programu yako',
    aboutAIAgents: 'Waajiri wa AI',
    aboutAIAgentsDesc: 'Wasaidizi wachangamfu wanaoweza kutimiza kazi na kutumia zana katika programu yako',
    aboutBackendPrompts: 'Maombi ya Backend (na maelekezo)',
    aboutBackendPromptsDesc: 'Mwongozo na maelekezo ya kujenga server na database ya programu yako',
    aboutFrontendPrompts: 'Maombi ya Frontend (na maelekezo)',
    aboutFrontendPromptsDesc: 'Mwongozo na maelekezo ya kujenga interfeisi ya mtumiaji wa programu yako',
    aboutWhyUseful: 'Kwa nini ni muhimu?',
    aboutWhyUsefulDesc: 'Badala ya kuanza kutoka Kidato na kujaribu kugundua kila kitu mwenyewe, chombo hiki kinakuweka msingi mzuri. Unaweza kutumia matokeo yaliotengenezwa kama kiunganishi cha kuanza, kuyaandikia kwa mahitaji yako na kuokoa wakati katika hatua ya kupanga.',
    backToGenerator: 'Rudi kwenye Mtengenezi',
    
    // Category names
  },
  
  ha: {
    appTitle: 'ɗan ƙirar Ayyuka',
    appDescription: 'Amsa wasu tambayoyi game da fatan ayyukarka, zai ƙirƙira ayyuka, asusun, waɗanda suka fi duniya da aiki masu alhaki don ayyukarka.',
    appIdeaLabel: 'Fatan Ayyuka',
    appIdeaPlaceholder: 'Bayyana fata na ayyukarka (misali: "Ayyukan fintech don ƙungiyoyin kudade", "Sashin agri-tech mai haɗuwa wa masu kula da asuwanni")',
    appIdeaHint: 'Ka bayyana fata na ayyukarka da yaushe da alhakin mutane da ayyukarka.',
    offlineAccessLabel: 'Amfani a tsagin intanet',
    offlineAccessHint: 'Ayyukarka zai iya aiki a tsagin intanet?',
    offlineYes: 'Iya',
    offlineNo: 'A\'a',
    generatePrompts: 'Ƙirƙiri Ayyuka',
    generating: 'Ana ƙirƙira...',
    reset: 'Ƙirƙir daidai',
    close: 'Rufe',
    previous: 'Na gaba',
    next: 'Tsaka',
    copy: 'Kwafawa',
    copied: 'An kwafa!',
    copyAll: 'Kwafawa Duka',
    loadPrevious: 'Saka na gaba',
    generatedResults: 'Sabbabin Hasashe',
    userRoles: 'Awa li na Masu Amfani',
    aiAgents: 'Masu Aiki da AI',
    backendPrompts: 'Ayyukan Backend (Laravel)',
    frontendPrompts: 'Ayyukan Frontend (Vue.js)',
    rawResponse: 'Amfani da AI a cikin gaskiya',
    noResults: 'Babanin Sabuwa',
    noResultsHint: 'Cire fom na nan da shigar da Ƙirƙiri don ganin sabuwa.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'An kwafa URL!',
    jsonDownloaded: 'An sayarwa!',
    markdownDownloaded: 'An sayarwa!',
    ideaRequired: 'Fata na ayyuka an bukata',
    followUpQuestions: 'Tambayoyi na AI',
    generatingQuestions: 'Ana ƙirƙira tambayoyi',
    failedToGenerateQuestions: 'Ba zai yiwu ƙirƙira tambayoyi. Da fatan zai iya ganiya.',
    enterYourAnswer: 'Shigar da amsar ku',
    pleaseAnswerAllQuestions: 'Da fatan amsa duk tambayoyin da ke nan a nan har yaushe.',
    promptsGenerated: 'An ƙirƙira ayyuka a cefane!',
    failedToSave: 'Ba zai yiwu aƙwatin sabuwa. Da fatan zai iya ganiya.',
    failedToLoad: 'Ba zai yiwu sayarwa. Da fatan zai iya ganiya.',
    noResponse: 'Kuskure: Babanin amsa daga server. Da fatan kwana backend.',
    serverError: 'Kuskuren server',
    cancelButton: 'Soke',
    optional: '(za a iya zaba)',
    yes: 'Iya',
    no: 'A\'a',
    
    // About page
    aboutTitle: 'Game da Ƙirar Ayyuka',
    aboutSubtitle: 'Manufar sadarwa mai sauƙi don taimakon shirya ayyukarka',
    aboutWhatItDoes: 'Mene manufa ita ke yi?',
    aboutDescription1: 'Manufar wannan sadarwa shi ne taimaka wa ku can canzawa fatan ayyukarka zuwa tsarin gaskiya. Idan kuna yin ayyuka a wayar hira, shafin yanar gizo ko abin da yake da sauƙi a cikin dijital, muna sauƙaƙa wa sabuwar tsarin shirye.',
    aboutDescription2: 'Za ku amsa wasu tambayoyi game da abin da kuke son yin, da muna ba ku duk abin da kuka buƙata don faruwa da shirye.',
    aboutHowItWorks: 'Yaya ake aiki',
    aboutStep1: 'Bayyana fatan ayyukarka a cikin harshe mai sauƙi',
    aboutStep2: 'Amsa wasu tambayoyi don taimaka mana fahimta buƙatun ku',
    aboutStep3: 'Sami cikakken jerin asusun, waɗanda suka fi duniya, da ayyuka masu taimako shirye wa shirye shi ne',
    aboutWhatYouGet: 'Mene ka samu',
    aboutWhatYouGetDesc: 'Ayyukan da aka ƙirƙira suna haɗa wa maelekezo masu ƙina don taimaka wa ku a cikin tsarin rigakafin ku.',
    aboutUserRoles: 'Awa li na Masu Amfani',
    aboutUserRolesDesc: 'Wasu nau\'i na masu amfani da suka yi a cikin ayyukarka',
    aboutAIAgents: 'Masu Aiki da AI',
    aboutAIAgentsDesc: 'Masu taimako masu haskaka waɗanda zai iya yin aiki da shirya ayyuka a cikin ayyukarka',
    aboutBackendPrompts: 'Ayyukan Backend (da maelekezo)',
    aboutBackendPromptsDesc: 'Nasara da maelekezo don yin server da database don ayyukarka',
    aboutFrontendPrompts: 'Ayyukan Frontend (da maelekezo)',
    aboutFrontendPromptsDesc: 'Nasara da maelekezo don yin interface na masu amfani don ayyukarka',
    aboutWhyUseful: 'Mene yasa munafu?',
    aboutWhyUsefulDesc: 'Yaushe ba sa mun faruwa daga kasa da koi da yake yi a duk, wannan manufa zata ba ka da asali mai ƙima. Za ka iya amfani da sabuwar hasashe kama naƙali don faruwa, sassautawa ya yi da buƙatun ku da kuma aje wakatin da yake a cikin tsarin shirye.',
    backToGenerator: 'Dauki zuwa Ƙirar',
    
    // Category names
  },
  
  yo: {
    appTitle: 'Àgbàlàwọ́ Àwọn Àmò̩lùwípò',
    appDescription: 'Dá àgbéyẹ̀ àwọn ìbàwọ́lẹ̀ àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ àwọn àmò̩lùwípò, àwọn ìdí, àwọn àgẹ̀ntí, àti àwọn ìlà àwújọ̀ fún àwọn àkó̩sílẹ̀.',
    appIdeaLabel: 'Àwọn Ìtẹ̀wọ́ Àmò̩lùwípò',
    appIdeaPlaceholder: 'Ṣàlà àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ (Àwújọ̀: "Àmò̩lùwípò Fínánṣí fún àwọn àgùtàn àkọ́jọ̀", "Àgbàlàwọ́ Àgri-tech tó máa shàfí àwọn ònílẹ̀dẹ́ àwọn àwòòràn")',
    appIdeaHint: 'Jẹ́ àgbàlàwọ́ àwọn àwújọ̀ àti àwọn olùkọ́ àwọn àkó̩sílẹ̀.',
    offlineAccessLabel: 'Àwújọ̀ Ìtànkálẹ̀',
    offlineAccessHint: 'Ṣé àmò̩lùwípò yẹ́n í lẹ̀ àlààfin àkọ́jọ̀ àwọn ìtànkálẹ̀?',
    offlineYes: 'Bẹ́ẹ̀',
    offlineNo: 'Rará',
    generatePrompts: 'Ḥà àwọn Àmò̩lùwípò',
    generating: 'Àwọn Àmò̩lùwípò ó n ṣàfíhàn...',
    reset: 'Tún àwọn Àkó̩sílẹ̀',
    close: 'Mú',
    previous: 'Ìtúù',
    next: 'Ìdàbọ́bò',
    copy: 'Kópipí',
    copied: 'À ti kó!',
    copyAll: 'Kópipí Gbogbo',
    loadPrevious: 'Sàlọ́ Ìtúù',
    generatedResults: 'Àwọn Àkó̩sílẹ̀ Tó Di Ìtúù',
    userRoles: 'Àwọn Ìdí Olùkọ́',
    aiAgents: 'Àwọn Àgẹ̀ntí AI',
    backendPrompts: 'Àmò̩lùwípò Backend (Laravel)',
    frontendPrompts: 'Àmò̩lùwípò Frontend (Vue.js)',
    rawResponse: 'Àdáhùnsẹ̀ Àgùtàn AI',
    noResults: 'Rara Àkó̩sílẹ̀',
    noResultsHint: 'Tẹ̀ àwọn fọ́ọ̀mù àti pẹ̀ Àmò̩lùwípò láti rì àwọn àkó̩sílẹ̀.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'À ti kópipí URL!',
    jsonDownloaded: 'À ti sàlọ́!',
    markdownDownloaded: 'À ti sàlọ́!',
    ideaRequired: 'Àwọn Ìtẹ̀wọ́ Àmò̩lùwípò wúlà',
    followUpQuestions: 'Àwọn Ìtẹ̀wọ́ Àdàhùnsẹ̀ AI',
    generatingQuestions: 'Àwọn Àmò̩lùwípò ó n ṣàfíhàn',
    failedToGenerateQuestions: 'Àmò̩lùwípò kò ṣe àṣẹ̀. Jọ̀wọ́ kí à ti ṣàwárí.',
    enterYourAnswer: 'Tẹ̀ ìtùmọ́ rẹ̀',
    pleaseAnswerAllQuestions: 'Jọ̀wọ́ d àwọn àwọn Ìtẹ̀wọ́ Àdàhùnsẹ̀ gbogbo àwujọ àti àmò̩lùwípò.',
    promptsGenerated: 'Àwọn Àmò̩lùwípò ti di Ìtúù!',
    failedToSave: 'Àgbéyẹ̀ kò ṣe àṣẹ̀. Jọ̀wọ́ kí à ti ṣàwárí.',
    failedToLoad: 'Àgbéyẹ̀ kò ṣe àṣẹ̀. Jọ̀wọ́ kí à ti ṣàwárí.',
    noResponse: 'Ṣà Sanktì: Àkó̩sílẹ̀ kò wà ní àwọn server. Jọ̀wọ́ wò ó backend.',
    serverError: 'Ṣà Sanktì àwọn server',
    cancelButton: 'Dàgbà',
    optional: '(Àìpẹ̀lẹ̀)',
    yes: 'Bẹ́ẹ̀',
    no: 'Rará',
    
    // About page
    aboutTitle: 'Nínú Àgbàlàwọ́ Àwọn Àmò̩lùwípò',
    aboutSubtitle: 'Àwọn ìrú ọkàn púpọ̀ tó gbà àwọn àdàhùnsẹ̀ ìtọ́jú àwọn àkó̩sílẹ̀',
    aboutWhatItDoes: 'Ṣé àwọn Àgbàlàwọ́ Àmò̩lùwípò wá',
    aboutDescription1: 'Àwọn Àgbàlàwọ́ Àmò̩lùwípò jẹ́ àlàkò́sílẹ̀ àwọn àwújọ̀ tó tún àwọn àkó̩sílẹ̀ nínú àwọn àdàhùnsẹ̀. Àwọn Àgbàlàwọ́ Àmò̩lùwípò jẹ́ àlàkò́sílẹ̀ àwọn àwújọ̀ àti àwọn èdè tó yẹ́ kí à lò àwọn àkó̩sílẹ̀.',
    aboutDescription2: 'Àwọn Àgbàlàwọ́ Àmò̩lùwípò jẹ́ púpọ̀ àwọn àkó̩sílẹ̀ àti àwọn àwújọ̀ tó yẹ́ àwọn olùkọ́ láti mú àwọn ìtọ́jú.',
    aboutHowItWorks: 'Bá à ṣe àwọn Àgbà',
    aboutStep1: 'Ṣàlà àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀',
    aboutStep2: 'Jiban àwọn àmò̩lùwípò àti àwọn àdàhùnsẹ̀ AI',
    aboutStep3: 'Gbà àwọn àkó̩sílẹ̀ àti àwọn àdí àwọn àgẹ̀ntí AI',
    aboutWhatYouGet: 'Ṣé à wá',
    aboutWhatYouGetDesc: 'Àwọn àmò̩lùwípò tó a tindun jẹ́ pATPATI àwọn ìtọ́jú àti àwọn àlà àwújọ̀ láti mu àwọn olùkọ́ aṣà àkó̩sílẹ̀.',
    aboutUserRoles: 'Àwọn Ìdí Olùkọ́',
    aboutUserRolesDesc: 'Àwọn àdí àwọn olùkọ́ àti àwọn ìṣẹ̀ tó wá àwọn jẹ́ àwọn àmò̩lùwípò',
    aboutAIAgents: 'Àwọn Àgẹ̀ntí AI',
    aboutAIAgentsDesc: 'Àwọn àgẹ̀ntí AI tó lè ṣe àwọn ìṣẹ̀ àti àwọn àlà àwújọ̀',
    aboutBackendPrompts: 'Àmò̩lùwípò Backend (pẹlu àwọn ìtọ́jú)',
    aboutBackendPromptsDesc: 'Àwọn ìtọ́jú àti àwọn àlà àwújọ̀ àwọn àkó̩sílẹ̀ Backend',
    aboutFrontendPrompts: 'Àmò̩lùwípò Frontend (pẹlu àwọn ìtọ́jú)',
    aboutFrontendPromptsDesc: 'Àwọn ìtọ́jú àti àwọn àlà àwújọ̀ àwọn àkó̩sílẹ̀ Frontend',
    aboutWhyUseful: 'Ṣé àwọn Àgbàlàwọ́ Àmò̩lùwípò dáradará?',
    aboutWhyUsefulDesc: 'Àwọn Àgbàlàwọ́ Àmò̩lùwípò jẹ́ àlàkò́sílẹ̀ àwọn àkó̩sílẹ̀ àti àwọn àdí àwọn àgẹ̀ntí AI.',
    backToGenerator: 'Tẹ̀síwájú Àgbàlàwọ́',
    
    // Category names
  },
  
  am: {
    appTitle: 'አፍሪካ አፕሊኬሽን ጥናት አጠቃቀም',
    appDescription: 'ለአፍሪካ የተሟላ አፕሊኬሽን እንደዚሁ ሁሉት ጥናቶች በጣም ከፍተኛ አጠቃቀም፤ ዕድገት፤ አገንቶች እና ክህንቶች ይፍጠሩ።',
    appIdeaLabel: 'የአፕሊኬሽን እዲያ',
    appIdeaPlaceholder: 'የአፕሊኬሽን እዲያዎን ያጋሩ',
    appIdeaHint: 'እንደዚሁ አፕሊኬሽን ባለ፤ የሚፈለገውን ዓለም እና ባለ ሰርተው ያጋሩ።',
    offlineAccessLabel: 'ያልተገናኘ ጎበኛ',
    offlineAccessHint: 'አፕሊኬሽንዎ ነው ያልተገናኘ ለማግኘት አለበት?',
    offlineYes: 'አዎ',
    offlineNo: 'አይ',
    generatePrompts: 'ጥናቶችን አጠቃቀም',
    generating: 'ሁኔት ነው...',
    reset: 'አዘምር',
    close: 'ዝጋ',
    previous: 'ቀዳሚ',
    next: 'ክህል',
    copy: 'አትግብ',
    copied: 'አልገባለሁ!',
    copyAll: 'ሁሉን አትግብ',
    loadPrevious: 'ቀዳሚውን አስተማረን',
    generatedResults: 'የሚፈጠሩ ናቶች',
    userRoles: 'የተጠቃሚ ሚያያት',
    aiAgents: 'የአርቲፌል ኢንተሊጄንስ አገንቶች',
    backendPrompts: 'የሳይት ባህሪ ጥናቶች (Laravel)',
    frontendPrompts: 'የተጠቃሚ ባህሪ ጥናቶች (Vue.js)',
    rawResponse: 'አጠቃቀም ቅጥታ በቅር',
    noResults: 'ምንም ናት አይፈጠርም',
    noResultsHint: 'ፎርምን ይሞላና እና "ጥናቶችን አጠቃቀም" ይጫን።',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'አድራሻውን አትግብኩ!',
    jsonDownloaded: 'አልገባለሁ!',
    markdownDownloaded: 'አልገባለሁ!',
    ideaRequired: 'የአፕሊኬሽን እዲያ አለበት',
    followUpQuestions: 'አርቲፌል ኢንተሊጄንስ ጥናቶች',
    generatingQuestions: 'ጥናቶችን አጠቃቀም እያሰለኝ...',
    failedToGenerateQuestions: 'ጥናቶችን አጠቃቀም አልገባም። እንደገና አይጣለው።',
    enterYourAnswer: 'መልሰኛዎን ያስገቡ',
    pleaseAnswerAllQuestions: 'ጥናቶችን አጠቃቀም በፊለግ ጥናቶችን ሁሉ መልሰኛዎን ይህለን።',
    promptsGenerated: 'ጥናቶችን በሚገኝታ አጠቃቀም!',
    failedToSave: 'አስተማረኝን አሁር አልገባሁም። እንደገና አይጣለው።',
    failedToLoad: 'አስተማረኝን አሁር አልገባሁም',
    noResponse: 'ግልጽ: ምንም መልሰኛ አይነበረም።',
    serverError: 'የሰርቨር ጥርጥር',
    na: 'አይተገኘም',
    yes: 'አዎ',
    no: 'አይ',
    cancelButton: 'አትግብ',
    optional: '(አንደርገዋለሁ)',
    
    // About page
    aboutTitle: 'ስለ አፕሊኬሽን ጥናት አጠቃቀም',
    aboutSubtitle: 'የአፕሊኬሽንዎን እያንዳንድ ለማነጻጸር ጣልቅ ነው',
    aboutWhatItDoes: 'ይህ ጣልቅ ምን እንደገና ይሠራ?',
    aboutDescription1: 'ይህ ጣልቅ የአፕሊኬሽንዎን እዲያ ማተግበር እና ማገናግን ይበጥራል። እንደማነት አፕሊኬሽን ሳለ ስልክ ወይን አካል ዲጂታል ፈጣን፤ ጥናቶችን አጠቃቀም ብልክ እናማነሰራለን።',
    aboutDescription2: 'አፕሊኬሽንዎን ስለምን እንደሚፈለግ እንደሚያደርጉ ጥናቶችን አሰማሁ፤ ሁሉን ሁሉ እንደሚገባን ይቀጥላሉ።',
    aboutHowItWorks: 'እንደምንት እንደገና ይሠራ',
    aboutStep1: 'አፕሊኬሽንዎን እዲያ በጣም ጥንቅና ለማግኘት',
    aboutStep2: 'አርቲፌል ኢንተሊጄንስ ጥናቶችንን ለመነሳት አጠቃቀም',
    aboutStep3: 'የአፕሊኬሽንዎን ሚያያት፤ አገንቶች፤ እና ጥናቶችን ይገኝ',
    aboutWhatYouGet: 'ምንድን ነው ይገባናል',
    aboutWhatYouGetDesc: 'የሚፈጠሩ ጥናቶች ከፍተኛ አገልግሎትን ለማነጸር እና ለማገናገን ነው።',
    aboutUserRoles: 'የተጠቃሚ ሚያያት',
    aboutUserRolesDesc: 'የተጠቃሚዎችን አይነት እና የሚፈለግ ነገር',
    aboutAIAgents: 'የአርቲፌል ኢንተሊጄንስ አገንቶች',
    aboutAIAgentsDesc: 'ለአፕሊኬሽንዎ ውስጥ እያንዳንድ ነገሮችን እና ጣልቅዎችን ማቀበል የሚችሉ አገንቶች',
    aboutBackendPrompts: 'የሳይት ባህሪ ጥናቶች (ግልጽን ይንገላል)',
    aboutBackendPromptsDesc: 'ለአፕሊኬሽንዎ ሳይት እና ዳታቤዝ ለማገናገን ምርማሮች እና አገልግሎቶች',
    aboutFrontendPrompts: 'የተጠቃሚ ባህሪ ጥናቶች (ግልጽን ይንገላል)',
    aboutFrontendPromptsDesc: 'ለአፕሊኬሽንዎ ተጠቃሚ አቀራርጥ ለማገናገን ምርማሮች እና አገልግሎቶች',
    aboutWhyUseful: 'ለምን ነው በጣም አስተማሪ',
    aboutWhyUsefulDesc: 'በዚህ ጣልቅ ያስተማሪዎት ከአካል ከተጠቃሚ እና ከጥናቶች በሚገኝታ አጠቃቀም ብልክ ማነጸር ነው። ጥናቶችን ማገናገን፤ እንደ አሰማሪዎት ይገንብሉ፤ እንደገና ከማነጸሩ ይቆጣጠር።',
    backToGenerator: 'ክህንቶች አጠቃቀም ለመመለስ',
    
    // Category names
  },
  
  or: {
    appTitle: 'Afrika Aplikeshinii Camsaa Qorannoo',
    appDescription: 'Yeroo aftoota Afrikaa keessaa qophaa nii jiraachuuf, camsaa qophaawwan, roolaawwan, ejennoowwan, snaa barnootaargan akka waan jiraachuuf.',
    appIdeaLabel: 'Aplikeshinii Qophaa',
    appIdeaPlaceholder: 'Qophaa aplikeshinichaa barree',
    appIdeaHint: 'Qophaa aplikeshinichaa fi yeroo aftota Afrikaa keessatti argadhu.',
    offlineAccessLabel: 'Intarnetii Alaa',
    offlineAccessHint: 'Aplikeshinichaa intarneti alaa deebisuufi?',
    offlineYes: 'Eeyyee',
    offlineNo: 'Lakkoofsa',
    generatePrompts: 'Camsaa Qophaawwan',
    generating: 'Qophaawwan camsaama...',
    reset: 'Nuuf Haala Gaaffii',
    close: 'Xumura',
    previous: 'Eegaa',
    next: 'Itti',
    copy: 'Cufaa',
    copied: 'Cufame!',
    copyAll: 'Hama Cufaa',
    loadPrevious: 'Eegaa Qabee',
    generatedResults: 'Qophaawwanii Camsaame',
    userRoles: 'Seensollee Taayitaa',
    aiAgents: 'AI Ejennoowwan',
    backendPrompts: 'Qophaawwan Backend (Laravel)',
    frontendPrompts: 'Qophaawwan Frontend (Vue.js)',
    rawResponse: 'AI Qophaawwan Asii',
    noResults: 'Hin Beekamuu',
    noResultsHint: 'Fayyadamii fi Camsaa qophaawwanii taasisu.',
    ideaRequired: 'Aplikeshinii qophaa barbaadu',
    followUpQuestions: 'AI Tambaa Qophaawwan',
    generatingQuestions: 'Qophaawwan camsaama...',
    failedToGenerateQuestions: 'Hin qabxii tambaa. Gaafatamaa itti fayyadama.',
    enterYourAnswer: 'Fayyadama afurii',
    pleaseAnswerAllQuestions: 'Fayyadamii tambaa Afaan Orma hundaa itti fayyadama.',
    promptsGenerated: 'Qophaawwanii camsaamee!',
    failedToSave: 'Hin qabxii.',
    failedToLoad: 'Hin qabxii.',
    noResponse: 'Xiyyaara: Hin hafeen serverii.',
    serverError: 'Serverii xiyyaara',
    na: 'Hin Argatu',
    yes: 'Eeyyee',
    no: 'Lakkoofsa',
    cancelButton: 'Haala Gaaffii',
    optional: '(Akkamii)',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL cufame!',
    jsonDownloaded: 'Daawwadi!',
    markdownDownloaded: 'Daawwadi!',
    
    // About page
    aboutTitle: 'Waaee Aplikeshinii Camsaa Qorannoo',
    aboutSubtitle: 'Qalbii sadarkaa argachuu Aplikeshinii keessattis',
    aboutWhatItDoes: 'Eessatti waan itti fayyadamaa?',
    aboutDescription1: 'Qalbii kun waan hojii Aplikeshinii qophaa keessattis argachuu. Aplikeshiniiqaa keessattis moo nagaa sadii, web saaytii moo nagaa dijitaalii, nagaan dirree qabee. Aplikeshiniin waan barnoota qophii, roolii, ejennoowwanii fi qophaa qabeessa jiraachuu. Aplikeshinii qophaa itti fayyadamaa waan barnoota isaa argachuuf.',
    aboutDescription2: 'Qophaa aplikeshinichaa itti fayyadamaa waan barnootaa isaa argachuuf. Aplikeshiniin qophaa itti fayyadamaa itti fayyadamaa argachuuf.',
    aboutHowItWorks: 'Eessatti waan ifaa?',
    aboutStep1: 'Aplikeshinii qophaa barree',
    aboutStep2: 'Fayyadamii tambaa itti fayyadama.',
    aboutStep3: 'Roolii, ejennoowwanii fi qophaa qabeessa argachuuf.',
    aboutWhatYouGet: 'Eessan jirau?',
    aboutWhatYouGetDesc: 'Camsaa qophaawwanii keessattis maelekezoota argachuuf yaalamee jira.',
    aboutUserRoles: 'Seensollee Taayitaa',
    aboutUserRolesDesc: 'Aplikeshiniin keessa jiraatan Seensollee taayitaa',
    aboutAIAgents: 'AI Ejennoowwan',
    aboutAIAgentsDesc: 'AI Ejennoowwan keessattis Aplikeshiniin keessaa ifaa fi qabee.',
    aboutBackendPrompts: 'Qophaawwan Backend (maelekezoota argachuuf)',
    aboutBackendPromptsDesc: 'Serverii fi Database Aplikeshiniin keessaa ifaa fi maelekezoota.',
    aboutFrontendPrompts: 'Qophaawwan Frontend (maelekezoota argachuuf)',
    aboutFrontendPromptsDesc: 'Aplikeshinii Seensii ifaa fi maelekezoota.',
    aboutWhyUseful: 'Eessan nagaa?',
    aboutWhyUsefulDesc: 'Qalbii kun waan hojii Aplikeshinii qophaa keessattis argachuu. Waaniif Aplikeshiniin moo nagaa.',
    backToGenerator: 'Deebii Camsaa Qorannoo',
    
    // Category names
  },
  
  ig: {
    appTitle: 'Mmepe Aṅwạn Úzọ̀',
    appDescription: 'Dị mkpúre na àkwúkwọ̀ gbasara aṅwạn úzọ̀ gị, anyị ga emépe àkwúkwọ̀, ónwe, ákwúkwọ̀ na mmúmmú.',
    appIdeaLabel: 'Aṅwạn Úzọ̀',
    appIdeaPlaceholder: 'Kpebie aṅwạn úzọ̀ gị',
    appIdeaHint: 'Bìakwute na ọrụ aṅwạn úzọ̀ gị na ndị na agba ụlọ.',
    offlineAccessLabel: 'Ọrụ N etiti',
    offlineAccessHint: 'Ga emesi aṅwạn úzọ̀ gị ịrụ ọrụ n etiti onwe ya?',
    offlineYes: 'Ee',
    offlineNo: 'Mba',
    generatePrompts: 'Mmepe Àkwúkwọ̀',
    generating: 'Agba empatu...',
    reset: 'Tipịsị',
    close: 'Mechịe',
    previous: 'Mbu',
    next: 'Osote',
    copy: 'Kopí',
    copied: 'Ọ dị kopí!',
    copyAll: 'Kopí Ha Niile',
    loadPrevious: 'Gbaa Mbu',
    generatedResults: 'Ụdịdị Mmepe',
    userRoles: 'Ọrụ Ndi Onye Onye',
    aiAgents: 'AI Ákwúkwọ̀',
    backendPrompts: 'Àkwúkwọ̀ Backend (Laravel)',
    frontendPrompts: 'Àkwúkwọ̀ Frontend (Vue.js)',
    rawResponse: 'AI Ákříkṛ',
    noResults: 'Ọ dịghị present',
    noResultsHint: 'Fịlị form na kwado Generate ka ịghọta result.',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL kopí!',
    jsonDownloaded: 'Dowonloade!',
    markdownDownloaded: 'Dowonloade!',
    ideaRequired: 'Aṅwạn úzọ̀ adịghị',
    followUpQuestions: 'AI Àtụmatụ Àkwúkwọ̀',
    generatingQuestions: 'Àgbá Àkwúkwọ̀...',
    failedToGenerateQuestions: 'Àtụmatụ Àkwúkwọ̀ adịghị mme. Bịakwutere ọzọ.',
    enterYourAnswer: 'Tie àkwúkwọ̀ gị',
    pleaseAnswerAllQuestions: 'Bịakwutere Àkwúkwọ̀ AI niile mbu na mgbe ị na emépe Àkwúkwọ̀.',
    promptsGenerated: 'Àkwúkwọ̀ emere!',
    failedToSave: 'Emeela ịkwe ka mma.',
    failedToLoad: 'Emeela ịnweta.',
    noResponse: 'Mfe: Ọ dịghị response nke server.',
    serverError: 'Mfe server',
    cancelButton: 'Kagbuo',
    optional: '(ma ọ bụrụ)',
    yes: 'Ee',
    no: 'Mba',
    
    // About page
    aboutTitle: 'Makwuchita Mmepe Àkwúkwọ̀',
    aboutSubtitle: 'Ụzọ̀ dị mfe na agbakwunye gị na mpaghara Àkwúkwọ̀ gị',
    aboutWhatItDoes: 'Kedu ka ụzọ̀ a na emé?',
    aboutDescription1: 'Ụzọ̀ a na agbakwunye gị na agba ụzọ̀ gị na mpaghara. Na mmepe Àkwúkwọ̀, ónwe, ákwúkwọ̀ na mmúmmú naÀkwúkwọ̀ gị.',
    aboutDescription2: 'Ụzọ̀ a na agbakwunye gị na agba ụzọ̀ gị na mpaghara.',
    aboutHowItWorks: 'Onye ọ bụla na emé?',
    aboutStep1: 'Kpebie aṅwạn úzọ̀ gị',
    aboutStep2: 'Bịakwutere AI Àtụmatụ Àkwúkwọ̀',
    aboutStep3: 'Gbaa ónwe, Ákwúkwọ̀ na Àkwúkwọ̀ na Àkwúkwọ̀ gị',
    aboutWhatYouGet: 'Kedu ka ị na agba?',
    aboutWhatYouGetDesc: 'Àkwúkwọ̀ ndị ịtụgharịrị nwere Àkwúkwọ̀ nke na agba nke ga enyere aka na àkwúkwọ̀ gị.',
    aboutUserRoles: 'Ọrụ Ndi Onye Onye',
    aboutUserRolesDesc: 'Ọrụ Ndi Onye Onye na Àkwúkwọ̀ gị',
    aboutAIAgents: 'AI Ákwúkwọ̀',
    aboutAIAgentsDesc: 'Àkwúkwọ̀ AI dị ka ndị mmadụ ga emé okwu na nleba anyị',
    aboutBackendPrompts: 'Àkwúkwọ̀ Backend (na àkwúkwọ̀)',
    aboutBackendPromptsDesc: 'Àkwúkwọ̀ na àkwúkwọ̀ gị dị ka nkà na àkwúkwọ̀ server na database',
    aboutFrontendPrompts: 'Àkwúkwọ̀ Frontend (na àkwúkwọ̀)',
    aboutFrontendPromptsDesc: 'Àkwúkwọ̀ na àkwúkwọ̀ gị dị ka nkà na àkwúkwọ̀ user interface',
    aboutWhyUseful: 'Gịnị ka ọ mfe?',
    aboutWhyUsefulDesc: 'Ụzọ̀ a na agbakwunye gị na agba ụzọ̀ gị na mpaghara.',
    backToGenerator: 'Gaa n Mmepe Àkwúkwọ̀',
    
    // Category names
  },
  
  lg: {
    appTitle: 'Olusanu Olwino',
    appDescription: 'Yongera ku musaanyizibwa gwe ga ku byo by input yonna, ne tumugattako olusanu olwino, obugula, abagendako, ne obulimi ebifanana.',
    appIdeaLabel: 'Ekirobyo eky Olwino',
    appIdeaPlaceholder: 'Nyandikira ekirobyo eky olwino lyo',
    appIdeaHint: 'Obulembeze ku lwatu lwa olwino lyo ne abayizi byo.',
    offlineAccessLabel: 'Okuzimbibwa ku Internet',
    offlineAccessHint: 'Olwino lwo lwanga lwa kulemwa okuzimbibwa ku internet?',
    offlineYes: 'Yee',
    offlineNo: 'Ate',
    generatePrompts: 'Gattako Ebifanana',
    generating: 'Kigattako...',
    reset: 'Yambitsa',
    close: 'Ggwa',
    previous: 'Emu',
    next: 'Owukuta',
    copy: 'Koppiya',
    copied: 'Byakoppiyibwa!',
    copyAll: 'Koppiya Ebyona',
    loadPrevious: 'Gattako Emyaka',
    generatedResults: 'Ebifanana Ebigattibwa',
    userRoles: 'Obugula bwa Abayizi',
    aiAgents: 'Abagendako Aba AI',
    backendPrompts: 'Ebifanana ebya System (Laravel)',
    frontendPrompts: 'Ebifanana ebya Olwino (Vue.js)',
    rawResponse: 'Ekitundibwa kya AI',
    noResults: 'Tewali ebifanana',
    noResultsHint: 'Jjukira ebyo bya fofi ne nkuleeta "Gattako Ebifanana".',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL byakoppiyibwa!',
    jsonDownloaded: 'Byadduka!',
    markdownDownloaded: 'Byadduka!',
    ideaRequired: 'Ekirobyo eky olwino kye kimuli',
    followUpQuestions: 'Ebibuuzo eby AI',
    generatingQuestions: 'Kigattako Ebibuuzo...',
    failedToGenerateQuestions: 'Simwera okugattako ebibuuzo. Wanoongera wano.',
    enterYourAnswer: 'Nyandikira ddala lyange',
    pleaseAnswerAllQuestions: 'Mulwa nti yonna yebibuuzo ebikolwawo okugattako Ebifanana.',
    promptsGenerated: 'Ebifanana byagattibwa!',
    failedToSave: 'Simwera okwekeka.',
    failedToLoad: 'Simwera okunnyiga.',
    noResponse: 'Kibugumizzwa: Tewali kitundu ky olwino.',
    serverError: 'Kibugumizzwa kya server',
    cancelButton: 'Ggwa',
    optional: '(kinoonyereza)',
    yes: 'Yee',
    no: 'Ate',
    
    // About page
    aboutTitle: 'Ebyolusanu Olwino',
    aboutSubtitle: 'Ekizikiza ekigenderera okuwasa ku kyokola olwino lwawe',
    aboutWhatItDoes: 'Ekizikiza kino kiyinza?',
    aboutDescription1: 'Ekizikiza kino ekigenderera okuwasa ku kyokola olwino lwawe. Oli olwino lw Engeri yonna, ennyimba, olwino olwino lw Engeri yonna, ne tutwasa okuwasa ku byona byokola olwino lwawe.',
    aboutDescription2: 'Oyagala ku lwatu lwolwino lw lwanga okulabirira, ne tutwasa byonna byokola okuyambibwa.',
    aboutHowItWorks: 'Kino kiyinza',
    aboutStep1: 'Nyandikira ekirobyo eky olwino lyo',
    aboutStep2: 'Yongera ku byo yebibuuzo ebikolwawo AI',
    aboutStep3: 'Yagala ebifanana, obugula, abagendako, ne obulimi ebifanana n olwino lwawe',
    aboutWhatYouGet: 'Owaagala kino',
    aboutWhatYouGetDesc: 'Ebifanana ebyagattibwa biba ne ebyokulabirira ebya nkola ku byokukola olwino lwo.',
    aboutUserRoles: 'Obugula bwa Abayizi',
    aboutUserRolesDesc: 'Ebikola ebirala ebikolwa abayizi mu olwino lwo',
    aboutAIAgents: 'Abagendako Aba AI',
    aboutAIAgentsDesc: 'Abagendako abasobola okukola ebintu ne ebikozesebwa mu olwino lwo',
    aboutBackendPrompts: 'Ebifanana ebya System (na ebyokulabirira)',
    aboutBackendPromptsDesc: 'Ebyokulabirira na ebyokulabirira okuyambibwa server ne database ya olwino lwo',
    aboutFrontendPrompts: 'Ebifanana ebya Olwino (na ebyokulabirira)',
    aboutFrontendPromptsDesc: 'Ebyokulabirira na ebyokulabirira okuyambibwa ekitundibwa kya omukwano',
    aboutWhyUseful: 'Ggwa kino kirungye?',
    aboutWhyUsefulDesc: 'Ekizikiza kino ekigenderera okuyambibwa olwino lwawe. Onaalabirira ebifanana ebikolwawo kuba ekizikiza kyo kyokola.',
    backToGenerator: 'Ddayo ku Olusanu Olwino',
    
    // Category names
  }
}

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Get translation for current language
const useTranslations = (language = 'en', options = {}) => {
  const { useCookies = false, useLocalStorage = true, autoDetect = false } = options
  
  const currentLanguage = ref(language)
  
  // Try to initialize from cookie or localStorage if options enabled
  if (useCookies) {
    const cookieLang = getCookie('prompt-generator-lang')
    if (cookieLang && SUPPORTED_LANGUAGES[cookieLang]) {
      currentLanguage.value = cookieLang
    }
  }
  
  if (useLocalStorage) {
    const storedLang = localStorage.getItem('prompt-generator-lang')
    if (storedLang && SUPPORTED_LANGUAGES[storedLang]) {
      currentLanguage.value = storedLang
    }
  }
  
  const setLanguage = (langCode) => {
    if (SUPPORTED_LANGUAGES[langCode]) {
      currentLanguage.value = langCode
      if (useLocalStorage) {
        localStorage.setItem('prompt-generator-lang', langCode)
      }
      if (useCookies) {
        document.cookie = `prompt-generator-lang=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      }
    }
  }
  
  const getLanguageFromCookie = () => {
    if (!useCookies) return null
    return getCookie('prompt-generator-lang')
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
    getLanguageFromCookie,
    SUPPORTED_LANGUAGES,
    translations
  }
}

export default useTranslations
