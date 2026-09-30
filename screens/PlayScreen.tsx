import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getGame } from '../lib/games';
import { colors, radius, shadow } from '../lib/theme';
import { useStore } from '../lib/store';
import { GAME_COMPONENTS } from '../games';

interface Result {
  score: number;
  note?: string;
  record: boolean;
  previous: number;
}

export default function PlayScreen({ route, navigation }: any) {
  const game = getGame(route.params.id);
  const Game = GAME_COMPONENTS[game.id];
  const { submitScore, scores } = useStore();
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const restart = useCallback(() => {
    setResult(null);
    setRunKey((k) => k + 1);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: game.title,
      headerRight: () => (
        <Pressable onPress={restart} hitSlop={10} style={{ padding: 6 }}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </Pressable>
      ),
    });
  }, [game.title, restart]);

  const onFinish = useCallback(
    (score: number, note?: string) => {
      const r = submitScore(game.id, score);
      setResult({ score, note, ...r });
    },
    [game.id, submitScore]
  );

  const best = Math.max(scores[game.id] || 0, result?.score || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.bestRow}>
        <Ionicons name="trophy" size={14} color={colors.yellow} />
        <Text style={styles.bestText}>Record : {best || '—'}</Text>
      </View>
      <View style={styles.game}>
        <Game key={runKey} onFinish={onFinish} />
      </View>

      {result && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.modal}>
            <Text style={styles.big}>{result.record ? '🏆' : game.emoji}</Text>
            <Text style={styles.over}>{result.record ? 'Nouveau record !' : 'Partie terminée'}</Text>
            <Text style={styles.score}>{result.score}</Text>
            <Text style={styles.unit}>{game.scoreLabel}</Text>
            {!!result.note && <Text style={styles.note}>{result.note}</Text>}
            {!result.record && result.previous > 0 && (
              <Text style={styles.note}>Votre record : {result.previous}</Text>
            )}
            <Pressable style={styles.primary} onPress={restart}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryText}>Rejouer</Text>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryText}>Quitter</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 6 },
  bestText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  game: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5,5,20,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  big: { fontSize: 60 },
  over: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 6 },
  score: { color: colors.yellow, fontSize: 56, fontWeight: '900', marginTop: 8 },
  unit: { color: colors.muted, fontSize: 13, marginTop: -4, letterSpacing: 1, textTransform: 'uppercase' },
  note: { color: '#CFCFF5', fontSize: 14, marginTop: 8 },
  primary: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink,
    height: 50,
    borderRadius: 25,
    width: '100%',
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  secondary: { marginTop: 10, paddingVertical: 12, width: '100%', alignItems: 'center' },
  secondaryText: { color: colors.muted, fontWeight: '700', fontSize: 15 },
});
