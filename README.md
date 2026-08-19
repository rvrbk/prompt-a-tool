# Africa Prompt Generator

A **Laravel 13 + Vue.js 3** full-stack web application for generating tailored prompts, roles, agents, and skills for African-focused app ideas using **Mistral AI**.

## Overview

This application allows users to answer a questionnaire about their African app idea and generates:
- User roles with permissions and actions
- AI agents with skills and tools
- Technical prompts for Laravel backend development
- Technical prompts for Vue.js frontend development

## Project Structure

This is a **single unified project** with:
- **Backend**: Laravel 13 with API routes
- **Frontend**: Vue.js 3 with Vite + Tailwind CSS v4
- **AI Integration**: Mistral AI via HTTP API

## Features Implemented

### Iteration 1: Questionnaire (Frontend)
- Vue 3 Composition API with `<script setup>`
- Tailwind CSS v4 for styling
- Multi-step questionnaire with:
  - App Idea (textarea, required)
  - Target Countries (multi-select dropdown with 50+ African countries)
  - Primary User Types (multi-select checkboxes)
  - Offline Access (Yes/No radio buttons)
- Basic validation
- Clean, mobile-friendly, professional UI

### Iteration 2: Backend API (Laravel)
- Laravel 13 project setup
- POST endpoint `/api/generate-prompts` with validation
- CORS configured for frontend
- Environment variables for Mistral AI

### Iteration 3: Frontend-Backend Connection
- Axios for HTTP requests
- API integration with Laravel backend
- Error handling with user-friendly messages
- Loading states during API calls
- Display of API response data

### Iteration 4: Mistral AI Integration
- MistralService class for API communication
- Prompt engineering for African context with **iterative development structure**
  - Backend prompts organized by iterations (Setup → Models → API → Auth → Logic → Validation → Deployment)
  - Frontend prompts organized by iterations (Setup → Components → Forms → API → State → UX → Testing)
- Response parsing and JSON handling
- Error handling and logging
- Configurable via .env file

### Iteration 5: Display Generated Output in UI (Enhanced)
- ResultsDisplay component for structured output rendering
- Collapsible sections for User Roles, AI Agents, Backend Prompts, and Frontend Prompts
- User Roles displayed as cards with permissions and actions
- AI Agents displayed as cards with skills, tools, and responsibilities
- Technical prompts displayed as formatted code blocks
- Copy-to-clipboard functionality for each section (using vue-clipboard3)
- Copy all results as JSON button
- Color-coded sections (blue for roles, purple for agents, green for backend, orange for frontend)
- Responsive grid layout for cards
- Raw response fallback for debugging

### Iteration 6: Add Africa-specific templates
- Database migration for templates table with JSON fields
- Template model with query scopes (byCategory, featured, ordered)
- TemplateSeeder with 5 Africa-specific templates:
  - AgriTech Marketplace (connecting farmers to buyers)
  - Mobile Money FinTech (financial services for unbanked populations)
  - EdTech Learning Platform (adaptive learning in African languages)
  - HealthTech Telemedicine (rural healthcare access)
  - Logistics & Delivery Platform (last-mile delivery)
- TemplateController with RESTful endpoints
- TemplateSelector Vue component with modal interface
- Category filter tabs for easy browsing
- Pre-fill questionnaire from selected template
- Selected template display with clear option

### Iteration 7: Save & Load User Sessions
- Database migration for user_sessions table with JSON fields
- Session model with query scopes (forUser, anonymous, recent)
- SessionController with RESTful endpoints:
  - POST /api/sessions - Save a session
  - GET /api/sessions - List user sessions
  - GET /api/sessions/{id} - Load a specific session
  - DELETE /api/sessions/{id} - Delete a session
- SessionManager Vue component with modal interface
- Save Progress button with Quick Save functionality
- Load Previous Session dropdown
- Resume Session button for active sessions
- Session persistence for anonymous users via unique session IDs
- Automatic session name generation from questionnaire data

### Iteration 8: Export & Share Prompts
- Export functionality with three formats:
  - **Export as JSON**: Download generated prompts, roles, agents, and metadata as a JSON file
  - **Export as Markdown**: Download structured documentation in Markdown format
  - **Share via URL**: Generate a shareable link to the session
- Database migration adding share_token, is_shared, and shared_at columns to user_sessions
- Session model updated with share_token field, generateShareToken() method, and query scopes (shared, byShareToken)
- SessionController extended with:
  - POST /api/sessions/{id}/share - Generate a shareable link for a session
  - GET /api/share/{shareToken} - Retrieve a shared session by token
- ExportShare Vue component with:
  - Export buttons (JSON, Markdown)
  - Share button with loading state
  - Share URL display with copy functionality
  - Feedback notifications for all actions
- Integration in ResultsDisplay component with export/share buttons in the header
- Uses Blob API for client-side file downloads
- Generates unique share tokens using PHP's random_bytes (server-side)

## Project Setup

### Prerequisites
- PHP 8.2+
- Composer 2.5+
- Node.js 18+
- npm 9+

### 1. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 2. Configure Environment

Copy the `.env` file and configure your settings:

```bash
cp .env .env.local
```

Update the following in `.env.local`:

```env
APP_NAME=Africa_Prompt_Generator
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite works out of the box for development)
DB_CONNECTION=sqlite

# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_MODEL=mistral-medium

# Google Analytics 4 (Optional)
# Get your Measurement ID from https://analytics.google.com (Format: G-XXXXXXXXXX)
VITE_GA_MEASUREMENT_ID=
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Start Servers

In **two separate terminals**:

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
# Runs on http://localhost:8000
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
# Compiles assets, HMR enabled
```

Then visit: **http://localhost:8000**

## Usage

1. Open the application in your browser
2. Fill out the questionnaire:
   - Describe your African app idea
   - Select target countries
   - Select user types
   - Choose if offline access is needed
   - Select core features
   - Select AI features
3. Click "Generate Prompts"
4. View the generated roles, agents, and prompts

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main application page |
| POST | `/api/generate-prompts` | Generate prompts from questionnaire data |
| GET | `/api/mistral/status` | Check Mistral AI configuration |
| GET | `/health` | Health check endpoint |
| POST | `/api/sessions` | Save a user session |
| GET | `/api/sessions` | List user sessions |
| GET | `/api/sessions/{id}` | Load a specific session |
| POST | `/api/sessions/{id}/share` | Generate a shareable link for a session |
| DELETE | `/api/sessions/{id}` | Delete a session |
| GET | `/api/share/{shareToken}` | Load a shared session by token |

## Configuration Options

### Mistral AI
- `MISTRAL_API_KEY`: Your Mistral API key (required)
- `MISTRAL_API_URL`: API endpoint (default: https://api.mistral.ai/v1/chat/completions)
- `MISTRAL_MODEL`: Model to use (default: mistral-medium)

### Application
- `APP_NAME`: Application name
- `APP_ENV`: Environment (local, production, etc.)
- `APP_DEBUG`: Debug mode
- `APP_URL`: Application URL

### Google Analytics (Optional)
- `VITE_GA_MEASUREMENT_ID`: Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX)
  - Get it from: https://analytics.google.com
  - Leave empty to disable tracking
  - Tracks: page views, form submissions, exports, shares

## Testing

### Test API Endpoint

```bash
# Using curl
curl -X POST http://localhost:8000/api/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A Nigerian fintech app for savings groups",
    "countries": ["Nigeria"],
    "userTypes": ["Small Business Owners"],
    "offlineAccess": true
  }'
```

### Check Mistral Configuration

```bash
curl http://localhost:8000/api/mistral/status
```

## Next Steps (Remaining Iterations)

- [x] Iteration 1: Vue.js frontend questionnaire
- [x] Iteration 2: Laravel backend API
- [x] Iteration 3: Connect frontend to backend
- [x] Iteration 4: Integrate Mistral AI for prompt generation
- [x] Iteration 5: Display generated output in UI (enhanced)
- [x] Iteration 6: Add Africa-specific templates
- [x] Iteration 7: Save & Load User Sessions
- [x] Iteration 8: Export & Share Prompts
- [ ] Iteration 9: Add Offline Support (PWA)
- [ ] Iteration 10: Deploy to Production

## License

MIT License
