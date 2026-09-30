import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../lib/theme';
import { GameProps } from './types';

const ROUNDS = 5;
type Phase = 'idle' | 'wait' | 'go' | 'early' | 'shown';

const CONFIG: Record<Phase, { bg: string; icon: any; title: string; sub: string }> = {
  idle: { bg: '#2563EB', icon: 'hand-left', title: 'Prêt ?', sub: 'Touchez pour commencer la manche' },
  wait: { bg: '#DC2626', icon: 'hourglass', title: 'Attendez…', sub: 'Touchez quand l’écran devient vert' },
  go: { bg: '#16A34A', icon: 'flash', title: 'TOUCHEZ !', sub: '' },
  early: { bg: '#EA580C', icon: 'alert-circle', title: 'Trop tôt !', sub: 'Touchez pour réessayer' },
  shown: { bg: '#7C3AED', icon: 'timer', title: '', sub: 'Touchez pour la manche suivante' },
};

export default function Reflex({ onFinish }: GameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<number[]>([]);
  const [last, setLast] = useState(0);
  const t0 = useRef(0);
  const timer = useRef<any>(null);
  const finishTimer = useRef<any>(null);
  const done = useRef(false);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(finishTimer.current);
    },
    []
  );

  const startRound = () => {
    setPhase('wait');
    timer.current = setTimeout(() => {
      t0.current = Date.now();
      setPhase('go');
    }, 1200 + Math.random() * 2800);
  };

  const press = () => {
    if (done.current) return;
    if (phase === 'idle' || phase === 'early' || phase === 'shown') return startRound();
    if (phase === 'wait') {
      clearTimeout(timer.current);
      return setPhase('early');
    }
    if (phase === 'go') {
      const ms = Date.now() - t0.current;
      const nr = [...results, ms];
      setResults(nr);
      setLast(ms);
      setPhase('shown');
      if (nr.length === ROUNDS) {
        done.current = true;
        const avg = Math.round(nr.reduce((a, b) => a + b, 0) / ROUNDS);
        const score = Math.max(0, Math.round(1000 - avg * 1.5));
        finishTimer.current = setTimeout(() => onFinish(score, `${avg} ms de moyenne`), 1100);
      }
    }
  };

  const cfg = CONFIG[phase];
  const title = phase === 'shown' ? `${last} ms` : cfg.title;
  const sub = phase === 'shown' && results.length === ROUNDS ? 'Calcul du score…' : cfg.sub;

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <View key={i} style={styles.dotWrap}>
            <View style={[styles.dot, results[i] !== undefined && { backgroundColor: colors.cyan }]} />
            <Text style={styles.dotText}>{results[i] !== undefined ? `${results[i]}` : '—'}</Text>
          </View>
        ))}
      </View>
      <Pressable onPressIn={press} style={[styles.pad, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={64} color="#fff" />
        <Text style={styles.title}>{title}</Text>
        {!!sub && <Text style={styles.sub}>{sub}</Text>}
      </Pressable>
      <Text style={styles.hint}>Manche {Math.min(results.length + (phase === 'shown' ? 0 : 1), ROUNDS)} / {ROUNDS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, width: '100%', maxWidth: 520, alignSelf: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  dotWrap: { alignItems: 'center', gap: 4, flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  dotText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  pad: {
    flex: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 320,
  },
  title: { color: '#fff', fontSize: 38, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
  hint: { color: colors.muted, textAlign: 'center', marginTop: 12, fontSize: 12 },
});
