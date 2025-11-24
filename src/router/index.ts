import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import GameScreen from '../components/GameScreen.vue';
import ResultScreen from '../components/ResultScreen.vue';
import LeaderboardScreen from '../components/LeaderboardScreen.vue';
import SettingsModal from '../components/SettingsModal.vue';
import AuthScreen from '../components/AuthScreen.vue';
import ProfilePage from '../components/ProfilePage.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: "/", name: "auth", component: AuthScreen },
  { path: '/home', name: 'home', component: HomePage },
  { path: '/profile', name: 'profile', component: ProfilePage },
  { path: '/game', name: 'game', component: GameScreen },
  { path: '/result', name: 'result', component: ResultScreen },
  { path: '/leaderboard', name: 'leaderboard', component: LeaderboardScreen },
  { path: '/settings', name: 'settings', component: SettingsModal },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});


router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  const publicPages = ['auth'];
  const authRequired = !publicPages.includes(to.name as string);

  if (!auth.user && sessionStorage.getItem('auth_token')) {
    auth.loadFromStorage();
  }

  if (authRequired && !auth.isAuthenticated) {
    return next({ name: 'auth' });
  }

  if (to.name === 'auth' && auth.isAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
