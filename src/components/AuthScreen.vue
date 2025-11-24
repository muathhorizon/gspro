<template>
  <div class="auth-screen">
    <div class="auth-left">
      <div class="visual-bg"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="auth-content">
        <div class="brand-section">
          <div class="brand-icon">
            <img src="/images/logo.png" alt="Guess Logo" class="logo-img" />
          </div>

          <h1 class="brand-title gradient-title">{{ $t('gameTitle') }}</h1>
          <p class="brand-subtitle">{{ $t('gameSubtitle') }}</p>
          <div class="game-explanation">

            <h2 class="gradient-title">
              <span class="title-icon">ℹ️</span>
              شرح اللعبة
              <span class="title-accent"></span>
            </h2>

            <p class="explanation-text">
              لعبة التخمين هي لعبة تعتمد على الذكاء الاصطناعي. يقوم الكمبيوتر باختيار شخصية
              أو كيان في عقله بناءً على الموضوع الذي اخترته مثل:
              <strong>الرياضة، الألعاب، الأفلام…</strong>
            </p>

            <p class="explanation-text">
              بعد ذلك ستظهر لك مجموعة من التصنيفات.
              في كل تصنيف سيظهر لك <strong>سؤالان فقط</strong> لتختار أحدهما،
              والذكاء الاصطناعي سيُجيب كما لو كان هو تلك الشخصية فعلاً.
            </p>

            <p class="explanation-text">
              مهمتك هي أن تخمّن الشخصية أو الكيان الذي يفكر به الذكاء الاصطناعي
              <strong>قبل انتهاء الوقت أو عدد المحاولات المتاحة.</strong>
            </p>

          </div>

        </div>
      </div>
    </div>

    <div class="auth-right">
      <!-- Floating Logo on the Right Side -->
      <div class="floating-logo-container">
        <div class="floating-logo">
          <img src="/images/logo.png" alt="Logo" class="logo-float" />
        </div>
      </div>

      <div class="auth-card">
  <div v-if="!showOtp" class="auth-form">
  <h2 class="form-title">{{ welcomeMessage }}</h2>
  <p class="form-subtitle">{{ subtitleMessage }}</p>

  <!-- NAME INPUT -->
  <div class="input-group">
    <label class="input-label">{{ $t('enterName') }}</label>

    <div class="input-icon-wrapper">
      <input
        v-model="playerName"
        type="text"
        class="form-input input-with-icon"
        :placeholder="$t('enterName')"
        @keyup.enter="handleLogin"
      />

      <span class="input-icon">
        <!-- USER SVG -->
        <svg class="field-icon-svg" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M4 20C4 15.6 7.6 13 12 13C16.4 13 20 15.6 20 20"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round"/>
        </svg>
      </span>
    </div>
  </div>

  <!-- EMAIL INPUT -->
  <div class="input-group">
    <label class="input-label">{{ $t('enterEmail') }}</label>

    <div class="input-icon-wrapper">
      <input
        v-model="playerEmail"
        type="email"
        class="form-input input-with-icon"
        :placeholder="$t('enterEmail')"
        @keyup.enter="handleLogin"
      />

      <span class="input-icon">
        <!-- MAIL SVG -->
        <svg class="field-icon-svg" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2"
                stroke="currentColor" stroke-width="2"/>
          <path d="M3 7L12 13L21 7"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round"/>
        </svg>
      </span>
    </div>
  </div>

  <!-- SUBMIT BUTTON -->
  <button @click="handleLogin" class="submit-button" :disabled="!canSubmit || isLoading">
    <span v-if="!isLoading" class="button-text">{{ $t('startManually') }}</span>
    <span v-else class="button-loader">
      <span class="loader-spinner"></span>
      <span class="loader-text">{{ $t('verifying') }}</span>
    </span>
  </button>

  <!-- GOOGLE LOGIN BUTTON -->
  <button class="google-button" disabled>
    <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span class="google-text">{{ $t('loginWithGoogle') }}</span>
  </button>
</div>


        <OtpVerification v-else :email="playerEmail" @verify="handleVerifyOtp" @resend="handleResendOtp"
          @editEmail="showOtp = false" @success="handleOtpSuccess" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import OtpVerification from './OtpVerification.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const playerName = ref('');
const playerEmail = ref('');
const showOtp = ref(false);
const isLoading = ref(false);

const canSubmit = computed(() => {
  return playerName.value.trim() && playerEmail.value.trim();
});

const welcomeMessage = computed(() => {
  return showOtp.value ? t('otpTitle') : t('startChallenge');
});

const subtitleMessage = computed(() => {
  return showOtp.value ? t('subtitle') : t('gameSubtitle');
});

async function handleLogin() {
  if (!canSubmit.value || isLoading.value) return;

  isLoading.value = true;

  try {
    await authStore.sendOtp(playerEmail.value);
    showOtp.value = true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
  } finally {
    isLoading.value = false;
  }
}

async function handleVerifyOtp(otp: string) {
  try {
    await authStore.verifyOtp(playerEmail.value, otp);
  } catch (error) {
    console.error('OTP verification failed:', error);
    throw error;
  }
}

async function handleResendOtp() {
  try {
    await authStore.resendOtp(playerEmail.value);
  } catch (error) {
    console.error('Failed to resend OTP:', error);
  }
}

async function handleOtpSuccess() {
  const success = await authStore.loginManual(playerName.value, playerEmail.value)
  if (success) {
    router.push({ name: 'home' }) 
  }
}

const emit = defineEmits<{
  authenticated: [];
}>();
</script>

<style scoped>
.auth-screen {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: var(--bg-primary);
  overflow: hidden;
}

.auth-left {
  flex: 1;
  min-width: 60%;
  position: relative;
  display: flex;
  align-items: center;
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
  animation: float 20s ease-in-out infinite;
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
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {

  0%,
  100% {
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
  animation: morph 15s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: 20%;
  left: 10%;
  animation: morph 20s ease-in-out infinite reverse;
}

.shape-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  left: 40%;
  animation: morph 18s ease-in-out infinite;
}

@keyframes morph {

  0%,
  100% {
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

.auth-content {
  position: relative;
  z-index: 2;
  text-align: center;
  animation: slide-in-left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.brand-icon {
  font-size: 5rem;
  animation: bounce-in 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 10px 30px var(--primary-glow));
}

.game-explanation {
  margin-top: 2.2rem;
  max-width: 520px;
  animation: fadeIn 0.7s ease forwards;
}

.gradient-title{
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(1.6rem, 1.4vw + 1.1rem, 2rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.4rem;
  background: linear-gradient(90deg, #F8C900, #fff);
  -webkit-background-clip: text;
  color: transparent;
}
.explanation-title {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(1.6rem, 1.4vw + 1.1rem, 2rem);
  font-weight: 800;
  color: #fff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.4rem;
  background: linear-gradient(90deg, #F8C900, #fff);
  -webkit-background-clip: text;
  color: transparent;
}

/* Icon */
.title-icon {
  font-size: 2rem;
  display: inline-block;
  animation: popIn .4s ease;
  color: #F8C900;
}

/* Accent bar under the title */
.title-accent {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #F8C900, rgba(248, 201, 0, 0.45));
  border-radius: 4px;
  animation: slideIn 0.6s ease forwards;
}

/* Animations */
@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }

  to {
    width: 60px;
    opacity: 1;
  }
}



.explanation-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(1.05rem, 0.6vw + 0.95rem, 1.25rem);
  line-height: 1.8;
  text-align: justify;
  margin-bottom: 1rem;
  font-weight: 400;
}

/* Fade Animation */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}



@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }

  60% {
    transform: scale(1.2) rotate(20deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 900;
  /* background: linear-gradient(135deg, var(--accent-color), var()); */
  -webkit-background-clip: text;
  /* -webkit-text-fill-color: transparent; */
  background-clip: text;
  margin: 0;
  animation: fade-in 0.8s ease 0.2s backwards;


}

.brand-subtitle {
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 500;
  max-width: 500px;
  animation: fade-in 0.8s ease 0.4s backwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-right {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--card-bg);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 3;
}

.auth-card {
  width: 100%;
  max-width: 550px;
  animation: slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  animation: fade-in 0.6s ease 0.2s backwards;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: -1rem 0 0 0;
  animation: fade-in 0.6s ease 0.3s backwards;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fade-in 0.6s ease backwards;
}

.input-group:nth-child(3) {
  animation-delay: 0.4s;
}

.input-group:nth-child(4) {
  animation-delay: 0.5s;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  padding: 1rem 1.25rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.form-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
  transform: translateY(-2px);
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

.submit-button {
  padding: 1.25rem 2rem;
  background: var(--bg-logo-secondary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fade-in 0.6s ease 0.6s backwards;
}

.submit-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--primary-glow);
}

.submit-button:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.submit-button:active:not(:disabled) {
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 1;
  cursor: not-allowed;
  transform: none;
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

@media (max-width: 1366px) {
  .auth-left {
    min-width: 55%;
    padding: 2.5rem;
  }

  .auth-right {
    flex: 0 0 45%;
    padding: 1.5rem;
  }

  .brand-title {
    font-size: 3rem;
  }

  .brand-subtitle {
    font-size: 1.35rem;
  }

  .logo-img {
    height: 130px;
  }

  .game-explanation {
    max-width: 480px;
  }

  .explanation-text {
    font-size: clamp(1rem, 0.5vw + 0.9rem, 1.15rem);
  }

  .auth-card {
    max-width: 500px;
  }
}

@media (max-width: 1024px) {
  .auth-left {
    min-width: 50%;
    padding: 2rem;
  }

  .auth-right {
    flex: 0 0 50%;
    padding: 1.5rem;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-subtitle {
    font-size: 1.2rem;
  }

  .logo-img {
    height: 110px;
  }

  .game-explanation {
    max-width: 440px;
  }

  .explanation-text {
    font-size: clamp(0.95rem, 0.5vw + 0.85rem, 1.1rem);
    line-height: 1.7;
  }

  .form-title {
    font-size: 1.85rem;
  }

  .form-subtitle {
    font-size: 0.95rem;
  }

  .form-input {
    padding: 0.95rem 1.15rem;
    font-size: 0.98rem;
  }

  .submit-button {
    padding: 1.15rem 1.85rem;
    font-size: 1.05rem;
  }

  .google-button {
    padding: 1.15rem 1.85rem;
    font-size: 1.05rem;
  }
}

@media (max-width: 768px) {
  .auth-screen {
    flex-direction: column-reverse;
    min-height: 100vh;
  }

  .auth-left {
    min-width: 100%;
    min-height: auto;
    padding: 2rem 1.5rem;
  }

  .auth-right {
    flex: 0 0 auto;
    min-height: auto;
    padding: 2rem 1.5rem;
    box-shadow: none;
  }

  .brand-icon {
    margin-bottom: 0.75rem;
  }

  .logo-img {
    height: 90px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    font-size: 1rem;
    max-width: 400px;
  }

  .game-explanation {
    margin-top: 1.5rem;
    max-width: 100%;
  }

  .gradient-title {
    font-size: clamp(1.4rem, 1.2vw + 1rem, 1.75rem);
    margin-bottom: 1rem;
  }

  .explanation-text {
    font-size: clamp(0.95rem, 0.5vw + 0.85rem, 1.05rem);
    line-height: 1.65;
    margin-bottom: 0.85rem;
  }

  .form-title {
    font-size: 1.65rem;
  }

  .form-subtitle {
    font-size: 0.9rem;
  }

  .auth-card {
    max-width: 100%;
  }

  .auth-form {
    gap: 1.75rem;
  }

  .input-group {
    margin-bottom: 0.9rem;
  }

  .form-input {
    padding: 0.9rem 1.1rem;
    font-size: 0.95rem;
  }

  .input-with-icon {
    padding-right: 42px;
  }

  .field-icon-svg {
    width: 20px;
    height: 20px;
  }

  .submit-button {
    padding: 1.1rem 1.75rem;
    font-size: 1rem;
  }

  .google-button {
    padding: 1.1rem 1.75rem;
    font-size: 1rem;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }

  .shape-1,
  .shape-2,
  .shape-3 {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 640px) {
  .auth-left {
    padding: 1.75rem 1.25rem;
  }

  .auth-right {
    padding: 1.75rem 1.25rem;
  }

  .logo-img {
    height: 80px;
  }

  .brand-title {
    font-size: 1.85rem;
  }

  .brand-subtitle {
    font-size: 0.95rem;
  }

  .game-explanation {
    margin-top: 1.25rem;
  }

  .gradient-title {
    font-size: clamp(1.3rem, 1.1vw + 0.9rem, 1.6rem);
  }

  .explanation-text {
    font-size: clamp(0.9rem, 0.4vw + 0.8rem, 1rem);
    line-height: 1.6;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.875rem;
  }

  .auth-form {
    gap: 1.5rem;
  }

  .input-group {
    margin-bottom: 0.8rem;
  }

  .input-label {
    font-size: 0.875rem;
  }

  .form-input {
    padding: 0.85rem 1rem;
    font-size: 0.925rem;
  }

  .submit-button {
    padding: 1rem 1.5rem;
    font-size: 0.975rem;
  }

  .google-button {
    padding: 1rem 1.5rem;
    font-size: 0.975rem;
  }

  .shape-1,
  .shape-2,
  .shape-3 {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .auth-left {
    padding: 1.5rem 1rem;
  }

  .auth-right {
    padding: 1.5rem 1rem;
  }

  .logo-img {
    height: 70px;
  }

  .brand-title {
    font-size: 1.65rem;
  }

  .brand-subtitle {
    font-size: 0.875rem;
  }

  .game-explanation {
    margin-top: 1rem;
  }

  .gradient-title {
    font-size: clamp(1.2rem, 1vw + 0.85rem, 1.45rem);
    margin-bottom: 0.85rem;
  }

  .title-icon {
    font-size: 1.65rem;
  }

  .explanation-text {
    font-size: clamp(0.875rem, 0.4vw + 0.75rem, 0.95rem);
    line-height: 1.55;
    margin-bottom: 0.75rem;
  }

  .form-title {
    font-size: 1.35rem;
  }

  .form-subtitle {
    font-size: 0.825rem;
  }

  .auth-form {
    gap: 1.35rem;
  }

  .input-group {
    margin-bottom: 0.7rem;
  }

  .input-label {
    font-size: 0.85rem;
  }

  .form-input {
    padding: 0.8rem 0.95rem;
    font-size: 0.9rem;
  }

  .input-with-icon {
    padding-right: 40px;
  }

  .input-icon {
    right: 10px;
  }

  .field-icon-svg {
    width: 19px;
    height: 19px;
  }

  .submit-button {
    padding: 0.95rem 1.35rem;
    font-size: 0.95rem;
  }

  .google-button {
    padding: 0.95rem 1.35rem;
    font-size: 0.95rem;
  }

  .google-icon {
    width: 18px;
    height: 18px;
  }

  .google-text {
    font-size: 0.875rem;
  }

  .shape-1,
  .shape-2,
  .shape-3 {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 360px) {
  .auth-left {
    padding: 1.25rem 0.85rem;
  }

  .auth-right {
    padding: 1.25rem 0.85rem;
  }

  .logo-img {
    height: 60px;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.825rem;
  }

  .gradient-title {
    font-size: clamp(1.1rem, 0.9vw + 0.8rem, 1.3rem);
  }

  .explanation-text {
    font-size: clamp(0.825rem, 0.3vw + 0.7rem, 0.9rem);
    line-height: 1.5;
  }

  .form-title {
    font-size: 1.25rem;
  }

  .auth-form {
    gap: 1.2rem;
  }

  .form-input {
    padding: 0.75rem 0.85rem;
    font-size: 0.875rem;
  }

  .submit-button {
    padding: 0.875rem 1.2rem;
    font-size: 0.9rem;
  }

  .google-button {
    padding: 0.875rem 1.2rem;
    font-size: 0.9rem;
  }
}

[data-animations="disabled"] .auth-content,
[data-animations="disabled"] .auth-card,
[data-animations="disabled"] .input-group,
[data-animations="disabled"] .brand-icon,
[data-animations="disabled"] .brand-title,
[data-animations="disabled"] .brand-subtitle,
[data-animations="disabled"] .form-title,
[data-animations="disabled"] .form-subtitle,
[data-animations="disabled"] .submit-button {
  animation: none !important;
}

[data-animations="disabled"] .shape {
  animation: none !important;
}

[data-animations="disabled"] .visual-bg::before,
[data-animations="disabled"] .visual-bg::after {
  animation: none !important;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  animation: iconPop 0.6s ease forwards;
}

.logo-img {
  width: auto;
  height: 150px;
  object-fit: contain;
  border-radius: 18px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.28));
}

/* Animation */
@keyframes iconPop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}


.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.1rem;
}

.input-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

/* WRAPPER */
.input-icon-wrapper {
  position: relative;
  width: 100%;
}

/* BASE INPUT */
.form-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
 background: #ffff;
  backdrop-filter: blur(4px); 
  border: 1px solid rgba(255,255,255,0.18); 
  color: rgba(24, 20, 20, 0.5);
  font-size: 1.05rem;
  transition: 0.25s ease;
}

.form-input:focus {
  border-color: var(--color-secondary);
  background: #ffff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(248,201,0,0.2);
}

/* INPUT WITH ICON */
.input-with-icon {
  padding-right: 48px;
}

/* ICON POSITIONING */
.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.field-icon-svg {
  width: 22px;
  height: 22px;
  color: rgba(24, 20, 20, 0.5);
  animation: iconFadeIn 0.3s ease;
}

/* ICON FADE IN */
@keyframes iconFadeIn {
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0); }
}
.form-input::placeholder {
  color: rgba(24, 20, 20, 0.5);
  opacity: 1;
}

/* Floating Logo Container */
.floating-logo-container {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
}

.floating-logo {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: floatLogo 4s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(3deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-3deg);
  }
}

.logo-float {
  width: 70px;
  height: 70px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* Enhanced Submit Button with Loader */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-loader {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.loader-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spinLoader 0.8s linear infinite;
}

@keyframes spinLoader {
  to {
    transform: rotate(360deg);
  }
}

.loader-text {
  font-size: 1rem;
  font-weight: 600;
}

/* Google Login Button */
.google-button {
  padding: 1.25rem 2rem;
  background: white;
  border: 2px solid #dadce0;
  border-radius: 12px;
  color: #3c4043;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: not-allowed;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  opacity: 0.6;
  animation: fade-in 0.6s ease 0.7s backwards;
}

.google-button:not(:disabled) {
  cursor: pointer;
  opacity: 1;
}

.google-button:not(:disabled):hover {
  background: #f8f9fa;
  border-color: #d2d3d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.google-text {
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .floating-logo-container {
    top: 1rem;
    right: 1rem;
  }

  .floating-logo {
    width: 80px;
    height: 80px;
  }

  .logo-float {
    width: 55px;
    height: 55px;
  }

  .google-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .floating-logo-container {
    display: none;
  }

  .google-button {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  .google-text {
    font-size: 0.9rem;
  }
}
</style>
