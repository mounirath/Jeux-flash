import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius } from '../lib/theme';
import { Dir, useArrowKeys, useSwipe } from '../lib/input';
import { GameProps } from './types';

const N = 16;
type P = { x: number; y: number };
const DELTA: Record<Dir, P> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

function spawnFood(snake: P[]): P {
  while (true) {
    const p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

export default function Snake({ onFinish }: GameProps) {
  const { width } = useWindowDimensions();
  const cell = Math.floor(Math.min(width - 32, 440) / N);
  const boardSize = cell * N;

  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [, setTick] = useState(0);

  const snake = useRef<P[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const food = useRef<P>({ x: 12, y: 8 });
  const dir = useRef<Dir>('right');
  const queued = useRef<Dir>('right');
  const scoreRef = useRef(0);
  const over = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const steer = useCallback((d: Dir) => {
    if (OPPOSITE[d] !== dir.current) queued.current = d;
  }, []);

  useArrowKeys(steer);
  const pan = useSwipe(steer, 18);

  const speed = Math.max(70, 150 - Math.floor(score / 50) * 10 - Math.floor(score / 10) * 2);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      if (over.current) return;
      dir.current = queued.current;
      const head = snake.current[0];
      const d = DELTA[dir.current];
      const nh = { x: head.x + d.x, y: head.y + d.y };
      const body = snake.current;
      const hitWall = nh.x < 0 || nh.y < 0 || nh.x >= N || nh.y >= N;
      const hitSelf = body.some((s, i) => i < body.length - 1 && s.x === nh.x && s.y === nh.y);
      if (hitWall || hitSelf) {
        over.current = true;
        clearInterval(id);
        finishRef.current(scoreRef.current);
        return;
      }
      const ate = nh.x === food.current.x && nh.y === food.current.y;
      const ns = [nh, ...body];
      if (!ate) ns.pop();
      else {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        food.current = spawnFood(ns);
      }
      snake.current = ns;
      setTick((t) => t + 1);
    }, speed);
    return () => clearInterval(id);
  }, [started, speed]);

  return (
    <View style={styles.wrap} {...pan}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>LONGUEUR</Text>
          <Text style={styles.hudValue}>{snake.current.length}</Text>
        </View>
      </View>

      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {snake.current.map((s, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: s.x * cell + 1,
              top: s.y * cell + 1,
              width: cell - 2,
              height: cell - 2,
              borderRadius: i === 0 ? cell / 2.5 : cell / 4,
              backgroundColor: i === 0 ? colors.green : '#10B981',
              opacity: i === 0 ? 1 : Math.max(0.45, 1 - i * 0.03),
            }}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: food.current.x * cell + 2,
            top: food.current.y * cell + 2,
            width: cell - 4,
            height: cell - 4,
            borderRadius: cell,
            backgroundColor: colors.pink,
            shadowColor: colors.pink,
            shadowOpacity: 0.9,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
        {!started && (
          <View style={styles.overlay}>
            <Text style={styles.overlayEmoji}>🐍</Text>
            <Pressable style={styles.startBtn} onPress={() => setStarted(true)}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startText}>Démarrer</Text>
            </Pressable>
            <Text style={styles.hint}>Glissez ou utilisez les flèches</Text>
          </View>
        )}
      </View>

      <View style={styles.pad}>
        <PadBtn icon="chevron-up" onPress={() => steer('up')} />
        <View style={styles.padRow}>
          <PadBtn icon="chevron-back" onPress={() => steer('left')} />
          <View style={{ width: 64 }} />
          <PadBtn icon="chevron-forward" onPress={() => steer('right')} />
        </View>
        <PadBtn icon="chevron-down" onPress={() => steer('down')} />
      </View>
    </View>
  );
}

function PadBtn({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable
      onPressIn={onPress}
      style={({ pressed }) => [styles.padBtn, pressed && { backgroundColor: colors.purple }]}
    >
      <Ionicons name={icon} size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 8 },
  hud: { flexDirection: 'row', gap: 12, marginBottom: 12 },
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
  board: {
    backgroundColor: '#0D0D29',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.green,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,31,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  overlayEmoji: { fontSize: 56 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { color: colors.muted, fontSize: 12 },
  pad: { marginTop: 16, alignItems: 'center', gap: 6 },
  padRow: { flexDirection: 'row', gap: 6 },
  padBtn: {
    width: 64,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
