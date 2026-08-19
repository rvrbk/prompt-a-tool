# Mistral AI API Integration

This document explains how to use Mistral AI API in this application for fetching templates and generating prompts.

## Setup

### 1. Configure API Key

Add your Mistral API key to your `.env` file:

```bash
MISTRAL_API_KEY=your_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_MODEL=mistral-medium
```

### 2. Verify Configuration

Check if Mistral is configured by visiting:
```
GET /api/mistral/status
```

Response:
```json
{
  "configured": true,
  "model": "mistral-medium"
}
```

## Backend API Endpoints

### Templates from Mistral AI

**Endpoint:** `GET /api/templates/mistral`

**Parameters:**
- `category` (optional): Filter templates by category (AgriTech, FinTech, EdTech, HealthTech, Logistics, general)
- `context` (optional): Additional context for template generation

**Example:**
```bash
GET /api/templates/mistral?category=FinTech
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Nigeria Fintech Savings",
      "description": "A savings group app for Nigerian communities",
      "category": "FinTech",
      "icon": "💰",
      "tags": ["savings", "fintech", "nigeria"]
    }
  ],
  "count": 10,
  "source": "mistral"
}
```

### Generate Prompts (Existing)

**Endpoint:** `POST /api/generate-prompts`

**Request Body:**
```json
{
  "idea": "A fintech app for savings groups",
  "countries": ["Nigeria", "Kenya"],
  "userTypes": ["Individual", "SMEs"],
  "offlineAccess": true,
  "features": ["User Authentication", "Payments"],
  "aiFeatures": ["Fraud Detection"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "roles": [...],
    "agents": [...],
    "backend_prompts": [...],
    "frontend_prompts": [...]
  }
}
```

## Frontend Client Implementation

### Option 1: Use in Vue Components

Import the Mistral client composable:

```javascript
<script setup>
import useMistralClient from '../composables/useMistralClient'

const { fetchTemplates, generatePrompts, isLoading, error, lastResponse } = useMistralClient()

// Fetch templates from Mistral
const loadTemplates = async () => {
  try {
    const templates = await fetchTemplates('FinTech')
    console.log(templates)
  } catch (err) {
    console.error(err)
  }
}

// Generate prompts
const generate = async () => {
  const data = {
    idea: 'A savings app',
    countries: ['Nigeria'],
    userTypes: ['Individual'],
    offlineAccess: true,
    features: ['Payments'],
    aiFeatures: []
  }
  
  const result = await generatePrompts(data)
  console.log(result)
}
</script>
```

### Option 2: Direct API Calls (Development Only)

For development/testing, you can call Mistral directly from the browser:

```javascript
import useMistralClient from '../composables/useMistralClient'

const { callMistralDirect } = useMistralClient()

// WARNING: Only use this in development with a test API key
// In production, always use the Laravel backend proxy
const response = await callMistralDirect(
  'your_test_api_key',
  'Generate 5 fintech app ideas in JSON format'
)

console.log(response.choices[0].message.content)
```

## TemplateSelector Integration

The `TemplateSelector.vue` component now has a toggle to switch between Local DB and Mistral AI:

```vue
<!-- In TemplateSelector.vue -->
<div class="flex items-center bg-gray-100 rounded-lg p-1 text-sm">
  <button @click="useMistralApi = false; fetchTemplates()">
    Local DB
  </button>
  <button @click="useMistralApi = true; fetchTemplates()">
    Mistral AI
  </button>
</div>
```

When "Mistral AI" is selected, the component will call `/api/templates/mistral` instead of `/api/templates/metadata`.

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Vue.js    │────▶│   Laravel API   │────▶│  Mistral AI  │
│  Frontend   │     │   Backend        │     │              │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │         ┌─────────────────┐           │
       │         │  Template       │           │
       │         │  Controller     │           │
       │         └─────────────────┘           │
       │                   │                   │
       ▼                   ▼                   │
┌─────────────┐     ┌─────────────────┐           │
│ useMistral  │     │ MistralService  │◀──────────┘
│ Client      │     │                 │
└─────────────┘     └─────────────────┘
```

## Files Modified

1. **app/Services/MistralService.php** - Added `fetchTemplates()` and `buildTemplatePrompt()` methods
2. **app/Http/Controllers/TemplateController.php** - Added `mistralTemplates()` endpoint
3. **routes/api.php** - Added `/api/templates/mistral` route
4. **resources/js/components/TemplateSelector.vue** - Added toggle and Mistral integration
5. **resources/js/composables/useMistralClient.js** - New client-side composable (NEW FILE)

## Security Note

⚠️ **IMPORTANT:** Never expose your Mistral API key in client-side code in production. Always use the Laravel backend as a proxy to keep your API key secure.

The `callMistralDirect()` method in `useMistralClient.js` is for development/testing only. For production, use the Laravel endpoints which keep your API key on the server.

## Testing

1. Set your API key in `.env`
2. Visit your app and open the TemplateSelector modal
3. Click "Mistral AI" toggle
4. Templates should be fetched from Mistral AI

If you get an error about API key not configured, check:
- `.env` file has `MISTRAL_API_KEY`
- You restarted the Laravel server after adding the key
- The key is valid and has credits

## Customization

To customize the template generation prompt, modify the `buildTemplatePrompt()` method in `MistralService.php`.

You can adjust:
- Number of templates to generate
- Template structure (fields)
- Categories
- Formatting requirements
