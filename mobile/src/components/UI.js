import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, gradients, initials, avatarColorFor } from '../theme';

function v(x, fallback) { return x === undefined ? fallback : x; }

export function Screen({ children, style, edges = [], padded = false, variant = 'light' }) {
  const bg = variant === 'dark' ? colors.navy : variant === 'brand' ? colors.primary : colors.bg;
  return (
    <View style={[{ flex: 1, backgroundColor: bg }, padded && { padding: spacing.lg }, style]}>
      {children}
    </View>
  );
}

export function GradientView({ children, colors: c = gradients.brand, style, start, end }) {
  return (
    <LinearGradient
      colors={c}
      start={start || { x: 0, y: 0 }}
      end={end || { x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

export function Card({ children, style, variant = 'light', padded = true }) {
  const bg = variant === 'dark' ? colors.navyLight : variant === 'brand' ? colors.primarySoft : colors.card;
  return (
    <View style={[
      styles.card,
      { backgroundColor: bg, padding: padded ? spacing.lg : 0 },
      style
    ]}>
      {children}
    </View>
  );
}

export function Button({
  title, onPress, variant = 'primary', style, disabled, loading,
  icon, iconPosition = 'left', size = 'md',
}) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isSmall = size === 'sm';

  const height = isSmall ? 38 : 50;
  const padH = isSmall ? spacing.md : spacing.xl;
  const fontSize = isSmall ? 13 : 15;

  const content = (
    <View style={styles.btnInner}>
      {icon && iconPosition === 'left' && <Ionicons name={icon} size={isSmall ? 16 : 18} color={isPrimary || isDanger ? '#fff' : colors.primary} style={{ marginRight: 8 }} />}
      <Text style={[
        styles.btnText,
        { fontSize, color: isPrimary || isDanger ? '#fff' : isOutline ? colors.primary : colors.text }
      ]}>{title}</Text>
      {icon && iconPosition === 'right' && <Ionicons name={icon} size={18} color={isPrimary ? '#fff' : colors.primary} style={{ marginLeft: 8 }} />}
      {loading && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
    </View>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[{ borderRadius: radius.pill, overflow: 'hidden', minHeight: height }, style]}>
        <GradientView style={[{ minHeight: height, paddingHorizontal: padH, justifyContent: 'center' }, disabled && { opacity: 0.5 }]}>
          {content}
        </GradientView>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading}
      style={[
        styles.btn,
        {
          minHeight: height, paddingHorizontal: padH,
          backgroundColor: isDanger ? colors.red : isOutline ? 'transparent' : isGhost ? 'transparent' : colors.bg,
          borderWidth: isOutline ? 1.5 : 0, borderColor: colors.primary,
        },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

export function Input({ label, icon, error, ...props }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && { borderColor: colors.red }]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.subtext} style={{ marginRight: 10 }} /> : null}
        <TextInput
          placeholderTextColor={colors.subtext}
          style={styles.input}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Avatar({ name, color, size = 44, uri }) {
  const bg = color || avatarColorFor(name || '');
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

export function Badge({ text, color = colors.primary, tone = 'light', size = 'sm' }) {
  const bg = tone === 'dark' ? color : color + '1A';
  const fg = tone === 'dark' ? '#fff' : color;
  return (
    <View style={[
      styles.badge,
      { backgroundColor: bg, paddingHorizontal: size === 'sm' ? 8 : 12, paddingVertical: size === 'sm' ? 3 : 6 }
    ]}>
      <Text style={[styles.badgeText, { color: fg, fontSize: size === 'sm' ? 10 : 12 }]}>
        {String(text || '').toUpperCase()}
      </Text>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function StatCard({ label, value, icon, color = colors.primary, suffix, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[{ flex: 1 }, style]} onPress={onPress} disabled={!onPress}>
      <Card style={styles.statCard} padded>
        <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon || 'stats-chart'} size={18} color={color} />
        </View>
        <Text style={styles.statValue}>{value}{suffix ? <Text style={{ fontSize: 13, color: colors.subtext }}> {suffix}</Text> : null}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </Card>
    </Wrapper>
  );
}

export function QuickTile({ icon, label, color = colors.primary, onPress }) {
  return (
    <TouchableOpacity style={styles.quickTile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ children, right, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.md }, style]}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function EmptyState({ icon = 'inbox-outline', title, subtitle, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.subtext, textAlign: 'center', paddingHorizontal: 32, marginBottom: 12 }}>{subtitle}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  btn: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700', letterSpacing: 0.3 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, height: 50, backgroundColor: colors.card,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
  errorText: { color: colors.red, fontSize: 12, marginTop: 4 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill },
  badgeText: { fontWeight: '800', letterSpacing: 0.5 },
  statCard: { alignItems: 'flex-start' },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  quickTile: {
    width: '31%', aspectRatio: 1,
    backgroundColor: colors.card, borderRadius: radius.xl,
    padding: spacing.md, alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: spacing.md,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
});

export { colors, radius, spacing, gradients };
