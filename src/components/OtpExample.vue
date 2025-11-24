<template>
  <div class="otp-example">
    <OtpVerification
      :email="userEmail"
      @verify="handleVerify"
      @resend="handleResend"
      @editEmail="handleEditEmail"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OtpVerification from './OtpVerification.vue';

// Example email - replace with actual email from your auth flow
const userEmail = ref('user@example.com');

// Handler when user verifies OTP
const handleVerify = (otp: string) => {
  console.log('OTP submitted:', otp);

  // TODO: Replace with actual API call
  // Example:
  // try {
  //   const response = await fetch('/auth/email/verify-otp', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email: userEmail.value, otp })
  //   });
  //
  //   if (response.ok) {
  //     // Verification successful - component will show success message
  //   } else {
  //     // Handle error
  //   }
  // } catch (error) {
  //   console.error('Verification failed:', error);
  // }
};

// Handler when user requests to resend OTP
const handleResend = () => {
  console.log('Resend OTP requested for:', userEmail.value);

  // TODO: Replace with actual API call
  // Example:
  // try {
  //   await fetch('/auth/email/resend-otp', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email: userEmail.value })
  //   });
  // } catch (error) {
  //   console.error('Resend failed:', error);
  // }
};

// Handler when user wants to edit email
const handleEditEmail = () => {
  console.log('User wants to edit email');

  // TODO: Navigate back to email input screen
  // Example:
  // router.push({ name: 'enter-email' });
};

// Handler when verification is successful
const handleSuccess = () => {
  console.log('Verification successful, redirecting...');

  // TODO: Redirect to next screen or home
  // Example:
  // setTimeout(() => {
  //   router.push({ name: 'home' });
  // }, 2000);
};
</script>

<style scoped>
.otp-example {
  width: 100%;
  min-height: 100vh;
}
</style>
