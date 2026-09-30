import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES } from './games';

const KEY = 'flashzone:v1';

interface Data {
  pseudo: string;
  avatar: string;
  favorites: string[];
  scores: Record<string, number>;
  plays: Record<string, number>;
  recent: string[];
}

const DEFAULT: Data = {
  pseudo: 'Joueur',
  avatar: '😎',
  favorites: [],
  scores: {},
  plays: {},
  recent: [],
};

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

interface Ctx extends Data {
  loaded: boolean;
  totalPlays: number;
  triedCount: number;
  recordsCount: number;
  xp: number;
  level: number;
  levelProgress: number;
  badges: Badge[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  submitScore: (id: string, score: number) => { record: boolean; previous: number };
  markOpened: (id: string) => void;
  setProfile: (pseudo: string, avatar: string) => void;
  resetAll: () => void;
}

const StoreContext = createContext<Ctx>(null as unknown as Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<Data>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = { ...DEFAULT, ...JSON.parse(raw) };
          ref.current = parsed;
          setData(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const commit = useCallback((next: Data) => {
    ref.current = next;
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const cur = ref.current;
      const favorites = cur.favorites.includes(id) ? cur.favorites.filter((f) => f !== id) : [...cur.favorites, id];
      commit({ ...cur, favorites });
    },
    [commit]
  );

  const submitScore = useCallback(
    (id: string, score: number) => {
      const cur = ref.current;
      const previous = cur.scores[id] || 0;
      const record = score > previous;
      commit({
        ...cur,
        scores: { ...cur.scores, [id]: record ? score : previous },
        plays: { ...cur.plays, [id]: (cur.plays[id] || 0) + 1 },
        recent: [id, ...cur.recent.filter((r) => r !== id)].slice(0, 6),
      });
      return { record, previous };
    },
    [commit]
  );

  const markOpened = useCallback(
    (id: string) => {
      const cur = ref.current;
      if (cur.recent[0] === id) return;
      commit({ ...cur, recent: [id, ...cur.recent.filter((r) => r !== id)].slice(0, 6) });
    },
    [commit]
  );

  const setProfile = useCallback(
    (pseudo: string, avatar: string) => {
      commit({ ...ref.current, pseudo: pseudo.trim() || 'Joueur', avatar });
    },
    [commit]
  );

  const resetAll = useCallback(() => {
    commit({ ...DEFAULT, pseudo: ref.current.pseudo, avatar: ref.current.avatar });
  }, [commit]);

  const value = useMemo<Ctx>(() => {
    const totalPlays = Object.values(data.plays).reduce((a, b) => a + b, 0);
    const triedCount = Object.keys(data.plays).length;
    const recordsCount = Object.values(data.scores).filter((s) => s > 0).length;
    const xp = Math.round(Object.values(data.scores).reduce((a, b) => a + b, 0) / 20 + totalPlays * 10);
    const level = Math.floor(xp / 100) + 1;
    const levelProgress = (xp % 100) / 100;
    const badges: Badge[] = [
      { id: 'first', emoji: '🎮', title: 'Première partie', desc: 'Jouez une partie', unlocked: totalPlays >= 1 },
      { id: 'explorer', emoji: '🧭', title: 'Explorateur', desc: 'Essayez 4 jeux', unlocked: triedCount >= 4 },
      { id: 'fan', emoji: '❤️', title: 'Fan', desc: '3 jeux en favoris', unlocked: data.favorites.length >= 3 },
      { id: 'addict', emoji: '🔥', title: 'Accro', desc: 'Jouez 25 parties', unlocked: totalPlays >= 25 },
      { id: 'snake', emoji: '🐍', title: 'Serpent d’or', desc: '100 pts au Serpent', unlocked: (data.scores.snake || 0) >= 100 },
      { id: 'master', emoji: '👑', title: 'Maître', desc: 'Essayez tous les jeux', unlocked: triedCount >= GAMES.length },
    ];
    return {
      ...data,
      loaded,
      totalPlays,
      triedCount,
      recordsCount,
      xp,
      level,
      levelProgress,
      badges,
      toggleFavorite,
      isFavorite: (id: string) => data.favorites.includes(id),
      submitScore,
      markOpened,
      setProfile,
      resetAll,
    };
  }, [data, loaded, toggleFavorite, submitScore, markOpened, setProfile, resetAll]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
