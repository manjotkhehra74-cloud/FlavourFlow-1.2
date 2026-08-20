import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function OvertimeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Overtime Management</Text><Text style={styles.headerSub}>Track overtime and approvals</Text></View>
        <View style={styles.tab}><Text style={styles.tabActive}>Overview</Text><Text style={styles.tabInactive}>My Overtime</Text><Text style={styles.tabInactive}>Approvals</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>This Month</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statLabel}>Total OT Hours</Text><Text style={styles.statValue}>24h 30m</Text></View>
            <View style={styles.stat}><Text style={styles.statLabel}>Approved</Text><Text style={[styles.statValue, { color: colors.green }]}>20h 00m</Text></View>
            <View style={styles.stat}><Text style={styles.statLabel}>Pending</Text><Text style={[styles.statValue, { color: colors.orange }]}>04h 30m</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Recent Overtime Requests</Text><TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity></View>
          {[
            { date: '18 May 2025, Sun • General Shift - A', hours: '3h 00m', status: 'Approved', color: colors.green },
            { date: '15 May 2025, Thu • General Shift - A', hours: '2h 30m', status: 'Pending', color: colors.orange },
            { date: '10 May 2025, Sat • General Shift - B', hours: '4h 00m', status: 'Approved', color: colors.green },
          ].map((r,i)=>(
            <View key={i} style={styles.reqRow}>
              <View style={styles.reqLeft}><Text style={styles.reqDate}>{r.date}</Text><Text style={styles.reqHours}>{r.hours}</Text></View>
              <View style={[styles.badge, { backgroundColor: r.color+'22' }]}><Text style={[styles.badgeText, { color: r.color }]}>{r.status}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'add-circle', label: 'Apply OT', color: colors.primary },
              { icon: 'document', label: 'My Requests', color: colors.blue },
              { icon: 'calendar', label: 'OT Calendar', color: colors.green },
              { icon: 'book', label: 'OT Policy', color: colors.orange },
            ].map((q,i)=><View key={i} style={styles.quickTile}><View style={[styles.quickIcon, { backgroundColor: q.color+'18' }]}><Ionicons name={q.icon} size={18} color={q.color} /></View><Text style={styles.quickLabel}>{q.label}</Text></View>)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 48, left: 16 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  headerSub: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 2 },
  tab: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 999, padding: 4, marginTop: 12, alignSelf: 'center', gap: 8 },
  tabActive: { backgroundColor: '#7C3AED', color: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  tabInactive: { color: '#94A3B8', fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 6 },
  statsCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  statsTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#94A3B8', fontSize: 10 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  viewAll: { color: '#8B5CF6', fontSize: 11, fontWeight: '700' },
  reqRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  reqLeft: { flex: 1 },
  reqDate: { color: '#fff', fontSize: 11, fontWeight: '600' },
  reqHours: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155' },
  quickIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
});
