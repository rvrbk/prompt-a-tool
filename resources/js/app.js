import { createApp } from 'vue'
import '../css/app.css'
import App from './App.vue'
import router from './router.js'

// Create Vue app
const app = createApp(App)

// Use router
app.use(router)

// Mount to the app container
app.mount('#app')
