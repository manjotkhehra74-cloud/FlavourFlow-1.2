import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function Header({ title, subtitle, onBack, right }) {
  return (
    <SafeAreaView edges={['top']} style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </SafeAreaView>
  );
}

export function HeroHeader({ title, subtitle, illustration }) {
  return (
    <View style={styles.hero}>
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
      </SafeAreaView>
      {illustration}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.brand },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: { color: '#fff', fontSize: 19, fontWeight: '800' },
  subtitle: { color: '#d1fae5', fontSize: 12, marginTop: 2 },
  hero: {
    backgroundColor: colors.brand,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 8 },
  heroSubtitle: { color: '#d1fae5', fontSize: 14, marginTop: 6, maxWidth: '80%' },
});
