<template>
  <div class="result-screen">
    <!-- Loading Overlay -->
  

    <canvas ref="confettiCanvas" class="confetti-canvas" v-if="state.status === 'won'"></canvas>

    <!-- Full Screen Container -->
    <div  class="result-wrapper" :class="{ win: state.status === 'won', lose: state.status === 'lost' }">

      <!-- Header Section -->
      <div class="result-header">
        <div class="result-icon-container">
          <div class="result-icon">
            {{ state.status === 'won' ? '🎉' : '😔' }}
          </div>
        </div>
        <h1 class="result-title">
          {{ $t(state.status === 'won' ? 'congratulations' : 'gameOver') }}
        </h1>
      </div>

      <!-- Main Content Area -->
      <div class="result-content">

        <!-- Left Column: Player Photo and Entity Info -->
        <div class="content-left">
          <div class="player-photo-section">
            <div class="photo-frame">
              <img
                src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Player Photo"
                class="player-photo"
              />
              <div class="photo-glow"></div>
            </div>
          </div>

          <div class="entity-card">
            <p class="entity-label">{{ $t('answerWas') }}</p>
            <h2 class="entity-name">{{ state.entity?.name }}</h2>
            <p class="entity-description">{{ state.entity?.description }}</p>
          </div>
        </div>

        <!-- Right Column: Stats and Details -->
        <div class="content-right">

          <!-- Game Stats -->
          <div class="stats-section">
            <h3 class="section-title">{{ $t('gameStats') || 'Game Statistics' }}</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">❓</div>
                <div class="stat-info">
                  <div class="stat-label">{{ $t('questionsAsked') }}</div>
                  <div class="stat-value">{{ state.questionsAsked }}</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-info">
                  <div class="stat-label">{{ $t('spentTime') }}</div>
                  <div class="stat-value">{{ formatTime(timeElapsed) }}</div>
                </div>
              </div>

              <div class="stat-card" v-if="categoriesRemaining">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-label">{{ $t('categoriesUsed') || 'Categories Used' }}</div>
                  <div class="stat-value">{{ state.questionsAsked }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Player Details -->
          <div class="details-section">
            <h3 class="section-title">{{ $t('playerInfoTitle') }}</h3>
            <div class="details-grid">
              <div class="detail-card">
                <span class="detail-icon">🌍</span>
                <div class="detail-info">
                  <span class="detail-label">{{ $t('nationality') }}</span>
                  <span class="detail-value">{{ state.entity?.attributes?.nationality || '-' }}</span>
                </div>
              </div>

              <div class="detail-card">
                <span class="detail-icon">🏆</span>
                <div class="detail-info">
                  <span class="detail-label">{{ $t('league') }}</span>
                  <span class="detail-value">{{ state.entity?.attributes?.league || '-' }}</span>
                </div>
              </div>

              <div class="detail-card">
                <span class="detail-icon">⚽</span>
                <div class="detail-info">
                  <span class="detail-label">{{ $t('club') }}</span>
                  <span class="detail-value">{{ state.entity?.attributes?.currentTeam || '-' }}</span>
                </div>
              </div>

              <div class="detail-card">
                <span class="detail-icon">👟</span>
                <div class="detail-info">
                  <span class="detail-label">{{ $t('preferredFoot') }}</span>
                  <span class="detail-value">{{ state.entity?.attributes?.footed || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button @click="handlePlayAgain" class="action-button primary">
          <span class="button-icon">🔄</span>
          <span class="button-text">{{ $t('playAgain') }}</span>
        </button>
        <button @click="handleViewLeaderboard" class="action-button secondary">
          <span class="button-icon">🏆</span>
          <span class="button-text">{{ $t('viewLeaderboard') }}</span>
        </button>
        <button @click="handleBackToMenu" class="action-button secondary">
          <span class="button-icon">🏠</span>
          <span class="button-text">{{ $t('mainMenu') }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../stores/game';
import { useThemeStore } from '../stores/theme';
import { createConfetti, updateParticle, renderConfetti, type ConfettiParticle } from '../utils/confetti';

const { t: $t } = useI18n();

const emit = defineEmits<{
  playAgain: [];
  viewLeaderboard: [];
  backToMenu: [];
}>();

const gameStore = useGameStore();
const themeStore = useThemeStore();

const { state, timeElapsed, categoriesRemaining } = storeToRefs(gameStore);
const { animationsEnabled } = storeToRefs(themeStore);
const { playSound } = themeStore;

const confettiCanvas = ref<HTMLCanvasElement | null>(null);

let confettiParticles: ConfettiParticle[] = [];
let animationFrameId: number | null = null;
let lastTime = 0;

const formatTime = computed(() => {
  return (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
});

function handlePlayAgain() {
  playSound('click');
  emit('playAgain');
}

function handleViewLeaderboard() {
  playSound('click');
  emit('viewLeaderboard');
}

function handleBackToMenu() {
  playSound('click');
  emit('backToMenu');
}

function animateConfetti(currentTime: number) {
  if (!confettiCanvas.value || !animationsEnabled.value) return;

  const deltaTime = lastTime ? (currentTime - lastTime) / 16 : 1;
  lastTime = currentTime;

  const ctx = confettiCanvas.value.getContext('2d');
  if (!ctx) return;

  confettiParticles = confettiParticles
    .map(p => updateParticle(p, deltaTime))
    .filter(p => p.y < window.innerHeight && p.opacity > 0);

  renderConfetti(ctx, confettiParticles);

  if (confettiParticles.length > 0) {
    animationFrameId = requestAnimationFrame(animateConfetti);
  }
}



onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.result-screen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, var(--primary-glow), transparent 70%),
              linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100000;
}

/* Main Wrapper - Full Screen Layout */
.result-wrapper {
  width: 100%;
  height: 100%;
  max-width: 1600px;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  gap: 1rem;
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.result-wrapper.win {
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1),
             winGlow 3s ease-in-out 1s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes winGlow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(34, 197, 94, 0.6));
  }
}

/* Header Section - Compact */
.result-header {
  text-align: center;
  animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  flex-shrink: 0;
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

.result-icon-container {
  display: inline-block;
  margin-bottom: 0.5rem;
  animation: floatBounce 3s ease-in-out infinite;
}

@keyframes floatBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(-5deg);
  }
  75% {
    transform: translateY(-8px) rotate(5deg);
  }
}

.result-icon {
  font-size: 4rem;
  display: inline-block;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.result-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -1px;
  animation: slideDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

.result-wrapper.win .result-title {
  background: linear-gradient(135deg, #22c55e, #10b981, #14f195);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: slideDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards,
             textShimmer 3s ease-in-out infinite;
}

@keyframes textShimmer {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

.result-wrapper.lose .result-title {
  color: var(--text-secondary);
}

/* Main Content Area - Two Column Layout */
.result-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  overflow: hidden;
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
  min-height: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Left Column */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.player-photo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  flex-shrink: 0;
}

.photo-frame {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  padding: 6px;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  animation: photoReveal 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s backwards,
             frameRotate 15s linear infinite;
  filter: drop-shadow(0 15px 50px rgba(0, 0, 0, 0.4));
}

@keyframes photoReveal {
  from {
    opacity: 0;
    transform: scale(0.3) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes frameRotate {
  from {
    filter: hue-rotate(0deg) drop-shadow(0 15px 50px rgba(0, 0, 0, 0.4));
  }
  to {
    filter: hue-rotate(360deg) drop-shadow(0 15px 50px rgba(0, 0, 0, 0.4));
  }
}

.player-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--card-bg);
  position: relative;
  z-index: 2;
}

.photo-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-glow), transparent 70%);
  opacity: 0.6;
  animation: glowPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
}

.entity-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 1.25rem;
  text-align: center;
  animation: cardFloat 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards,
             cardFloatLoop 6s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@keyframes cardFloat {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardFloatLoop {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.entity-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent);
  transform: translateX(-100%);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(200%);
  }
}

.entity-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.entity-name {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.entity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Right Column */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  animation: slideLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s backwards;
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Stats Section */
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 1.25rem;
  animation: cardPop 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards;
  flex: 1;
  display: flex;
  flex-direction: column;
}

@keyframes cardPop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  60% {
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  flex: 1;
}

.stat-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  animation: statPop 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: calc(0.7s + var(--stat-index, 0) * 0.1s);
}

.stat-card:nth-child(1) { --stat-index: 0; }
.stat-card:nth-child(2) { --stat-index: 1; }
.stat-card:nth-child(3) { --stat-index: 2; }

@keyframes statPop {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(30px);
  }
  70% {
    transform: scale(1.05) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.05);
  border-color: var(--accent-color);
  box-shadow: 0 15px 50px var(--primary-glow);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(5deg);
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: center;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1;
}

/* Details Section */
.details-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 1.25rem;
  animation: cardPop 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s backwards;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
  flex: 1;
}

.detail-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  animation: detailPop 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: calc(0.9s + var(--detail-index, 0) * 0.1s);
}

.detail-card:nth-child(1) { --detail-index: 0; }
.detail-card:nth-child(2) { --detail-index: 1; }
.detail-card:nth-child(3) { --detail-index: 2; }
.detail-card:nth-child(4) { --detail-index: 3; }

@keyframes detailPop {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-10deg);
  }
  60% {
    transform: scale(1.05) rotate(2deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.detail-card:hover {
  transform: translateY(-6px) scale(1.05);
  border-color: var(--accent-color);
  box-shadow: 0 15px 50px var(--primary-glow);
}

.detail-icon {
  font-size: 2rem;
  flex-shrink: 0;
  animation: iconSpin 4s ease-in-out infinite;
}

@keyframes iconSpin {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

[dir="rtl"] .detail-info {
  text-align: right;
}

.detail-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.7s backwards;
}

.action-button {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%) skewX(-15deg);
  transition: transform 0.6s ease;
}

.action-button:hover::before {
  transform: translateX(200%) skewX(-15deg);
}

.action-button.primary {
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  color: white;
  box-shadow: 0 8px 30px var(--primary-glow);
}

.action-button.primary:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 50px var(--primary-glow);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.action-button.secondary:hover {
  border-color: var(--accent-color);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

.action-button:active {
  transform: translateY(-2px) scale(0.98);
}

.button-icon {
  font-size: 1.25rem;
  position: relative;
  z-index: 1;
}

.button-text {
  position: relative;
  z-index: 1;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .result-wrapper {
    padding: 1.25rem 1.5rem;
  }

  .result-title {
    font-size: 2.25rem;
  }

  .result-icon {
    font-size: 3.5rem;
  }

  .photo-frame {
    width: 140px;
    height: 140px;
  }

  .entity-name {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 968px) {
  .result-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .content-right {
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .result-wrapper {
    padding: 1rem;
    gap: 0.75rem;
    overflow-y: auto;
  }

  .result-title {
    font-size: 1.75rem;
  }

  .result-icon {
    font-size: 3rem;
  }

  .photo-frame {
    width: 130px;
    height: 130px;
  }

  .player-photo-section {
    padding: 0.75rem;
  }

  .entity-name {
    font-size: 1.5rem;
  }

  .entity-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .stats-section,
  .details-section {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card,
  .detail-card {
    padding: 0.75rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .detail-icon {
    font-size: 1.75rem;
  }

  .action-bar {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-button {
    padding: 1rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .result-wrapper {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .result-icon {
    font-size: 2.5rem;
  }

  .photo-frame {
    width: 110px;
    height: 110px;
  }

  .entity-name {
    font-size: 1.25rem;
  }

  .entity-card {
    padding: 0.875rem;
  }

  .entity-label {
    font-size: 0.65rem;
  }

  .entity-description {
    font-size: 0.8rem;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 0.65rem;
  }

  .stats-section,
  .details-section {
    padding: 0.875rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .stat-card {
    flex-direction: row;
    justify-content: flex-start;
    padding: 0.75rem;
  }

  .stat-info {
    text-align: left;
  }

  [dir="rtl"] .stat-info {
    text-align: right;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.35rem;
  }

  .detail-card {
    padding: 0.75rem;
    gap: 0.875rem;
  }

  .detail-icon {
    font-size: 1.65rem;
  }

  .detail-value {
    font-size: 0.95rem;
  }

  .action-button {
    padding: 0.875rem;
    font-size: 0.875rem;
  }

  .button-icon {
    font-size: 1.15rem;
  }
}

/* Disable animations */
[data-animations="disabled"] .result-wrapper,
[data-animations="disabled"] .result-header,
[data-animations="disabled"] .result-icon,
[data-animations="disabled"] .result-content,
[data-animations="disabled"] .content-left,
[data-animations="disabled"] .content-right,
[data-animations="disabled"] .photo-frame,
[data-animations="disabled"] .entity-card,
[data-animations="disabled"] .stat-card,
[data-animations="disabled"] .detail-card,
[data-animations="disabled"] .action-bar {
  animation: none !important;
}

[data-animations="disabled"] .action-button::before,
[data-animations="disabled"] .entity-card::before {
  display: none !important;
}

/* Reveal Loader Styles */
.reveal-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
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

.loader-content-reveal {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  animation: loaderContentAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.orb-wrapper-reveal {
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-reveal {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow:
    0 0 70px var(--primary-glow),
    0 0 140px var(--primary-glow),
    inset 0 0 50px rgba(255, 255, 255, 0.3);
  animation: orbFloatReveal 3s ease-in-out infinite;
}

@keyframes orbFloatReveal {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow:
      0 0 70px var(--primary-glow),
      0 0 140px var(--primary-glow),
      inset 0 0 50px rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: translateY(-25px) scale(1.15);
    box-shadow:
      0 0 100px var(--primary-glow),
      0 0 180px var(--primary-glow),
      inset 0 0 60px rgba(255, 255, 255, 0.4);
  }
}

.orb-ring-reveal {
  position: absolute;
  width: 160px;
  height: 160px;
  border: 6px solid var(--accent-color);
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 2;
  animation: orbRingRotate 2s linear infinite;
}

.orb-pulse-reveal {
  position: absolute;
  width: 190px;
  height: 190px;
  border: 5px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
  animation: orbPulse 2s ease-out infinite;
  opacity: 0;
}

.particle-reveal {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  box-shadow: 0 0 12px var(--accent-color);
  animation: particleOrbitReveal 4s linear infinite;
  animation-delay: calc(var(--i) * -0.333s);
  transform-origin: 110px;
}

@keyframes particleOrbitReveal {
  from {
    transform: rotate(0deg) translateX(110px) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(360deg) translateX(110px) rotate(-360deg);
    opacity: 0.3;
  }
}

.loader-title-reveal {
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--text-primary);
  text-align: center;
  max-width: 700px;
  line-height: 1.4;
  animation: titlePulseReveal 2s ease-in-out infinite;
  text-shadow: 0 4px 25px rgba(0, 0, 0, 0.3);
}

@keyframes titlePulseReveal {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.03);
  }
}

.loader-subtitle-reveal {
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  animation: subtitleFadeIn 0.8s 0.3s ease backwards;
}

@keyframes subtitleFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loader-progress-reveal {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.loader-progress-bar-reveal {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  border-radius: 10px;
  animation: progressReveal 2s ease-in-out infinite;
}

@keyframes progressReveal {
  0% {
    width: 0%;
    margin-left: 0;
  }
  50% {
    width: 50%;
    margin-left: 25%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

@media (max-width: 768px) {
  .orb-wrapper-reveal {
    width: 180px;
    height: 180px;
  }

  .orb-reveal {
    width: 90px;
    height: 90px;
  }

  .orb-ring-reveal {
    width: 130px;
    height: 130px;
  }

  .orb-pulse-reveal {
    width: 150px;
    height: 150px;
  }

  .loader-title-reveal {
    font-size: 2rem;
  }

  .loader-subtitle-reveal {
    font-size: 1.1rem;
  }
}

/* Special optimization for 1366x656 and below screen heights */
@media (max-width: 1400px) and (max-height: 700px) {
  .result-wrapper {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .result-icon {
    font-size: 2.5rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .result-content {
    gap: 0.75rem;
  }

  .content-left {
    gap: 0.5rem;
  }

  .player-photo-section {
    padding: 0.25rem;
  }

  .photo-frame {
    width: 100px;
    height: 100px;
    padding: 4px;
  }

  .entity-card {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .entity-label {
    font-size: 0.65rem;
    margin-bottom: 0.35rem;
  }

  .entity-name {
    font-size: 1.25rem;
    margin-bottom: 0.35rem;
  }

  .entity-description {
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .content-right {
    gap: 0.5rem;
  }

  .section-title {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }

  .stats-section,
  .details-section {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .stats-grid {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.5rem;
    gap: 0.35rem;
    border-radius: 10px;
  }

  .stat-icon {
    font-size: 1.65rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .details-grid {
    gap: 0.5rem;
  }

  .detail-card {
    padding: 0.5rem;
    gap: 0.5rem;
    border-radius: 10px;
  }

  .detail-icon {
    font-size: 1.4rem;
  }

  .detail-label {
    font-size: 0.6rem;
  }

  .detail-value {
    font-size: 0.8rem;
  }

  .action-bar {
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.65rem 1rem;
    font-size: 0.8rem;
    border-radius: 10px;
  }

  .button-icon {
    font-size: 0.95rem;
  }
}

</style>
