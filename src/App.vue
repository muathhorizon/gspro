<template>
  <div class="app" lang="en" dir="rtl">
    <button
      @click="showSettings = true"
      class="settings-button"
      v-if="$route.name === 'home' || $route.name === 'leaderboard'"
    >
      ⚙️
    </button>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>

    <SettingsModal :isOpen="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingsModal from './components/SettingsModal.vue';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
// import { auth } from "./lib/firebase";
const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();
  // if (auth.currentUser) {
  //   signOut(auth).catch((e) => console.warn("Firebase signout error:", e));
  // }
});
const showSettings = ref(false);
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
}

.settings-button {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.settings-button:hover {
  border-color: var(--accent-color);
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 6px 20px var(--primary-glow);
}

.settings-button:active {
  transform: rotate(90deg) scale(0.95);
}

.settings-button-enter-active,
.settings-button-leave-active {
  transition: all 0.3s ease;
}

.settings-button-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.settings-button-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.page-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.6, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.96);
  filter: blur(4px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.96);
  filter: blur(4px);
}

[data-animations="disabled"] .page-enter-active,
[data-animations="disabled"] .page-leave-active,
[data-animations="disabled"] .settings-button-enter-active,
[data-animations="disabled"] .settings-button-leave-active {
  transition: none !important;
}

[data-animations="disabled"] .page-enter-from,
[data-animations="disabled"] .page-leave-to {
  filter: none !important;
}

@media (max-width: 640px) {
  .settings-button {
    top: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }
}
</style>
