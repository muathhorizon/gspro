import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

type ThemeMode = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeMode>('dark');
  const soundEnabled = ref(true);
  const animationsEnabled = ref(true);

  const savedTheme = sessionStorage.getItem('theme') as ThemeMode;
  if (savedTheme) {
    currentTheme.value = savedTheme;
  }

  const savedSound = sessionStorage.getItem('soundEnabled');
  if (savedSound !== null) {
    soundEnabled.value = savedSound === 'true';
  }

  const savedAnimations = sessionStorage.getItem('animationsEnabled');
  if (savedAnimations !== null) {
    animationsEnabled.value = savedAnimations === 'true';
  }

  watch(currentTheme, (newTheme) => {
    sessionStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  });

  document.documentElement.setAttribute('data-theme', currentTheme.value);

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value;
    sessionStorage.setItem('soundEnabled', soundEnabled.value.toString());
  }

  function toggleAnimations() {
    animationsEnabled.value = !animationsEnabled.value;
    sessionStorage.setItem('animationsEnabled', animationsEnabled.value.toString());
    document.documentElement.setAttribute('data-animations', animationsEnabled.value ? 'enabled' : 'disabled');
  }

  function playSound(type: 'click' | 'correct' | 'wrong' | 'win' | 'lose') {
    if (!soundEnabled.value) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    switch (type) {
      case 'click':
        oscillator.frequency.value = 300;
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
        break;
      case 'correct':
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.2);
        break;
      case 'wrong':
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
        break;
      case 'win':
        [400, 500, 600].forEach((freq, i) => {
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(context.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, context.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + i * 0.1 + 0.3);
          osc.start(context.currentTime + i * 0.1);
          osc.stop(context.currentTime + i * 0.1 + 0.3);
        });
        break;
      case 'lose':
        [300, 250, 200].forEach((freq, i) => {
          const osc = context.createOscillator();
          const gain = context.createGain();
          osc.connect(gain);
          gain.connect(context.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, context.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + i * 0.15 + 0.4);
          osc.start(context.currentTime + i * 0.15);
          osc.stop(context.currentTime + i * 0.15 + 0.4);
        });
        break;
    }
  }

  document.documentElement.setAttribute('data-animations', animationsEnabled.value ? 'enabled' : 'disabled');

  return {
    currentTheme,
    soundEnabled,
    animationsEnabled,
    toggleTheme,
    toggleSound,
    toggleAnimations,
    playSound,
  };
});
