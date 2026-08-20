import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function AssetsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Assets Management</Text><Text style={styles.headerSub}>Track, manage and secure company assets</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Total Assets</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>10</Text><Text style={styles.statLabel}>Assigned</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.orange }]}>1</Text><Text style={styles.statLabel}>Due for Return</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Assigned Assets</Text>{[
          { name: 'MacBook Pro 14" (M2 Pro)', tag: 'LAP-MNJ-001', status: 'Assigned', color: colors.green },
          { name: 'iPhone 14 Pro Max (256GB)', tag: 'MOB-MNJ-002', status: 'Assigned', color: colors.green },
          { name: 'Logitech Wireless Headset', tag: 'ACC-MNJ-004', status: 'Maintenance', color: colors.orange },
        ].map((a,i)=><View key={i} style={styles.assetRow}><View style={styles.assetIcon}><Ionicons name="laptop" size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.assetTitle}>{a.name}</Text><Text style={styles.assetSub}>{a.tag}</Text></View><View style={[styles.badge, { backgroundColor: a.color+'22' }]}><Text style={[styles.badgeText, { color: a.color }]}>{a.status}</Text></View></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  assetIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  assetTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  assetSub: { color: '#94A3B8', fontSize: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
