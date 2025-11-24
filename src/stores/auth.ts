import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../lib/api';
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import type { User } from '../models/User';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(sessionStorage.getItem('auth_token'));
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  async function loginWithGoogle(idToken: string) {
    try {
      const response = await api.post('/auth/google', { token: idToken });
      const data = response.data.data;
      user.value = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        token: data.token,
      };
      token.value = data.token;
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user', JSON.stringify(user.value));
      return true;
    } catch {
      return false;
    }
  }

  async function loginManual(name: string, email: string) {
    try {
      const response = await api.post('/auth/manual', { name, email });
      const data = response.data.data;
      user.value = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
      };
      token.value = data.token;
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user', JSON.stringify(user.value));
      return true;
    } catch {
      return false;
    }
  }

async function sendOtp(email: string) {
  try {
    const response = await api.post('/auth/send-otp', { email });
    return response.data.data; // يحتوي على cooldown_seconds و valid_for_minutes
  } catch (error: any) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
}

async function resendOtp(email: string) {
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data.data;
  } catch (error: any) {
    console.error('Error resending OTP:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
}

async function verifyOtp(email: string, otp: string) {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const data = response.data.data;

    user.value = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      token: data.token,
    };
    token.value = data.token;

    sessionStorage.setItem('auth_token', data.token);
    sessionStorage.setItem('user', JSON.stringify(user.value));

    return true;
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Invalid or expired OTP' };
  }
}


  function logout() {
  //    if (auth.currentUser) {
  //   signOut(auth).catch((e) => console.warn("Firebase signout error:", e));
  // }
    user.value = null;
    token.value = null;
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
  }

  function loadFromStorage() {
    
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
   
  }

  return {
    user,
    token,
    isAuthenticated,
    loginWithGoogle,
    loginManual,
    logout,
    loadFromStorage,
      sendOtp,
  resendOtp,
  verifyOtp,
  };
});
