import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { GAMES, getGame } from '../lib/games';
import { colors, radius, shadow } from '../lib/theme';
import { useStore } from '../lib/store';
import GameCard, { GridSpacer, padGrid } from '../components/GameCard';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { pseudo, avatar, level, levelProgress, recent, totalPlays } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const cols = width > 720 ? 3 : 2;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const day = Math.floor(Date.now() / 86400000);
  const featured = GAMES[day % GAMES.length];
  const open = (id: string) => nav.navigate('Detail', { id });
  const popular = [...GAMES].sort((a, b) => parseFloat(b.plays) - parseFloat(a.plays));

  const header = (
    <View>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>
            FLASH<Text style={{ color: colors.pink }}>ZONE</Text>
          </Text>
          <Text style={styles.hello}>Salut {pseudo} 👋 prêt à jouer ?</Text>
        </View>
        <Pressable style={styles.avatarWrap} onPress={() => nav.navigate('Profil')}>
          <Text style={{ fontSize: 26 }}>{avatar}</Text>
          <View style={styles.lvl}>
            <Text style={styles.lvlText}>{level}</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.xpBar}>
        <View style={[styles.xpFill, { width: `${Math.max(4, levelProgress * 100)}%` }]} />
      </View>
      <Text style={styles.xpText}>
        Niveau {level} · {totalPlays} partie{totalPlays > 1 ? 's' : ''} jouée{totalPlays > 1 ? 's' : ''}
      </Text>

      <Pressable onPress={() => open(featured.id)} style={styles.heroWrap}>
        <LinearGradient colors={featured.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroTag}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.heroTagText}>JEU DU JOUR</Text>
            </View>
            <Text style={styles.heroTitle}>{featured.title}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>
              {featured.description}
            </Text>
            <View style={styles.heroBtn}>
              <Ionicons name="play" size={16} color={featured.gradient[0]} />
              <Text style={[styles.heroBtnText, { color: featured.gradient[0] }]}>Jouer</Text>
            </View>
          </View>
          <Text style={styles.heroEmoji}>{featured.emoji}</Text>
        </LinearGradient>
      </Pressable>

      {recent.length > 0 && (
        <>
          <Text style={styles.section}>Reprendre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
            {recent.map((id) => (
              <GameCard key={id} game={getGame(id)} width={170} onPress={() => open(id)} />
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.section}>Les plus joués</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {popular.slice(0, 4).map((g) => (
          <GameCard key={g.id} game={g} width={170} onPress={() => open(g.id)} />
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Tous les jeux</Text>
        <Pressable onPress={() => nav.navigate('Jeux')}>
          <Text style={styles.link}>Explorer</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        key={cols}
        data={padGrid(GAMES, cols)}
        numColumns={cols}
        keyExtractor={(g, i) => g?.id ?? `sp${i}`}
        ListHeaderComponent={header}
        renderItem={({ item }) => (item ? <GameCard game={item} onPress={() => open(item.id)} /> : <GridSpacer />)}
        contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pink} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingTop: 10 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  hello: { color: colors.muted, fontSize: 14, marginTop: 2 },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.pink,
  },
  lvl: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.yellow,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  lvlText: { fontSize: 11, fontWeight: '900', color: '#1a1a1a' },
  xpBar: { height: 6, borderRadius: 3, backgroundColor: colors.surface, marginTop: 14, marginHorizontal: 6, overflow: 'hidden' },
  xpFill: { height: 6, backgroundColor: colors.cyan, borderRadius: 3 },
  xpText: { color: colors.muted, fontSize: 12, marginTop: 6, marginHorizontal: 6 },
  heroWrap: { marginTop: 18, marginHorizontal: 6, ...shadow },
  hero: { borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', minHeight: 170 },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 10 },
  heroDesc: { color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 4, lineHeight: 18, maxWidth: 260 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 14,
  },
  heroBtnText: { fontWeight: '900', fontSize: 14 },
  heroEmoji: { fontSize: 78, marginLeft: 6 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 },
  section: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 24, marginBottom: 6, marginLeft: 6 },
  link: { color: colors.cyan, fontWeight: '700', marginTop: 18 },
});
