/**
 * Display helpers shared by the saved-prompts pages
 */

export const PLATFORM_LABEL_KEYS = {
  web: 'webApp',
  ios: 'iosApp',
  android: 'androidApp',
  both: 'bothMobile',
}

/**
 * Localised date and time; falls back to English for locales the browser
 * doesn't know (e.g. Luganda).
 */
export const formatDate = (iso, lang) => {
  if (!iso) return ''
  const options = { dateStyle: 'medium', timeStyle: 'short' }
  try {
    return new Intl.DateTimeFormat(lang, options).format(new Date(iso))
  } catch {
    return new Intl.DateTimeFormat('en', options).format(new Date(iso))
  }
}
