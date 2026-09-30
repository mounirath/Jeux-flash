import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../lib/theme';
import { GameProps } from './types';

const EMOJIS = ['🍒', '🍋', '🍇', '🍉', '🥝', '🍓', '🍑', '🍍'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Card({ size, emoji, faceUp, matched, onPress }: any) {
  const sx = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sx.value = withSequence(withTiming(0.05, { duration: 110 }), withTiming(1, { duration: 140 }));
  }, [faceUp]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: sx.value }] }));
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, margin: 4 }}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: matched ? 'rgba(52,211,153,0.22)' : faceUp ? colors.surface2 : colors.purple,
            borderColor: matched ? colors.green : faceUp ? colors.pink : '#A78BFA',
          },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.46, color: '#fff', fontWeight: '800' }}>{faceUp || matched ? emoji : '?'}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Memory({ onFinish }: GameProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 420);
  const size = (boardSize - 8 * 4 - 8) / 4;

  const deck = useMemo(() => shuffle([...EMOJIS, ...EMOJIS]), []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const lock = useRef(false);
  const secRef = useRef(0);
  const finished = useRef(false);
  const timeouts = useRef<any[]>([]);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      secRef.current += 1;
      setSeconds(secRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const press = (i: number) => {
    if (lock.current || finished.current || flipped.includes(i) || matched.includes(i)) return;
    if (!started) setStarted(true);
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) {
      const nm = moves + 1;
      setMoves(nm);
      lock.current = true;
      const [a, b] = nf;
      if (deck[a] === deck[b]) {
        const newMatched = [...matched, a, b];
        timeouts.current.push(
          setTimeout(() => {
            setMatched(newMatched);
            setFlipped([]);
            lock.current = false;
            if (newMatched.length === deck.length) {
              finished.current = true;
              const score = Math.max(50, 2000 - nm * 40 - secRef.current * 12);
              onFinish(score, `${nm} coups en ${secRef.current} s`);
            }
          }, 350)
        );
      } else {
        timeouts.current.push(
          setTimeout(() => {
            setFlipped([]);
            lock.current = false;
          }, 750)
        );
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>COUPS</Text>
          <Text style={styles.hudValue}>{moves}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>TEMPS</Text>
          <Text style={styles.hudValue}>{seconds}s</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>PAIRES</Text>
          <Text style={styles.hudValue}>{matched.length / 2}/8</Text>
        </View>
      </View>
      <View style={{ width: boardSize, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {deck.map((e, i) => (
          <Card
            key={i}
            size={size}
            emoji={e}
            faceUp={flipped.includes(i)}
            matched={matched.includes(i)}
            onPress={() => press(i)}
          />
        ))}
      </View>
      <Text style={styles.hint}>Touchez une carte pour lancer le chrono</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 8 },
  hud: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  hudItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 88,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hudLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  hudValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  card: { flex: 1, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.muted, fontSize: 12, marginTop: 14 },
});
