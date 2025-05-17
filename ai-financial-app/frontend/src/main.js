import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import the router

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faComments, faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Add icons to the library
library.add(faHome, faComments, faCog)

// Import global styles if any - for now, App.vue handles its own.
// import './assets/main.css' // Assuming Vite's default structure might have this

const app = createApp(App)

app.use(router) // Use the router
app.component('font-awesome-icon', FontAwesomeIcon) // Register FontAwesomeIcon component

app.mount('#app')
