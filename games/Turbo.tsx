import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../lib/theme';
import { GameProps } from './types';

const DURATION = 10;

export default function Turbo({ onFinish }: GameProps) {
  const [started, setStarted] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const clicksRef = useRef(0);
  const done = useRef(false);
  const scale = useSharedValue(1);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    if (!started) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, DURATION - (Date.now() - t0) / 1000);
      setLeft(remaining);
      if (remaining <= 0 && !done.current) {
        done.current = true;
        clearInterval(id);
        finishRef.current(clicksRef.current, `${(clicksRef.current / DURATION).toFixed(1)} clics / seconde`);
      }
    }, 50);
    return () => clearInterval(id);
  }, [started]);

  const tap = () => {
    if (done.current) return;
    if (!started) setStarted(true);
    clicksRef.current += 1;
    setClicks(clicksRef.current);
    scale.value = withSequence(withTiming(0.9, { duration: 40 }), withTiming(1, { duration: 70 }));
  };

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.wrap}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>CLICS</Text>
          <Text style={styles.hudValue}>{clicks}</Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>TEMPS</Text>
          <Text style={[styles.hudValue, started && left < 3 && { color: colors.red }]}>{left.toFixed(1)}s</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${(left / DURATION) * 100}%` }]} />
      </View>
      <View style={styles.center}>
        <Pressable onPressIn={tap}>
          <Animated.View style={[styles.btn, style]}>
            <Text style={{ fontSize: 64 }}>🚀</Text>
            <Text style={styles.btnText}>{started ? 'TAPEZ !' : 'TOUCHEZ POUR DÉMARRER'}</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingTop: 8, width: '100%' },
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
  hudValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  barBg: { height: 8, width: 300, maxWidth: '85%', borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.pink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btn: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.pink,
    borderWidth: 8,
    borderColor: '#FDA4AF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.pink,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
});
