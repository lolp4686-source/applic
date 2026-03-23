import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogEntry } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../theme';

const levelColors: Record<string, string> = {
  info: colors.primaryLight,
  warn: colors.warning,
  error: colors.error,
  success: colors.success,
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function LogItem({ log }: { log: LogEntry }) {
  const color = levelColors[log.level] ?? colors.textSecondary;
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{formatTime(log.timestamp)}</Text>
      <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.levelText, { color }]}>{log.level.toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.action}>{log.action}</Text>
        <Text style={styles.message} numberOfLines={2}>{log.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginRight: spacing.sm,
    marginTop: 2,
    minWidth: 65,
  },
  levelBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    minWidth: 52,
    alignItems: 'center',
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  action: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
