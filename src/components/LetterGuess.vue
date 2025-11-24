<template>
  <div class="letter-guess-container" :style="{ height: `${containerHeight}px` }"
    :class="{ focused: isFocused, 'suggestions-open': suggestions.length > 0 }">
    <div class="letter-guess-wrapper">
      <button class="keyboard-toggle" @click="toggleKeyboard">
        <svg class="arrow-icon" :class="{ rotated: !keyboardVisible }" xmlns="http://www.w3.org/2000/svg" width="26"
          height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
          stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <!-- Display Area -->
      <div class="guess-display" ref="guessDisplay" @click="focusInput">

        <div class="display-inner">


          <transition-group name="letter" tag="div" class="letters-display">
            <template v-for="(letter, index) in displayLetters" :key="`${letter}-${index}`">
              <div v-if="letter.trim() !== ''" class="letter-chip" :style="{ '--index': index }">
                <span class="letter-text">{{ letter }}</span>
                <button @click.stop="removeLetter(index)" class="remove-letter" :aria-label="`Remove ${letter}`">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div v-else class="space-chip"></div>
            </template>
          </transition-group>


          <div v-if="displayLetters.length === 0" class="placeholder">
            <span class="placeholder-icon">✨</span>
            <span class="placeholder-text">{{ placeholder }}</span>
          </div>

          <div class="cursor-blink" v-show="isFocused && displayLetters.length > 0"></div>
        </div>
        <!-- Suggestions Dropdown -->




      </div>
      <transition name="suggestions-slide-fade">
        <div v-if="suggestions.length > 0" class="suggestions-container">
          <button class="close-suggestions" @click="suggestions = []">✕</button>
          <!-- shimmer loading -->
          <div v-if="isLoadingSuggestions" class="suggestions-loading">
            <div class="shimmer"></div>
            <div class="shimmer short"></div>
            <div class="shimmer shorter"></div>
          </div>

          <h4 v-else class="suggestions-title">
            {{ $t('suggestionsTitle') }}
          </h4>

          <!-- actual list -->
          <ul v-if="!isLoadingSuggestions" class="suggestions-list">
            <li v-for="(item, idx) in suggestions" :key="idx" class="suggestion-item" @click="selectSuggestion(item)">
              <div class="suggestion-content">
                <div class="suggestion-name">{{ item.name }}</div>
                <div v-if="item.attributes?.currentTeam" class="suggestion-hint">
                  ⚽ {{ item.attributes.currentTeam }} • {{ item.attributes.position }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </transition>
      <!-- Submit Button -->
      <button @click="handleSubmit" class="submit-button" :disabled="disabled || displayLetters.length === 0">
        <transition name="fade" mode="out-in">
          <span v-if="!isSubmitting" key="text" class="button-content">
            <span class="button-icon">🚀</span>
            <span class="button-text">{{ $t('sendGuess') }}</span>
          </span>
          <span v-else key="loading" class="loading-spinner"></span>
        </transition>
      </button>



    </div>
    <transition name="keyboard-slide" appear>
      <div v-if="keyboardVisible" class="keyboard-container">
        <!-- Keyboard -->
        <div class="keyboard">
          <div class="keyboard-row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
            <button v-for="key in row" :key="key" @click="addLetter(key)" class="key" :class="{
              'key-used': usedLetters.includes(key)
            }" :disabled="disabled">
              <span class="key-label">{{ key }}</span>
            </button>
          </div>

          <div class="keyboard-row bottom-row">
            <button @click="addLetter('SPACE')" class="key key-space expanded" :disabled="disabled">
              <span class="key-label">Space</span>
            </button>
            <button @click="backspace" class="key key-backspace" :disabled="disabled || displayLetters.length === 0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>


          </div>


        </div>
      </div>

    </transition>


  </div>
</template>

<script setup lang="ts">
const isMobile = window.innerWidth <= 768;
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
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
const skipNextSuggestion = ref(false);
const suggestions = ref<any[]>([]);
const suggestionsVisible = ref(false);
const displayLetters = ref<string[]>([]);
const isFocused = ref(false);
const keyboardVisible = ref(true);
const isLoadingSuggestions = ref(false);
const container = ref<HTMLElement | null>(null);
const guessDisplay = ref<HTMLElement | null>(null);
const containerHeight = ref(200);
const lastLength = ref(0);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (guessDisplay.value) {
    resizeObserver = new ResizeObserver(() => {
      adjustContainerHeight();
    });
    resizeObserver.observe(guessDisplay.value);
  }
});

onUnmounted(() => {
  if (resizeObserver && guessDisplay.value) {
    resizeObserver.unobserve(guessDisplay.value);
  }
});
function adjustContainerHeight(force = false) {
  nextTick(() => {
    const displayHeight = guessDisplay.value?.offsetHeight || 0;

    let baseHeight = 360;

    if (window.innerWidth <= 768) {
      baseHeight = keyboardVisible.value ? 460 : 300;
    } else if (window.innerHeight < 700) {
      baseHeight = keyboardVisible.value ? 420 : 280;
    } else {
      baseHeight = keyboardVisible.value ? 380 : 260;
    }

    const dynamicIncrease = Math.min(displayHeight - 60, 160);
    const suggestionsExtra =
      suggestions.value.length > 0
        ? (window.innerHeight < 700 ? 180 : 160)
        : 0;

   containerHeight.value = keyboardVisible.value
  ? Math.max(baseHeight + Math.max(dynamicIncrease, 0) + suggestionsExtra, isMobile ? 550 : 430)
  : baseHeight + Math.max(dynamicIncrease, 0) + suggestionsExtra;
  });
}


const fetchSuggestionsDebounced = useDebounceFn(async (query: string) => {
  isLoadingSuggestions.value = true;
  const results = await game.fetchSuggestions(query);
  console.log(results);
  suggestions.value = results || [];
  suggestionsVisible.value = results.length > 0;
  isLoadingSuggestions.value = false;
}, 400);

watch(displayLetters, (letters) => {
  const currentLength = letters.length;
  const query = letters.join('').trim();

  if (currentLength < lastLength.value) {
    lastLength.value = currentLength;
    return;
  }

  lastLength.value = currentLength;

  if (skipNextSuggestion.value) {
    skipNextSuggestion.value = false;
    return;
  }

  if (query.length >= 2) {
    fetchSuggestionsDebounced(query);
  } else {
    suggestions.value = [];
    suggestionsVisible.value = false;
  }
}, { deep: true });

watch(keyboardVisible, () => {
  adjustContainerHeight(true);
});
watch(suggestions, () => {
  adjustContainerHeight(true);
});
function toggleKeyboard() {
  keyboardVisible.value = !keyboardVisible.value;
}
const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const usedLetters = computed(() => {
  return displayLetters.value;
});

function addLetter(letter: string) {
  if (props.disabled) return;

  if (letter === 'SPACE') {
    if (displayLetters.value.length > 0 && displayLetters.value[displayLetters.value.length - 1] !== ' ') {

      displayLetters.value.push(' ');
    }
    return;
  }

  displayLetters.value.push(letter);
  isFocused.value = true;
}

function removeLetter(index: number) {
  if (props.disabled) return;
  displayLetters.value.splice(index, 1);
}

function backspace() {
  if (props.disabled || displayLetters.value.length === 0) return;
  displayLetters.value.pop();
}

function focusInput() {
  isFocused.value = true;
}
function selectSuggestion(item: any) {
  // خذ الاسم من العنصر المختار
  const name = item.name || '';
  skipNextSuggestion.value = true;
  // فرّغ الأحرف الحالية وعبّيها من الاسم الجديد
  displayLetters.value = name.split('');

  // اخفِ القائمة بعد الاختيار
  suggestions.value = [];
  suggestionsVisible.value = false;

  // فعل الفوكس
  isFocused.value = true;
}
function handleSubmit() {
  if (props.disabled || displayLetters.value.length === 0 || props.isSubmitting) return;

  const value = displayLetters.value.join('');
  emit('submit', value);
}

// Clear function exposed to parent
function clear() {
  displayLetters.value = [];
  isFocused.value = false;
}

defineExpose({ clear });
</script>

<style scoped>
.letter-guess-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--card-bg) 90%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1.5rem 2rem 2rem;
  z-index: 1000;
  border-top: 2px solid var(--border-color);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
  animation: slideUpIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  height: 360px;
  transition: height 0.6s cubic-bezier(0.25, 1, 0.5, 1);

}

/* .letter-guess-container.suggestions-open {
  height: 520px; 
} */

@media (max-height: 700px) {
  /* .letter-guess-container.suggestions-open {
    max-height: 480px; 
  } */
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

@media (max-height: 768px) {
  .letter-guess-container {
    padding-bottom: 4rem;
    min-height: 420px !important;
    transition: height 0.5s ease;
  }

  .suggestions-container {
    max-height: 200px;
  }

  .suggestions-title {
    position: sticky;
    top: 0;
    background: rgba(25, 25, 25, 0.95);
    z-index: 10;
  }
}

@media (max-height: 700px),
(max-width: 768px) {
  .letter-guess-container {
    padding-bottom: 3.5rem;
  }
}

@media (max-width: 768px) {
  .letter-guess-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-button {
    width: 100%;
    margin-top: 0.75rem;
  }

  .keyboard-toggle {
    align-self: center;
  }
}

/* .letter-guess-container.focused {
  border-top-color: var(--accent-color);
  box-shadow: 0 -12px 48px var(--primary-glow), 0 -4px 16px var(--primary-glow);
} */

.letter-guess-wrapper {
  max-width: 900px;
  margin: 0 auto 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: stretch;
  align-items: center;
}

/* Display Area */
.guess-display {
  flex: 1;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 1.25rem 1.75rem;
  min-height: 60px;
  cursor: text;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  min-width: 300px;
}

.guess-display::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

/* .letter-guess-container.focused .guess-display {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--primary-glow), 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
} */

.letter-guess-container.focused .guess-display::before {
  opacity: 0.1;
}

.display-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  min-height: 32px;
  position: relative;
}

.letters-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  direction: ltr !important;
  flex-direction: row !important;
}

/* Letter Chips */
.letter-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px var(--primary-glow);
  animation: letterPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition: all 0.2s ease;
}

@keyframes letterPop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-10deg);
  }

  50% {
    transform: scale(1.1) rotate(5deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.letter-chip:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px var(--primary-glow);
}

.letter-text {
  min-width: 12px;
  text-align: center;
}

.remove-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-letter:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.remove-letter svg {
  stroke: white;
}

/* Placeholder */
.placeholder {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 1.05rem;
  font-weight: 500;
  opacity: 0.7;
  animation: placeholderFade 0.4s ease;
}

@keyframes placeholderFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.7;
  }
}

.placeholder-icon {
  font-size: 1.25rem;
}

.close-suggestions {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.close-suggestions:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.25);
}

/* Cursor */
.cursor-blink {
  width: 2px;
  height: 24px;
  background: var(--accent-color);
  animation: blink 1s infinite;
  margin-left: 0.25rem;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

/* Submit Button */
.submit-button {
  padding: 1.35rem 2.75rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  min-height: 60px;
  animation: buttonPulse 2s ease-in-out infinite;
}

@keyframes buttonPulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.6),
      0 6px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.2),
      0 0 40px rgba(16, 185, 129, 0.4);
  }
}

.submit-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(135deg, #34d399, #10b981, #059669);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.05);
  background: linear-gradient(135deg, #34d399, #10b981);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.3),
    inset 0 2px 2px rgba(255, 255, 255, 0.3),
    0 0 50px rgba(16, 185, 129, 0.5);
  animation: buttonShake 0.5s ease-in-out;
}

@keyframes buttonShake {
  0%, 100% { transform: translateY(-4px) scale(1.05) rotate(0deg); }
  25% { transform: translateY(-4px) scale(1.05) rotate(-2deg); }
  75% { transform: translateY(-4px) scale(1.05) rotate(2deg); }
}

.submit-button:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-button:hover:not(:disabled)::after {
  width: 300px;
  height: 300px;
  opacity: 0;
  transition: width 0.8s ease, height 0.8s ease, opacity 0.6s ease;
}

.submit-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  animation: contentBounce 2s ease-in-out infinite;
}

@keyframes contentBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.submit-button:hover:not(:disabled) .button-content {
  animation: none;
}

.button-icon {
  font-size: 1.25rem;
  animation: iconRotate 3s linear infinite;
}

@keyframes iconRotate {
  0%, 90% { transform: rotate(0deg); }
  95% { transform: rotate(-15deg); }
  100% { transform: rotate(0deg); }
}

.submit-button:hover:not(:disabled) .button-icon {
  animation: iconShake 0.5s ease-in-out;
}

@keyframes iconShake {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  50% { transform: scale(1.3) rotate(10deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
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

/* Keyboard */
.keyboard {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.5rem;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.keyboard-row.bottom-row {
  gap: 0.5rem;
}

.key {
  min-width: 44px;
  height: 54px;
  padding: 0 0.7rem;
  background: linear-gradient(145deg, var(--card-bg), rgba(255, 255, 255, 0.02));
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  flex: 1;
  max-width: 60px;
}

.key::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.key-label {
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}

.key:hover:not(:disabled) {
  border-color: var(--accent-color);
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 6px 18px var(--primary-glow),
    0 2px 8px rgba(0, 0, 0, 0.15);
}

.key:hover:not(:disabled)::before {
  opacity: 0.2;
}

.key:hover:not(:disabled) .key-label {
  color: var(--accent-color);
  transform: scale(1.1);
}

.key:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.key-used {
  opacity: 0.6;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border-color: var(--accent-color);
  color: white;
}

.key-used .key-label {
  color: white;
}

.key-space {
  flex: 3;
  max-width: none;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  font-weight: 600;
  min-width: 0;
}

.key-backspace {
  flex: 1.2;
  max-width: 70px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border-color: rgba(239, 68, 68, 0.3);
  min-width: 0;
  padding: 0 0.5rem;
}

.key-backspace:hover:not(:disabled) {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
}

.key-backspace svg {
  stroke: #ef4444;
}

/* Letter Transitions */
.letter-enter-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.letter-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.letter-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-10deg);
}

.letter-leave-to {
  opacity: 0;
  transform: scale(0) rotate(10deg);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .letter-guess-container {
    padding: 1rem;
    overflow-y: scroll;;
  }

  .letter-guess-wrapper {
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .guess-display {
    padding: 1rem 1.25rem;
    min-height: 50px;
  }

  .letter-chip {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .submit-button {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 0.95rem;
    animation: buttonPulseMobile 2s ease-in-out infinite;
  }

  @keyframes buttonPulseMobile {
    0%, 100% {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4),
        0 4px 12px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: 0 8px 28px rgba(16, 185, 129, 0.6),
        0 4px 16px rgba(0, 0, 0, 0.3),
        0 0 35px rgba(16, 185, 129, 0.4);
    }
  }

  /* Mobile Keyboard Improvements */
  .keyboard {
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .keyboard-row {
    gap: 0.4rem;
  }

  .keyboard-row.bottom-row {
    gap: 0.4rem;
  }

  .key {
    min-width: 32px;
    height: 50px;
    padding: 0 0.5rem;
    font-size: 0.9rem;
    border-radius: 10px;
    background: linear-gradient(145deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.02));
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.08);
    font-weight: 700;
    letter-spacing: 0.03em;
    max-width: 45px;
  }

  .key:active:not(:disabled) {
    transform: scale(0.92);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3),
      inset 0 2px 6px rgba(0, 0, 0, 0.15);
    background: linear-gradient(145deg,
        rgba(123, 47, 247, 0.15),
        rgba(241, 7, 163, 0.15));
    border-color: rgba(123, 47, 247, 0.4);
  }

  .key-space {
    flex: 3;
    max-width: none;
    font-size: 0.8rem;
    height: 50px;
  }

  .key-backspace {
    flex: 1.2;
    max-width: 60px;
    background: linear-gradient(145deg,
        rgba(239, 68, 68, 0.15),
        rgba(220, 38, 38, 0.1));
    border-color: rgba(239, 68, 68, 0.35);
    padding: 0 0.4rem;
  }

  .key-backspace:active:not(:disabled) {
    background: linear-gradient(145deg,
        rgba(239, 68, 68, 0.25),
        rgba(220, 38, 38, 0.2));
    border-color: rgba(239, 68, 68, 0.5);
  }

  .key-backspace svg {
    width: 16px;
    height: 16px;
  }

  .placeholder {
    font-size: 0.9rem;
  }

  .keyboard-container {
    padding-bottom: env(safe-area-inset-bottom, 24px) !important;
    /* لأجهزة iPhone الحديثة */
    margin-bottom: 20px !important;
    /* يعطي فراغ مرئي لطيف */
  }

  /* للتأكد أن الكيبورد نفسه مش ملزق بالحافة */
  .letter-guess-container {
    padding-bottom: calc(2.5rem + env(safe-area-inset-bottom, 20px)) !important;
  }
}

@media (max-width: 480px) {
  .keyboard {
    gap: 0.4rem;
    padding: 0.6rem 0.3rem;
  }

  .keyboard-row {
    gap: 0.3rem;
  }

  .keyboard-row.bottom-row {
    gap: 0.3rem;
  }

  .key {
    min-width: 28px;
    height: 46px;
    font-size: 0.85rem;
    border-radius: 9px;
    padding: 0 0.4rem;
    max-width: 40px;
  }

  .key-space {
    flex: 3;
    max-width: none;
    font-size: 0.75rem;
  }

  .key-backspace {
    flex: 1.2;
    max-width: 55px;
    padding: 0 0.3rem;
  }

  .key-backspace svg {
    width: 15px;
    height: 15px;
  }


}

/* Touch-specific enhancements */
@media (hover: none) and (pointer: coarse) {
  .key {
    /* Larger tap targets for touch devices */
    min-height: 54px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .key:active:not(:disabled) {
    /* More pronounced visual feedback on touch */
    transform: scale(0.9);
    transition: transform 0.1s ease;
  }

  .key-label {
    pointer-events: none;
  }
}

/* Toggle wrapper attached visually to keyboard */


.keyboard-toggle {
  background: transparent;
  border: 2px solid rgba(160, 160, 160, 0.4);
  border-radius: 10px;
  width: 58px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.25s ease;
}

.keyboard-toggle:hover {
  border-color: rgba(120, 120, 120, 0.7);
  transform: translateY(-3px);
}

.keyboard-toggle:active {
  transform: translateY(0) scale(0.98);
  border-color: rgba(80, 80, 80, 0.6);
}

.arrow-icon {
  stroke: var(--text-primary);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    stroke 0.25s ease;
}

.keyboard-toggle:hover .arrow-icon {
  stroke: var(--accent-color);
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

.arrow-icon {
  color: white;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

/* Smooth keyboard slide animation */
.keyboard-slide-enter-active,
.keyboard-slide-leave-active {
  transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease;
}

.keyboard-slide-enter-from {
  opacity: 0;
  transform: translateY(80px);
}

.keyboard-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.keyboard-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.keyboard-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Optional: gentle bounce when showing keyboard */
.keyboard-container {
  animation: keyboardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes keyboardPop {
  0% {
    transform: translateY(80px);
    opacity: 0;
  }

  70% {
    transform: translateY(-8px);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.letter-guess-wrapper {
  position: relative;
  /* لازم تكون relative حتى يتحدد موضع dropdown */
}

/* SUGGESTIONS CONTAINER */
.suggestions-container {
  position: absolute;
  top: calc(100% + 6px);
  /* يخليها تنزل تحت display */
  left: 0;
  right: 0;
  background: rgba(25, 25, 25, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  max-height: 280px;
  overflow-y: auto;
  z-index: 99999;
  animation: dropdownPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}


/* ANIMATION FOR APPEAR */
@keyframes dropdownPop {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* LIST STYLE */
.suggestions-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
}

.suggestion-item {
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

/* TEXT STYLING */
.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.suggestion-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}

.suggestion-hint {
  font-size: 0.8rem;
  color: #ccc;
  opacity: 0.8;
}

/* shimmer loading */
.suggestions-loading {
  padding: 0.85rem 1.25rem;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
  letter-spacing: 0.3px;
  text-align: start;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 5;
}

.shimmer {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmerAnim 1.2s infinite linear;
  margin-bottom: 8px;
}

.shimmer.short {
  width: 80%;
}

.shimmer.shorter {
  width: 60%;
}

@keyframes shimmerAnim {
  from {
    background-position: -200% 0;
  }

  to {
    background-position: 200% 0;
  }
}

.suggestions-slide-fade-enter-active,
.suggestions-slide-fade-leave-active {
  transition: all 0.3s ease;
}

.suggestions-slide-fade-enter-from,
.suggestions-slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.key-space.expanded {
  flex: 4;
  max-width: none;
}
.submit-button {
  -webkit-tap-highlight-color: transparent; /* لإزالة اللمعة الرمادية على الموبايل */
  outline: none !important;
}

/* .submit-button:focus,
.submit-button:active,
.submit-button:focus-visible {
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color)) !important;
  color: white !important;
  box-shadow: 0 8px 20px var(--primary-glow),
              0 4px 12px rgba(0, 0, 0, 0.2) !important;
  transform: none !important;
  outline: none !important;
} */

/* 🔹 يعطل أي تفاعل بصري */
/* .submit-button:hover {
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color)) !important;
  transform: none !important;
  box-shadow: 0 8px 20px var(--primary-glow),
              0 4px 12px rgba(0, 0, 0, 0.2) !important;
} */
</style>
