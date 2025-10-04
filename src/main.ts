import { createApp } from 'vue';
import pinia from './stores';
import router from './router';
import App from './App.vue';
import './style.css';

async function initializeApp() {
  // 创建Vue应用
  const app = createApp(App);

  app.use(pinia);
  app.use(router);

  app.mount('#app');

  console.log('[Main] App mounted');
}

initializeApp().catch((error) => {
  console.error('App initialization failed:', error);
});
