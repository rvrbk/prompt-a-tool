# Africa Prompt Generator - Full Implementation Guide for Vibe Code

**Objective**:  
Build a **Vue.js + Laravel** web app where users answer a questionnaire to generate tailored prompts, roles, agents, and skills for their African-focused app ideas. The system uses **Mistral AI** to dynamically generate outputs.

---

## **📌 Overview**

This guide provides **10 iterations** to build the app step-by-step. Each iteration includes:

- **Tasks**: What to implement.
- **Technical Requirements**: Tools and libraries to use.
- **Deliverables**: Expected output.
- **Dependencies**: Commands to install required packages.
- **Next Steps**: What to do after completing the iteration.

---

## **🛠 Iteration 1: Project Setup & Basic Questionnaire (Frontend)**

**Goal**: Set up the Vue.js project and create a multi-step questionnaire to collect user inputs.

### **Tasks**

1. Initialize a **Vue 3 + Vite** project with **Tailwind CSS** for styling.
2. Create a **single-page questionnaire** with the following fields:
  - **App Idea**: Textarea (required).
  - **Target Countries**: Multi-select dropdown with African countries (e.g., Nigeria, Kenya, Ghana, South Africa, Uganda, Rwanda, Tanzania, etc.).
  - **Primary User Types**: Multi-select checkboxes (e.g., Farmers, Teachers, Healthcare Workers, Small Business Owners, Students, Government Officials, etc.).
  - **Offline Access**: Yes/No radio buttons.
3. Add **basic validation** (e.g., `idea` is required).
4. Add a **"Generate Prompts"** button that logs the form data to the console.
5. Style the form with **Tailwind CSS** (clean, mobile-friendly, and professional).

### **Technical Requirements**

- Use **Vue 3 Composition API** (`<script setup>`).
- Use **Tailwind CSS** for styling.
- Store form data in `reactive` or `ref` objects.
- Log the form data to the console when the button is clicked.

### **Dependencies**

```bash
npm create vue@latest africa-prompt-generator
cd africa-prompt-generator
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install
npm run dev
```

### **Deliverables**

- A working **Vue.js app** with the questionnaire.
- Console logs of the form data when the **"Generate Prompts"** button is clicked.

### **Example Workflow**

1. User opens the app.
2. User fills out the questionnaire.
3. User clicks **"Generate Prompts"**.
4. The app logs the form data to the console (e.g., `{ idea: "A Nigerian fintech app", countries: ["Nigeria"], userTypes: ["Farmers"], ... }`).

---

## **🖥 Iteration 2: Backend API (Laravel)**

**Goal**: Set up a Laravel backend to receive questionnaire data and prepare for Mistral AI integration.

### **Tasks**

1. Initialize a **Laravel 10** project.
2. Create a **POST endpoint** at `/api/generate-prompts` that:
  - Accepts JSON with the questionnaire data (e.g., `idea`, `countries`, `userTypes`, etc.).
  - Validates the input (e.g., `idea` is required, `countries` is an array).
  - Returns a **placeholder response** (e.g., `{ "status": "success", "message": "Prompts will be generated here" }`).
3. Set up **CORS** to allow requests from the Vue.js frontend (use `fruitcake/laravel-cors`).
4. Configure **environment variables** (`.env`) for future Mistral AI API calls.

### **Technical Requirements**

- Use **Laravel Sanctum** for API authentication (optional for now).
- Return **JSON responses** for all endpoints.

### **Dependencies**

```bash
composer create-project laravel/laravel africa-prompt-generator-backend
cd africa-prompt-generator-backend
composer require fruitcake/laravel-cors
php artisan serve
```

### **Deliverables**

- A **Laravel API** with the `/api/generate-prompts` endpoint.
- CORS configured to allow requests from `http://localhost:5173` (Vue.js default).

---

## **🔗 Iteration 3: Connect Frontend to Backend**

**Goal**: Link the Vue.js frontend to the Laravel backend.

### **Tasks**

1. In the Vue.js app, replace the `console.log` with a **fetch/axios call** to the Laravel endpoint (`/api/generate-prompts`).
2. Display the **API response** (placeholder for now) in the UI.
3. Add **error handling** (e.g., show a toast if the API call fails).
4. Test the full flow: Fill out the questionnaire → Submit → See the placeholder response.

### **Technical Requirements**

- Use **axios** or the native `fetch` API for HTTP requests.
- Handle **loading states** (e.g., disable the submit button while waiting for the API).

### **Dependencies**

```bash
npm install axios
```

### **Deliverables**

- Frontend successfully sends data to the backend and displays the response.

---

## **🤖 Iteration 4: Integrate Mistral AI for Prompt Generation**

**Goal**: Use **Mistral AI** to generate roles, agents, and prompts from the questionnaire data.

### **Tasks**

1. Sign up for **Mistral AI API access** (or use your existing access).
2. In the Laravel backend:
  - Add a **new method** to call the Mistral API with the questionnaire data.
  - Use the **structured prompt** to generate roles, agents, and technical prompts.
  - Parse the **JSON response** from Mistral and return it to the frontend.
3. Update the `/api/generate-prompts` endpoint to use this method.
4. Test with a **sample idea** (e.g., "A Nigerian fintech app for savings groups").

### **Technical Requirements**

- Use **Guzzle HTTP** or Laravel's `Http` facade to call the Mistral API.
- Handle **API errors** (e.g., rate limits, invalid responses).
- Sanitize the Mistral output to ensure valid JSON.

### **Example Mistral API Call in Laravel**

```php
use Illuminate\Support\Facades\Http;

public function generatePrompts(Request $request)
{
    $data = $request->validate([
        'idea' => 'required|string',
        'countries' => 'required|array',
        'userTypes' => 'required|array',
        'offlineAccess' => 'required|boolean',
        'features' => 'required|array',
    ]);

    $mistralResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . env('MISTRAL_API_KEY'),
        'Content-Type' => 'application/json',
    ])->post('https://api.mistral.ai/v1/chat/completions', [
        'model' => 'mistral-medium',
        'messages' => [
            [
                'role' => 'user',
                'content' => $this->buildMistralPrompt($data),
            ],
        ],
        'temperature' => 0.7,
    ]);

    $output = json_decode($mistralResponse->body(), true);
    $prompts = json_decode($output['choices'][0]['message']['content'], true);

    return response()->json($prompts);
}

protected function buildMistralPrompt(array $data): string
{
    return sprintf(
        "Given the following app idea and context, generate:
        1. A list of user roles (with permissions and actions) as JSON.
        2. A list of AI agents (with skills and tools) as JSON.
        3. Technical prompts for Laravel (backend) and Vue.js (frontend) as JSON.

        **Idea**: %s
        **Countries**: %s
        **User Types**: %s
        **Offline Access**: %s
        **Features**: %s

        Format the output as a single JSON object with keys: `roles`, `agents`, `backend_prompts`, `frontend_prompts`.",
        $data['idea'],
        implode(', ', $data['countries']),
        implode(', ', $data['userTypes']),
        $data['offlineAccess'] ? 'Yes' : 'No',
        implode(', ', $data['features'])
    );
}
```

### **Deliverables**

- Mistral AI generates **roles, agents, and prompts** based on user input.
- Frontend displays the **parsed JSON output** (e.g., roles, agents).

---

## **🎨 Iteration 5: Display Generated Output in the UI**

**Goal**: Render the generated **roles, agents, and prompts** in a user-friendly format.

### **Tasks**

1. In the Vue.js app, parse the JSON response from the backend.
2. Create **dedicated sections** to display:
  - **User Roles**: As a collapsible list with permissions/actions.
  - **AI Agents**: As cards with their skills and tools.
  - **Technical Prompts**: As code blocks (for Laravel/Vue.js).
3. Add **copy-to-clipboard** buttons for each section.
4. Allow users to **edit the generated output** (e.g., tweak a role's permissions).

### **Technical Requirements**

- Use **Vue.js computed properties** to format the data for display.
- Style with **Tailwind CSS** for readability.
- Use a library like `vue-clipboard3` for copy functionality.

### **Dependencies**

```bash
npm install vue-clipboard3
```

### **Deliverables**

- A polished UI that displays the generated output clearly.
- Users can copy or edit the prompts/roles/agents.

---

## **📝 Iteration 6: Add Africa-Specific Templates**

**Goal**: Pre-load **templates** for common African use cases (e.g., AgriTech, FinTech, EdTech).

### **Tasks**

1. In the Laravel backend, create a **templates table** in the database to store:
  - Template name (e.g., "AgriTech Marketplace").
  - Predefined **roles, agents, and prompts** for that template.
2. Add a **new endpoint** `/api/templates` to fetch available templates.
3. In the Vue.js frontend:
  - Add a **"Start from Template"** option at the beginning of the questionnaire.
  - Let users **select a template** and pre-fill the questionnaire with its data.
4. Allow users to **customize the template** before generating prompts.

### **Technical Requirements**

- Use **Laravel migrations** to create the `templates` table.
- Seed the database with **3-5 Africa-specific templates**.

### **Deliverables**

- Users can start from a template and customize it.

---

## **💾 Iteration 7: Save & Load User Sessions**

**Goal**: Let users **save their progress** and return later.

### **Tasks**

1. In Laravel, create a **sessions table** to store:
  - User ID (or anonymous session ID).
  - Questionnaire data.
  - Generated prompts/roles/agents.
2. Add endpoints to:
  - **Save a session** (`POST /api/sessions`).
  - **Load a session** (`GET /api/sessions/{id}`).
  - **List user sessions** (`GET /api/sessions`).
3. In Vue.js, add:
  - A **"Save Progress"** button.
  - A **"Load Previous Session"** dropdown.

### **Technical Requirements**

- Use **Laravel Sanctum** for user authentication (optional).
- Generate **unique session IDs** for anonymous users.

### **Deliverables**

- Users can save and resume their work.

---

## **📤 Iteration 8: Export & Share Prompts**

**Goal**: Allow users to **export or share** their generated prompts.

### **Tasks**

1. In Vue.js, add buttons to:
  - **Export as JSON** (download file).
  - **Export as Markdown** (for documentation).
  - **Share via URL** (generate a shareable link to the session).
2. In Laravel, add an endpoint to **generate a shareable link** (`POST /api/sessions/{id}/share`).
3. Use a library like **jsPDF** or **markdown-it** for export formats.

### **Technical Requirements**

- Use **Blob API** for file downloads in Vue.js.
- Generate **short, unique URLs** for sharing (e.g., using `nanoid`).

### **Dependencies**

```bash
npm install jspdf markdown-it nanoid
```

### **Deliverables**

- Users can export or share their prompts/roles/agents.

---

## **📶 Iteration 9: Add Offline Support (PWA)**

**Goal**: Make the app work **offline** for users with poor connectivity.

### **Tasks**

1. Convert the Vue.js app into a **Progressive Web App (PWA)**:
  - Add a **service worker** (use `vite-plugin-pwa`).
  - Cache **API responses** for offline use.
2. In Laravel, add an endpoint to **sync offline data** when connectivity is restored (`POST /api/sync`).
3. In Vue.js, add a **"Work Offline"** toggle and queue actions for later sync.

### **Technical Requirements**

- Use **IndexedDB** to store offline data in the browser.
- Implement **background sync** for queued actions.

### **Dependencies**

```bash
npm install vite-plugin-pwa
```

### **Deliverables**

- App works offline and syncs data when back online.

---

## **🚀 Iteration 10: Deploy to Production**

**Goal**: Deploy the app to **Hetzner** (or your preferred host).

### **Tasks**

1. **Frontend**:
  - Build the Vue.js app (`npm run build`).
  - Deploy the `dist` folder to a **static file host** (e.g., Hetzner Static Web Hosting or Nginx).
2. **Backend**:
  - Deploy the Laravel app to Hetzner using **Docker** or **direct server setup**. 
  - Configure **Nginx + Certbot** for HTTPS.
  - Set up **environment variables** (Mistral API key, database credentials).
3. **Database**:
  - Set up **PostgreSQL** on Hetzner and migrate the database.
4. **Monitoring**:
  - Add **basic logging** (Laravel logs + frontend error tracking).

### **Technical Requirements**

- Use **Docker Compose** for Laravel + PostgreSQL.
- Configure **Nginx** as a reverse proxy for Laravel.
- Set up **Certbot** for SSL certificates.

### **Deliverables**

- A live, production-ready app at your domain (e.g., `promptgen.verbeek.ug`).

---

## **📌 General Instructions for Vibe Code**

1. **Start with Iteration 1** and provide the full code for the Vue.js app.
2. **Test each iteration** before moving to the next.
3. **Use clear comments** in the code to explain key logic.
4. **Provide setup instructions** (e.g., `npm install`, `php artisan serve`).
5. **Assume the user is familiar with Vue.js, Laravel, and Tailwind CSS** but may need guidance on specific implementations (e.g., Mistral API integration).
6. For each iteration, include:
  - Full code (frontend/backend).
  - Dependencies to install.
  - Testing instructions.
  - Next steps.

---

## **🔹 Notes**

- **Mistral API Key**: Replace `env('MISTRAL_API_KEY')` with your actual Mistral API key in the Laravel `.env` file.
- **Database**: Use PostgreSQL for Laravel (recommended for JSON storage).
- **Security**: Sanitize all user inputs and API responses to prevent injection attacks.
- **Performance**: Optimize Mistral API calls (e.g., cache responses for identical inputs).
