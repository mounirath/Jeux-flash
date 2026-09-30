import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GameInfo } from '../lib/games';
import { colors, radius, shadow } from '../lib/theme';
import { useStore } from '../lib/store';

interface Props {
  game: GameInfo;
  onPress: () => void;
  width?: number;
}

export default function GameCard({ game, onPress, width }: Props) {
  const { isFavorite, toggleFavorite, scores } = useStore();
  const fav = isFavorite(game.id);
  const best = scores[game.id] || 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, width ? { width } : { flex: 1 }, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <LinearGradient colors={game.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.art}>
        <Text style={styles.emoji}>{game.emoji}</Text>
        <Pressable hitSlop={10} onPress={() => toggleFavorite(game.id)} style={styles.heart}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? colors.pink : '#fff'} />
        </Pressable>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{game.category}</Text>
        </View>
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="people" size={12} color={colors.muted} />
          <Text style={styles.metaText}>{game.plays}</Text>
          <Text style={styles.metaText}>·</Text>
          <Ionicons name="trophy" size={12} color={best ? colors.yellow : colors.muted} />
          <Text style={[styles.metaText, best ? { color: colors.yellow } : null]}>{best || '—'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function GridSpacer() {
  return <View style={{ flex: 1, margin: 6 }} />;
}

export function padGrid<T>(data: T[], cols: number): (T | null)[] {
  const out: (T | null)[] = [...data];
  while (out.length % cols !== 0) out.push(null);
  return out;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  art: { height: 116, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 54 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.38)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  info: { padding: 12, gap: 4 },
  title: { color: colors.text, fontSize: 15, fontWeight: '800' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
