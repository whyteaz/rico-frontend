import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import DashboardView from '../views/DashboardView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: ChatView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;