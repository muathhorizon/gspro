import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import './styles/intro-theme.css';
import i18n from './i18n';
import App from './App.vue';
import router from './router';

import { useAuthStore } from './stores/auth';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

const auth = useAuthStore();
auth.loadFromStorage();

app.use(i18n);
app.use(router);

app.mount('#app');
