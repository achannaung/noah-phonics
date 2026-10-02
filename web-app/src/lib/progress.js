import { useCallback, useEffect, useState } from 'react';
import { allUnits, getStage, SOUNDS } from '../data/curriculum.js';

const STORAGE_KEY = 'noah-phonics:v1';

const defaultState = {
  stage: 1,
  stars: 0,
  streak: 0,
  lastPlayed: null,
  // unitKey -> { learned, correct, wrong, lastScore }
  units: {},
  // per-sound mistake counts, used for the tricky-sounds report
  mistakes: {},
  gamesPlayed: 0,
  bookList: [],
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  if (typeof localStorage === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function useProgress() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — keep playing in memory */
    }
  }, [state]);

  const bumpStreak = useCallback(() => {
    setState((prev) => {
      const today = todayKey();
      if (prev.lastPlayed === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      return { ...prev, lastPlayed: today, streak: prev.lastPlayed === yesterday ? prev.streak + 1 : 1 };
    });
  }, []);

  const recordUnit = useCallback((unit, { learned = false, correct = 0, wrong = 0 }) => {
    const key = `${unit.stage}:${unit.sound}`;
    bumpStreak();
    setState((prev) => {
      const cur = prev.units[key] || { learned: false, correct: 0, wrong: 0, lastScore: 0 };
      const next = {
        units: {
          ...prev.units,
          [key]: {
            learned: cur.learned || learned,
            correct: cur.correct + correct,
            wrong: cur.wrong + wrong,
            lastScore: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : cur.lastScore,
          },
        },
        mistakes: { ...prev.mistakes },
      };
      for (const sound of [unit.sound].flat()) {
        next.mistakes[sound] = (next.mistakes[sound] || 0) + wrong;
      }
      return next;
    });
  }, [bumpStreak]);

  const addStars = useCallback((n) => {
    bumpStreak();
    setState((prev) => ({ ...prev, stars: prev.stars + n, gamesPlayed: prev.gamesPlayed + 1 }));
  }, [bumpStreak]);

  const setStage = useCallback((stage) => {
    bumpStreak();
    setState((prev) => ({ ...prev, stage: Number(stage) }));
  }, [bumpStreak]);

  const toggleBook = useCallback((title) => {
    setState((prev) => ({
      ...prev,
      bookList: prev.bookList.includes(title)
        ? prev.bookList.filter((t) => t !== title)
        : [...prev.bookList, title],
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...defaultState });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  const unitStats = useCallback((stageId, sound) => {
    return state.units[`${stageId}:${sound}`] || { learned: false, correct: 0, wrong: 0, lastScore: 0 };
  }, [state.units]);

  return {
    state,
    unitStats,
    recordUnit,
    addStars,
    setStage,
    toggleBook,
    reset,
    stageInfo: getStage(state.stage),
    totalUnits: allUnits().length,
    learnedCount: Object.values(state.units).filter((u) => u.learned).length,
    trickySounds: Object.entries(state.mistakes)
      .filter(([sound, count]) => count > 0 && SOUNDS[sound])
      .sort((a, b) => b[1] - a[1]),
  };
}

export { todayKey };