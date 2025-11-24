<template></template>

<!-- <template>
  <div class="leaderboard-screen">
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <button @click="handleBack" class="back-button">
          ← Back
        </button>
        <h1 class="leaderboard-title">🏆 Leaderboard</h1>
      </div>

      <div class="filters">
        <select v-model="selectedThemeId" class="filter-select">
          <option value="">All Themes</option>
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.icon }} {{ theme.name }}
          </option>
        </select>

        <select v-model="selectedDifficulty" class="filter-select">
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button @click="loadLeaderboard" class="refresh-button">
          Refresh
        </button>
      </div>

      <div class="leaderboard-list" v-if="leaderboard.length > 0">
        <TransitionGroup name="leaderboard-list">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.id"
            class="leaderboard-entry"
            :class="{ top3: index < 3 }"
            :style="{ '--index': index }"
          >
          <div class="rank" :class="`rank-${index + 1}`">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>

          <div class="entry-info">
            <div class="player-name">{{ entry.player_name }}</div>
            <div class="entry-details">
              <span>{{ entry.entity_guessed }}</span>
              <span class="separator">•</span>
              <span>{{ entry.difficulty }}</span>
              <span class="separator">•</span>
              <span>{{ entry.questions_asked }} questions</span>
              <span class="separator">•</span>
              <span>{{ formatTime(entry.time_spent) }}</span>
            </div>
          </div>

          <div class="entry-score">{{ entry.score }}</div>
          </div>
        </TransitionGroup>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🎯</div>
        <p class="empty-text">No entries yet. Be the first to play!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '../stores/game';
import { useThemeStore } from '../stores/theme';
// import type { Theme, LeaderboardEntry } from '../lib/supabase';

const emit = defineEmits<{
  back: [];
}>();

const gameStore = useGameStore();
const themeStore = useThemeStore();

const { playSound } = themeStore;

const leaderboard = ref<LeaderboardEntry[]>([]);
const themes = ref<Theme[]>([]);
const selectedThemeId = ref('');
const selectedDifficulty = ref('');
const loading = ref(false);

onMounted(async () => {
  themes.value = await gameStore.fetchThemes();
  await loadLeaderboard();
});

watch([selectedThemeId, selectedDifficulty], () => {
  loadLeaderboard();
});

async function loadLeaderboard() {
  loading.value = true;
  leaderboard.value = await gameStore.fetchLeaderboard(
    selectedThemeId.value || undefined,
    selectedDifficulty.value || undefined
  );
  loading.value = false;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleBack() {
  playSound('click');
  emit('back');
}
</script>

<style scoped>
.leaderboard-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
}

.leaderboard-container {
  max-width: 900px;
  width: 100%;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  padding: 2rem;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.leaderboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: var(--bg-primary);
  border-color: var(--accent-color);
}

.leaderboard-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.filter-select:hover,
.filter-select:focus {
  border-color: var(--accent-color);
}

.refresh-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px var(--primary-glow);
}

.refresh-button:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: entry-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: calc(var(--index) * 0.05s);
}

@keyframes entry-appear {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.leaderboard-list-move,
.leaderboard-list-enter-active,
.leaderboard-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.leaderboard-list-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}

.leaderboard-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.leaderboard-list-leave-active {
  position: absolute;
  width: 100%;
}

.leaderboard-entry:hover {
  transform: translateX(6px) scale(1.01);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.leaderboard-entry.top3 {
  background: linear-gradient(90deg, var(--primary-glow), var(--bg-primary));
  border-color: var(--accent-color);
}

.rank {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-1, .rank-2, .rank-3 {
  font-size: 1.75rem;
}

.entry-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-details {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.separator {
  color: var(--border-color);
}

.entry-score {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

[data-animations="disabled"] .leaderboard-container {
  animation: none !important;
}

[data-animations="disabled"] .leaderboard-entry {
  animation: none !important;
}

@media (max-width: 640px) {
  .leaderboard-container {
    padding: 1.5rem;
  }

  .leaderboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .leaderboard-title {
    font-size: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    min-width: 100%;
  }

  .leaderboard-entry {
    flex-wrap: wrap;
  }

  .entry-info {
    flex: 1 1 100%;
  }

  .entry-score {
    margin-left: auto;
  }
}
</style> -->
