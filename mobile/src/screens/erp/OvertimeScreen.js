import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function OvertimeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Overtime Management</Text><Text style={styles.headerSub}>Track OT hours and approvals</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statLabel}>This Month OT</Text><Text style={styles.statValue}>24h 30m</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Approved</Text><Text style={[styles.statValue, { color: colors.green }]}>20h 00m</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Pending</Text><Text style={[styles.statValue, { color: colors.orange }]}>04h 30m</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Recent Overtime Requests</Text>
          {[
            { date: '18 May 2025, Sun', hours: '3h 00m', status: 'Approved', color: colors.green },
            { date: '15 May 2025, Thu', hours: '2h 30m', status: 'Pending', color: colors.orange },
          ].map((r,i)=>(
            <View key={i} style={styles.row}><View><Text style={styles.rowTitle}>{r.date}</Text><Text style={styles.rowSub}>{r.hours}</Text></View><View style={[styles.badge, { backgroundColor: r.color+'22' }]}><Text style={[styles.badgeText, { color: r.color }]}>{r.status}</Text></View></View>
          ))}
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Quick Actions</Text><View style={styles.quickGrid}>{['Apply OT','My Requests','OT Calendar','OT Policy'].map((l,i)=><View key={i} style={styles.quickTile}><Ionicons name="time" size={18} color={colors.primary} /><Text style={styles.quickLabel}>{l}</Text></View>)}</View></View>
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
  statLabel: { color: '#94A3B8', fontSize: 10 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rowTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rowSub: { color: '#94A3B8', fontSize: 11 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
});
