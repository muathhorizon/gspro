<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Settings</h2>
            <button @click="handleClose" class="close-button">✕</button>
          </div>

          <div class="modal-body">
            <div class="setting-item" :style="{ '--index': 0 }">
              <div class="setting-info">
                <div class="setting-label">Theme</div>
                <div class="setting-description">Switch between light and dark mode</div>
              </div>
              <button @click="handleToggleTheme" class="toggle-button">
                <span class="toggle-icon">{{ currentTheme === 'dark' ? '🌙' : '☀️' }}</span>
                {{ currentTheme === 'dark' ? 'Dark' : 'Light' }}
              </button>
            </div>

            <div class="setting-item" :style="{ '--index': 1 }">
              <div class="setting-info">
                <div class="setting-label">Sound Effects</div>
                <div class="setting-description">Toggle game sound effects</div>
              </div>
              <button @click="handleToggleSound" class="toggle-button" :class="{ active: soundEnabled }">
                <span class="toggle-icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
                {{ soundEnabled ? 'On' : 'Off' }}
              </button>
            </div>

            <div class="setting-item" :style="{ '--index': 2 }">
              <div class="setting-info">
                <div class="setting-label">Animations</div>
                <div class="setting-description">Toggle interface animations</div>
              </div>
              <button @click="handleToggleAnimations" class="toggle-button" :class="{ active: animationsEnabled }">
                <span class="toggle-icon">{{ animationsEnabled ? '✨' : '🚫' }}</span>
                {{ animationsEnabled ? 'On' : 'Off' }}
              </button>
            </div>

            <div class="setting-item" :style="{ '--index': 3 }">
              <div class="setting-info">
                <div class="setting-label">About</div>
                <div class="setting-description">Guess Challenge v1.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useThemeStore } from '../stores/theme';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const themeStore = useThemeStore();

const { currentTheme, soundEnabled, animationsEnabled } = storeToRefs(themeStore);
const { toggleTheme, toggleSound, toggleAnimations, playSound } = themeStore;

function handleToggleTheme() {
  playSound('click');
  toggleTheme();
}

function handleToggleSound() {
  const wasEnabled = soundEnabled.value;
  toggleSound();
  if (!wasEnabled) {
    playSound('click');
  }
}

function handleToggleAnimations() {
  const wasEnabled = animationsEnabled.value;
  toggleAnimations();
  if (wasEnabled) {
    playSound('click');
  }
}

function handleClose() {
  playSound('click');
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--border-color);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.close-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  border-color: var(--accent-color);
  background: var(--bg-primary);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem 2rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
  animation: setting-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: calc(0.1s + var(--index, 0) * 0.05s);
}

.setting-item:last-child {
  border-bottom: none;
}

@keyframes setting-appear {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.toggle-button {
  padding: 0.75rem 1.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.toggle-button:hover {
  border-color: var(--accent-color);
  background: var(--card-bg);
}

.toggle-button.active {
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border-color: transparent;
  color: white;
}

.toggle-icon {
  font-size: 1.125rem;
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-button:hover .toggle-icon {
  transform: scale(1.2) rotate(10deg);
}

.toggle-button.active .toggle-icon {
  animation: icon-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes icon-pop {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
}

.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active .modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.modal-enter-from .modal-content {
  transform: scale(0.85) translateY(-30px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

[data-animations="disabled"] .setting-item {
  animation: none !important;
}

[data-animations="disabled"] .modal-enter-active .modal-content,
[data-animations="disabled"] .modal-leave-active .modal-content {
  transition: opacity 0.15s ease !important;
}

@media (max-width: 640px) {
  .modal-header,
  .modal-body {
    padding: 1.25rem 1.5rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
