# OTP Verification Component

A responsive, fully-styled OTP (One-Time Password) verification UI component for the Guess Challenge game, built with Vue 3 and TypeScript.

## Features

✅ **6-digit OTP input** with auto-focus and smart navigation
✅ **Email display with edit button** to allow users to change their email
✅ **Resend OTP** with 60-second cooldown timer
✅ **Success animation** with auto-redirect after verification
✅ **Error handling** with smooth error messages
✅ **Full i18n support** (Arabic RTL + English LTR)
✅ **Glassy card design** matching your landing page aesthetic
✅ **Smooth animations** and glowing accents
✅ **Responsive design** for mobile and desktop

## File Location

```
src/components/OtpVerification.vue
```

## Usage Example

```vue
<template>
  <OtpVerification
    :email="userEmail"
    @verify="handleVerify"
    @resend="handleResend"
    @editEmail="handleEditEmail"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OtpVerification from './OtpVerification.vue';

const userEmail = ref('user@example.com');

const handleVerify = async (otp: string) => {
  // Call your API endpoint: POST /auth/email/verify-otp
  // Body: { email: userEmail.value, otp }
};

const handleResend = async () => {
  // Call your API endpoint: POST /auth/email/resend-otp
  // Body: { email: userEmail.value }
};

const handleEditEmail = () => {
  // Navigate back to email input screen
};

const handleSuccess = () => {
  // Redirect to next screen after successful verification
};
</script>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | `string` | Yes | The email address where OTP was sent |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `verify` | `otp: string` | Emitted when user submits the OTP code |
| `resend` | - | Emitted when user clicks resend button |
| `editEmail` | - | Emitted when user wants to edit their email |
| `success` | - | Emitted after successful verification (2s delay) |

## Integration Flow

### 1️⃣ User enters name and email on landing page

```typescript
// In LandingPage.vue
async function manualLogin() {
  const success = await authStore.loginManual(playerName.value, playerEmail.value);
  if (success) {
    // Send OTP via API
    await sendOtp(playerEmail.value);
    // Show OTP screen
    showOtpScreen.value = true;
  }
}
```

### 2️⃣ Send OTP via API

```typescript
async function sendOtp(email: string) {
  try {
    const response = await fetch('/auth/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
}
```

### 3️⃣ Display OTP verification screen

```vue
<OtpVerification
  v-if="showOtpScreen"
  :email="playerEmail"
  @verify="verifyOtp"
  @resend="resendOtp"
  @editEmail="goBackToEmailInput"
  @success="proceedToThemes"
/>
```

### 4️⃣ Verify OTP

```typescript
async function verifyOtp(otp: string) {
  try {
    const response = await fetch('/auth/email/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: playerEmail.value,
        otp
      })
    });

    if (!response.ok) {
      throw new Error('Invalid OTP');
    }

    const data = await response.json();
    // Store auth token or user data
    authStore.setUser(data.user);

    // Component will auto-show success and emit @success event
  } catch (error) {
    console.error('Verification failed:', error);
    // Component will show error message
  }
}
```

### 5️⃣ Resend OTP

```typescript
async function resendOtp() {
  try {
    const response = await fetch('/auth/email/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: playerEmail.value })
    });

    if (!response.ok) {
      throw new Error('Failed to resend OTP');
    }

    // Component will automatically restart 60s countdown
  } catch (error) {
    console.error('Resend failed:', error);
  }
}
```

## i18n Translations

All text labels are fully translatable via i18n. The component uses the following keys:

### English (`en`)
```typescript
otp: {
  title: "Verify Email",
  subtitle: "We've sent a verification code to your email",
  sentTo: "Code sent to",
  enterCode: "Enter verification code",
  verify: "Verify",
  verifying: "Verifying...",
  resend: "Resend",
  sending: "Sending...",
  notReceived: "Didn't receive the code?",
  timer: "Resend after {seconds}s",
  success: "Verification Successful",
  redirecting: "Redirecting you now...",
  invalidCode: "Invalid code. Please try again.",
  error: "Verification failed. Please try again.",
  resendError: "Failed to resend code. Please try again."
}
```

### Arabic (`ar`)
```typescript
otp: {
  title: "تحقق من البريد الإلكتروني",
  subtitle: "لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني",
  sentTo: "تم الإرسال إلى",
  enterCode: "أدخل رمز التحقق",
  verify: "تحقق",
  verifying: "جاري التحقق...",
  resend: "إعادة الإرسال",
  sending: "جاري الإرسال...",
  notReceived: "لم تستلم الرمز؟",
  timer: "أعد الإرسال بعد {seconds} ثانية",
  success: "تم التحقق بنجاح",
  redirecting: "جاري تحويلك الآن...",
  invalidCode: "رمز غير صحيح. حاول مرة أخرى.",
  error: "فشل التحقق. حاول مرة أخرى.",
  resendError: "فشل إعادة إرسال الرمز. حاول مرة أخرى."
}
```

## Features Details

### Auto-focus & Smart Navigation
- First input is auto-focused on mount
- Auto-advances to next input when digit is entered
- Backspace moves to previous input
- Arrow keys for manual navigation
- Paste support (automatically distributes digits)

### Resend Timer
- 60-second countdown before resend button is enabled
- Visual countdown display
- Automatic countdown restart after resend

### Error Handling
- Displays error messages with smooth animations
- Automatically clears OTP on error
- Refocuses first input for retry

### Success Flow
- Shows full-screen success overlay
- Animated checkmark with glow effect
- 2-second delay before emitting success event
- Smooth fade-in/out transitions

## Styling

The component uses CSS custom properties from your existing theme:

```css
--bg-primary
--bg-secondary
--card-bg
--text-primary
--text-secondary
--border-color
--accent-color
--secondary-color
--primary-glow
```

It automatically adapts to:
- Light/dark themes
- RTL/LTR text direction
- Mobile/desktop screen sizes

## Component State (Local)

The component manages its own state:
- ✅ OTP digits (6-digit array)
- ✅ Loading states (verifying, resending)
- ✅ Error messages
- ✅ Success display
- ✅ Countdown timer
- ✅ Resend availability

**No backend or Pinia store connection** — all backend logic should be handled in parent component.

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  - Smaller card padding
  - Reduced OTP input sizes
  - Adjusted font sizes
}
```

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus indicators
- ARIA-friendly
- Screen reader compatible

## Notes

- Component is fully self-contained
- No external dependencies beyond Vue 3 and vue-i18n
- Uses existing design system (colors, spacing, animations)
- Matches landing page aesthetic (glassy cards, glowing accents)
- All backend API calls should be handled by parent component

## Demo Component

A demo/example component is available at:
```
src/components/OtpExample.vue
```

This shows complete usage with all event handlers.
