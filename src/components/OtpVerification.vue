<template>
  <div class="otp-verification">
    <div class="otp-backdrop"></div>
    <div class="otp-card">
      <div class="otp-glow-orb"></div>

      <!-- Header -->
      <div class="otp-header">
        <div class="otp-icon">✉️</div>
        <h2 class="otp-title">{{ $t('otpTitle') }}</h2>
        <p class="otp-description">{{ $t('subtitle') }}</p>
      </div>

      <!-- Email Display/Edit -->
      <div class="email-display-section">
        <div class="email-wrapper">
          <div class="email-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div class="email-content">
            <span class="email-label">{{ $t('sentTo') }}</span>
            <span class="email-value">{{ displayEmail }}</span>
          </div>
          <button @click="editEmail" class="email-edit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- OTP Input -->
      <div class="otp-input-section">
        <label class="otp-label">{{ $t('enterCode') }}</label>
        <div class="otp-inputs-wrapper">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="el => otpRefs[index] = el"
            v-model="otpDigits[index]"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste($event)"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-input"
            :class="{ 'has-value': otpDigits[index] }"
          />
        </div>
      </div>

      <!-- Error Message -->
      <transition name="error-fade">
        <div v-if="errorMessage" class="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Verify Button -->
      <button
        @click="verifyOtp"
        class="verify-button"
        :disabled="!isOtpComplete || isVerifying"
      >
        <span class="button-bg"></span>
        <span class="button-text">
          {{ isVerifying ? $t('verifying') : $t('verify') }}
        </span>
        <span class="button-spinner" v-if="isVerifying">
          <span class="spinner"></span>
        </span>
      </button>

      <!-- Resend Section -->
      <div class="resend-section">
        <span class="resend-text">{{ $t('notReceived') }}</span>
        <button
          v-if="canResend"
          @click="resendOtp"
          class="resend-button"
          :disabled="isResending"
        >
          {{ isResending ? $t('sending') : $t('resend') }}
        </button>
        <span v-else class="resend-timer">
          {{ $t('timer', { seconds: countdown }) }}
        </span>
      </div>

      <!-- Success Message (shown after verification) -->
      <transition name="success-fade">
        <div v-if="showSuccess" class="success-overlay">
          <div class="success-content">
            <div class="success-icon-wrapper">
              <div class="success-icon-glow"></div>
              <div class="success-icon">✓</div>
            </div>
            <h3 class="success-title">{{ $t('success') }}</h3>
            <p class="success-subtitle">{{ $t('redirecting') }}</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();

const { t } = useI18n();

// Props
interface Props {
  email: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  verify: [otp: string];
  resend: [];
  editEmail: [];
  success: [];
}>();

// State
const otpDigits = ref<string[]>(['', '', '', '', '', '']);
const otpRefs = ref<(HTMLInputElement | null)[]>([]);
const errorMessage = ref('');
const isVerifying = ref(false);
const isResending = ref(false);
const showSuccess = ref(false);
const canResend = ref(false);
const countdown = ref(60);
let countdownInterval: number | null = null;

// Computed
const displayEmail = computed(() => props.email);
const isOtpComplete = computed(() => otpDigits.value.every(digit => digit !== ''));

// Methods
const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = '';
    return;
  }

  otpDigits.value[index] = value;

  // Move to next input
  if (value && index < 5) {
    otpRefs.value[index + 1]?.focus();
  }

  // Clear error when user starts typing
  if (errorMessage.value) {
    errorMessage.value = '';
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      otpRefs.value[index - 1]?.focus();
    }
  }
  // Handle arrow keys
  else if (event.key === 'ArrowLeft' && index > 0) {
    otpRefs.value[index - 1]?.focus();
  }
  else if (event.key === 'ArrowRight' && index < 5) {
    otpRefs.value[index + 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text') || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

  digits.forEach((digit, index) => {
    if (index < 6) {
      otpDigits.value[index] = digit;
    }
  });

  // Focus last filled input or first empty
  const lastIndex = Math.min(digits.length, 5);
  otpRefs.value[lastIndex]?.focus();
};

const verifyOtp = async () => {
  if (!isOtpComplete.value || isVerifying.value) return;

  isVerifying.value = true;
  errorMessage.value = '';

  const otpCode = otpDigits.value.join('');

  try {
    const success = await auth.verifyOtp(displayEmail.value, otpCode);

    if (success) {
      showSuccess.value = true;
      setTimeout(() => {
        emit('verify', otpCode);
        emit('success'); 
      }, 1500);
    }
  } catch (error: any) {
    errorMessage.value =
      error?.message || error?.response?.data?.message || t('otp.invalidCode');
    otpDigits.value = ['', '', '', '', '', ''];
    otpRefs.value[0]?.focus();
  } finally {
    isVerifying.value = false;
  }
};

const resendOtp = async () => {
  if (!canResend.value || isResending.value) return;

  isResending.value = true;
  errorMessage.value = '';

  try {
    await auth.resendOtp(displayEmail.value);

    emit('resend');
    startCountdown();
  } catch (error: any) {
    errorMessage.value =
      error?.message || error?.response?.data?.message || t('otp.resendError');
  } finally {
    isResending.value = false;
  }
};

const editEmail = () => {
  emit('editEmail');
};

const startCountdown = () => {
  canResend.value = false;
  countdown.value = 60;

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      canResend.value = true;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    }
  }, 1000);
};

// Lifecycle
onMounted(() => {
  startCountdown();
  // Focus first input
  otpRefs.value[0]?.focus();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style scoped>
.otp-verification {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 2rem auto;
}

.otp-backdrop {
  display: none;
}

.otp-card {
  position: relative;
  width: 100%;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  padding: 2.5rem 2rem;
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

.otp-glow-orb {
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
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30px, 30px);
  }
}

.otp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.otp-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: icon-bounce 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(20deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.otp-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
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

.otp-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  animation: subtitle-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
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

/* Email Display Section */
.email-display-section {
  margin-bottom: 2rem;
  animation: section-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

@keyframes section-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.email-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.email-wrapper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.email-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 168, 232, 0.1));
  flex-shrink: 0;
}

.email-icon svg {
  stroke: var(--accent-color);
}

.email-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.email-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.email-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  direction: ltr;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.email-edit-btn:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.email-edit-btn:hover svg {
  stroke: white;
}

.email-edit-btn svg {
  stroke: var(--text-secondary);
  transition: stroke 0.3s ease;
}

/* OTP Input Section */
.otp-input-section {
  margin-bottom: 2rem;
  animation: section-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
}

.otp-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.otp-inputs-wrapper {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  direction: ltr;
}

.otp-input {
  width: 3.5rem;
  height: 4rem;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.otp-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
  transform: translateY(-2px) scale(1.05);
}

.otp-input.has-value {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 168, 232, 0.05));
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.125rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.error-message svg {
  stroke: #f87171;
  flex-shrink: 0;
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Verify Button */
.verify-button {
  position: relative;
  width: 100%;
  padding: 1.25rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: button-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
  box-shadow: 0 10px 30px var(--primary-glow);
  margin-bottom: 1.5rem;
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

.verify-button .button-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-color), var(--secondary-color));
  transition: transform 0.3s ease;
}

.verify-button .button-text {
  position: relative;
  z-index: 2;
}

.verify-button .button-spinner {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
}

.spinner {
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

.verify-button:not(:disabled):hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 40px var(--primary-glow);
}

.verify-button:not(:disabled):hover .button-bg {
  transform: scale(1.05);
}

.verify-button:not(:disabled):active {
  transform: translateY(-1px) scale(0.98);
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Resend Section */
.resend-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  animation: section-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
}

.resend-text {
  color: var(--text-secondary);
}

.resend-button {
  background: transparent;
  border: none;
  color: var(--accent-color);
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.resend-button:hover {
  background: var(--primary-glow);
  transform: translateY(-1px);
}

.resend-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-timer {
  color: var(--text-secondary);
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 168, 232, 0.1));
  border-radius: 6px;
}

/* Success Overlay */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  text-align: center;
  animation: success-appear 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes success-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, #10b981, transparent 70%);
  opacity: 0.5;
  filter: blur(30px);
  animation: success-glow-pulse 2s ease-in-out infinite;
}

@keyframes success-glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

.success-icon {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: 700;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.5);
  animation: success-icon-bounce 1s ease-out;
}

@keyframes success-icon-bounce {
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

.success-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.success-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

.success-fade-enter-active {
  transition: all 0.4s ease;
}

.success-fade-leave-active {
  transition: all 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .otp-verification {
    padding: 0;
    margin: 1.5rem auto;
  }

  .otp-card {
    padding: 2rem 1.5rem;
  }

  .otp-title {
    font-size: 1.25rem;
  }

  .otp-icon {
    font-size: 2.5rem;
  }

  .otp-inputs-wrapper {
    gap: 0.5rem;
  }

  .otp-input {
    width: 3rem;
    height: 3.5rem;
    font-size: 1.5rem;
  }

  .success-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .success-title {
    font-size: 1.5rem;
  }
}

/* RTL Support */
[dir="rtl"] .email-value {
  text-align: right;
}

[dir="rtl"] .button-spinner {
  right: auto;
  left: 1.5rem;
}
</style>
