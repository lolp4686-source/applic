import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  title: { color: colors.textSecondary, fontSize: fontSize.lg, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.sm, textAlign: 'center' },
});
