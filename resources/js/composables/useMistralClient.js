/**
 * Client-side Mistral API integration
 * 
 * This composable provides client-side methods for interacting with Mistral AI
 * through your Laravel backend or directly to Mistral API.
 */

import { ref } from 'vue'
import axios from 'axios'

/**
 * Use Mistral API client
 * 
 * @returns {Object} Methods for calling Mistral API
 */
export function useMistralClient() {
    const isLoading = ref(false)
    const error = ref(null)
    const lastResponse = ref(null)



    /**
     * Generate prompts from Mistral AI via Laravel backend
     * 
     * @param {Object} questionnaireData - The form data
     * @returns {Promise<Object>} Generated prompts, roles, agents
     */
    const generatePrompts = async (questionnaireData) => {
        isLoading.value = true
        error.value = null
        
        try {
            const response = await axios.post('/api/generate-prompts', questionnaireData)
            
            if (response.data.status === 'success') {
                lastResponse.value = response.data
                return response.data.data
            }
            
            throw new Error(response.data.message || 'Unknown error')
            
        } catch (err) {
            error.value = err.message || 'Failed to generate prompts'
            console.error('Mistral prompts error:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Direct client-side call to Mistral API (requires CORS setup)
     * 
     * NOTE: For production, use the Laravel backend proxy instead to keep
     * your API key secure. This is for development/testing only.
     * 
     * @param {string} apiKey - Your Mistral API key
     * @param {string} prompt - The prompt to send
     * @param {string} model - Model to use (default: mistral-medium)
     * @returns {Promise<Object>} Mistral API response
     */
    const callMistralDirect = async (apiKey, prompt, model = 'mistral-medium') => {
        if (!apiKey) {
            throw new Error('Mistral API key is required')
        }
        
        isLoading.value = true
        error.value = null
        
        try {
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 60000
                }
            )
            
            lastResponse.value = response.data
            return response.data
            
        } catch (err) {
            error.value = err.message || 'Failed to call Mistral API'
            console.error('Direct Mistral call error:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Check Mistral API status
     * 
     * @returns {Promise<Object>} Status information
     */
    const checkStatus = async () => {
        try {
            const response = await axios.get('/api/mistral/status')
            return response.data
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    return {
        isLoading,
        error,
        lastResponse,
        generatePrompts,
        callMistralDirect,
        checkStatus
    }
}

export default useMistralClient
