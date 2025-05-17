import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import the router

// Import global styles if any - for now, App.vue handles its own.
// import './assets/main.css' // Assuming Vite's default structure might have this

const app = createApp(App)

app.use(router) // Use the router

app.mount('#app')
