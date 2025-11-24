<template>
  <div class="game-screen">
    <!-- Header -->
    <div class="game-header">
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">{{$t('categories')}}</span>
          <span class="stat-value">{{ categoriesRemaining }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('time') }}</span>
          <span class="stat-value timer" :class="{ warning: state.timeRemaining < 30 }">
            {{ formatTime(state.timeRemaining) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('theme') }}</span>
          <span class="stat-value">{{ state.selectedTheme?.name?.ar }}</span>
        </div>
      </div>
      <button @click="handleGiveUp" class="give-up-button">{{$t('giveUp')}}</button>
    </div>

    <div class="game-content">
      <!-- Chat History Sidebar -->
      <aside
        v-if="state.conversation.length > 0 && !isLoadingQuestions"
        class="chat-sidebar"
        :class="{ 'sidebar-open': isSidebarOpen }"
      >
        <button class="sidebar-toggle" @click="isSidebarOpen = !isSidebarOpen">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
        <div class="sidebar-content">
          <h3 class="sidebar-title">{{ $t('previousConversation') }}</h3>
          <div class="sidebar-history" ref="conversationRef">
            <div
              v-for="(conv, index) in state.conversation"
              :key="index"
              class="sidebar-item"
            >
              <div class="sidebar-question">
                <span class="sidebar-icon">❓</span>
              <span class="sidebar-text">{{ conv.option.text?.ar }}</span>
              </div>
              <div class="sidebar-answer" :class="{ yes: conv.answer, no: !conv.answer }">
                <span class="sidebar-icon">{{ conv.answer ? '✓' : '✗' }}</span>
                <span class="sidebar-text">{{ conv.answer ? $t('yes') : $t('no') }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-game-area" :class="{ 'has-sidebar': state.conversation.length > 0 && !isLoadingQuestions }">

<div v-if="!showCategories && !isLoadingQuestions" class="question-area">
  <div class="question-title-wrapper">
    <div class="question-icon-ring">
      <div class="question-icon">❓</div>
    </div>
    <h2 class="questions-title">{{ state.questions[0].text?.ar }}</h2>
  </div>

 <transition-group name="stagger-slide" tag="div" class="options-grid-modern">
  <div
    v-for="(opt, index) in state.questions[0].options"
    :key="opt.id"
    class="option-card"
    :style="{ '--index': index }"
    @click="handleOption(opt)"
    :class="{ disabled: !canAskQuestion || isAsking }"
  >
    <div class="option-card-inner">

      <span class="option-number">{{ index + 1 }}</span>

      <p class="option-text">{{ opt.text?.ar }}</p>

      <img
        v-if="opt.image"
        class="option-image"
        :src="getImageUrl(opt.image)"
        alt="option image"
      />

      <div class="option-shine"></div>
    </div>
  </div>
</transition-group>

</div>
      </div>
      <!-- 🔹 عرض الكاتيجوري أولاً -->
      <div v-if="showCategories" class="categories-grid" :class="{ 'has-sidebar': state.conversation.length > 0 && !isLoadingQuestions }">
        <h3 class="section-title">في أي تصنيف تريد أن تسأل؟ 🎮</h3>

       

        <transition-group  name="fade" tag="div" class="categories-wrapper">
          <div v-for="(category, index) in state.categories"  class="category-card"
            :class="{ used: category.used }" @click="!category.used && selectCategory(category)">
            <div class="category-icon">🎯</div>
            <h4 class="category-name">{{ category.name?.ar || category.name }}</h4>
            <p class="category-desc">{{ category.description?.ar || category.description }}</p>
            <span v-if="category.used" class="used-overlay">تم الاختيار</span>
          </div>
        </transition-group>
      </div>

      <!-- 🔹 AI Thinking Loader Overlay -->
      <transition name="fade-overlay">
        <div v-if="isLoadingQuestions" class="question-loader-overlay">
          <div class="loader-backdrop"></div>
          <div class="loader-card">
            <div class="orb-wrapper-large">
              <div class="orb-large"></div>
              <div class="orb-ring-large"></div>
              <div class="orb-pulse-large"></div>
              <div class="particle" v-for="i in 8" :key="i" :style="{ '--i': i }"></div>
            </div>
            <h3 class="loader-title">{{ $t('thinkingQuestion') }}</h3>
            <p class="loader-subtitle">جاري تحضير السؤال لك...</p>
            <div class="loader-progress">
              <div class="loader-progress-bar"></div>
            </div>
          </div>
        </div>
      </transition>





    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${(state.questionsAsked / state.maxQuestions) * 100}%` }"></div>
    </div>

    <!-- 🔹 Letter Guess Component at Bottom -->
    <transition name="guess-slide-up">
  <LetterGuess
    v-if="showGuessInput"
    ref="letterGuessRef"
    placeholder="اختر الحروف لبناء تخمينك..."
    :disabled="isAsking"
    :is-submitting="isAsking"
    @submit="handleGuess"
  />
</transition>

    <!-- 🔹 Verifying Guess Loader Overlay -->
    <transition name="fade-scale">
      <div v-if="isVerifyingGuess" class="verification-overlay">
        <div class="verification-loader">
          <div class="orb-wrapper-verification">
            <div class="orb-verification"></div>
            <div class="orb-ring-verification"></div>
            <div class="orb-pulse-verification"></div>
            <div class="particle-verification" v-for="i in 10" :key="i" :style="{ '--i': i }"></div>
          </div>
          <h2 class="verification-title">{{ $t('verifyingGuessTitle') }}</h2>
          <p class="verification-subtitle">{{ $t('verifyingGuessSubtitle') }}</p>
          <div class="verification-progress">
            <div class="verification-progress-bar"></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 🔹 Answer Feedback Overlay -->
    <transition name="overlay-slide">
      <div v-if="showAnswerOverlay && currentAnswer" class="answer-overlay" :class="{ correct: currentAnswer.isCorrect, incorrect: !currentAnswer.isCorrect }">
        <div class="answer-content">
          <div class="answer-icon-wrapper">
            <div class="answer-icon">{{ currentAnswer.isCorrect ? '✓' : '✗' }}</div>
            <div class="answer-ripple"></div>
          </div>
          <h2 class="answer-title">{{ currentAnswer.isCorrect ? $t('correctAnswer') : $t('incorrectAnswer') }}</h2>
          <p class="answer-text">{{ currentAnswer.isCorrect ? $t('answerYes') : $t('answerNo') }}</p>
        </div>
      </div>
    </transition>



<transition name="fade-scale">
  <ResultScreen
    v-if="verificationResult"
    :state="{
      status: verificationResult.match ? 'won' : 'lost',
      entity: state.entity,
      questionsAsked: state.questionsAsked,
      score: state.score,
    }"
    :timeElapsed="timeElapsed"
    @playAgain="handlePlayAgain"
    @viewLeaderboard="handleViewLeaderboard"
    @backToMenu="handleBackToMenu"
  />
</transition>
    <transition name="fab-fade">
  <button
    v-if="!isVerifyingGuess && !verificationResult"
    class="floating-guess-button"
    :class="{ 'moved-up': showGuessInput }"
    @click="toggleGuessInput"
  >
    <span v-if="!showGuessInput">✍️ {{ $t('startGuess') }}</span>
    <span v-else>💭 {{ $t('thinkAgain') }}</span>
  </button>
</transition>
    
      <transition name="fade-overlay">
        <div v-if="isStartingGame" class="full-page-loader">
          <div class="loader-backdrop-animated"></div>
          <div class="loader-content">
            <div class="orb-wrapper-xl">
              <div class="orb-xl"></div>
              <div class="orb-ring-xl"></div>
              <div class="orb-pulse-xl"></div>
              <div class="particle-xl" v-for="i in 12" :key="i" :style="{ '--i': i }"></div>
            </div>
            <h2 class="loader-title-xl">{{ $t('loadingStartGame') }}</h2>
            <div class="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </transition>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, nextTick, watch, onMounted,computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/game';
import { useThemeStore } from '../stores/theme';
import { onUpdated } from 'vue';
import type { Theme } from '../models/Theme';
import type { Level } from '../models/Level';
import type { Category } from '../models/Category';
import ResultScreen from './ResultScreen.vue';
import LetterGuess from './LetterGuess.vue';
const showGuessInput = ref(false);
const isStartingGame = ref(true);
const router = useRouter();
const emit = defineEmits<{ endGame: [] }>();
const gameStore = useGameStore();
const themeStore = useThemeStore();
const { playSound } = themeStore;
const { state, categoriesRemaining, canAskQuestion ,timeElapsed } = storeToRefs(gameStore);
const showConversationAccordion = computed(() => showCategories.value);
const showCategories = ref(true);
const isConversationAccordion = computed(() => showCategories.value);
const isConversationOpen = ref(false);
const isSidebarOpen = ref(true);
const showAnswerOverlay = ref(false);
const currentAnswer = ref<{ isCorrect: boolean; text: string } | null>(null);
const isAsking = ref(false);
const conversationRef = ref<HTMLElement | null>(null);
const isLoadingQuestions = ref(false);
const letterGuessRef = ref<InstanceType<typeof LetterGuess> | null>(null);
const isVerifyingGuess = ref(false);
const verificationResult = ref<{ match: boolean; message: string } | null>(null);
const isLoadingCategories = ref(true);
onUpdated(() => {
  if (conversationRef.value) {
    const el = conversationRef.value;
    // Scroll directly to bottom every time component updates
    el.scrollTop = el.scrollHeight;
  }
});
const storageUrl = import.meta.env.VITE_STORAGE_URL;

const getImageUrl = (image: string | null) => {
  if (!image) return null;
  return `${storageUrl}/${image}`;
};
watch(showCategories, (val) => {

  isConversationOpen.value = !val;
});
function toggleGuessInput() {
  showGuessInput.value = !showGuessInput.value;
  playSound('click');
}
async function initializeGame() {
  const { user, selectedTheme, selectedLevel } = gameStore.state;
  if (!user || !selectedTheme || !selectedLevel) return;


 


  const started = await gameStore.startGame(
    
    selectedTheme as Theme,
    selectedLevel as Level
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  isStartingGame.value = false;
}
onMounted(() => {
  initializeGame();
});

async function selectCategory(category: Category) {
  playSound('click');
  showCategories.value = false;
  isLoadingQuestions.value = true;

  const questions = await gameStore.fetchQuestionsByCategory(category.id);

  isLoadingQuestions.value = false;

  if (questions.length) {
    gameStore.state.status = 'playing';
    gameStore.state.selectedCategory = category;
    gameStore.startTimer();
  }
}

watch(
  () => state.value.conversation.length,
  async () => {
    await nextTick();

    if (conversationRef.value) {
      // Scroll smoothly to the bottom when a new message appears
      conversationRef.value.scrollTo({
        top: conversationRef.value.scrollHeight,
        behavior: 'smooth'
      });

      setTimeout(() => {
        if (conversationRef.value) {
          conversationRef.value.scrollTop = conversationRef.value.scrollHeight;
        }
      }, 400);
    }
  }
);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function handleOption(option: any) {
  if (!canAskQuestion.value || isAsking.value) return;

  isAsking.value = true;
  playSound('click');

  const answer = await gameStore.askQuestion(option); // ← الآن نرسل option

  if (answer !== null) {
    currentAnswer.value = {
      isCorrect: answer,
      text: answer ? 'yes' : 'no'
    };

    showAnswerOverlay.value = true;
    playSound(answer ? 'correct' : 'wrong');

    await new Promise(resolve => setTimeout(resolve, 2500));
    showAnswerOverlay.value = false;

    await new Promise(resolve => setTimeout(resolve, 300));

    isLoadingQuestions.value = true;
    await new Promise(resolve => setTimeout(resolve, 1000));

    showCategories.value = true;
    isLoadingQuestions.value = false;
  }

  isAsking.value = false;
}



async function handleGuess(guessValue: string) {
  if (!guessValue.trim() || isAsking.value) return;
showGuessInput.value = false;
  isAsking.value = true;
  isVerifyingGuess.value = true;
  playSound('click');

  const result = await gameStore.verifyGuess(guessValue);

  isVerifyingGuess.value = false;

  if (result) {
    verificationResult.value = result;
    const { match } = result;
    playSound(match ? 'win' : 'lose');
  } else {
    playSound('lose');
    verificationResult.value = { match: false, message: 'Verification failed' };
  }

  isAsking.value = false;
}
function handleViewLeaderboard(){
  
}
function handleBackToMenu(){

}
function handlePlayAgain() {
  verificationResult.value = null;
  letterGuessRef.value?.clear();

  gameStore.resetGame?.();

  router.push({ name: 'home' });
}


function handleGiveUp() {
  if (confirm('هل أنت متأكد من الاستسلام؟')) {
    playSound('lose');
    state.value.status = 'lost';
    emit('endGame');
  }
}
</script>

<style scoped>


.full-page-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader-backdrop-animated {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  animation: backdropPulse 3s ease-in-out infinite;
}

@keyframes backdropPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}

.loader-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  animation: loaderContentAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes loaderContentAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.orb-wrapper-xl {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-xl {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow:
    0 0 60px var(--primary-glow),
    0 0 120px var(--primary-glow),
    inset 0 0 40px rgba(255, 255, 255, 0.3);
  animation: orbFloatXL 3s ease-in-out infinite;
}

@keyframes orbFloatXL {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow:
      0 0 60px var(--primary-glow),
      0 0 120px var(--primary-glow),
      inset 0 0 40px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    box-shadow:
      0 0 80px var(--primary-glow),
      0 0 140px var(--primary-glow),
      inset 0 0 50px rgba(255, 255, 255, 0.4);
  }
}

.orb-ring-xl {
  position: absolute;
  width: 140px;
  height: 140px;
  border: 5px solid var(--accent-color);
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 2;
  animation: orbRingRotate 2s linear infinite;
}

.orb-pulse-xl {
  position: absolute;
  width: 170px;
  height: 170px;
  border: 4px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
  animation: orbPulse 2s ease-out infinite;
  opacity: 0;
}

.particle-xl {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent-color);
  animation: particleOrbitXL 4s linear infinite;
  animation-delay: calc(var(--i) * -0.333s);
  transform-origin: 100px;
}

@keyframes particleOrbitXL {
  from {
    transform: rotate(0deg) translateX(100px) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(360deg) translateX(100px) rotate(-360deg);
    opacity: 0.3;
  }
}

.loader-title-xl {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  text-align: center;
  max-width: 700px;
  line-height: 1.4;
  animation: titlePulseXL 2s ease-in-out infinite;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

@keyframes titlePulseXL {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.loader-dots {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
}

.loader-dots span {
  width: 12px;
  height: 12px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite;
}

.loader-dots span:nth-child(1) {
  animation-delay: 0s;
}

.loader-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loader-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-15px);
    opacity: 1;
  }
}
/* 🔹 عام */
.game-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-bottom: 8rem;
  overflow-x: hidden;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
}
/* Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-weight: 700;
  color: var(--text-primary);
}

.timer.warning {
  color: #ff4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.give-up-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 2px solid #ff4444;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.give-up-button:hover {
  background: #ff4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
}

/* Game Content */
.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.game-main-content {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


/* Questions Container */
.questions-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.questions-section {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.questions-title {
  font-weight: 700;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.question-button {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.5;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp calc(0.1s * var(--index)) ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-button:hover:not(:disabled) {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px var(--primary-glow);
}

.question-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Letter Guess Component Styles - Handled by Component */

/* Category grid */
.categories-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  transition: margin-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.categories-grid.has-sidebar {
  margin-left: 370px;
  padding-left: 2rem;
  padding-right: 2rem;
}

.section-title {
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
}

.categories-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
  margin-top: 1rem;
}

.category-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 18px;
  padding: 0.5rem 0.3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.category-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px var(--primary-glow);
  transform: translateY(-5px);
}

.category-icon {
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.category-desc {
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 0.3rem;
}

/* Progress Bar */
.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  border-radius: 10px;
  transition: width 0.5s ease;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.question-list-move,
.question-list-enter-active {
  transition: all 0.4s ease;
}

.question-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.question-list-leave-active {
  position: absolute;
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .question-area {
    padding: 1rem;
  }

  .questions-title {
    font-size: 1.8rem;
  }

  .question-icon-ring {
    width: 80px;
    height: 80px;
  }

  .question-icon {
    font-size: 2.5rem;
  }

  .options-grid-modern {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .option-card-inner {
    padding: 1.5rem;
    min-height: 120px;
  }

  .option-text {
    font-size: 1.1rem;
  }

  .orb-wrapper-xl {
    width: 150px;
    height: 150px;
  }

  .orb-xl {
    width: 75px;
    height: 75px;
  }

  .orb-ring-xl {
    width: 110px;
    height: 110px;
  }

  .orb-pulse-xl {
    width: 130px;
    height: 130px;
  }

  .loader-title-xl {
    font-size: 1.8rem;
  }

  .orb-wrapper-large {
    width: 120px;
    height: 120px;
  }

  .orb-large {
    width: 60px;
    height: 60px;
  }

  .loader-card {
    padding: 2rem 1.5rem;
  }

  .loader-title {
    font-size: 1.5rem;
  }


  .game-screen {
    padding: 1rem;
    padding-bottom: 8rem;
  }

  .header-stats {
    gap: 1rem;
  }



  .game-main-content,
  .conversation-container,
  .questions-container {
    max-width: 100%;
  }

  .conversation-history {
    max-height: 300px;
  }

  .question-bubble,
  .answer-bubble {
    max-width: 85%;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }

  .categories-wrapper {
    grid-template-columns: 1fr;
  }

  .categories-grid.has-sidebar {
    margin-left: 0;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* 🎯 Modern Selected Category Effect */
/* 🎯 تصميم البطاقة المختارة */
.category-card.used {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  animation: selectedPulse 3s infinite ease-in-out;
}

/* ✨ طمس محتوى البطاقة الأصلية */

.used-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column; /* 🔹 عشان الأيقونة تصير تحت الكلمة */
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  background: rgba(34, 197, 94, 0.1);
  backdrop-filter: blur(6px) saturate(150%);
  -webkit-backdrop-filter: blur(6px) saturate(150%);

  color: #22c55e; 
  font-weight: 900;
  letter-spacing: 0.5px;
  text-shadow: 0 0 12px rgba(22, 163, 74, 0.6);

  border-radius: 16px;
  animation: fadeInOverlay 0.5s ease forwards;
  transition: all 0.3s ease;
}
.used-overlay::after {
  content: "✅";
  color: #16a34a;
  margin-top: 0.4rem;
  filter: drop-shadow(0 0 6px rgba(22, 163, 74, 0.4));
}


.category-card.used > *:not(.used-overlay) {
  filter: blur(3px);
  opacity: 0.45;
  transition: all 0.3s ease;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes selectedPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
  }
}


@keyframes selectedPulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.3),
      inset 0 0 10px rgba(34, 197, 94, 0.1);
  }
  50% {
    box-shadow:
      0 0 40px rgba(34, 197, 94, 0.6),
      inset 0 0 20px rgba(34, 197, 94, 0.15);
  }
}

/* ✅ Animated check badge */
/* .category-card.used::before {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  font-size: 3rem;
  color: #22c55e;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  opacity: 0;
  animation: checkPop 0.8s ease forwards;
} */

@keyframes checkPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}



@keyframes overlayFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}


@keyframes slideUpOverlay {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}




/* Question Loader Overlay */
.question-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader-backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

.loader-card {
  position: relative;
  z-index: 2;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 30px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 100px rgba(139, 92, 246, 0.2);
  animation: cardSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.orb-wrapper-large {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow:
    0 0 40px var(--primary-glow),
    0 0 80px var(--primary-glow),
    inset 0 0 30px rgba(255, 255, 255, 0.3);
  animation: orbFloatLarge 3s ease-in-out infinite;
}

@keyframes orbFloatLarge {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
  }
}

.orb-ring-large {
  position: absolute;
  width: 110px;
  height: 110px;
  border: 4px solid var(--accent-color);
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 2;
  animation: orbRingRotate 2s linear infinite;
}

.orb-pulse-large {
  position: absolute;
  width: 130px;
  height: 130px;
  border: 3px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
  animation: orbPulse 2s ease-out infinite;
  opacity: 0;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: particleOrbit 3s linear infinite;
  animation-delay: calc(var(--i) * -0.375s);
  transform-origin: 75px;
}

@keyframes particleOrbit {
  from {
    transform: rotate(0deg) translateX(75px) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(360deg) translateX(75px) rotate(-360deg);
    opacity: 0.2;
  }
}

.loader-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
}

.loader-subtitle {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
}

.loader-progress {
  width: 100%;
  height: 6px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.loader-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  border-radius: 10px;
  animation: progressIndeterminate 1.5s ease-in-out infinite;
}

@keyframes progressIndeterminate {
  0% {
    width: 0%;
    margin-left: 0;
  }
  50% {
    width: 40%;
    margin-left: 30%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}



@keyframes orbRingRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


@keyframes orbPulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Fade Overlay Transition */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

@keyframes textFade {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}


/* Verification Overlay */
.verification-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.92), rgba(20, 0, 40, 0.95));
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.verification-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  animation: fadeInUp 0.6s ease;
  background: rgba(255, 255, 255, 0.03);
  padding: 4rem 3rem;
  border-radius: 30px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
              0 0 100px rgba(139, 92, 246, 0.15);
}

.orb-wrapper-verification {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-verification {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow:
    0 0 60px var(--primary-glow),
    0 0 120px var(--primary-glow),
    inset 0 0 40px rgba(255, 255, 255, 0.3);
  animation: orbFloatVerification 2.5s ease-in-out infinite;
}

@keyframes orbFloatVerification {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow:
      0 0 60px var(--primary-glow),
      0 0 120px var(--primary-glow),
      inset 0 0 40px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: translateY(-25px) scale(1.15);
    box-shadow:
      0 0 90px var(--primary-glow),
      0 0 160px var(--primary-glow),
      inset 0 0 50px rgba(255, 255, 255, 0.4);
  }
}

.orb-ring-verification {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 5px solid var(--accent-color);
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 2;
  animation: orbRingRotate 2s linear infinite;
}

.orb-pulse-verification {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 4px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
  animation: orbPulse 2s ease-out infinite;
  opacity: 0;
}

.particle-verification {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  box-shadow: 0 0 15px var(--accent-color);
  animation: particleOrbitVerification 4s linear infinite;
  animation-delay: calc(var(--i) * -0.4s);
  transform-origin: 90px;
}

@keyframes particleOrbitVerification {
  from {
    transform: rotate(0deg) translateX(90px) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(360deg) translateX(90px) rotate(-360deg);
    opacity: 0.2;
  }
}

.verification-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-align: center;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: titlePulseVerification 2s ease-in-out infinite;
}

@keyframes titlePulseVerification {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.03);
  }
}

.verification-subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.verification-progress {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.verification-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color), #00c9ff, #92fe9d);
  background-size: 300% 100%;
  border-radius: 10px;
  animation: progressFlowVerification 2s ease-in-out infinite;
  box-shadow: 0 0 20px var(--primary-glow);
}

@keyframes progressFlowVerification {
  0% {
    width: 0%;
    background-position: 0% 50%;
  }
  50% {
    width: 70%;
    background-position: 100% 50%;
  }
  100% {
    width: 100%;
    background-position: 200% 50%;
  }
}

/* Result Overlays */
.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.result-overlay.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
}

.result-overlay.fail {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Success Icon */
.success-icon-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #10b981;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.5),
              0 0 80px rgba(255, 255, 255, 0.3);
  animation: successPulse 1.5s ease infinite;
  position: relative;
  z-index: 2;
}

@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.5),
                0 0 80px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 60px rgba(255, 255, 255, 0.7),
                0 0 100px rgba(255, 255, 255, 0.5);
  }
}

.success-particles {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: particleExpand 2s ease-out infinite;
  z-index: 1;
}

@keyframes particleExpand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Fail Icon */
.fail-icon-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fail-icon {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #ef4444;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.5),
              0 0 80px rgba(255, 255, 255, 0.3);
  animation: failShake 0.8s ease;
  position: relative;
  z-index: 2;
}

@keyframes failShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.fail-particles {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: particlePulse 1.5s ease infinite;
  z-index: 1;
}

@keyframes particlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
}

/* Result Text */
.result-title {
  font-weight: 900;
  color: white;
  text-align: center;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s 0.2s ease backwards;
}

.result-subtitle {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.8s 0.4s ease backwards;
}

/* Result Buttons */
.result-button {
  padding: 1.25rem 3rem;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.8s 0.6s ease backwards;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.success-button {
  background: white;
  color: #10b981;
}

.success-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.fail-button {
  background: white;
  color: #ef4444;
}

.fail-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Fade Scale Transition */
.fade-scale-enter-active {
  transition: all 0.5s ease;
}

.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Responsive for overlays */
@media (max-width: 768px) {
  

  .success-icon-wrapper,
  .fail-icon-wrapper {
    width: 120px;
    height: 120px;
  }

  .success-icon,
  .fail-icon {
    width: 100px;
    height: 100px;
  }

  .result-button {
    padding: 1rem 2rem;
  }
}

/* Shimmer Loading for Categories */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer-category-card {
  pointer-events: none !important;
  cursor: default !important;
  animation: shimmer-fade-in 0.4s ease;
}

@keyframes shimmer-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.shimmer-category-icon,
.shimmer-category-name,
.shimmer-category-desc {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 8px;
}

.shimmer-category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 0.5rem;
}

.shimmer-category-name {
  width: 70%;
  height: 20px;
  margin: 0 auto 0.5rem;
}

.shimmer-category-desc {
  width: 90%;
  height: 16px;
  margin: 0 auto;
}
.floating-guess-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10000;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, #7b2ff7, #f107a3, #00c9ff, #92fe9d);
  background-size: 400% 400%;
  animation: gradientShift 6s ease infinite, glowPulse 2.5s ease-in-out infinite;
  box-shadow:
    0 0 20px rgba(241, 7, 163, 0.6),
    0 0 40px rgba(0, 201, 255, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ✨ تدرج لوني متغير */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 💫 نبض الضوء */
@keyframes glowPulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(241, 7, 163, 0.6),
      0 0 40px rgba(0, 201, 255, 0.4),
      0 0 60px rgba(146, 254, 157, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 35px rgba(241, 7, 163, 0.9),
      0 0 70px rgba(0, 201, 255, 0.8),
      0 0 90px rgba(146, 254, 157, 0.6);
    transform: scale(1.05);
  }
}

/* ✍️ التأثير عند التحويم */
.floating-guess-button:hover {
  transform: translateY(-6px) scale(1.08);
  box-shadow:
    0 0 40px rgba(241, 7, 163, 0.9),
    0 0 80px rgba(0, 201, 255, 0.7),
    0 0 120px rgba(146, 254, 157, 0.5);
  filter: brightness(1.2);
}

/* 💨 انيميشن الظهور */
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}


/* Animation لمكون التخمين */
.guess-slide-up-enter-active,
.guess-slide-up-leave-active {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s ease;
}
.guess-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.guess-slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.guess-slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.guess-slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.floating-guess-button.moved-up {
  bottom: 28rem; 
}

@media (max-height: 700px) {
  .floating-guess-button.moved-up {
    bottom: 35rem;
  }
}

@media (max-width: 768px) {
  .floating-guess-button.moved-up {
    bottom: 35rem;
    right: 1rem;
  }
}

/* Accordion effect for conversation */
.accordion {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* عندما تُفتح القائمة */
.accordion-fade-enter-active,
.accordion-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.accordion-fade-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px) scale(0.96);
}
.accordion-fade-enter-to {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0) scale(1);
}
.accordion-fade-leave-from {
  max-height: 500px;
  opacity: 1;
}
.accordion-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.category-name{
  font-size: 1rem;
}
.category-desc{
  font-size: 0.9rem;
}


@media (max-width: 768px) {
.category-name{
  font-size: 1.3rem;
}
.category-desc{
  font-size: 1.2rem;
}
.section-title{
  font-size: 1.5rem;
}
}

/* Chat Sidebar Styles */
.chat-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 350px;
  background: var(--card-bg);
  border-right: 2px solid var(--border-color);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 100;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-toggle {
  position: absolute;
  right: -48px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-left: none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.3s ease;
  z-index: 101;
}

.sidebar-toggle:hover {
  background: var(--accent-color);
  color: white;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.5rem;
  overflow: hidden;
}

.sidebar-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  text-align: center;
}

.sidebar-history {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
}

.sidebar-history::-webkit-scrollbar {
  width: 6px;
}

.sidebar-history::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.sidebar-history::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.sidebar-history::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideInLeft 0.4s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-question {
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px 12px 12px 2px;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-answer {
  padding: 0.75rem 1rem;
  border-radius: 12px 12px 2px 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-self: flex-end;
}

.sidebar-answer.yes {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.sidebar-answer.no {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.sidebar-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-text {
  flex: 1;
  word-wrap: break-word;
}

.main-game-area {
  width: 100%;
  transition: margin-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.main-game-area.has-sidebar {
  margin-left: 370px;
}

/* Answer Overlay Styles */
.answer-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.answer-overlay.correct {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.98));
  animation: correctPulse 0.6s ease-out;
}

.answer-overlay.incorrect {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.98));
  animation: incorrectShake 0.5s ease-out;
}

@keyframes correctPulse {
  0% {
    background-color: rgba(16, 185, 129, 0);
  }
  50% {
    background-color: rgba(16, 185, 129, 1);
  }
  100% {
    background-color: rgba(16, 185, 129, 0.95);
  }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

.answer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: answerBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes answerBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-100px);
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.answer-icon-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-icon {
  width: 140px;
  height: 140px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  font-weight: 900;
  box-shadow: 0 0 60px rgba(255, 255, 255, 0.6),
              0 0 100px rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 2;
  animation: iconPulse 1.5s ease-in-out infinite;
}

.answer-overlay.correct .answer-icon {
  color: #10b981;
}

.answer-overlay.incorrect .answer-icon {
  color: #ef4444;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 60px rgba(255, 255, 255, 0.6),
                0 0 100px rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 80px rgba(255, 255, 255, 0.8),
                0 0 120px rgba(255, 255, 255, 0.6);
  }
}

.answer-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  animation: rippleExpand 1.5s ease-out infinite;
  z-index: 1;
}

@keyframes rippleExpand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.answer-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  text-align: center;
  margin: 0;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  animation: titleFadeIn 0.8s 0.3s ease backwards;
}

.answer-text {
  font-size: 2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
  animation: textFadeIn 0.8s 0.5s ease backwards;
}

@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Overlay Slide Transition */
.overlay-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.overlay-slide-leave-active {
  transition: all 0.4s ease;
}

.overlay-slide-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.overlay-slide-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 968px) {
  .chat-sidebar {
    width: 300px;
  }

  .main-game-area.has-sidebar {
    margin-left: 0;
  }

  .main-game-area.has-sidebar .question-area {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .sidebar-open ~ .main-game-area {
    filter: brightness(0.7);
    pointer-events: none;
  }
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 280px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .sidebar-question,
  .sidebar-answer {
    font-size: 0.85rem;
  }

  .answer-icon-wrapper {
    width: 140px;
    height: 140px;
  }

  .answer-icon {
    width: 100px;
    height: 100px;
    font-size: 3.5rem;
  }

  .answer-title {
    font-size: 2.5rem;
  }

  .answer-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .chat-sidebar {
    width: 260px;
  }

  .answer-title {
    font-size: 2rem;
  }

  .answer-text {
    font-size: 1.2rem;
  }
}

/* Modern Question Area */
.question-area {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: padding-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.main-game-area.has-sidebar .question-area {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.question-title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-icon-ring {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rotateRing 20s linear infinite;
}

@keyframes rotateRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.question-icon-ring::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(45deg, var(--accent-color), var(--primary-color), #00c9ff, #92fe9d);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: gradientRotate 3s linear infinite;
}

@keyframes gradientRotate {
  to { transform: rotate(360deg); }
}

.question-icon {
  font-size: 3rem;
  z-index: 2;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.questions-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.4;
  max-width: 900px;
  position: relative;
  padding: 0 1rem;
}


.questions-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  border-radius: 2px;
  animation: widthPulse 2s ease-in-out infinite;
}

@keyframes widthPulse {
  0%, 100% { width: 100px; opacity: 0.6; }
  50% { width: 150px; opacity: 1; }
}

/* Modern Options Grid */
.options-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  perspective: 1000px;
  max-width: 1600px;
  margin: 0 auto;
}

@media (min-width: 1400px) {
  .options-grid-modern {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1399px) {
  .options-grid-modern {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .options-grid-modern {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .options-grid-modern {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 479px) {
  .options-grid-modern {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.option-card {
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: staggerSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--index) * 0.1s);
}

@keyframes staggerSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px) rotateX(-20deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.option-card:hover:not(.disabled) {
  transform: translateY(-12px) scale(1.03);
  z-index: 10;
}

.option-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.option-card-inner {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 1.75rem 1.5rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@media (min-width: 1400px) {
  .option-card-inner {
    padding: 1.5rem 1.25rem;
    min-height: 160px;
  }
}

.option-card:hover:not(.disabled) .option-card-inner {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(139, 92, 246, 0.05) 100%);
  box-shadow:
    0 12px 40px rgba(139, 92, 246, 0.2),
    0 0 0 1px var(--accent-color),
    inset 0 0 30px rgba(139, 92, 246, 0.1);
}

.option-number {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.option-card:hover:not(.disabled) .option-number {
  border-color: var(--accent-color);
  transform: rotate(360deg) scale(1.1);
}

.option-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.5;
  margin: 0;
  z-index: 2;
  transition: all 0.3s ease;
}

@media (min-width: 1400px) {
  .option-text {
    font-size: 1.1rem;
  }
}

.option-card:hover:not(.disabled) .option-text {
  color: var(--accent-color);
  transform: scale(1.05);
}

.option-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.option-card:hover:not(.disabled) .option-shine {
  transform: translateX(100%);
}

/* Stagger Slide Transition */
.stagger-slide-enter-active,
.stagger-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stagger-slide-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}

.stagger-slide-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.9);
}
.option-image {
  width: 140px;
  height: 140px;
  object-fit: cover;
  margin-top: 0.75rem;
  border-radius: 14px;
  padding: 8px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 3px solid rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  position: relative;
}

@media (min-width: 1400px) {
  .option-image {
    width: 120px;
    height: 120px;
  }
}

.option-image::before {
  content: '';
  position: absolute;
  inset: -3px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.option-card:hover:not(.disabled) .option-image {
  transform: scale(1.1) translateY(-8px) rotate(2deg);
  border-color: var(--accent-color);
  background: linear-gradient(135deg, #ffffff, #faf5ff);
  box-shadow:
    0 16px 48px rgba(139, 92, 246, 0.3),
    0 8px 24px rgba(139, 92, 246, 0.2),
    0 0 0 4px rgba(139, 92, 246, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.9);
}

.option-card:hover:not(.disabled) .option-image::before {
  opacity: 0.15;
}

@media (max-width: 768px) {
  .option-image {
    width: 140px;
    height: 140px;
  }

  .verification-loader {
    padding: 3rem 2rem;
  }

  .verification-title {
    font-size: 2rem;
  }

  .verification-subtitle {
    font-size: 1.1rem;
  }

  .orb-wrapper-verification {
    width: 140px;
    height: 140px;
  }

  .orb-verification {
    width: 80px;
    height: 80px;
  }

  .orb-ring-verification {
    width: 120px;
    height: 120px;
  }

  .orb-pulse-verification {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 480px) {
  .option-image {
    width: 120px;
    height: 120px;
  }

  .verification-loader {
    padding: 2rem 1.5rem;
  }

  .verification-title {
    font-size: 1.8rem;
  }

  .verification-subtitle {
    font-size: 1rem;
  }
}


</style>
