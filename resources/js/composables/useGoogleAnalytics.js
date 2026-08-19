/**
 * Google Analytics 4 (GA4) integration for Vue 3
 * 
 * Usage:
 * 1. Add your GA4 Measurement ID to .env:
 *    VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 2. Import and use this composable in your App.vue or layout component:
 *    import useGoogleAnalytics from './composables/useGoogleAnalytics'
 *    useGoogleAnalytics()
 */

import { onMounted } from 'vue'

const GA_SCRIPT_ID = 'ga-gtag-script'
const GA_CONFIG_SCRIPT_ID = 'ga-config-script'

/**
 * Initialize Google Analytics tracking
 * @param {string} measurementId - GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
 * @param {object} options - Configuration options
 * @param {boolean} options.debug - Enable debug mode (default: false)
 * @param {boolean} options.useGtag - Use gtag.js instead of analytics.js (default: true)
 */
export const useGoogleAnalytics = (measurementId = null, options = {}) => {
  const {
    debug = false,
    useGtag = true
  } = options

  // Get measurement ID from environment or parameter
  const getMeasurementId = () => {
    return measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID || null
  }

  // Check if GA is configured
  const isConfigured = () => {
    return !!getMeasurementId()
  }

  // Inject the Google Analytics script
  const injectScript = (src, id, onloadCallback = null) => {
    if (document.getElementById(id)) return
    
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.id = id
      script.src = src
      script.async = true
      
      if (onloadCallback) {
        script.onload = () => {
          onloadCallback()
          resolve()
        }
      } else {
        script.onload = resolve
      }
      
      document.head.appendChild(script)
    })
  }

  // Initialize GA
  const initGA = () => {
    const measurementId = getMeasurementId()
    if (!measurementId) {
      if (debug) {
        console.warn('[GA] Measurement ID not configured. Skipping Google Analytics.')
      }
      return
    }

    if (useGtag) {
      // Use gtag.js (recommended for GA4)
      injectScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`, GA_SCRIPT_ID).then(() => {
        // Configure gtag after script loads
        const gtagScript = document.createElement('script')
        gtagScript.id = GA_CONFIG_SCRIPT_ID
        gtagScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}'${debug ? `, { debug_mode: true }` : ''});
        `
        document.head.appendChild(gtagScript)
        
        if (debug) {
          console.log(`[GA] Initialized with Measurement ID: ${measurementId}`)
        }
      })
    } else {
      // Use analytics.js (Universal Analytics - deprecated)
      injectScript('https://www.google-analytics.com/analytics.js', GA_SCRIPT_ID)
    }
  }

  // Track a page view
  const trackPageView = (path = null) => {
    const measurementId = getMeasurementId()
    if (!measurementId || !window.gtag) return
    
    const pagePath = path || window.location.pathname + window.location.search
    window.gtag('config', measurementId, { page_path: pagePath })
    
    if (debug) {
      console.log(`[GA] Tracked page view: ${pagePath}`)
    }
  }

  // Track an event
  const trackEvent = (eventName, eventParams = {}) => {
    const measurementId = getMeasurementId()
    if (!measurementId || !window.gtag) return
    
    window.gtag('event', eventName, eventParams)
    
    if (debug) {
      console.log(`[GA] Tracked event: ${eventName}`, eventParams)
    }
  }

  // Track form submission
  const trackFormSubmission = (formName, success = true, additionalParams = {}) => {
    trackEvent('form_submission', {
      form_name: formName,
      form_status: success ? 'success' : 'failure',
      ...additionalParams
    })
  }

  // Track button click
  const trackButtonClick = (buttonName, action = 'click') => {
    trackEvent('button_click', {
      button_name: buttonName,
      action
    })
  }

  // Track export actions
  const trackExport = (format) => {
    trackEvent('export', {
      format
    })
  }

  // Initialize on component mount
  onMounted(() => {
    initGA()
  })

  return {
    isConfigured,
    getMeasurementId,
    trackPageView,
    trackEvent,
    trackFormSubmission,
    trackButtonClick,
    trackExport
  }
}

/**
 * Global helper to track events without importing the composable
 * Useful for tracking from non-component contexts
 */
export const trackGAEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

export default useGoogleAnalytics
