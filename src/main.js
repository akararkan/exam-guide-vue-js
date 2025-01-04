import './assets/main.css'

// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router configuration
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

createApp(App)
  .use(router) // Tell Vue to use the router
  .mount('#app');

