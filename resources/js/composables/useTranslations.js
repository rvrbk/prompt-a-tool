/**
 * Translations for Africa Prompt Generator
 * Major African languages with ISO 639-1 codes
 */

import { ref } from 'vue'

// Supported languages with native names
const SUPPORTED_LANGUAGES = {
  am: { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  ar: { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  en: { name: 'English', native: 'English', flag: '🇬🇧' },
  fr: { name: 'French', native: 'Français', flag: '🇫🇷' },
  ha: { name: 'Hausa', native: 'Harshen Hausa', flag: '🇳🇬' },
  ig: { name: 'Igbo', native: 'Asụsụ Igbo', flag: '🇳🇬' },
  lg: { name: 'Luganda', native: 'Oluganda', flag: '🇺🇬' },
  or: { name: 'Oromo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  sw: { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿' },
  yo: { name: 'Yoruba', native: 'Èdè Yorùbá', flag: '🇳🇬' },
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
    
    offlineAccessLabel: 'Offline Access',
    offlineAccessHint: 'Will your app need to work without internet connectivity?',
    offlineYes: 'Yes',
    offlineNo: 'No',
    
    // Buttons
    generatePrompts: 'Generate Prompts',
    generating: 'Generating...',
    reset: 'Reset',
    close: 'Close',
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
    
    // Success/Error messages
    promptsGenerated: 'Prompts generated successfully!',
    failedToSave: 'Failed to save. Please try again.',
    failedToLoad: 'Failed to load. Please try again.',
    noResponse: 'Error: No server response. Please check backend.',
    serverError: 'Server error',
    
    cancelButton: 'Cancel',
    optional: '(optional)',
    
    // Category names
  },
  
  ar: {
    appTitle: 'مولد المطالبات على الغرار الأفريقي',
    appDescription: 'أجب عن بعض الأسئلة حول فكرة تطبيقك، وسنولد مطالبات ودوراً ووكالات ومهارات مخصصة لتطبيقك الموجه لأفريقيا.',
    appIdeaLabel: 'فكرة التطبيق',
    appIdeaPlaceholder: 'وصف فكرة التطبيق (مثال: "تطبيق فنتك نيجيري لمجموعات التوفير", "منصة تكنولوجيا زراعية كينية تربط المزارعين بالسوق")',
    appIdeaHint: 'كن محددًا بشأن هدف التطبيق وجمهورك المستهدف في أفريقيا.',
    offlineAccessLabel: 'الوصول بدون اتصال',
    offlineAccessHint: 'هل تحتاج تطبيقاتك للعمل بدون اتصال بالانترنت؟',
    offlineYes: 'نعم',
    offlineNo: 'لا',
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
    no: 'لا',
    
    cancelButton: 'إلغاء',
    
    // Category names
  },
  
  fr: {
    appTitle: 'Générateur de Prompts pour Applications Africaines',
    appDescription: 'Répondez à quelques questions sur votre idée d\'application, et nous générerons des prompts, rôles, agents et compétences adaptés pour votre application axée sur l\'Afrique.',
    appIdeaLabel: 'Idée de l\'application',
    appIdeaPlaceholder: 'Décrivez votre idée d\'application (ex: "Une application fintech nigériane pour les groupes d\'épargne", "Une plateforme agri-tech kényane connectant les agriculteurs aux marchés")',
    appIdeaHint: 'Soyez précis concernant le but de votre application et votre public cible en Afrique.',
    offlineAccessLabel: 'Accès hors ligne',
    offlineAccessHint: 'Votre application doit-elle fonctionner sans connexion internet ?',
    offlineYes: 'Oui',
    offlineNo: 'Non',
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
    no: 'Non',
    
    cancelButton: 'Annuler',
    
    // Category names
  },
  
  sw: {
    appTitle: 'Mtengenezi wa Maombi ya programu za Afrika',
    appDescription: 'Jibu maswali machache kuhusu wazo la programu yako, na tutaunda maombi, majukumu, waajiri, na ujuzi wa kioshvi cha Afrika.',
    appIdeaLabel: 'Wazo la programu',
    appIdeaPlaceholder: 'Eleza wazo la programu yako (mfano: "Programu ya fedha ya Kijo Nijeria kwa makundi ya uokoaji", "Jukwaa la Teknologia ya kilimo Kenya linaunganisha wakulima na soko")',
    appIdeaHint: 'Weweka kwa ufafanu wa lengo la programu yako na watazamaji wako Afrika.',
    offlineAccessLabel: 'Ufikatili wa mtandaoni',
    offlineAccessHint: 'Je, programu yako inahitaji kufanya kazi bila mtandao?',
    offlineYes: 'Ndiyo',
    offlineNo: 'Hapana',
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
    no: 'Hapana',
    
    cancelButton: 'Batilisha',
    
    // Category names
  },
  
  ha: {
    appTitle: 'ɗan ƙirar Ayyuka na Afirka',
    appDescription: 'Amsa wasu tambayoyi game da fatan ayyukarka, zai ƙirƙira ayyuka, asusun, waɗanda suka fi duniya da aiki masu alhaki don ayyukar Afirka.',
    appIdeaLabel: 'Fatan Ayyuka',
    appIdeaPlaceholder: 'Bayyana fata na ayyukarka (misali: "Ayyukan fintech na Nijeriya don ƙungiyoyin kudade", "Sashin agri-tech na Kenya mai haɗuwa wa masu kula da asuwanni")',
    appIdeaHint: 'Ka bayyana fata na ayyukarka da yaushe da alhakin mutane da ayyukarka a Afirka.',
    offlineAccessLabel: 'Amfani a tsagin intanet',
    offlineAccessHint: 'Ayyukarka zai iya aiki a tsagin intanet?',
    offlineYes: 'Iya',
    offlineNo: 'A\'a',
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
    no: 'A\'a',
    
    cancelButton: 'Soke',
    
    // Category names
  },
  
  yo: {
    appTitle: 'Àgbàlàwọ́ Àwọn Àmò̩lùwípò Àgbéyẹ̀ Àfríkà',
    appDescription: 'Dá àgbéyẹ̀ àwọn ìbàwọ́lẹ̀ àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ àwọn àmò̩lùwípò, àwọn ìdí, àwọn àgẹ̀ntí, àti àwọn ìlà àwújọ̀ fún àwọn àmò̩lùwípò àgbéyẹ̀ Àfríkà.',
    appIdeaLabel: 'Àwọn Ìtẹ̀wọ́ Àmò̩lùwípò',
    appIdeaPlaceholder: 'Ṣàlà àwọn ìtẹ̀wọ́ àwọn àkó̩sílẹ̀ (Àwújọ̀: "Àmò̩lùwípò Fínánṣí Nàìjíríà fún àwọn àgùtàn àkọ́jọ̀", "Àgbàlàwọ́ Àgri-tech Kẹ́níyà tó máa shàfí àwọn ònílẹ̀dẹ́ àwọn àwòòràn")',
    appIdeaHint: 'Jẹ́ àgbàlàwọ́ àwọn àwújọ̀ àti àwọn olùkọ́ àwọn àmò̩lùwípò nínú Àfríkà.',
    offlineAccessLabel: 'Àwújọ̀ Ìtànkálẹ̀',
    offlineAccessHint: 'Ṣé àmò̩lùwípò yẹ́n í lẹ̀ àlààfin àkọ́jọ̀ àwọn ìtànkálẹ̀?',
    offlineYes: 'Bẹ́ẹ̀',
    offlineNo: 'Rará',
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
    no: 'Rará',
    
    cancelButton: 'Dàgbà',
    
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
    copy: 'አትግብ',
    copied: 'አልገባለሁ!',
    copyAll: 'ሁሉን አትግብ',
    generatedResults: 'የሚፈጠሩ ናቶች',
    userRoles: 'የተጠቃሚ ሚያያት',
    aiAgents: 'የአርቲፌል ኢንተሊጄንስ አገንቶች',
    backendPrompts: 'የሳይት ባህሪ ጥናቶች (Laravel)',
    frontendPrompts: 'የተጠቃሚ ባህሪ ጥናቶች (Vue.js)',
    rawResponse: 'አጠቃቀም ቅጥታ በቅር',
    noResults: 'ምንም ናት አይፈጠርም',
    noResultsHint: 'ፎርምን ይሞላና እና "ጥናቶችን አጠቃቀም" ይጫን።',
    ideaRequired: 'የአፕሊኬሽን እዲያ አለበት',
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
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'አድራሻውን አትግብኩ!',
    jsonDownloaded: 'አልገባለሁ!',
    markdownDownloaded: 'አልገባለሁ!',
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
    copy: 'Cufaa',
    copied: 'Cufame!',
    copyAll: 'Hama Cufaa',
    generatedResults: 'Qophaawwanii Camsaame',
    userRoles: 'Seensollee Taayitaa',
    aiAgents: 'AI Ejennoowwan',
    backendPrompts: 'Qophaawwan Backend (Laravel)',
    frontendPrompts: 'Qophaawwan Frontend (Vue.js)',
    rawResponse: 'AI Qophaawwan Asii',
    noResults: 'Hin Beekamuu',
    noResultsHint: 'Fayyadamii fi Camsaa qophaawwanii taasisu.',
    ideaRequired: 'Aplikeshinii qophaa barbaadu',
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
  },
  
  ig: {
    appTitle: 'Mmepe Aṅwạn Úzọ̀ Áfrìkà',
    appDescription: 'Dị mkpúre na àkwúkwọ̀ gbasara aṅwạn úzọ̀ gị, anyị ga emépe àkwúkwọ̀, ónwe, ákwúkwọ̀ na mmúmmú fú Áfrìkà.',
    appIdeaLabel: 'Aṅwạn Úzọ̀',
    appIdeaPlaceholder: 'Kpebie aṅwạn úzọ̀ gị',
    appIdeaHint: 'Bìakwute na ọrụ aṅwạn úzọ̀ gị na ndị na agba ụlọ n Áfrìkà.',
    offlineAccessLabel: 'Ọrụ N etiti',
    offlineAccessHint: 'Ga emesi aṅwạn úzọ̀ gị ịrụ ọrụ n etiti onwe ya?',
    offlineYes: 'Ee',
    offlineNo: 'Mba',
    generatePrompts: 'Mmepe Àkwúkwọ̀',
    generating: 'Agba empatu...',
    reset: 'Tipịsịa',
    close: 'Mechịe',
    copy: 'Kopí',
    copied: 'Ọ dị kopí!',
    copyAll: 'Kopí Ha Niile',
    generatedResults: 'Ụdịdị Mmepe',
    userRoles: 'Ọrụ Ndi Onye Onye',
    aiAgents: 'AI Ákwúkwọ̀',
    backendPrompts: 'Àkwúkwọ̀ Backend (Laravel)',
    frontendPrompts: 'Àkwúkwọ̀ Frontend (Vue.js)',
    rawResponse: 'AI Ákříkṛ',
    noResults: 'Ọ dịghị present',
    noResultsHint: 'Fịlị form na kwado Generate ka ịghọta result.',
    ideaRequired: 'Aṅwạn úzọ̀ adịghị',
    promptsGenerated: 'Àkwúkwọ̀ emere!',
    failedToSave: 'Emeela ịkwe ka mma.',
    failedToLoad: 'Emeela ịnweta.',
    noResponse: 'Mfe: Ọ dịghị response nke server.',
    serverError: 'Mfe server',
    na: 'Adịghị',
    yes: 'Ee',
    no: 'Mba',
    cancelButton: 'Kagbuo',
    optional: '(ma ọ bụrụ)',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL kopí!',
    jsonDownloaded: 'Dowonloade!',
    markdownDownloaded: 'Dowonloade!',
  },
  
  lg: {
    appTitle: 'Olusanu Olwino olwino olwo olwino Ebya Afrika',
    appDescription: 'Yongera ku musaanyizibwa gwe ga ku byo by input yonna, ne tumugattako olusanu olwino, obugula, abagendako, ne obulimi ebifanana n olwino lwa Afrika.',
    appIdeaLabel: 'Ekirobyo eky Olwino',
    appIdeaPlaceholder: 'Nyandikira ekirobyo eky olwino lyo',
    appIdeaHint: 'Obulembeze ku lwatu lwa olwino lyo ne abayizi byo bya Afrika.',
    offlineAccessLabel: 'Okuzimbibwa ku Internet',
    offlineAccessHint: 'Olwino lwo lwanga lwa kulemwa okuzimbibwa ku internet?',
    offlineYes: 'Yee',
    offlineNo: 'Ate',
    generatePrompts: 'Gattako Ebifanana',
    generating: 'Kigattako...',
    reset: 'Yambitsa',
    close: 'Ggwa',
    copy: 'Koppiya',
    copied: 'Byakoppiyibwa!',
    copyAll: 'Koppiya Ebyona',
    generatedResults: 'Ebifanana Ebigattibwa',
    userRoles: 'Obugula bwa Abayizi',
    aiAgents: 'Abagendako Aba AI',
    backendPrompts: 'Ebifanana ebya System (Laravel)',
    frontendPrompts: 'Ebifanana ebya Olwino (Vue.js)',
    rawResponse: 'Ekitundibwa kya AI',
    noResults: 'Tewali ebifanana',
    noResultsHint: 'Jjukira ebyo bya fofi ne nkuleeta "Gattako Ebifanana".',
    ideaRequired: 'Ekirobyo eky olwino kye kimuli',
    promptsGenerated: 'Ebifanana byagattibwa!',
    failedToSave: 'Simwera okwekeka.',
    failedToLoad: 'Simwera okunnyiga.',
    noResponse: 'Kibugumizzwa: Tewali kitundu ky olwino.',
    serverError: 'Kibugumizzwa kya server',
    na: 'Tewali',
    yes: 'Yee',
    no: 'Ate',
    cancelButton: 'Ggwa',
    optional: '(kinoonyereza)',
    exportJson: 'JSON',
    exportMarkdown: 'MD',
    shareUrlCopied: 'URL byakoppiyibwa!',
    jsonDownloaded: 'Byadduka!',
    markdownDownloaded: 'Byadduka!',
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
