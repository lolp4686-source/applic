import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BotStatus } from '../types';
import { colors, borderRadius, fontSize, spacing } from '../theme';

const statusConfig: Record<BotStatus, { color: string; label: string }> = {
  online: { color: colors.success, label: 'En ligne' },
  offline: { color: colors.textMuted, label: 'Hors ligne' },
  error: { color: colors.error, label: 'Erreur' },
  starting: { color: colors.warning, label: 'Démarrage' },
};

export function StatusBadge({ status }: { status: BotStatus }) {
  const cfg = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
