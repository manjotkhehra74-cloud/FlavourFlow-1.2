import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, initials, avatarColorFor, statusColors } from '../theme';

export function Screen({ children, style, edges = ['top'] }) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', style, disabled, small }) {
  const bg =
    variant === 'primary' ? colors.brand :
    variant === 'danger' ? colors.red :
    variant === 'ghost' ? 'transparent' :
    variant === 'outline' ? 'transparent' : colors.brandLight;
  const textColor =
    variant === 'ghost' ? colors.brand :
    variant === 'outline' ? colors.brand : '#fff';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg, borderColor: variant === 'outline' ? colors.brand : 'transparent' },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 13 }, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.subtext}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Avatar({ name, color, size = 44, uri }) {
  const bg = color || avatarColorFor(name || '');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials(name || '')}</Text>
      )}
    </View>
  );
}

export function Badge({ text, color, tone = 'light' }) {
  const c = color || statusColors[text] || colors.brand;
  const bg = tone === 'solid' ? c : c + '1a';
  const tc = tone === 'solid' ? '#fff' : c;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: tc }]}>
        {String(text).replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function SectionTitle({ children, right }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginBottom: 8, marginTop: 6 }}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </Row>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', padding: 28 }}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>🌿</Text>
      <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 4 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.subtext, textAlign: 'center' }}>{subtitle}</Text> : null}
    </View>
  );
}

export function StatPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: (color || colors.brand) + '55' }]}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: color || colors.brand }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { fontWeight: '700', fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.subtext, marginBottom: 6 },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginLeft: 16, marginTop: 8 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
