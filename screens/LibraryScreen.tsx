import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES, GAMES } from '../lib/games';
import { colors, radius } from '../lib/theme';
import GameCard, { GridSpacer, padGrid } from '../components/GameCard';
import EmptyState from '../components/EmptyState';

export default function LibraryScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const cols = width > 720 ? 3 : 2;
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter(
      (g) =>
        (cat === 'Tous' || g.category === cat) &&
        (!q || g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
    );
  }, [query, cat]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Tous les jeux</Text>
        <Text style={styles.count}>{data.length} jeu{data.length > 1 ? 'x' : ''}</Text>
      </View>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un jeu…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipOn]}>
              <Text style={[styles.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        key={cols}
        data={padGrid(data, cols)}
        numColumns={cols}
        keyExtractor={(g, i) => g?.id ?? `sp${i}`}
        renderItem={({ item }) =>
          item ? <GameCard game={item} onPress={() => nav.navigate('Detail', { id: item.id })} /> : <GridSpacer />
        }
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="Aucun résultat"
            text="Essayez un autre mot-clé ou une autre catégorie."
            action="Réinitialiser"
            onAction={() => {
              setQuery('');
              setCat('Tous');
            }}
          />
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pink} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  count: { color: colors.muted, fontWeight: '600' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: '#fff', fontSize: 15, height: 48, outlineStyle: 'none' } as any,
  chips: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.pink, borderColor: colors.pink },
  chipText: { color: colors.muted, fontWeight: '700' },
});
