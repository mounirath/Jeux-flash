import React, { useEffect, useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getGame, getLeaderboard } from '../lib/games';
import { colors, radius, shadow } from '../lib/theme';
import { useStore } from '../lib/store';

export default function DetailScreen({ route, navigation }: any) {
  const game = getGame(route.params.id);
  const { isFavorite, toggleFavorite, scores, plays, pseudo, avatar, markOpened } = useStore();
  const fav = isFavorite(game.id);
  const best = scores[game.id] || 0;
  const board = getLeaderboard(game, pseudo, best);

  useEffect(() => {
    markOpened(game.id);
  }, [game.id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <Pressable onPress={() => toggleFavorite(game.id)} hitSlop={10} style={{ padding: 6 }}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={26} color={fav ? colors.pink : '#fff'} />
        </Pressable>
      ),
    });
  }, [fav, game.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={game.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.emoji}>{game.emoji}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{game.category}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.desc}>{game.description}</Text>

        <View style={styles.stats}>
          <Stat icon="time" label="Durée" value={game.duration} color={colors.cyan} />
          <Stat
            icon="flame"
            label="Difficulté"
            value={['Facile', 'Moyen', 'Difficile'][game.difficulty - 1]}
            color={colors.orange}
          />
          <Stat icon="trophy" label="Record" value={best ? `${best}` : '—'} color={colors.yellow} />
          <Stat icon="repeat" label="Parties" value={`${plays[game.id] || 0}`} color={colors.green} />
        </View>

        <Text style={styles.section}>Comment jouer</Text>
        <View style={styles.card}>
          {game.howTo.map((h, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{h}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Classement</Text>
        <View style={styles.card}>
          {board.map((r) => (
            <View key={r.name + r.rank} style={[styles.row, r.me && styles.rowMe]}>
              <Text style={styles.rank}>{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</Text>
              <Text style={styles.name}>{r.me ? `${avatar} ${r.name} (vous)` : r.name}</Text>
              <Text style={styles.score}>
                {r.score} <Text style={styles.unit}>{game.scoreLabel}</Text>
              </Text>
            </View>
          ))}
          {best === 0 && <Text style={styles.noScore}>Jouez une partie pour apparaître au classement !</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('Play', { id: game.id })} style={({ pressed }) => [styles.play, pressed && { opacity: 0.85 }]}>
          <Ionicons name="play" size={22} color="#fff" />
          <Text style={styles.playText}>JOUER MAINTENANT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 110, width: '100%', maxWidth: 720, alignSelf: 'center' },
  hero: { height: 190, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', ...shadow },
  emoji: { fontSize: 92 },
  tag: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 18 },
  desc: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
  statLabel: { color: colors.muted, fontSize: 11 },
  section: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 26, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  stepText: { color: '#E5E5FF', flex: 1, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12, gap: 10 },
  rowMe: { backgroundColor: 'rgba(255,61,129,0.16)', borderWidth: 1, borderColor: colors.pink },
  rank: { color: '#fff', width: 30, textAlign: 'center', fontWeight: '800', fontSize: 16 },
  name: { color: '#fff', flex: 1, fontWeight: '600', fontSize: 15 },
  score: { color: colors.yellow, fontWeight: '800', fontSize: 15 },
  unit: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  noScore: { color: colors.muted, fontSize: 13, textAlign: 'center', paddingTop: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(10,10,31,0.94)',
    alignItems: 'center',
  },
  play: {
    width: '100%',
    maxWidth: 688,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.pink,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  playText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
