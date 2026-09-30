import { useEffect, useRef } from 'react';
import { PanResponder, Platform } from 'react-native';

export type Dir = 'up' | 'down' | 'left' | 'right';

const KEY_MAP: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Écoute les flèches du clavier (web uniquement). */
export function useArrowKeys(handler: (d: Dir) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const w: any = globalThis;
    const fn = (e: any) => {
      const d = KEY_MAP[e.key];
      if (d) {
        e.preventDefault();
        ref.current(d);
      }
    };
    w.addEventListener('keydown', fn);
    return () => w.removeEventListener('keydown', fn);
  }, []);
}

/** Détecte un glissement (une seule direction par geste). */
export function useSwipe(cb: (d: Dir) => void, threshold = 22) {
  const ref = useRef(cb);
  ref.current = cb;
  const fired = useRef(false);
  return useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        fired.current = false;
      },
      onPanResponderMove: (_, g) => {
        if (fired.current) return;
        const ax = Math.abs(g.dx);
        const ay = Math.abs(g.dy);
        if (Math.max(ax, ay) < threshold) return;
        fired.current = true;
        if (ax > ay) ref.current(g.dx > 0 ? 'right' : 'left');
        else ref.current(g.dy > 0 ? 'down' : 'up');
      },
    })
  ).current.panHandlers;
}
