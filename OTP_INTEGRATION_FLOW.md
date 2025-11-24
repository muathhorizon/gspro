# OTP Integration Flow

## Updated Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Landing Page - Auth Section                  │
│                                                                 │
│  User enters:                                                   │
│  - Name: [_________________]                                    │
│  - Email: [________________]                                    │
│                                                                 │
│  [ابدأ اللعب] (Start Game Button)                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks "Start Game"
                            │ manualLogin() is called
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OTP Verification Screen                      │
│                                                                 │
│  ✉️ تحقق من البريد الإلكتروني                                  │
│  لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │ 📧  تم الإرسال إلى                               │ [✏️]     │
│  │     user@example.com                             │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  أدخل رمز التحقق                                               │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                         │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │                         │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                         │
│                                                                 │
│  [تحقق] (Verify Button)                                        │
│                                                                 │
│  لم تستلم الرمز؟ [إعادة الإرسال بعد 60 ثانية]                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User enters OTP & verifies
                            │ verifyOtp() called
                            │ Success → handleOtpSuccess()
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Success Animation                          │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │          ✓              │                        │
│              │   تم التحقق بنجاح       │                        │
│              │  جاري تحويلك الآن...    │                        │
│              └─────────────────────────┘                        │
│                                                                 │
│              (2 second delay)                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ After 2 seconds
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Welcome Screen                             │
│                                                                 │
│  ✨ أهلاً بك 🎉                                                 │
│                                                                 │
│  تم تسجيل الدخول كـ                                            │
│  أحمد محمد                                                     │
│                                                                 │
│  [متابعة لاختيار التحدي] →                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks "Continue"
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Theme Selection Screen                       │
│  (Existing flow continues...)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Changes in LandingPage.vue

### 1. New State Variable
```typescript
const showOtpScreen = ref(false);
```

### 2. Updated manualLogin()
```typescript
async function manualLogin() {
  // Show OTP screen instead of welcome
  showOtpScreen.value = true;
  // TODO: Send OTP via API
  // await sendOtp(playerEmail.value);
}
```

### 3. New OTP Handlers
```typescript
// Verify OTP entered by user
async function verifyOtp(otp: string) {
  // Call API: POST /auth/email/verify-otp
  // Body: { email, otp }
}

// Resend OTP code
async function resendOtp() {
  // Call API: POST /auth/email/resend-otp
  // Body: { email }
}

// Go back to edit email
function goBackToEmailInput() {
  showOtpScreen.value = false;
}

// After successful verification
async function handleOtpSuccess() {
  const success = await authStore.loginManual(playerName.value, playerEmail.value);
  if (success) {
    showOtpScreen.value = false;
    showWelcome.value = true; // NOW show welcome
  }
}
```

### 4. Updated Template Structure
```vue
<!-- OTP Screen (shown after user submits email) -->
<OtpVerification
  v-if="showOtpScreen && !showThemeSelect"
  :email="playerEmail"
  @verify="verifyOtp"
  @resend="resendOtp"
  @editEmail="goBackToEmailInput"
  @success="handleOtpSuccess"
/>

<!-- Welcome Screen (shown after OTP verification) -->
<div v-else-if="showWelcome && !showThemeSelect" class="welcome-container">
  ...
</div>

<!-- Auth Form (initial screen) -->
<div v-else-if="!showThemeSelect && !showOtpScreen" class="auth-container">
  ...
</div>
```

## What You Need To Do Next

### 1. Implement API Endpoints

You need to create three API endpoints (or edge functions):

#### `/auth/email/send-otp`
```typescript
// Called in manualLogin()
POST /auth/email/send-otp
Body: { email: string }
Response: { success: boolean, message: string }
```

#### `/auth/email/verify-otp`
```typescript
// Called in verifyOtp()
POST /auth/email/verify-otp
Body: { email: string, otp: string }
Response: { success: boolean, token?: string, user?: object }
```

#### `/auth/email/resend-otp`
```typescript
// Called in resendOtp()
POST /auth/email/resend-otp
Body: { email: string }
Response: { success: boolean, message: string }
```

### 2. Update the Handler Functions

Replace the TODO comments in `LandingPage.vue` with actual API calls:

```typescript
async function manualLogin() {
  showOtpScreen.value = true;

  // Send OTP
  try {
    await fetch('/auth/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: playerEmail.value })
    });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    showOtpScreen.value = false;
  }
}

async function verifyOtp(otp: string) {
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

  // Success - handleOtpSuccess() will be called by component
}

async function resendOtp() {
  await fetch('/auth/email/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: playerEmail.value })
  });
}
```

## Testing Flow

1. User enters name and email → clicks "ابدأ اللعب"
2. OTP screen appears with glassy card animation
3. User receives email with 6-digit code
4. User enters OTP → clicks "تحقق"
5. Success animation plays (2 seconds)
6. Welcome screen appears with user's name
7. User clicks "متابعة لاختيار التحدي"
8. Theme selection screen appears

## Features Included

✅ OTP screen replaces welcome screen initially
✅ Email display with edit button
✅ 6-digit OTP input with smart navigation
✅ Resend with 60-second countdown
✅ Success animation before welcome screen
✅ Full RTL/LTR support
✅ All i18n translations included
✅ Matches landing page design perfectly
