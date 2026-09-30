import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../lib/theme';

interface Props {
  icon: any;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, text, action, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={38} color={colors.pink} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {action && (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 40, gap: 10 },
  circle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  text: { color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 10, backgroundColor: colors.pink, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontWeight: '800' },
});
