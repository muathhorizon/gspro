<template>
  <div class="profile-screen">
    <div class="profile-visual-side">
      <div class="visual-bg"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <button @click="goBack" class="back-nav-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>{{ $t('backToHome') }}</span>
      </button>

      <div class="profile-visual-content">
        <div class="profile-hero">
          <div class="hero-avatar">
            <div class="avatar-circle">
              <span class="avatar-initials">{{ userInitials }}</span>
            </div>
            <div class="avatar-glow-ring"></div>
          </div>

          <h1 class="hero-name gradient-text">{{ userData.name }}</h1>
          <p class="hero-email">{{ userData.email }}</p>

          <div class="stats-showcase">
            <div class="stat-showcase-item">
              <div class="stat-icon">🎮</div>
              <div class="stat-number">{{ userData.totalGames }}</div>
              <div class="stat-text">{{ $t('totalGames') }}</div>
            </div>

            <div class="stat-divider"></div>

            <div class="stat-showcase-item win">
              <div class="stat-icon">🏆</div>
              <div class="stat-number">{{ userData.wins }}</div>
              <div class="stat-text">{{ $t('wins') }}</div>
            </div>

            <div class="stat-divider"></div>

            <div class="stat-showcase-item loss">
              <div class="stat-icon">❌</div>
              <div class="stat-number">{{ userData.losses }}</div>
              <div class="stat-text">{{ $t('losses') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-history-side">
      <div class="history-content">
        <div class="history-header">
          <h2 class="history-title gradient-text">{{ $t('gameHistory') }}</h2>
          <p class="history-subtitle">آخر 5 مباريات لك</p>
        </div>

        <div v-if="gameHistory.length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <p class="empty-text">{{ $t('noGamesYet') }}</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="(game, index) in gameHistory"
            :key="game.id"
            class="history-item"
            :style="{ '--index': index }"
          >
            <div class="history-item-header">
              <div class="result-badge" :class="game.result">
                <span class="result-icon">{{ game.result === 'won' ? '✓' : '✗' }}</span>
                <span class="result-text">{{ game.result === 'won' ? $t('won') : $t('lost') }}</span>
              </div>
              <span class="game-date">{{ formatDate(game.date) }}</span>
            </div>

            <div class="history-item-body">
              <div class="game-info-row">
                <span class="info-label">{{ $t('entity') }}</span>
                <span class="info-value entity-highlight">{{ game.entity }}</span>
              </div>

              <div class="game-info-grid">
                <div class="info-cell">
                  <span class="cell-label">{{ $t('theme') }}</span>
                  <span class="cell-value">{{ game.theme }}</span>
                </div>
                <div class="info-cell">
                  <span class="cell-label">{{ $t('difficulty') }}</span>
                  <span class="cell-value difficulty" :class="game.difficulty">{{ game.difficulty }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userData = ref({
  name: authStore.user?.name || 'Player',
  email: authStore.user?.email || 'player@example.com',
  totalGames: 24,
  wins: 18,
  losses: 6
});

const gameHistory = ref([
  {
    id: 1,
    theme: 'كرة القدم',
    difficulty: 'سهل',
    result: 'won',
    entity: 'كريستيانو رونالدو',
    date: new Date('2025-01-15')
  },
  {
    id: 2,
    theme: 'الألعاب',
    difficulty: 'متوسط',
    result: 'won',
    entity: 'ماريو',
    date: new Date('2025-01-14')
  },
  {
    id: 3,
    theme: 'كرة القدم',
    difficulty: 'صعب',
    result: 'lost',
    entity: 'ليونيل ميسي',
    date: new Date('2025-01-13')
  },
  {
    id: 4,
    theme: 'الألعاب',
    difficulty: 'سهل',
    result: 'won',
    entity: 'سونيك',
    date: new Date('2025-01-12')
  },
  {
    id: 5,
    theme: 'كرة القدم',
    difficulty: 'متوسط',
    result: 'won',
    entity: 'محمد صلاح',
    date: new Date('2025-01-11')
  }
]);

const userInitials = computed(() => {
  const name = userData.value.name;
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const goBack = () => {
  router.push('/home');
};
</script>

<style scoped>
.profile-screen {
  min-height: 100vh;
  display: flex;
  background: var(--bg-primary);
}

.profile-visual-side {
  flex: 1;
  min-width: 45%;
  position: relative;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  padding: 3rem;
  overflow: hidden;
}

.visual-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      var(--bg-primary) 0%,
      var(--bg-secondary) 50%,
      var(--bg-primary) 100%);
  opacity: 0.9;
}

.visual-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 150%;
  background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
  opacity: 0.15;
  border-radius: 50%;
  animation: float-orbit 20s ease-in-out infinite;
}

.visual-bg::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -15%;
  width: 70%;
  height: 120%;
  background: radial-gradient(circle, var(--secondary-color) 0%, transparent 70%);
  opacity: 0.12;
  border-radius: 50%;
  animation: float-orbit 25s ease-in-out infinite reverse;
}

@keyframes float-orbit {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0.08;
  filter: blur(40px);
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: 10%;
  right: 15%;
  animation: morph-shape 15s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: 20%;
  left: 10%;
  animation: morph-shape 20s ease-in-out infinite reverse;
}

.shape-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  left: 40%;
  animation: morph-shape 18s ease-in-out infinite;
}

@keyframes morph-shape {
  0%, 100% {
    border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
    transform: rotate(0deg);
  }
  25% {
    border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
    transform: rotate(90deg);
  }
  50% {
    border-radius: 60% 40% 40% 60% / 40% 60% 40% 60%;
    transform: rotate(180deg);
  }
  75% {
    border-radius: 45% 55% 55% 45% / 55% 45% 55% 45%;
    transform: rotate(270deg);
  }
}

.back-nav-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(var(--card-bg-rgb, 26, 26, 36), 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.back-nav-button:hover {
  transform: translateX(-4px);
  background: var(--card-bg);
  border-color: var(--accent-color);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
}

.profile-visual-content {
  margin-top: 3rem;
  position: relative;
  z-index: 2;
  animation: fade-slide-in 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.hero-avatar {
  position: relative;
  margin-bottom: 1rem;
}

.avatar-circle {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 10px 40px rgba(0, 212, 255, 0.4);
  animation: avatar-bounce 3s ease-in-out infinite;
}

@keyframes avatar-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

.avatar-initials {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.avatar-glow-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0.3;
  filter: blur(20px);
  animation: ring-pulse 2.5s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

.hero-name {
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  margin: 0;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-email {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: -0.5rem 0 0 0;
}

.stats-showcase {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  padding: 2rem 3rem;
  background: rgba(var(--card-bg-rgb, 26, 26, 36), 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 24px;
}

.stat-showcase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 2.5rem;
  animation: icon-float 3s ease-in-out infinite;
}

.stat-showcase-item:nth-child(1) .stat-icon {
  animation-delay: 0s;
}

.stat-showcase-item:nth-child(3) .stat-icon {
  animation-delay: 0.3s;
}

.stat-showcase-item:nth-child(5) .stat-icon {
  animation-delay: 0.6s;
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, var(--border-color), transparent);
}

.profile-history-side {
  flex: 1;
  background: var(--bg-secondary);
  padding: 3rem;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
}

.history-content {
  max-width: 700px;
  margin: 0 auto;
  animation: fade-slide-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes fade-slide-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-header {
  margin-bottom: 2rem;
}

.history-title {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.history-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: history-slide-in 0.5s ease calc(var(--index) * 0.1s) both;
}

@keyframes history-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-item:hover {
  transform: translateX(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.history-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
}

.result-badge.won {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.result-badge.lost {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-icon {
  font-size: 1.1rem;
}

.game-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.history-item-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.info-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.entity-highlight {
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.1rem;
}

.game-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cell-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cell-value {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
}

.cell-value.difficulty {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  width: fit-content;
}

.cell-value.difficulty.سهل {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.cell-value.difficulty.متوسط {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.cell-value.difficulty.صعب {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

@media (max-width: 1024px) {
  .profile-screen {
    flex-direction: column;
  }

  .profile-visual-side,
  .profile-history-side {
    min-width: 100%;
    padding: 2rem 1.5rem;
  }

  .stats-showcase {
    gap: 1.5rem;
    padding: 1.5rem 2rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .profile-visual-side {
    padding: 1.5rem 1rem;
  }

  .back-nav-button {
    top: 1rem;
    left: 1rem;
    padding: 0.625rem 1rem;
  }

  .avatar-circle {
    width: 100px;
    height: 100px;
  }

  .avatar-initials {
    font-size: 2rem;
  }

  .stats-showcase {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .stat-divider {
    width: 60%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border-color), transparent);
  }

  .profile-history-side {
    padding: 2rem 1rem;
  }

  .game-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
