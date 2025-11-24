import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
// import { supabase, type LeaderboardEntry } from '../lib/supabase';
import api from '../lib/api';
import type { Theme } from '../models/Theme';
import type { Level } from '../models/Level';
import type { Category } from '../models/Category';
import { useAuthStore } from './auth';
import type { User } from '../models/User';
import {QuestionOption} from '../models/QuestionOption';
const gameApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-ai`;
import type { Question } from '../models/Question';
const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

interface GameEntity {
  name: string;
  description?: string;
  image_url?: string | null;
  attributes?: {
    nationality?: string | null;
    league?: string | null;
    currentTeam?: string | null;
    footed?: string | null;
    [key: string]: any;
  };
}
interface GameState {
  sessionId: string | null;
  user: User | null;
  selectedTheme: Theme | null;
  selectedLevel: Level | null;
  categories: Category[];
  selectedCategory: Category | null;
  questions: Question[];
 conversation: { option: QuestionOption; answer: boolean }[];
  questionsAsked: number;
  categoriesCount: number;
  timeLimit: number;
  timeRemaining: number;
  status: 'idle' | 'playing' | 'won' | 'lost';
  entity: GameEntity | null
  score: number;
  resultSummary?: {
    type: 'win' | 'lose';
    message: string;
  } | null;
}

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>({
    sessionId: null,
    user: null,
    selectedTheme: null,
    selectedLevel: null,
    categories: [],
    selectedCategory: null,
    questions: [],
    conversation: [],
    questionsAsked: 0,
    categoriesCount: 15,
    timeLimit: 240,
    timeRemaining: 240,
    status: 'idle',
    entity: null,
    resultSummary: null,
    score: 0,
  });

  let timerInterval: number | null = null;

  const isPlaying = computed(() => state.value.status === 'playing');
  const categoriesRemaining = computed(() => {
    const usedCategories = state.value.categories.filter(c => c.used).length;
    return Math.max(state.value.categoriesCount - usedCategories, 0);
  }); const timeElapsed = computed(() => state.value.timeLimit - state.value.timeRemaining);
  const canAskQuestion = computed(() => categoriesRemaining.value > 0 && state.value.timeRemaining > 0);


  async function startGame(theme: Theme, level: Level) {
    try {

      const auth = useAuthStore();
      if (!auth.user) {
        console.error("❌ No authenticated user found!");
        return false;
      }

      const response = await api.post('/start-game', {
        theme_id: theme.id,
        level_id: level.id,
      });

      const data = response.data.data || response.data;

      state.value.sessionId = data.session_token;
      state.value.user = auth.user;
      state.value.selectedTheme = theme;
      state.value.selectedLevel = level;
      state.value.questions = [];
      state.value.conversation = [];
      state.value.questionsAsked = 0;

      state.value.categories = (data.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        used: cat.used ?? false,
      }));

      state.value.categoriesCount = data.categories_count || level.categories_count;
      state.value.timeLimit = data.time_per_attempt || level.time_per_attempt;
      state.value.timeRemaining = state.value.timeLimit;
      state.value.status = 'idle';
      state.value.entity = null;
      state.value.score = 0;

      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      return false;
    }
  }
  async function verifyGuess(guess: string) {
    if (!state.value.sessionId) {
      console.error('No active session to verify guess.');
      return null;
    }

    try {
      const response = await api.post('/verify-guess', {
        session_token: state.value.sessionId,
        guess_name: guess,
      });

      const data = response.data.data || response.data;
      if (data.entity) {
        state.value.entity = {
          name: data.entity.name,
          image_url: data.entity.image_url,
          attributes: data.entity.attributes || {},
        };
      }
      console.log('🎯 Guess verification result:', data);

      const match = data.match === true || data.match === 'true';
      const message = data.message || '';
      const categoriesUsed = data.categories_used || 0;
      const entityName = data.entity_name || '';

      if (match) {
        state.value.status = 'won';
        state.value.resultSummary = {
          type: 'win',
          message: `🎉 استخدمت ${categoriesUsed} تصنيف${categoriesUsed > 1 ? 'ات' : ''} لتخمين الجواب الصحيح!`,
        };
      } else {
        state.value.status = 'lost';
        state.value.resultSummary = {
          type: 'lose',
          message: `❌ الجواب الصحيح كان: ${entityName}`,
        };
      }

      return { match, message, categoriesUsed, entityName };
    } catch (error) {
      console.error('Error verifying guess:', error);
      return null;
    }
  }
  async function fetchSuggestions(query: string): Promise<any[]> {
    // نتحقق أن الجلسة والـtheme موجودين
    if (!state.value.sessionId || !state.value.selectedTheme) {
      console.warn('No active session or theme for suggestions.');
      return [];
    }

    if (query.trim().length < 2) {
      return [];
    }

    try {
      const response = await api.get('/entities/search', {
        params: {
          session_id: state.value.sessionId,
          q: query.trim(),
          limit: 5,
        },
      });

      const raw = response.data.data || response.data;

      const suggestions = raw.map((item: any) => ({
        id: item.id,
        name: item.name,
        attributes: item.attributes || {},
      }));

      return suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  async function fetchQuestionsByCategory(categoryId: number): Promise<Question[]> {
    if (!state.value.sessionId) {
      console.error('No active session to fetch questions.');
      return [];
    }

    try {
      const response = await api.post('/fetch-questions', {
        session_token: state.value.sessionId,
        category_id: categoryId,
      });

      const q = response.data.questions;


    state.value.questions = [{
  id: q.question_id,
  text: q.text,
  hint: q.hint,
  options: q.options
}];
      state.value.selectedCategory = state.value.categories.find(c => c.id === categoryId) || null;
      state.value.status = 'playing';
     return state.value.questions;
    } catch (error) {
      console.error('Error fetching category questions:', error);
      return [];
    }
  }

 async function askQuestion(option: QuestionOption) {
  if (!state.value.sessionId || !canAskQuestion.value) return null;

  try {
    stopTimer();

    const response = await api.post('/ask-question', {
      session_token: state.value.sessionId,
      option_id: option.id, 
    });

    const data = response.data;
    const isYes = data.answer === 'yes';

    state.value.conversation.push({
      option,
      answer: isYes
    });

    state.value.questionsAsked += 1;

    if (data.categories) {
      state.value.categories = data.categories;
    }

    state.value.questions = [];
    state.value.selectedCategory = null;
    state.value.status = 'idle';

    return isYes;

  } catch (error) {
    console.error('Error asking option:', error);
    return null;
  }
}



  function resetTimerForRound() {
    stopTimer();
    state.value.timeRemaining = state.value.selectedLevel?.time_per_attempt || 60; // أو أي قيمة افتراضية
    startTimer();
  }

  async function fetchNextQuestions(count?: number) {
    if (!state.value.sessionId) return [];

    const questionsCount = count || state.value.selectedLevel?.questions_per_attempt || 4;

    try {
      const response = await api.post('/next-questions', {
        session_token: state.value.sessionId,
        count: questionsCount,
      });

      const data = response.data;
      state.value.questions = data.questions;

      return data.questions;
    } catch (error) {
      console.error('Error fetching next questions:', error);
      return [];
    }
  }

  async function submitGuess(guess: string) {
    if (!state.value.sessionId) return null;

    stopTimer();

    try {
      const response = await fetch(`${gameApiUrl}/submit-guess`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: state.value.sessionId,
          guess,
          timeSpent: timeElapsed.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit guess');
      }

      const data = await response.json();

      state.value.status = data.correct ? 'won' : 'lost';
      state.value.entity = { name: data.entity, description: data.description };
      state.value.score = data.score;

      return data;
    } catch (error) {
      console.error('Error submitting guess:', error);
      return null;
    }
  }

  function startTimer() {
    stopTimer();
    timerInterval = window.setInterval(() => {
      if (state.value.timeRemaining > 0) {
        state.value.timeRemaining--;
      } else {
        stopTimer();
        state.value.status = 'lost';
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetGame() {
    stopTimer();
    const auth = useAuthStore();
    state.value = {
      sessionId: null,
      user: auth.user,
      selectedTheme: null,
      selectedLevel: null,
      questions: [],
      conversation: [],
      questionsAsked: 0,
      categoriesCount: 0,
      timeLimit: 0,
      timeRemaining: 0,
      status: 'idle',
      entity: null,
      score: 0,
    };
  }


  // async function fetchThemes(): Promise<Theme[]> {
  //   const { data, error } = await supabase
  //     .from('themes')
  //     .select('*')
  //     .eq('is_active', true);

  //   if (error) {
  //     console.error('Error fetching themes:', error);
  //     return [];
  //   }

  //   return data || [];
  // }

  async function fetchThemes(): Promise<Theme[]> {
    try {
      const response = await api.get('/themes');
      const rawData = response.data.data || response.data;

      const themes: Theme[] = rawData.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        description: item.description ? item.description : null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return themes;
    } catch (error) {
      console.error('Error fetching themes:', error);
      return [];
    }
  }


  async function fetchLevels(): Promise<Level[]> {
    try {
      const res = await api.get('/levels');
      const raw = Array.isArray(res.data) ? res.data : res.data.data;
      return raw as Level[];
    } catch (e) {
      console.error('Error fetching levels:', e);
      return [];
    }
  }




  // async function fetchLeaderboard(themeId?: string, difficulty?: string): Promise<LeaderboardEntry[]> {
  //   let query = supabase
  //     .from('leaderboard')
  //     .select('*')
  //     .order('score', { ascending: false })
  //     .limit(10);

  //   if (themeId) {
  //     query = query.eq('theme_id', themeId);
  //   }

  //   if (difficulty) {
  //     query = query.eq('difficulty', difficulty);
  //   }

  //   const { data, error } = await query;

  //   if (error) {
  //     console.error('Error fetching leaderboard:', error);
  //     return [];
  //   }

  //   return data || [];
  // }

  return {
    state,
    isPlaying,
    categoriesRemaining,
    timeElapsed,
    canAskQuestion,
    startGame,
    askQuestion,
    submitGuess,
    resetGame,
    fetchThemes,
    // fetchLeaderboard,
    fetchLevels,
    fetchNextQuestions,
    resetTimerForRound,
    fetchQuestionsByCategory,
    startTimer,
    verifyGuess,
    fetchSuggestions
  };
});
