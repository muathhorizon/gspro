<template>
  <div class="landing-page">
    <div v-if="authStore.isAuthenticated" class="floating-header-actions">
      <div class="user-profile-chip" @click="goToProfile">
        <div class="chip-avatar-container">
          <div class="avatar-orbit">
            <div class="orbit-ring"></div>
            <div class="orbit-ring"></div>
          </div>
          <div class="chip-avatar">
            <span class="avatar-initials">{{ userInitials }}</span>
          </div>
          <div class="online-indicator"></div>
        </div>

        <div class="chip-info">
          <span class="chip-label">{{ $t('welcome') }}</span>
          <span class="chip-username">{{ authStore.user?.name }}</span>
        </div>

        <div class="chip-caret">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        <div class="chip-glow"></div>
      </div>

      <button @click="handleLogout" class="action-logout-button">
        <div class="logout-bg"></div>
        <svg class="logout-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span class="logout-label">{{ $t('logout') }}</span>
      </button>
    </div>


    <div class="hero-section">
      <div class="logo-container">
        <div class="logo-glow"></div>
        <h1 class="game-title">{{ $t('gameTitle') }}</h1>
        <p class="game-subtitle">{{ $t('gameSubtitle') }}</p>
      </div>

      <!-- <div class="welcome-layout">
       
        <div class="right-side">
          <div v-if="!showThemeSelect" class="accordion-container">
            <button @click="isAccordionOpen = !isAccordionOpen" class="accordion-header"
              :class="{ 'is-open': isAccordionOpen }">
              <span class="accordion-title">{{ $t('gameExplanationTitle') }}</span>
              <span class="accordion-icon" :class="{ 'rotated': isAccordionOpen }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <transition name="accordion">
              <div v-show="isAccordionOpen" class="accordion-content">
                <div class="accordion-body">
                  <p v-for="(paragraph, index) in $t('gameExplanationContent').split('\n')" :key="index"
                    class="accordion-paragraph">
                    {{ paragraph }}
                  </p>
                </div>
              </div>
            </transition>
          </div>
        </div>
         <div class="left-side">
          <OtpVerification v-if="showOtpScreen && !showThemeSelect" :email="playerEmail" @verify="verifyOtp"
            @resend="resendOtp" @editEmail="goBackToEmailInput" @success="handleOtpSuccess" />


          <div v-if="showWelcome && !showThemeSelect && !showOtpScreen" class="welcome-container">
            <div class="welcome-backdrop"></div>
            <div class="welcome-card">
              <div class="welcome-particles">
                <div class="particle" v-for="n in 6" :key="n" :style="{ '--delay': n * 0.2 + 's' }"></div>
              </div>

              <div class="welcome-icon-wrapper">
                <div class="welcome-icon-glow"></div>
                <div class="welcome-icon">✨</div>
              </div>

              <h2 class="welcome-title">{{ $t('welcomeBack') }}</h2>
              <p class="welcome-subtitle">
                <span class="welcome-label">{{ $t('loggedInAs') }}</span> 
                <span class="welcome-name">{{ authStore.user?.name }}</span>
              </p>

              <button @click="proceedToThemes" class="continue-button" data-tour-continue>
                <span class="button-text">{{ $t('continueToThemes') }}</span>
                <span class="button-arrow">→</span>
                <span class="button-shine"></span>
              </button>
            </div>
          </div>

          <div v-if="!showThemeSelect && !showOtpScreen && !showWelcome" class="auth-container">
            <div class="auth-backdrop"></div>
            <div class="auth-card">
              <div class="auth-glow-orb"></div>

              <div class="auth-header">
                <h2 class="auth-title">{{ $t('startManually') }}</h2>
              </div>

              <div class="input-group">
                <div class="input-wrapper" :class="{ 'has-value': playerName.trim() }">
                  <input v-model="playerName" type="text" class="game-input" maxlength="20" />
                  <div class="input-glow"></div>
                  <label class="input-label">{{ $t('enterName') }}</label>
                </div>

                <div class="input-wrapper" :class="{ 'has-value': playerEmail.trim() }">
                  <input v-model="playerEmail" type="email" class="game-input" />
                  <div class="input-glow"></div>
                  <label class="input-label">{{ $t('enterEmail') }}</label>
                </div>
              </div>

              <button @click="manualLogin" class="game-start-button"
                :disabled="!playerName.trim() || !playerEmail.trim()">
                <span class="button-bg"></span>
                <span class="button-text">ابدأ اللعب</span>
                <span class="button-particles">
                  <span v-for="n in 8" :key="n" class="particle-dot"></span>
                </span>
              </button>

              <div class="divider-wrapper">
                <div class="divider-line"></div>
                <span class="divider-text">{{ $t('or') }}</span>
                <div class="divider-line"></div>
              </div>

              <button @click="googleLogin" class="google-button">
                <span class="google-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </span>
                <span class="button-text">{{ $t('loginWithGoogle') }}</span>
                <span class="google-shimmer"></span>
              </button>
            </div>
          </div>
        </div>
      </div> -->

      <div v-if="showThemeSelect" class="theme-selection" data-tour-step="theme-selection">


        <h2 class="section-title">{{ $t('chooseTheme') }}</h2>

        <div class="themes-scroll-container" ref="themesContainerRef">
          <div v-if="isLoadingThemes" class="themes-grid" :class="{ 'mobile-carousel': isMobile }">
            <div v-for="n in 6" :key="'shimmer-theme-' + n" class="theme-card shimmer-card">
              <div class="shimmer-icon"></div>
              <div class="shimmer-title"></div>
              <div class="shimmer-description"></div>
            </div>
          </div>

          <transition-group v-else name="theme-list" tag="div" class="themes-grid">
            <div v-for="(theme, index) in themes" :key="theme.id" @click="selectTheme(theme)" class="theme-card"
              :class="{ selected: selectedTheme?.id === theme.id }" :style="{ '--index': index }"
              :data-tour-theme="theme.name?.en?.toLowerCase()">
              <div class="theme-icon">{{ theme.icon }}</div>
              <h3 class="theme-name">{{ theme.name?.ar }}</h3>
              <p class="theme-description">{{ theme.description?.ar }}</p>
            </div>
          </transition-group>
        </div>

        <transition name="difficulty-section">
          <div v-if="selectedTheme" class="difficulty-section" ref="levelsSectionRef">
            <h3 class="section-title">{{ $t('selectDifficulty') }}</h3>

            <div v-if="isLoadingLevels" class="difficulty-buttons">
              <div v-for="n in 3" :key="'shimmer-level-' + n" class="level-card shimmer-level-card">
                <div class="level-card-inner">
                  <div class="shimmer-badge"></div>
                  <div class="shimmer-stats">
                    <div class="shimmer-stat-line"></div>
                    <div class="shimmer-stat-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <transition-group v-else name="difficulty-list" tag="div" class="difficulty-buttons">
              <button v-for="(level, index) in levels" :key="level.id" @click="selectLevel(level)" class="level-card"
                :class="[
                  level.name?.en?.toLowerCase() || '',
                  { active: selectedLevel?.id === level.id }
                ]" :style="{ '--index': index }" data-tour-level>
                <div class="level-card-inner">
                  <div class="level-bg-glow"></div>
                  <div class="level-border-glow"></div>

                  <div class="level-top-section">
                    <div class="level-badge-wrapper">
                      <div class="badge-glow-pulse"></div>
                      <span class="level-badge">{{ level.name?.ar }}</span>
                    </div>

                    <!-- غلاف للأيقونة والبوبوفر مثبت في أقصى inline-end -->
                    <div class="info-anchor">
                      <button @click.stop="toggleTooltip(level.id)" @keydown.enter.stop="toggleTooltip(level.id)"
                        @keydown.escape="closeTooltip" class="info-icon-btn"
                        :aria-label="$t('levelInfo') || 'معلومات المستوى'" tabindex="0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </button>

                      <transition name="tooltip-fade">
                        <div v-if="activeTooltip === level.id" class="level-tooltip" @click.stop role="dialog"
                          aria-modal="true">
                          <div class="tooltip-content">
                            <h4 class="tooltip-title">{{ level.name?.ar }}</h4>
                            <p class="tooltip-text">{{ level.hint?.ar }}</p>
                          </div>
                          <button @click.stop="closeTooltip" class="tooltip-close" aria-label="إغلاق">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </transition>
                    </div>
                  </div>




                  <div class="level-stats-container"></div>
                  <div class="level-stats">
                    <div class="stat-row">
                      <span class="stat-key">عدد التصنيفات:</span>
                      <span class="stat-value">{{ level.categories_count }}</span>
                    </div>

                    <div class="stat-row">
                      <span class="stat-key">الوقت المتاح:</span>
                      <span class="stat-value">{{ formatTime(level.time_per_attempt) }}</span>
                    </div>
                  </div>






                  <div class="level-corner-accent top-left"></div>
                  <div class="level-corner-accent top-right"></div>
                  <div class="level-corner-accent bottom-left"></div>
                  <div class="level-corner-accent bottom-right"></div>
                </div>
              </button>
            </transition-group>


            <transition name="start-button">
              <button ref="startButtonRef" @click="startGame" v-if="selectedLevel && selectedTheme"
                class="primary-button glow">
                {{ $t('beginGame') }}
              </button>
            </transition>
          </div>
        </transition>
      </div>





      <!-- 
      <button @click="showLeaderboard" class="secondary-button leaderboard-button">
        🏆 {{ $t('viewLeaderboard') }}
      </button> -->
    </div>


  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'; // أو google-one-tap
import { auth, provider } from '../lib/firebase';
import { useTimeFormatter } from '../composables/useTimeFormatter';
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useGameStore } from '../stores/game';
import { useThemeStore } from '../stores/theme';
import type { Theme } from '../models/Theme';
import type { Level } from '../models/Level';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTour } from '../composables/useTour';
import OtpVerification from './OtpVerification.vue';
const { formatTime } = useTimeFormatter();
const { t } = useI18n();
const authStore = useAuthStore();
const playerEmail = ref('');
const emit = defineEmits<{
  startGame: [];
  showLeaderboard: [];
}>();
const levelsSectionRef = ref<HTMLElement | null>(null);
const startButtonRef = ref<HTMLElement | null>(null);
const gameStore = useGameStore();
const themeStore = useThemeStore();
const router = useRouter()
const { playSound } = themeStore;
const showWelcome = ref(false);
const showOtpScreen = ref(false);
const playerName = ref('');
const showThemeSelect = ref(false);
const { startTour } = useTour();
let tourContinueCallback: (() => void) | null = null;
const isAccordionOpen = ref(false);
const themes = ref<Theme[]>([]);
const selectedTheme = ref<Theme | null>(null);
const levels = ref<Level[]>([]);
const selectedLevel = ref<Level | null>(null);
const isLoadingThemes = ref(false);
const isLoadingLevels = ref(false);
const themesContainerRef = ref<HTMLElement | null>(null);
const isMobile = ref(false);
const activeTooltip = ref<number | null>(null);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

function goToProfile() {
  playSound('click');
  router.push('/profile');
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}

function toggleTooltip(levelId: number) {
  if (activeTooltip.value === levelId) {
    activeTooltip.value = null;
  } else {
    activeTooltip.value = levelId;
  }
}

function closeTooltip() {
  activeTooltip.value = null;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (activeTooltip.value && !target.closest('.level-tooltip') && !target.closest('.info-icon-btn')) {
    closeTooltip();
  }
}

function handleEscKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && activeTooltip.value) {
    closeTooltip();
  }
}

onMounted(async () => {
  isLoadingThemes.value = true;
  themes.value = await gameStore.fetchThemes();
  isLoadingThemes.value = false;
  showThemeSelect.value = true;
 

  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscKey);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscKey);
});

async function manualLogin() {
  if (!playerName.value.trim() || !playerEmail.value.trim()) return;

  try {




    showOtpScreen.value = true;

    authStore.sendOtp(playerEmail.value)
      .then(() => {
        console.log("✅ OTP sent successfully");
      })
      .catch((error: any) => {
        console.error("❌ Failed to send OTP:", error);

      });

  } catch (error: any) {
    console.error("Failed to send OTP:", error);
    alert(error.message || 'فشل إرسال رمز التحقق');
  }
}
async function googleLogin() {
  try {
    playSound('click');
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(true);

    const success = await authStore.loginWithGoogle(idToken);

    if (success) {
      playerName.value = authStore.user?.name || '';
      showWelcome.value = true;
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    alert('فشل تسجيل الدخول عبر Google');
  }
}
async function proceedToThemes() {
  if (!playerName.value.trim()) return;
  playSound('click');

  isAccordionOpen.value = false;

  showThemeSelect.value = true;

  // Check if user has seen tour
  const hasSeenTour = sessionStorage.getItem('hasSeenTour');
  if (!hasSeenTour) {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Wait for theme cards to be fully rendered
    const checkThemesRendered = () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          const themeCard = document.querySelector('.theme-card[data-tour-theme]');
          if (themeCard && !isLoadingThemes.value && themes.value.length > 0) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    await checkThemesRendered();
    await new Promise(resolve => setTimeout(resolve, 200));

    startTour((continueCallback) => {
      tourContinueCallback = continueCallback;
    });
  }
}
async function selectLevel(level: Level) {
  playSound('click');
  selectedLevel.value = level;

  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));

  const target = startButtonRef.value;
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
}
async function selectTheme(theme: Theme) {
  playSound('click');
  selectedTheme.value = theme;

  // Store callback before async operations
  const callback = tourContinueCallback;
  tourContinueCallback = null;

  isLoadingLevels.value = true;
  levels.value = await gameStore.fetchLevels();
  isLoadingLevels.value = false;

  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 200));

  const target = levelsSectionRef.value;
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  // Continue tour if active
  if (callback) {
    callback();
  }
}

// async function startGame() {
//   if (!selectedTheme.value || !selectedLevel.value) return; // التأكد من اختيار المستوى
//   playSound('click');

//   const success = await gameStore.startGame(playerName.value, selectedTheme.value, selectedLevel.value); // استخدام المستوى
//   if (success) {
//     emit('startGame');
//       if (success) {
//     router.push({ name: 'game' });
//   }
//   }
// }
async function startGame() {
  if (!selectedTheme.value || !selectedLevel.value) return;
  playSound('click');



  gameStore.state.user = authStore.user;
  gameStore.state.selectedTheme = selectedTheme.value;
  gameStore.state.selectedLevel = selectedLevel.value;


  router.push({ name: 'game' });
}

function showLeaderboard() {
  playSound('click');
  emit('showLeaderboard');
}

function handleLogout() {
  playSound('click');
  authStore.logout();
  showWelcome.value = false;
  showOtpScreen.value = false;
  showThemeSelect.value = false;
  playerName.value = '';
  playerEmail.value = '';
  selectedTheme.value = null;
  selectedLevel.value = null;
  router.push({name:"auth"})
}

// OTP Verification Handlers
async function verifyOtp(otp: string) {
  console.log('Verifying OTP:', otp);

  // TODO: Replace with actual API call to /auth/email/verify-otp
  // Example:
  // try {
  //   const response = await fetch('/auth/email/verify-otp', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email: playerEmail.value, otp })
  //   });
  //
  //   if (!response.ok) {
  //     throw new Error('Invalid OTP');
  //   }
  //
  //   const data = await response.json();
  //   // Store user data
  //   await authStore.loginManual(playerName.value, playerEmail.value);
  //   // Success handler will be called automatically by OtpVerification component
  // } catch (error) {
  //   console.error('Verification failed:', error);
  //   throw error; // Component will show error
  // }
}

async function resendOtp() {
  console.log('Resending OTP to:', playerEmail.value);

  // TODO: Replace with actual API call to /auth/email/resend-otp
  // Example:
  // try {
  //   await fetch('/auth/email/resend-otp', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email: playerEmail.value })
  //   });
  // } catch (error) {
  //   console.error('Resend failed:', error);
  //   throw error;
  // }
}

function goBackToEmailInput() {
  playSound('click');
  showOtpScreen.value = false;
  // User can now edit their email and resubmit
}

async function handleOtpSuccess() {
  // Called after successful OTP verification
  // Complete the login process
  const success = await authStore.loginManual(playerName.value, playerEmail.value);
  if (success) {
    showOtpScreen.value = false;
    showWelcome.value = true;
  }
}

// OTP Verification Handlers







</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  padding-bottom: 6rem;
  background: radial-gradient(circle at 50% 50%, var(--primary-glow), transparent 70%),
    linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  position: relative;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

.floating-header-actions {
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: fade-in-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-profile-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.5rem 1.25rem 0.5rem 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--card-bg);
  border-radius: 60px;
  opacity: 0.95;
  transition: all 0.4s ease;
}

.user-profile-chip:hover::before {
  opacity: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.user-profile-chip:hover {
  transform: translateY(-3px) scale(1.02);
}

.user-profile-chip:active {
  transform: translateY(-1px) scale(0.98);
}

.chip-avatar-container {
  position: relative;
  width: 52px;
  height: 52px;
  z-index: 2;
  flex-shrink: 0;
}

.avatar-orbit {
  position: absolute;
  inset: -6px;
  pointer-events: none;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--accent-color);
  animation: orbit-spin 3s linear infinite;
  opacity: 0.6;
}

.orbit-ring:nth-child(2) {
  animation-duration: 4s;
  animation-direction: reverse;
  border-top-color: var(--secondary-color);
  opacity: 0.4;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

.chip-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
}

.user-profile-chip:hover .chip-avatar {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(0, 212, 255, 0.5);
}

.avatar-initials {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 3px solid var(--card-bg);
  border-radius: 50%;
  z-index: 3;
  animation: pulse-indicator 2s ease-in-out infinite;
}

@keyframes pulse-indicator {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
}

.chip-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  z-index: 2;
}

.chip-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1;
}

.chip-username {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chip-caret {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.user-profile-chip:hover .chip-caret {
  opacity: 1;
  transform: translateX(3px);
}

.chip-caret svg {
  stroke: var(--accent-color);
}

.chip-glow {
  position: absolute;
  top: 50%;
  left: 30px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
  opacity: 0;
  filter: blur(20px);
  transform: translate(-50%, -50%);
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.user-profile-chip:hover .chip-glow {
  opacity: 0.3;
}

.action-logout-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 14px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logout-bg {
  position: absolute;
  inset: 0;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.action-logout-button:hover .logout-bg {
  background: rgba(239, 68, 68, 0.15);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
}

.action-logout-button:hover {
  transform: translateY(-3px);
}

.action-logout-button:active {
  transform: translateY(-1px);
}

.logout-svg {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.action-logout-button:hover .logout-svg {
  transform: translateX(4px);
}

.logout-label {
  position: relative;
  z-index: 2;
  font-weight: 700;
}

.logout-button .logout-text {
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
}

.logout-button .logout-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.logout-button:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--primary-glow);
}

.logout-button:hover .logout-glow {
  opacity: 0.15;
}

.logout-button:hover .logout-icon {
  transform: translateX(-3px);
}

.logout-button:hover .logout-icon svg {
  stroke: var(--accent-color);
}

.logout-button:hover .logout-text {
  color: var(--accent-color);
}

.logout-button:active {
  transform: translateY(0) scale(0.96);
  transition-duration: 0.1s;
}

.hero-section {
  max-width: 900px;
  width: 100%;
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  position: relative;
  margin-bottom: 3rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--accent-color), transparent 70%);
  opacity: 0.2;
  filter: blur(60px);
  animation: pulse-glow 4s ease-in-out infinite;
}

@media (max-width: 1366px) {
  .landing-page {
    padding: 2rem 1.5rem;
  }

  .hero-section {
    max-width: 800px;
    margin-bottom: 1.75rem;
  }

  .game-title {
    font-size: clamp(2.5rem, 3.5vw + 1.5rem, 3.5rem);
  }

  .game-subtitle {
    font-size: clamp(1.1rem, 0.8vw + 0.95rem, 1.35rem);
  }

  .themes-grid {
    gap: 1.5rem;
  }

  .theme-card {
    padding: 2rem 1.75rem;
  }

  .welcome-card,
  .auth-card {
    padding: 2.5rem 2rem;
  }

  .accordion-container {
    max-width: 650px;
  }
}

@media (max-width: 1024px) {
  .landing-page {
    padding: 1.75rem 1.25rem;
  }

  .hero-section {
    max-width: 700px;
    margin-bottom: 1.5rem;
  }

  .game-title {
    font-size: clamp(2.25rem, 3vw + 1.25rem, 3rem);
    letter-spacing: -1px;
  }

  .game-subtitle {
    font-size: clamp(1rem, 0.7vw + 0.85rem, 1.25rem);
  }

  .themes-grid {
    gap: 1.35rem;
  }

  .theme-card {
    padding: 1.85rem 1.5rem;
  }

  .theme-icon {
    font-size: clamp(2.5rem, 1.8vw + 1.8rem, 3.5rem);
  }

  .theme-name {
    font-size: clamp(1.35rem, 1.2vw + 1rem, 1.75rem);
  }

  .theme-description {
    font-size: clamp(0.95rem, 0.5vw + 0.85rem, 1.1rem);
  }

  .difficulty-buttons {
    gap: 1.5rem;
  }

  .level-card-inner {
    padding: 2.25rem 1.85rem;
  }

  .welcome-card,
  .auth-card {
    padding: 2.25rem 1.85rem;
  }

  .accordion-header {
    padding: 1.15rem 1.5rem;
  }

  .accordion-body {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .floating-header-actions {
    top: 1rem;
    left: 1rem;
    gap: 0.75rem;
  }

  .user-profile-chip {
    padding: 0.375rem 1rem 0.375rem 0.375rem;
  }

  .chip-avatar-container {
    width: 44px;
    height: 44px;
  }

  .chip-avatar {
    width: 44px;
    height: 44px;
  }

  .avatar-initials {
    font-size: 1.05rem;
  }

  .online-indicator {
    width: 12px;
    height: 12px;
    border-width: 2.5px;
  }

  .chip-label {
    font-size: 0.65rem;
  }

  .chip-username {
    font-size: 0.95rem;
  }

  .action-logout-button {
    padding: 0.625rem 1rem;
  }

  .logout-label {
    display: none;
  }

  .landing-page {
    padding: 1.5rem 1rem;
  }

  .hero-section {
    max-width: 100%;
    margin-bottom: 1.25rem;
  }

  .game-title {
    font-size: clamp(1.85rem, 2.5vw + 1rem, 2.5rem);
  }

  .game-subtitle {
    font-size: clamp(0.95rem, 0.6vw + 0.8rem, 1.15rem);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.game-title {
  font-weight: 900;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color), var(--accent-color));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -2px;
  position: relative;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.game-subtitle {
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-weight: 500;
  text-align: center;
}

.accordion-container {
  max-width: 700px;

  width: 100%;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.accordion-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.accordion-header:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--primary-glow);
}

.accordion-header:hover::before {
  opacity: 0.1;
}

.accordion-header.is-open {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-color: var(--accent-color);
}

.accordion-title {
  font-weight: 700;
  color: var(--text-primary);
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.accordion-header:hover .accordion-title {
  color: var(--accent-color);
}

.accordion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.accordion-icon.rotated {
  transform: rotate(180deg);
}

.accordion-icon svg {
  stroke: var(--text-primary);
  transition: stroke 0.3s ease;
}

.accordion-header:hover .accordion-icon svg {
  stroke: var(--accent-color);
}

.accordion-content {
  overflow: hidden;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-top: none;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.accordion-body {
  padding: 1.75rem;
  color: var(--text-secondary);
  line-height: 1.8;
  text-align: right;
}

.accordion-paragraph {
  margin: 0 0 1rem 0;
  direction: rtl;
}

.accordion-paragraph:last-child {
  margin-bottom: 0;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: scaleY(0.8);
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: scaleY(1);
}

.welcome-container,
.auth-container {
  max-width: 500px;
  margin: 0 auto 2rem;
  position: relative;
}

.welcome-backdrop,
.auth-backdrop {
  position: absolute;
  inset: -40px;
  background: radial-gradient(circle at center, var(--primary-glow), transparent 70%);
  filter: blur(40px);
  opacity: 0.4;
  animation: backdrop-pulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes backdrop-pulse {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.welcome-card,
.auth-card {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  animation: card-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(30px) rotateX(10deg);
  }

  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.auth-glow-orb {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--accent-color), transparent 70%);
  opacity: 0.15;
  filter: blur(60px);
  animation: orb-float 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes orb-float {

  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-30px, 30px);
  }
}

.welcome-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.welcome-particles .particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--accent-color);
  border-radius: 50%;
  opacity: 0;
  animation: particle-rise 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.welcome-particles .particle:nth-child(1) {
  left: 10%;
}

.welcome-particles .particle:nth-child(2) {
  left: 25%;
}

.welcome-particles .particle:nth-child(3) {
  left: 40%;
}

.welcome-particles .particle:nth-child(4) {
  left: 60%;
}

.welcome-particles .particle:nth-child(5) {
  left: 75%;
}

.welcome-particles .particle:nth-child(6) {
  left: 90%;
}

@keyframes particle-rise {
  0% {
    bottom: 0;
    opacity: 0;
    transform: translateY(0) scale(0);
  }

  50% {
    opacity: 1;
  }

  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

.welcome-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-icon-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, var(--accent-color), transparent 70%);
  opacity: 0.3;
  filter: blur(30px);
  animation: icon-glow-pulse 2s ease-in-out infinite;
}

@keyframes icon-glow-pulse {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.welcome-icon {
  position: relative;
  z-index: 1;
  animation: icon-bounce 1s ease-out;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0) rotate(-180deg);
  }

  60% {
    transform: scale(1.2) rotate(20deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

.welcome-title {
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-align: center;
  animation: title-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes title-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-subtitle {
  text-align: center;
  margin-bottom: 2rem;
  animation: subtitle-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

@keyframes subtitle-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.welcome-name {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.continue-button {
  position: relative;
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: button-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  box-shadow: 0 10px 30px var(--primary-glow);
}

@keyframes button-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.continue-button .button-text {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
  display: inline-block;
}

.continue-button .button-arrow {
  position: relative;
  z-index: 2;
  margin-right: 0.5rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.continue-button .button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.continue-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px var(--primary-glow);
}

.continue-button:hover .button-arrow {
  transform: translateX(5px);
}

.continue-button:hover .button-shine {
  left: 100%;
}

.continue-button:active {
  transform: translateY(-1px) scale(0.98);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-icon {
  margin-bottom: 1rem;
  animation: auth-icon-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

@keyframes auth-icon-spin {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }

  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.auth-title {
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  animation: title-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.auth-description {
  color: var(--text-secondary);
  animation: subtitle-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-wrapper {
  position: relative;
  animation: input-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.input-wrapper:nth-child(1) {
  animation-delay: 0.4s;
}

.input-wrapper:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes input-slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.input-label {
  position: absolute;
  top: 1.125rem;
  right: 1.25rem;
  color: var(--text-secondary);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  background: var(--card-bg);
  padding: 0 0.5rem;
}

.input-wrapper.has-value .input-label,
.input-wrapper .game-input:focus~.input-label {
  top: -0.625rem;
  color: var(--accent-color);
  font-weight: 600;
}

.game-input {
  width: 100%;
  padding: 1.125rem 1.25rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.game-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
  transform: translateY(-2px);
}

.game-input:hover {
  border-color: var(--accent-color);
}

.input-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border-radius: 14px;
  opacity: 0;
  filter: blur(10px);
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.game-input:focus~.input-glow {
  opacity: 0.3;
}

.game-start-button {
  position: relative;
  width: 100%;
  padding: 1.25rem 2rem;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: button-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  box-shadow: 0 10px 30px var(--primary-glow);
}

.game-start-button .button-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  transition: transform 0.3s ease;
}

.game-start-button .button-text {
  position: relative;
  z-index: 2;
}

.game-start-button .button-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.game-start-button .particle-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  opacity: 0;
}

.game-start-button:hover .particle-dot {
  animation: particle-explode 0.6s ease-out forwards;
}

.game-start-button .particle-dot:nth-child(1) {
  top: 50%;
  left: 50%;
  animation-delay: 0s;
}

.game-start-button .particle-dot:nth-child(2) {
  top: 50%;
  left: 50%;
  animation-delay: 0.05s;
}

.game-start-button .particle-dot:nth-child(3) {
  top: 50%;
  left: 50%;
  animation-delay: 0.1s;
}

.game-start-button .particle-dot:nth-child(4) {
  top: 50%;
  left: 50%;
  animation-delay: 0.15s;
}

.game-start-button .particle-dot:nth-child(5) {
  top: 50%;
  left: 50%;
  animation-delay: 0s;
}

.game-start-button .particle-dot:nth-child(6) {
  top: 50%;
  left: 50%;
  animation-delay: 0.05s;
}

.game-start-button .particle-dot:nth-child(7) {
  top: 50%;
  left: 50%;
  animation-delay: 0.1s;
}

.game-start-button .particle-dot:nth-child(8) {
  top: 50%;
  left: 50%;
  animation-delay: 0.15s;
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(var(--x, 50px), var(--y, -50px)) scale(0);
  }
}

.game-start-button .particle-dot:nth-child(1) {
  --x: 40px;
  --y: -40px;
}

.game-start-button .particle-dot:nth-child(2) {
  --x: -40px;
  --y: -40px;
}

.game-start-button .particle-dot:nth-child(3) {
  --x: 40px;
  --y: 40px;
}

.game-start-button .particle-dot:nth-child(4) {
  --x: -40px;
  --y: 40px;
}

.game-start-button .particle-dot:nth-child(5) {
  --x: 50px;
  --y: 0;
}

.game-start-button .particle-dot:nth-child(6) {
  --x: -50px;
  --y: 0;
}

.game-start-button .particle-dot:nth-child(7) {
  --x: 0;
  --y: -50px;
}

.game-start-button .particle-dot:nth-child(8) {
  --x: 0;
  --y: 50px;
}

.game-start-button:not(:disabled):hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 40px var(--primary-glow);
}

.game-start-button:not(:disabled):hover .button-bg {
  transform: scale(1.05);
}

.game-start-button:not(:disabled):active {
  transform: translateY(-1px) scale(0.98);
}

.game-start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.theme-selection {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  max-width: 1200px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.theme-list-move {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-list-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: calc(var(--index) * 0.08s);
}

.theme-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
  position: absolute;
}

.theme-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.85) rotateX(-15deg);
}

.theme-list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.85) rotateX(15deg);
}



.back-button::before {
  content: '←';
  position: absolute;
  left: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
}

.back-button:hover::before {
  opacity: 1;
  transform: translateX(0);
}

.back-button:hover {
  background: var(--card-bg);
  border-color: var(--accent-color);
  transform: translateX(-4px);
  padding-left: 2.5rem;
}

.back-button:active {
  transform: translateX(-2px) scale(0.98);
  transition-duration: 0.1s;
}

.section-title {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-weight: 700;
}

/* .themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
} */
.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
  justify-items: stretch;
  grid-auto-rows: 1fr;
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  padding: 0.5rem 0;
}

.theme-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding: 2rem 1.5rem;
  height: 100%;
  box-sizing: border-box;

  word-break: break-word;
  /* 🔹 يكسر الكلمة الطويلة داخل حدود الكرت */
  overflow-wrap: break-word;
  /* 🔹 نفس الفكرة لكن للمتصفحات الحديثة */
  text-align: center;
  /* 🔹 توسيط النص */
}



@keyframes theme-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.theme-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-card:hover::before,
.theme-card.selected::before {
  opacity: 0.1;
}

.theme-card:hover,
.theme-card.selected {
  border-color: var(--accent-color);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px var(--primary-glow);
}

.theme-card:active {
  transform: translateY(-2px) scale(0.98);
  transition-duration: 0.1s;
}

.theme-icon {
  margin-bottom: 1rem;
}

.theme-name {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* .theme-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
} */
.theme-description {
  white-space: normal;
  /* 🔹 يسمح للنص بأنه يلف داخل الكرت */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* 🔹 يحد النص لـ 3 أسطر */
  -webkit-box-orient: vertical;
}

.difficulty-section {
  margin-top: 2rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-top: 2px solid var(--border-color);
  width: 100%;
  max-width: 1200px;
}

.difficulty-section-enter-active {
  animation: sectionSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.difficulty-section-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.difficulty-section-enter-from {
  opacity: 0;
}

.difficulty-section-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes sectionSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.level-card {
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.level-card-inner {
  position: relative;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.01));
  backdrop-filter: blur(16px);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.08);
  min-height: 280px;
  max-height: 280px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.level-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--level-color), transparent 60%);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  filter: blur(50px);
}

.level-border-glow {
  position: absolute;
  inset: -2px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--level-color), var(--level-color-alt));
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;
}



.level-badge-wrapper {
  position: relative;
  display: inline-flex;
}

.badge-glow-pulse {
  position: absolute;
  inset: -8px;
  background: var(--level-color);
  border-radius: 16px;
  opacity: 0;
  filter: blur(16px);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {

  0%,
  100% {
    opacity: 0;
    transform: scale(0.95);
  }

  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.level-badge {
  position: relative;
  display: inline-block;
  padding: 0.7rem 1.75rem;
  background: linear-gradient(135deg, var(--level-color), var(--level-color-dark));
  color: white;
  font-weight: 700;
  border-radius: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow:
    0 3px 12px var(--level-glow),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* .level-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
} */

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-align: center;
}

.stat-item::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--level-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}


.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04));
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  stroke: var(--level-color);
  transition: all 0.3s ease;
}

.level-card:hover .level-card-inner {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 10px 28px var(--level-glow);
  border-color: var(--level-color);
}

.level-card:hover .level-badge {
  transform: scale(1.04);
  box-shadow: 0 3px 10px var(--level-glow);
}

.level-card:hover .stat-item {
  border-color: rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.02));
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  text-align: center;
}

.stat-label {


  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.6;
}

.stat-value {

  font-weight: 800;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--level-color), var(--level-color-alt));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.stat-divider {
  display: none;
}





.level-corner-accent {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid var(--level-color);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.level-corner-accent.top-left {
  top: 12px;
  right: 12px;
  border-bottom: none;
  border-left: none;
  border-top-right-radius: 8px;
}

.level-corner-accent.top-right {
  top: 12px;
  left: 12px;
  border-bottom: none;
  border-right: none;
  border-top-left-radius: 8px;
}

.level-corner-accent.bottom-left {
  bottom: 12px;
  right: 12px;
  border-top: none;
  border-left: none;
  border-bottom-right-radius: 8px;
}

.level-corner-accent.bottom-right {
  bottom: 12px;
  left: 12px;
  border-top: none;
  border-right: none;
  border-bottom-left-radius: 8px;
}

.level-card:hover .level-bg-glow {
  opacity: 0.1;
}

.level-card:hover .level-border-glow {
  opacity: 0.2;
}

.level-card:hover .stat-item::before {
  opacity: 1;
}

.level-card:hover .stat-icon {
  transform: scale(1.08);
  box-shadow: 0 3px 10px var(--level-glow);
}

.level-card:hover .level-hover-indicator {
  opacity: 1;
  transform: translateY(0);
}

.level-card:hover .level-hover-indicator svg {
  transform: translateX(2px);
}

.level-card:hover .level-corner-accent {
  opacity: 0.8;
}

.level-card.active .level-card-inner {
  transform: translateY(-4px) scale(1.01);
  border-color: var(--level-color);
  box-shadow:
    0 16px 48px var(--level-glow),
    0 0 0 1.5px var(--level-color),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.2);
}

.level-card.active .level-bg-glow {
  opacity: 0.15;
  animation: active-pulse 3s ease-in-out infinite;
}

@keyframes active-pulse {

  0%,
  100% {
    opacity: 0.15;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.22;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

.level-card.active .level-border-glow {
  opacity: 0.35;
  animation: border-rotate 8s linear infinite;
}

@keyframes border-rotate {
  0% {
    filter: hue-rotate(0deg);
  }

  100% {
    filter: hue-rotate(360deg);
  }
}

.level-card.active .level-badge {
  transform: scale(1.05);
  box-shadow:
    0 6px 16px var(--level-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.level-card.active .stat-item {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.03));
  border-color: var(--level-color);
}

.level-card.active .stat-item::before {
  opacity: 1;
  width: 3px;
}

.level-card.active .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--level-glow);
}

.level-card.active .level-hover-indicator {
  opacity: 1;
  transform: translateY(0);
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.85));
  color: var(--level-color-dark);
  font-weight: 800;
}

.level-card.active .level-corner-accent {
  opacity: 1;
  width: 22px;
  height: 22px;
  border-width: 2.5px;
}

.level-card:active .level-card-inner {
  transform: translateY(-2px) scale(0.99);
  transition-duration: 0.1s;
}

.difficulty-list-move {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.difficulty-list-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: calc(var(--index) * 0.1s);
}

.difficulty-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
  position: absolute;
}

.difficulty-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.difficulty-list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.level-card.easy {
  --level-color: #10b981;
  --level-color-dark: #059669;
  --level-color-light: #34d399;
  --level-color-alt: #06b6d4;
  --level-glow: rgba(16, 185, 129, 0.25);
}

.level-card.medium {
  --level-color: #f59e0b;
  --level-color-dark: #d97706;
  --level-color-light: #fbbf24;
  --level-color-alt: #fb923c;
  --level-glow: rgba(245, 158, 11, 0.25);
}

.level-card.hard {
  --level-color: #ef4444;
  --level-color-dark: #dc2626;
  --level-color-light: #f87171;
  --level-color-alt: #fb7185;
  --level-glow: rgba(239, 68, 68, 0.25);
}

.primary-button {
  padding: 1rem 2rem;

  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin: 2rem auto;
  display: block;
  min-width: 200px;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-button:not(:disabled):hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px var(--primary-glow);
}

.primary-button:not(:disabled):active {
  transform: translateY(-1px) scale(0.98);
  transition-duration: 0.1s;
}

.primary-button.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 4px 12px var(--primary-glow);
  }

  50% {
    box-shadow: 0 8px 24px var(--primary-glow);
    transform: scale(1.02);
  }
}

.start-button-enter-active {
  animation: buttonSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-button-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.start-button-enter-from {
  opacity: 0;
}

.start-button-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

@keyframes buttonSlideUp {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.secondary-button {
  padding: 0.875rem 1.75rem;

  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  border-color: var(--accent-color);
  background: var(--card-bg);
  transform: translateY(-2px);
}

.secondary-button:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.leaderboard-button {
  margin-top: 2rem;
}

[data-animations="disabled"] .theme-card,
[data-animations="disabled"] .theme-selection,
[data-animations="disabled"] .logo-container,
[data-animations="disabled"] .welcome-card,
[data-animations="disabled"] .auth-card,
[data-animations="disabled"] .welcome-icon,
[data-animations="disabled"] .auth-icon,
[data-animations="disabled"] .welcome-title,
[data-animations="disabled"] .auth-title,
[data-animations="disabled"] .welcome-subtitle,
[data-animations="disabled"] .auth-description,
[data-animations="disabled"] .input-wrapper,
[data-animations="disabled"] .continue-button,
[data-animations="disabled"] .game-start-button,
[data-animations="disabled"] .divider-wrapper,
[data-animations="disabled"] .google-button,
[data-animations="disabled"] .logout-button {
  animation: none !important;
}

[data-animations="disabled"] .welcome-backdrop,
[data-animations="disabled"] .auth-backdrop,
[data-animations="disabled"] .welcome-icon-glow,
[data-animations="disabled"] .auth-glow-orb,
[data-animations="disabled"] .welcome-particles .particle {
  animation: none !important;
}

[data-animations="disabled"] .level-card,
[data-animations="disabled"] .level-bg-glow,
[data-animations="disabled"] .level-border-glow,
[data-animations="disabled"] .level-badge,
[data-animations="disabled"] .badge-glow-pulse,
[data-animations="disabled"] .back-button::before {
  animation: none !important;
}

@media (max-width: 768px) {
  .difficulty-buttons {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .level-card-inner {
    padding: 2rem 1.75rem;
    min-height: 250px;
    max-height: 250px;
    gap: 1.25rem;
  }

  .level-badge {
    padding: 0.55rem 1.4rem;
    font-size: clamp(0.9rem, 0.45vw + 0.8rem, 1.05rem);
  }

  .stat-item {
    padding: 1rem 1.2rem;
    gap: 0.65rem;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
  }

  .stat-icon svg {
    width: 21px;
    height: 21px;
  }

  .stat-label {
    font-size: clamp(0.8rem, 0.35vw + 0.7rem, 0.925rem);
  }

  .stat-value {
    font-size: clamp(0.925rem, 0.45vw + 0.8rem, 1.075rem);
  }





  .level-hover-indicator {
    padding: 0.7rem 1.05rem;
    font-size: clamp(0.85rem, 0.4vw + 0.75rem, 1rem);
  }

  .themes-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
    justify-items: stretch !important;
    max-width: 100% !important;
    padding: 0.5rem 0 !important;
  }

  .theme-card {
    min-height: 180px;
    max-width: 100%;
    padding: 1.75rem 1.5rem;
  }


}

@media (max-width: 640px) {
  .landing-page {
    padding: 1.25rem 0.875rem;
  }

  .hero-section {
    margin-bottom: 1rem;
  }

  .game-title {
    font-size: clamp(1.65rem, 2.2vw + 0.85rem, 2.25rem);
    letter-spacing: -0.5px;
  }

  .game-subtitle {
    font-size: clamp(0.875rem, 0.5vw + 0.75rem, 1.05rem);
    margin-top: 0.375rem;
  }

  .themes-grid {
    grid-template-columns: 1fr;
    gap: 1.15rem;
  }

  .theme-card {
    padding: 1.65rem 1.35rem;
  }

  .theme-icon {
    font-size: clamp(2.25rem, 1.5vw + 1.6rem, 3rem);
  }

  .theme-name {
    font-size: clamp(1.2rem, 1vw + 0.85rem, 1.5rem);
  }

  .theme-description {
    font-size: clamp(0.875rem, 0.4vw + 0.75rem, 1rem);
  }

  .difficulty-buttons {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .level-card-inner {
    padding: 1.65rem 1.35rem;
    min-height: 220px;
    max-height: 220px;
    gap: 1rem;
  }

  .level-badge {
    padding: 0.5rem 1.25rem;
    font-size: clamp(0.85rem, 0.4vw + 0.75rem, 1rem);
  }

  .stat-item {
    padding: 0.875rem 1.1rem;
    gap: 0.6rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-label {
    font-size: clamp(0.75rem, 0.3vw + 0.65rem, 0.875rem);
  }

  .stat-value {
    font-size: clamp(0.875rem, 0.4vw + 0.75rem, 1rem);
  }

  .level-hover-indicator {
    padding: 0.65rem 0.95rem;
    font-size: clamp(0.8rem, 0.35vw + 0.7rem, 0.95rem);
  }

  .level-hover-indicator svg {
    width: 15px;
    height: 15px;
  }

  .level-corner-accent {
    width: 15px;
    height: 15px;
  }

  .level-card.active .level-corner-accent {
    width: 18px;
    height: 18px;
  }

  .welcome-card,
  .auth-card {
    padding: 1.75rem 1.35rem;
  }

  .welcome-icon {
    font-size: clamp(2.5rem, 1.5vw + 1.8rem, 3.25rem);
  }

  .welcome-title {
    font-size: clamp(1.5rem, 1.2vw + 1rem, 2rem);
  }

  .welcome-subtitle {
    font-size: clamp(0.95rem, 0.5vw + 0.8rem, 1.15rem);
  }

  .logout-button {
    top: 1rem;
    left: 1rem;
    padding: 0.575rem 0.95rem;
  }

  .logout-button .logout-text {
    display: none;
  }

  .logout-button .logout-icon svg {
    width: 19px;
    height: 19px;
  }

  .accordion-container {
    max-width: 100%;
    margin: 1.35rem auto 2.25rem;
  }

  .accordion-header {
    padding: 0.95rem 1.15rem;
  }

  .accordion-title {
    font-size: clamp(1rem, 0.6vw + 0.85rem, 1.25rem);
  }

  .accordion-icon {
    width: 28px;
    height: 28px;
  }

  .accordion-icon svg {
    width: 17px;
    height: 17px;
  }

  .accordion-body {
    padding: 1.15rem;
    line-height: 1.65;
    font-size: clamp(0.9rem, 0.4vw + 0.8rem, 1.05rem);
  }

  .game-input {
    padding: 1rem 1.15rem;
    font-size: clamp(0.95rem, 0.4vw + 0.85rem, 1.1rem);
  }

  .continue-button,
  .game-start-button {
    padding: 1.1rem 1.75rem;
    font-size: clamp(1rem, 0.5vw + 0.85rem, 1.2rem);
  }
}

@media (max-width: 480px) {
  .landing-page {
    padding: 1rem 0.75rem;
  }

  .game-title {
    font-size: clamp(1.45rem, 2vw + 0.75rem, 2rem);
  }

  .game-subtitle {
    font-size: clamp(0.8rem, 0.45vw + 0.7rem, 0.95rem);
  }

  .themes-grid {
    gap: 1rem;
  }

  .theme-card {
    padding: 1.5rem 1.2rem;
  }

  .theme-icon {
    font-size: clamp(2rem, 1.3vw + 1.4rem, 2.75rem);
  }

  .theme-name {
    font-size: clamp(1.1rem, 0.85vw + 0.75rem, 1.35rem);
  }

  .theme-description {
    font-size: clamp(0.8rem, 0.35vw + 0.7rem, 0.95rem);
  }

  .difficulty-buttons {
    gap: 1.1rem;
  }

  .level-card-inner {
    padding: 1.5rem 1.2rem;
    min-height: 200px;
    max-height: 200px;
    gap: 0.875rem;
  }

  .level-badge {
    padding: 0.45rem 1.1rem;
    font-size: clamp(0.8rem, 0.35vw + 0.7rem, 0.95rem);
  }

  .stat-item {
    padding: 0.8rem 1rem;
    gap: 0.55rem;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
  }

  .stat-icon svg {
    width: 19px;
    height: 19px;
  }

  .welcome-card,
  .auth-card {
    padding: 1.5rem 1.2rem;
  }

  .welcome-icon {
    font-size: clamp(2.25rem, 1.3vw + 1.6rem, 3rem);
  }

  .welcome-title {
    font-size: clamp(1.35rem, 1vw + 0.9rem, 1.75rem);
  }

  .accordion-header {
    padding: 0.875rem 1rem;
  }

  .accordion-body {
    padding: 1rem;
    font-size: clamp(0.85rem, 0.35vw + 0.75rem, 1rem);
  }

  .game-input {
    padding: 0.95rem 1.05rem;
    font-size: clamp(0.9rem, 0.35vw + 0.8rem, 1.05rem);
  }

  .continue-button,
  .game-start-button {
    padding: 1rem 1.5rem;
    font-size: clamp(0.95rem, 0.45vw + 0.8rem, 1.15rem);
  }
}

@media (max-width: 360px) {
  .landing-page {
    padding: 0.875rem 0.625rem;
  }

  .game-title {
    font-size: clamp(1.3rem, 1.8vw + 0.65rem, 1.85rem);
  }

  .game-subtitle {
    font-size: clamp(0.75rem, 0.4vw + 0.65rem, 0.9rem);
  }

  .theme-card {
    padding: 1.35rem 1.1rem;
  }

  .theme-icon {
    font-size: clamp(1.85rem, 1.2vw + 1.3rem, 2.5rem);
  }

  .theme-name {
    font-size: clamp(1rem, 0.75vw + 0.7rem, 1.25rem);
  }

  .theme-description {
    font-size: clamp(0.75rem, 0.3vw + 0.65rem, 0.9rem);
  }

  .level-card-inner {
    padding: 1.35rem 1.1rem;
    min-height: 185px;
    max-height: 185px;
  }

  .level-badge {
    padding: 0.4rem 1rem;
    font-size: clamp(0.75rem, 0.3vw + 0.65rem, 0.9rem);
  }

  .stat-item {
    padding: 0.75rem 0.95rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-icon svg {
    width: 18px;
    height: 18px;
  }

  .welcome-card,
  .auth-card {
    padding: 1.35rem 1.1rem;
  }

  .accordion-header {
    padding: 0.8rem 0.95rem;
  }

  .accordion-body {
    padding: 0.95rem;
  }

  .game-input {
    padding: 0.875rem 1rem;
  }

  .continue-button,
  .game-start-button {
    padding: 0.95rem 1.35rem;
  }
}

/* 🔹 اجعل الاتجاه من اليمين لليسار */
.landing-page {
  direction: rtl;
}

/* 🔹 النصوص تبدأ من اليمين */
.difficulty-info {
  text-align: right;
}


.section-title,
.theme-name,
.theme-description {
  text-align: right;
}

.back-button {
  float: left;
}

.themes-grid {
  direction: rtl;
}

.difficulty-buttons {
  justify-content: center;
}


.section-title,
.theme-name,
.theme-description {
  text-align: right;
}

.back-button {
  margin-bottom: 2rem;
}

.themes-grid,
.difficulty-buttons {
  direction: rtl;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.level-card {
  direction: rtl;
}

.detail-row {
  direction: rtl;
}

.hero-section {
  text-align: center;
}

@media (max-width: 640px) {
  .landing-page {
    padding: 1.25rem 0.875rem;
    padding-bottom: 3.5rem;
  }

  .themes-grid {
    grid-template-columns: 1fr;
    gap: 1.15rem;
  }

  .difficulty-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .difficulty-section {
    padding-bottom: 2.75rem;
  }

  .section-title {
    font-size: clamp(1.5rem, 1.2vw + 1rem, 2rem);
  }
}

.themes-scroll-container {
  position: relative;
}

.themes-wrapper {
  width: 100%;
}



.divider-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  animation: button-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
}

.divider-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.google-button {
  position: relative;
  width: 100%;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: button-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-button .google-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.google-button .button-text {
  font-weight: 600;
  color: #1a1a1a;
  position: relative;
  z-index: 2;
}

.google-button .google-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.google-button:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.google-button:hover .google-icon {
  transform: scale(1.1) rotate(5deg);
}

.google-button:hover .google-shimmer {
  transform: translateX(100%);
}

.google-button:active {
  transform: translateY(0) scale(0.98);
}

/* 🎯 تحسين عرض الإحصاءات داخل الكرت */
/* 🎯 عرض بسيط وواضح لمعلومات المستوى */
.level-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.25rem 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
  line-height: 1.6;
  gap: 1.25rem;
  /* 🔹 مسافة أوضح بين المفتاح والقيمة */
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-key {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  letter-spacing: 0.3px;
  white-space: nowrap;
}


.stat-value {
  font-weight: 700;
  background: linear-gradient(135deg, var(--level-color), var(--level-color-alt));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* 🔹 أصغر شوي من قبل */
  line-height: 1.4;
  flex-shrink: 0;
  text-align: left;
}

/* Shimmer Loading Styles */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }

  100% {
    background-position: 1000px 0;
  }
}

.shimmer-card {
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

.shimmer-card .shimmer-icon,
.shimmer-card .shimmer-title,
.shimmer-card .shimmer-description {
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 8px;
}

.shimmer-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.shimmer-title {
  width: 70%;
  height: 24px;
  margin: 0 auto 0.5rem;
}

.shimmer-description {
  width: 90%;
  height: 16px;
  margin: 0 auto;
}

.shimmer-level-card {
  pointer-events: none !important;
  cursor: default !important;
}

.shimmer-level-card .level-card-inner {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
}

.shimmer-badge {
  width: 120px;
  height: 40px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 12px;
  margin: 0 auto 1.5rem;
}

.shimmer-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.shimmer-stat-line {
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 8px;
}

/* Full Page Loader */
.full-page-loader {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.95));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  animation: fadeInUp 0.6s ease;
}

.loader-content .orb-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-content .orb {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow: 0 0 40px var(--primary-glow),
    0 0 80px var(--primary-glow),
    inset 0 0 30px rgba(255, 255, 255, 0.3);
  animation: orbFloat 3s ease-in-out infinite;
}

.loader-content .orb-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 4px solid var(--accent-color);
  border-radius: 50%;
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 2;
  animation: orbRingRotate 2s linear infinite;
}

.loader-content .orb-pulse {
  position: absolute;
  width: 120px;
  height: 120px;
  border: 3px solid var(--accent-color);
  border-radius: 50%;
  z-index: 1;
  animation: orbPulse 2s ease-out infinite;
  opacity: 0;
}

.loader-title {
  font-weight: 800;
  color: white;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
  animation: textFade 2s ease-in-out infinite;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

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

@media (max-width: 768px) {
  .full-page-loader {
    padding: 1.5rem;
  }

  .loader-content {
    gap: 2rem;
  }

  .loader-content .orb-wrapper {
    width: 100px;
    height: 100px;
  }

  .loader-content .orb {
    width: 50px;
    height: 50px;
  }

  .loader-content .orb-ring {
    width: 75px;
    height: 75px;
  }

  .loader-content .orb-pulse {
    width: 90px;
    height: 90px;
  }

  .loader-title {
    font-size: clamp(1.5rem, 1.2vw + 1rem, 2rem);
    max-width: 500px;
  }
}

@media (max-width: 640px) {
  .loader-content .orb-wrapper {
    width: 90px;
    height: 90px;
  }

  .loader-content .orb {
    width: 45px;
    height: 45px;
  }

  .loader-content .orb-ring {
    width: 68px;
    height: 68px;
  }

  .loader-content .orb-pulse {
    width: 82px;
    height: 82px;
  }

  .loader-title {
    font-size: clamp(1.35rem, 1vw + 0.9rem, 1.8rem);
    max-width: 450px;
  }
}

@media (max-width: 480px) {
  .loader-content .orb-wrapper {
    width: 80px;
    height: 80px;
  }

  .loader-content .orb {
    width: 40px;
    height: 40px;
  }

  .loader-content .orb-ring {
    width: 60px;
    height: 60px;
  }

  .loader-content .orb-pulse {
    width: 75px;
    height: 75px;
  }

  .loader-title {
    font-size: clamp(1.2rem, 0.85vw + 0.8rem, 1.6rem);
    max-width: 400px;
  }
}

.level-hint {
  text-align: center;
  color: #ccc;
  margin-top: 6px;
  margin-bottom: 10px;
  line-height: 1.4;
  transition: opacity 0.3s ease;
}

.level-top-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* الشارة على طرف، الأيقونة على الطرف الآخر */
  position: relative;
  gap: 12px;
}

/* تثبيت الأيقونة في أقصى الجهة المقابلة للعنوان */
.info-anchor {
  position: relative;
  margin-inline-start: auto;
  /* يدزها لأقصى inline-end */
  display: inline-flex;
  align-items: center;
}

.info-icon-btn {
  inline-size: 28px;
  block-size: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid var(--info-ring, #e5e7eb);
  background: #fff;
  color: #334155;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}

.info-icon-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(2, 6, 23, .08);
  border-color: #cbd5e1;
}

.info-icon-btn:active {
  transform: scale(.96);
}

/* Tooltip عائم وخارج الكارد، أبيض/مُتباين + سهم */
.level-tooltip {
  position: absolute;
  inset-block-start: calc(100% + 10px);
  /* تحت الأيقونة */
  inset-inline-end: 0;
  /* محاذاة مع طرف الأيقونة */
  z-index: 50;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(15, 23, 42, .12),
    0 2px 8px rgba(15, 23, 42, .06);
  padding: 14px 40px 14px 14px;
  /* مساحة لزر الإغلاق */
  min-inline-size: 240px;
  max-inline-size: min(320px, 80vw);
  transform-origin: top right;
}

/* السهم */
.level-tooltip::before {
  content: "";
  position: absolute;
  inset-inline-end: 12px;
  inset-block-start: -6px;
  inline-size: 12px;
  block-size: 12px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb;
  transform: rotate(45deg);
}

/* محتوى داخلي */
.tooltip-title {
  margin: 0 0 6px 0;
  font-weight: 700;
  color: #0f172a;
}

.tooltip-text {
  margin: 0;
  line-height: 1.55;
  color: #334155;
}

/* زر الإغلاق في الزاوية */
.tooltip-close {
  position: absolute;
  inset-inline-end: 8px;
  inset-block-start: 8px;
  inline-size: 26px;
  block-size: 26px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, transform .1s ease;
}

.tooltip-close:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.tooltip-close:active {
  transform: scale(.94);
}

/* أنيميشن الظهور/الإخفاء */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.96);
}

/* تأكد إن الكارد ما يقصّ البوبوفر */
.level-card-inner {
  overflow: visible;
  position: relative;
}

/* تحكم لوني سريع لو الكارد فاتح جدًا أو غامق:
   لديك حرية تعديل المتغيرات حسب ثيمك */
:root {
  --info-ring: #e5e7eb;
}


@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes tooltipFadeOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
}

@media (max-width: 768px) {
  .info-icon-btn {
    width: 28px;
    height: 28px;
  }

  .info-icon-btn svg {
    width: 14px;
    height: 14px;
  }

  .level-tooltip {
    min-width: 280px;
    padding: 1.5rem 1.25rem;
    border-radius: 18px;
  }



  .tooltip-text {
    line-height: 1.65;
  }

  .tooltip-close {
    width: 28px;
    height: 28px;
    top: 8px;
    left: 8px;
  }

  .tooltip-close svg {
    width: 12px;
    height: 12px;
  }
}

/* font-size */
.stat-value {
  font-size: 0.8rem;
}

.tooltip-title {
  font-size: 1rem;
}

.auth-title {
  font-size: 1.5rem;
}

.welcome-name {
  font-size: 2.5rem;
}

.button-text {
  font-weight: bold !important;
}

@media (max-width: 768px) {
  .level-stats {
    margin-top: 0px;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .tooltip-title {
    font-size: 1.3rem;
  }

  .welcome-title {
    font-size: 3rem;
  }

  .welcome-name {
    font-size: 2.5rem;
  }

  .button-text {
    font-size: 1.2rem;

  }

  .primary-button {
    font-size: 1.5rem;
  }
}

.welcome-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.left-side {
  flex: 0 0 60%;   
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.right-side {
  flex: 0 0 40%;   
}



@media (max-width: 768px) {
  .welcome-layout {
    flex-direction: column;
  }

  .left-side, .right-side {
    flex: 1 1 100%;
  }
}

@keyframes tooltipFadeOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
}

@media (max-width: 768px) {
  .info-icon-btn {
    width: 28px;
    height: 28px;
  }

  .info-icon-btn svg {
    width: 14px;
    height: 14px;
  }

  .level-tooltip {
    min-width: 280px;
    padding: 1.5rem 1.25rem;
    border-radius: 18px;
  }



  .tooltip-text {
    line-height: 1.65;
  }

  .tooltip-close {
    width: 28px;
    height: 28px;
    top: 8px;
    left: 8px;
  }

  .tooltip-close svg {
    width: 12px;
    height: 12px;
  }
}
/* font-size */
.stat-value{
  font-size: 0.8rem;
}
.tooltip-title{
  font-size: 1rem;
}


@media (max-width: 768px) {
  .level-stats{
    margin-top: 0px;
  }
  .stat-value{
    font-size: 1.2rem;
  }
  
  .tooltip-title{
    font-size: 1.3rem;
  }
}
</style>
