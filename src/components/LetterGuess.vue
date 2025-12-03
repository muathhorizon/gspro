<template>
  <div class="letter-guess-container" :class="{ 'expanded': suggestions.length > 0 }">
    <div class="letter-guess-wrapper">
      <!-- Native Input Field -->
      <div class="input-wrapper" :class="{ 'has-suggestions': suggestions.length > 0 }">
        <input
          ref="inputField"
          v-model="inputValue"
          type="text"
          :placeholder="placeholder || $t('typeYourGuess')"
          :disabled="disabled"
          @focus="isFocused = true"
          @blur="handleBlur"
          @input="handleInput"
          class="native-input"
          autocomplete="off"
          spellcheck="false"
        />

        <!-- Clear Button -->
        <button
          v-if="inputValue.length > 0"
          @click="clearInput"
          class="clear-button"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </button>

        <!-- Premium Entity Cards Dropdown -->
        <transition name="cards-cascade">
          <div v-if="suggestions.length > 0" class="entity-cards-container">
            <div class="cards-header">
              <h4 class="cards-title">{{ $t('suggestionsTitle') }}</h4>
              <button class="close-cards" @click="suggestions = []">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingSuggestions" class="cards-loading">
              <div v-for="i in 3" :key="i" class="card-skeleton" :style="{ '--delay': i }">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line long"></div>
                  <div class="skeleton-line short"></div>
                </div>
              </div>
            </div>

            <!-- Entity Cards -->
            <div v-else class="entity-cards-grid">
              <div
                v-for="(entity, idx) in suggestions"
                :key="entity.id || idx"
                class="entity-card"
                :style="{ '--card-index': idx }"
                @click="selectSuggestion(entity)"
              >
                <div class="card-glow"></div>
                <div class="card-content">
                  <div class="entity-image-wrapper">
                    <img
                      v-if="entity.attributes?.image_url"
                      :src="entity.attributes.image_url"
                      :alt="entity.name"
                      class="entity-image"
                      @error="handleImageError"
                    />
                    <div v-else class="entity-image-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="image-shine"></div>
                  </div>

                  <div class="entity-details">
                    <h5 class="entity-name">{{ entity.name }}</h5>
                    <div v-if="entity.attributes" class="entity-meta">
                      <span v-if="entity.attributes.currentTeam" class="meta-item team">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                        {{ entity.attributes.currentTeam }}
                      </span>
                      <span v-if="entity.attributes.nationality" class="meta-item">
                        🌍 {{ entity.attributes.nationality }}
                      </span>
                      <span v-if="entity.attributes.position" class="meta-item">
                        {{ entity.attributes.position }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="card-border"></div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Submit Button -->
      <button @click="handleSubmit" class="submit-button" :disabled="disabled || inputValue.trim().length === 0">
        <transition name="fade" mode="out-in">
          <span v-if="!isSubmitting" key="text" class="button-content">
            <span class="button-icon">🚀</span>
            <span class="button-text">{{ $t('sendGuess') }}</span>
          </span>
          <span v-else key="loading" class="loading-spinner"></span>
        </transition>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
  placeholder?: string;
  submitText?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
}>();

const game = useGameStore();
const emit = defineEmits<{
  submit: [value: string];
}>();

const inputValue = ref('');
const suggestions = ref<any[]>([]);
const isFocused = ref(false);
const isLoadingSuggestions = ref(false);
const inputField = ref<HTMLInputElement | null>(null);

const fetchSuggestionsDebounced = useDebounceFn(async (query: string) => {
  if (query.trim().length < 2) {
    suggestions.value = [];
    isLoadingSuggestions.value = false;
    return;
  }

  isLoadingSuggestions.value = true;
  const results = await game.fetchSuggestions(query.trim());
  suggestions.value = results || [];
  isLoadingSuggestions.value = false;
}, 400);

function handleInput() {
  fetchSuggestionsDebounced(inputValue.value);
}

function handleBlur() {
  // Delay to allow click on suggestions
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
}

function clearInput() {
  inputValue.value = '';
  suggestions.value = [];
  inputField.value?.focus();
}

function selectSuggestion(entity: any) {
  inputValue.value = entity.name || '';
  suggestions.value = [];
  inputField.value?.focus();
}

function handleSubmit() {
  if (props.disabled || inputValue.value.trim().length === 0 || props.isSubmitting) return;
  emit('submit', inputValue.value.trim());
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
}

// Clear function exposed to parent
function clear() {
  inputValue.value = '';
  suggestions.value = [];
  isFocused.value = false;
}

defineExpose({ clear });
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   CONTAINER & WRAPPER
   ═══════════════════════════════════════════════════════════════ */
.letter-guess-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--card-bg) 95%, transparent);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  padding: 2rem 2rem 2.5rem;
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 -20px 60px rgba(0, 0, 0, 0.3),
    0 -1px 0 rgba(255, 255, 255, 0.05);
  animation: slideUpIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 90vh;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible;
}

.letter-guess-container.expanded {
  box-shadow:
    0 -30px 80px rgba(0, 0, 0, 0.4),
    0 -2px 0 rgba(139, 92, 246, 0.3),
    0 0 100px rgba(139, 92, 246, 0.2);
  border-top-color: rgba(139, 92, 246, 0.4);
}

@keyframes slideUpIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.letter-guess-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

/* ═══════════════════════════════════════════════════════════════
   INPUT WRAPPER & NATIVE INPUT
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   INPUT WRAPPER & NATIVE INPUT
   ═══════════════════════════════════════════════════════════════ */
.input-wrapper {
  flex: 1;
  position: relative;
}

.native-input {
  width: 100%;
  padding: 1.25rem 3.5rem 1.25rem 1.5rem;
  background: linear-gradient(145deg, var(--card-bg), rgba(255, 255, 255, 0.02));
  border: 2px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  outline: none;
}

.native-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
  font-weight: 500;
}

.native-input:focus {
  border-color: var(--accent-color);
  background: linear-gradient(145deg, var(--card-bg), rgba(139, 92, 246, 0.03));
  box-shadow:
    0 0 0 4px rgba(139, 92, 246, 0.1),
    0 8px 30px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.native-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Clear Button */
.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {opacity: 1;}
}

.clear-button:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-50%) scale(1.1) rotate(90deg);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.clear-button:active {
  transform: translateY(-50%) scale(0.95);
}

/* ═══════════════════════════════════════════════════════════════
   ENTITY CARDS CONTAINER
   ═══════════════════════════════════════════════════════════════ */
.entity-cards-container {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(30, 30, 45, 0.98));
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 9999;
  padding: 1.5rem;
  scroll-behavior: smooth;
}

.entity-cards-container::-webkit-scrollbar {
  width: 10px;
}

.entity-cards-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  margin: 8px 0;
}

.entity-cards-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--accent-color), var(--primary-color));
  border-radius: 12px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: all 0.3s ease;
}

.entity-cards-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--primary-color), #00c9ff);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.entity-cards-container::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 24px;
  opacity: 0;
  z-index: -1;
  animation: containerGlow 3s ease-in-out infinite;
}

@keyframes containerGlow {
  0%, 100% {
    opacity: 0.1;
    filter: blur(8px);
  }
  50% {
    opacity: 0.3;
    filter: blur(12px);
  }
}

/* Cards Header */
.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cards-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-cards {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-cards:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg) scale(1.1);
}

/* ═══════════════════════════════════════════════════════════════
   ENTITY CARDS GRID
   ═══════════════════════════════════════════════════════════════ */
.entity-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.entity-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: cardCascade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--card-index) * 0.08s);
}

@keyframes cardCascade {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.entity-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(241, 7, 163, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.entity-card:hover::before {
  opacity: 1;
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color), #00c9ff, #92fe9d);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.entity-card:hover .card-glow {
  opacity: 0.6;
}

.card-content {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.95), rgba(20, 20, 30, 0.95));
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  align-items: center;
  z-index: 2;
  transition: all 0.3s ease;
}

.entity-card:hover .card-content {
  transform: translateY(-4px);
  background: linear-gradient(145deg, rgba(40, 40, 60, 0.95), rgba(30, 30, 45, 0.95));
}

.card-border {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 3;
}

.entity-card:hover .card-border {
  border-color: var(--accent-color);
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.4),
    inset 0 0 20px rgba(139, 92, 246, 0.1);
}

/* Entity Image */
.entity-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(241, 7, 163, 0.2));
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.3);
}

.entity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s ease;
}

.entity-card:hover .entity-image {
  transform: scale(1.1) rotate(2deg);
}

.entity-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(241, 7, 163, 0.1));
}

.image-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.entity-card:hover .image-shine {
  transform: translateX(100%);
}

/* Entity Details */
.entity-details {
  flex: 1;
  min-width: 0;
}

.entity-name {
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  line-height: 1.3;
  word-wrap: break-word;
  background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.entity-card:hover .entity-name {
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color), #00c9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: translateX(4px);
}

.entity-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
  width: fit-content;
}

.entity-card:hover .meta-item {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateX(4px);
}

.meta-item.team {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
  border-color: rgba(16, 185, 129, 0.3);
}

.entity-card:hover .meta-item.team {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25));
  border-color: rgba(16, 185, 129, 0.5);
}

.meta-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SKELETONS
   ═══════════════════════════════════════════════════════════════ */
.cards-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.card-skeleton {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.5), rgba(20, 20, 30, 0.5));
  border-radius: 20px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  animation: pulse 1.5s ease-in-out infinite;
  animation-delay: calc(var(--delay) * 0.1s);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.skeleton-image {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.1) 25%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(139, 92, 246, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: center;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.long {
  width: 80%;
}

.skeleton-line.short {
  width: 60%;
}

/* ═══════════════════════════════════════════════════════════════
   SUBMIT BUTTON
   ═══════════════════════════════════════════════════════════════ */
.submit-button {
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  box-shadow:
    0 8px 24px rgba(16, 185, 129, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  min-height: 60px;
}

.submit-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #34d399, #10b981);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.05);
  box-shadow:
    0 12px 40px rgba(16, 185, 129, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.3),
    inset 0 2px 2px rgba(255, 255, 255, 0.3);
}

.submit-button:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-button:hover:not(:disabled)::after {
  width: 300px;
  height: 300px;
  opacity: 0;
}

.submit-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
  box-shadow:
    0 4px 16px rgba(16, 185, 129, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.button-icon {
  font-size: 1.25rem;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════════════════════════════════ */
.cards-cascade-enter-active {
  animation: cascadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cards-cascade-leave-active {
  animation: cascadeOut 0.3s ease;
}

@keyframes cascadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cascadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .entity-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .letter-guess-container {
    padding: 1.5rem 1rem 2rem;
  }

  .letter-guess-container.expanded {
    padding-top: 2rem;
    box-shadow:
      0 -40px 100px rgba(0, 0, 0, 0.5),
      0 -2px 0 rgba(139, 92, 246, 0.4),
      0 0 120px rgba(139, 92, 246, 0.3);
  }

  .letter-guess-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .native-input {
    font-size: 1rem;
    padding: 1rem 3rem 1rem 1.25rem;
  }

  .submit-button {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .entity-cards-grid {
    grid-template-columns: 1fr;
  }

  .entity-image-wrapper {
    width: 80px;
    height: 80px;
  }

  .entity-name {
    font-size: 1.1rem;
  }

  .meta-item {
    font-size: 0.8rem;
    padding: 0.35rem 0.6rem;
  }

  .entity-cards-container {
    max-height: 50vh;
    padding: 1rem;
  }

  .entity-cards-container::-webkit-scrollbar {
    width: 6px;
  }
}

@media (max-width: 480px) {
  .letter-guess-container {
    padding: 1rem 0.75rem 1.5rem;
  }

  .letter-guess-container.expanded {
    padding-top: 1.5rem;
  }

  .native-input {
    font-size: 0.95rem;
    padding: 0.875rem 2.75rem 0.875rem 1rem;
  }

  .clear-button {
    width: 32px;
    height: 32px;
    right: 0.75rem;
  }

  .entity-image-wrapper {
    width: 70px;
    height: 70px;
  }

  .card-content {
    padding: 1rem;
    gap: 1rem;
  }

  .entity-name {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .cards-title {
    font-size: 1rem;
  }

  .entity-cards-container {
    max-height: 45vh;
    padding: 0.875rem;
    border-radius: 20px;
  }

  .entity-cards-container::-webkit-scrollbar {
    width: 5px;
  }
}
</style>
