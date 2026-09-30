import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GAMES } from '../lib/games';
import { colors, radius } from '../lib/theme';
import { useStore } from '../lib/store';

const AVATARS = ['😎', '🦊', '🐼', '🦄', '👾', '🤖', '🐲', '🐙'];

export default function ProfileScreen() {
  const s = useStore();
  const [pseudo, setPseudo] = useState(s.pseudo);
  const [avatar, setAvatar] = useState(s.avatar);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (s.loaded) {
      setPseudo(s.pseudo);
      setAvatar(s.avatar);
    }
  }, [s.loaded]);

  const save = () => {
    s.setProfile(pseudo, avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Mon profil</Text>

          <View style={styles.profileCard}>
            <View style={styles.bigAvatar}>
              <Text style={{ fontSize: 44 }}>{avatar}</Text>
            </View>
            <Text style={styles.levelLabel}>NIVEAU {s.level}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${Math.max(4, s.levelProgress * 100)}%` }]} />
            </View>
            <Text style={styles.xpText}>{s.xp % 100} / 100 XP vers le niveau {s.level + 1}</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value={s.totalPlays} label="Parties" icon="game-controller" color={colors.cyan} />
            <Stat value={s.recordsCount} label="Records" icon="trophy" color={colors.yellow} />
            <Stat value={s.favorites.length} label="Favoris" icon="heart" color={colors.pink} />
          </View>

          <Text style={styles.section}>Personnaliser</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Pseudo</Text>
            <TextInput
              style={styles.input}
              value={pseudo}
              onChangeText={setPseudo}
              maxLength={16}
              placeholder="Votre pseudo"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              onSubmitEditing={save}
            />
            <Text style={[styles.label, { marginTop: 14 }]}>Avatar</Text>
            <View style={styles.avatars}>
              {AVATARS.map((a) => (
                <Pressable key={a} onPress={() => setAvatar(a)} style={[styles.avatarOpt, avatar === a && styles.avatarOn]}>
                  <Text style={{ fontSize: 26 }}>{a}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.saveBtn, saved && { backgroundColor: colors.green }]} onPress={save}>
              <Ionicons name={saved ? 'checkmark' : 'save'} size={18} color="#fff" />
              <Text style={styles.saveText}>{saved ? 'Enregistré !' : 'Enregistrer'}</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Badges</Text>
          <View style={styles.badges}>
            {s.badges.map((b) => (
              <View key={b.id} style={[styles.badge, !b.unlocked && { opacity: 0.4 }]}>
                <Text style={{ fontSize: 30 }}>{b.unlocked ? b.emoji : '🔒'}</Text>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Mes records</Text>
          <View style={styles.card}>
            {GAMES.map((g) => (
              <View key={g.id} style={styles.recordRow}>
                <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                <Text style={styles.recordName}>{g.title}</Text>
                <Text style={styles.recordScore}>{s.scores[g.id] || '—'}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.reset} onPress={() => setConfirm(true)}>
            <Ionicons name="trash" size={16} color={colors.red} />
            <Text style={styles.resetText}>Réinitialiser ma progression</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={styles.modalTitle}>Tout effacer ?</Text>
            <Text style={styles.modalText}>Vos records, favoris, badges et statistiques seront supprimés définitivement.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.surface2 }]} onPress={() => setConfirm(false)}>
                <Text style={styles.modalBtnText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.red }]}
                onPress={() => {
                  s.resetAll();
                  setConfirm(false);
                }}
              >
                <Text style={styles.modalBtnText}>Effacer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label, icon, color }: { value: number; label: string; icon: any; color: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 14 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bigAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surface2,
    borderWidth: 3,
    borderColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: { color: colors.yellow, fontWeight: '900', letterSpacing: 2, marginTop: 12 },
  xpBar: { height: 10, width: '100%', borderRadius: 5, backgroundColor: colors.bg, marginTop: 10, overflow: 'hidden' },
  xpFill: { height: 10, borderRadius: 5, backgroundColor: colors.cyan },
  xpText: { color: colors.muted, fontSize: 12, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 12 },
  section: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 26, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontWeight: '700', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    color: '#fff',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    outlineStyle: 'none',
  } as any,
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOpt: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOn: { borderColor: colors.pink, backgroundColor: colors.surface2 },
  saveBtn: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '31.5%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeTitle: { color: '#fff', fontWeight: '800', fontSize: 12, textAlign: 'center' },
  badgeDesc: { color: colors.muted, fontSize: 10, textAlign: 'center' },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  recordName: { color: '#fff', flex: 1, fontWeight: '600', fontSize: 15 },
  recordScore: { color: colors.yellow, fontWeight: '800', fontSize: 16 },
  reset: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 28, padding: 14 },
  resetText: { color: colors.red, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 8 },
  modalText: { color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  modalBtn: { flex: 1, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '800' },
});
