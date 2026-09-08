/**
 * Sets up axios interceptor to trigger lightning animation on AI requests
 */
import axios from 'axios'

let isInterceptorSetup = false
let activeRequestCount = 0
let lightningElement = null

// Get the lightning bolt element once
function getLightningElement() {
    if (!lightningElement) {
        lightningElement = document.querySelector('.lightning-bolt')
    }
    return lightningElement
}

// Update lightning state based on active requests
function updateLightningState() {
    const element = getLightningElement()
    if (!element) return
    
    if (activeRequestCount > 0) {
        // AI request in progress - add pulsing yellow class
        element.classList.add('lightning-pulse')
    } else {
        // No active requests - remove pulsing class
        element.classList.remove('lightning-pulse')
    }
}

export function setupLightningInterceptor() {
    if (isInterceptorSetup) return
    isInterceptorSetup = true

    // Define AI API endpoints
    const aiEndpoints = [
        '/generate-prompts',
        '/generate-questions'
    ]

    // Request interceptor
    axios.interceptors.request.use((config) => {
        const url = config.url || ''
        const isAiRequest = aiEndpoints.some(endpoint => url.includes(endpoint))
        
        if (isAiRequest) {
            activeRequestCount++
            updateLightningState()
        }
        
        return config
    }, (error) => {
        return Promise.reject(error)
    })

    // Response interceptor
    axios.interceptors.response.use((response) => {
        const url = response.config.url || ''
        const isAiRequest = aiEndpoints.some(endpoint => url.includes(endpoint))
        
        if (isAiRequest) {
            activeRequestCount--
            updateLightningState()
        }
        
        return response
    }, (error) => {
        // Also decrement on error
        const url = error.config?.url || ''
        const isAiRequest = aiEndpoints.some(endpoint => url.includes(endpoint))
        
        if (isAiRequest) {
            activeRequestCount--
            updateLightningState()
        }
        
        return Promise.reject(error)
    })
}

// Manually trigger lightning for loading states
export function setLightningLoading(isLoading) {
    if (isLoading) {
        activeRequestCount++
    } else {
        activeRequestCount--
    }
    updateLightningState()
}

// Trigger initial page load animation
export function triggerInitialLightning() {
    const element = getLightningElement()
    console.log(element)
    if (!element) return
    
    // Add animation class for initial strike
    element.classList.add('lightning-initial-strike')
    
    setTimeout(() => {
        element.classList.remove('lightning-initial-strike')
    }, 600)
}
