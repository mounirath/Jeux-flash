import React from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GAMES } from '../lib/games';
import { colors } from '../lib/theme';
import { useStore } from '../lib/store';
import GameCard, { GridSpacer, padGrid } from '../components/GameCard';
import EmptyState from '../components/EmptyState';

export default function FavoritesScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const cols = width > 720 ? 3 : 2;
  const { favorites } = useStore();
  const data = GAMES.filter((g) => favorites.includes(g.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.count}>{data.length}</Text>
      </View>
      <FlatList
        key={cols}
        data={padGrid(data, cols)}
        numColumns={cols}
        keyExtractor={(g, i) => g?.id ?? `sp${i}`}
        renderItem={({ item }) =>
          item ? <GameCard game={item} onPress={() => nav.navigate('Detail', { id: item.id })} /> : <GridSpacer />
        }
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Pas encore de favoris"
            text="Touchez le cœur sur un jeu pour le retrouver ici en un clin d’œil."
            action="Découvrir les jeux"
            onAction={() => nav.navigate('Jeux')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  count: {
    color: '#fff',
    backgroundColor: colors.pink,
    minWidth: 28,
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '800',
  },
});
