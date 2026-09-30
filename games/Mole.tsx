import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../lib/theme';
import { GameProps } from './types';

const DURATION = 30;
type Kind = 'mole' | 'gold' | 'bomb';
const FACE: Record<Kind, string> = { mole: '🐹', gold: '👑', bomb: '💣' };

export default function Mole({ onFinish }: GameProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 400);
  const hole = (boardSize - 12 * 4) / 3;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState<{ i: number; kind: Kind } | null>(null);
  const [flash, setFlash] = useState<{ i: number; text: string; color: string } | null>(null);

  const scoreRef = useRef(0);
  const timeRef = useRef(DURATION);
  const running = useRef(false);
  const last = useRef(-1);
  const activeRef = useRef<{ i: number; kind: Kind } | null>(null);
  const timer = useRef<any>(null);
  const flashTimer = useRef<any>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const setAct = (a: { i: number; kind: Kind } | null) => {
    activeRef.current = a;
    setActive(a);
  };

  const spawn = () => {
    if (!running.current) return;
    const elapsed = DURATION - timeRef.current;
    let i = Math.floor(Math.random() * 9);
    if (i === last.current) i = (i + 1 + Math.floor(Math.random() * 8)) % 9;
    last.current = i;
    const r = Math.random();
    const kind: Kind = r < 0.17 ? 'bomb' : r < 0.27 ? 'gold' : 'mole';
    setAct({ i, kind });
    const visible = Math.max(420, 950 - elapsed * 16);
    timer.current = setTimeout(() => {
      setAct(null);
      timer.current = setTimeout(spawn, 220);
    }, visible);
  };

  useEffect(() => {
    if (!started) return;
    running.current = true;
    spawn();
    const clock = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        running.current = false;
        clearInterval(clock);
        clearTimeout(timer.current);
        setAct(null);
        finishRef.current(scoreRef.current);
      }
    }, 1000);
    return () => {
      running.current = false;
      clearInterval(clock);
      clearTimeout(timer.current);
      clearTimeout(flashTimer.current);
    };
  }, [started]);

  const showFlash = (i: number, text: string, color: string) => {
    setFlash({ i, text, color });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 500);
  };

  const hit = (i: number) => {
    const a = activeRef.current;
    if (!running.current || !a || a.i !== i) return;
    clearTimeout(timer.current);
    const delta = a.kind === 'mole' ? 10 : a.kind === 'gold' ? 30 : -20;
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
    showFlash(i, delta > 0 ? `+${delta}` : `${delta}`, delta > 0 ? colors.green : colors.red);
    setAct(null);
    timer.current = setTimeout(spawn, 180);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>TEMPS</Text>
          <Text style={[styles.hudValue, timeLeft <= 5 && started && { color: colors.red }]}>{timeLeft}s</Text>
        </View>
      </View>
      <View style={[styles.barBg, { width: boardSize }]}>
        <View style={[styles.barFill, { width: `${(timeLeft / DURATION) * 100}%` }]} />
      </View>

      <View style={{ width: boardSize, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Pressable key={i} onPressIn={() => hit(i)} style={{ width: hole, height: hole, margin: 6 }}>
            <View style={styles.hole}>
              <View style={styles.dirt} />
              {active?.i === i && <Text style={{ fontSize: hole * 0.55 }}>{FACE[active.kind]}</Text>}
              {flash?.i === i && <Text style={[styles.flash, { color: flash.color }]}>{flash.text}</Text>}
            </View>
          </Pressable>
        ))}
        {!started && (
          <View style={styles.overlay}>
            <Text style={{ fontSize: 56 }}>🐹</Text>
            <Pressable style={styles.startBtn} onPress={() => setStarted(true)}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startText}>C’est parti !</Text>
            </Pressable>
            <Text style={styles.hint}>🐹 +10   👑 +30   💣 −20</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 8 },
  hud: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  hudItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 110,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hudLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  hudValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.surface, marginBottom: 14, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.orange },
  hole: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#2B1B12',
    borderWidth: 3,
    borderColor: '#5B3A21',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dirt: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: '#3A2618' },
  flash: { position: 'absolute', top: 6, fontSize: 22, fontWeight: '900' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,31,0.85)',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { color: colors.muted, fontSize: 14 },
});
