import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot } from '../types';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { colors, spacing, fontSize } from '../theme';

interface BotCardProps {
  bot: Bot;
  onPress: () => void;
  onToggle: () => void;
}

export function BotCard({ bot, onPress, onToggle }: BotCardProps) {
  const isOn = bot.status === 'online' || bot.status === 'starting';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{bot.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{bot.name}</Text>
            <Text style={styles.prefix}>Préfixe: {bot.prefix}</Text>
          </View>
          <StatusBadge status={bot.status} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, isOn ? styles.btnStop : styles.btnStart]}
            onPress={onToggle}
          >
            <Text style={styles.btnText}>{isOn ? 'Arrêter' : 'Démarrer'}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
  info: { flex: 1, marginRight: spacing.sm },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  prefix: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md },
  btn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  btnStart: { backgroundColor: colors.success + '20' },
  btnStop: { backgroundColor: colors.error + '20' },
  btnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
});
