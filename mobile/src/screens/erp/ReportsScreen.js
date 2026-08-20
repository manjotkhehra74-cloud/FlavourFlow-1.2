import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function ReportsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Reports & Analytics</Text><Text style={styles.headerSub}>Insights that help you make smarter decisions</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>842</Text><Text style={styles.statLabel}>Total Employees</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>78.6%</Text><Text style={styles.statLabel}>Attendance %</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>42</Text><Text style={styles.statLabel}>Leaves Taken</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Attendance Trend 78.6%</Text><View style={styles.chart}><View style={styles.barWrap}><View style={[styles.bar, { height: 40 }]} /><Text style={styles.barLabel}>Apr</Text></View><View style={styles.barWrap}><View style={[styles.bar, { height: 60 }]} /><Text style={styles.barLabel}>May</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Quick Reports</Text><View style={styles.quickGrid}>{[
          { icon: 'time', label: 'Attendance', color: colors.blue },
          { icon: 'calendar', label: 'Leave', color: colors.green },
          { icon: 'wallet', label: 'Payroll', color: colors.orange },
          { icon: 'people', label: 'Employee', color: colors.purple },
        ].map((q,i)=><View key={i} style={styles.quickTile}><View style={[styles.quickIcon, { backgroundColor: q.color+'18' }]}><Ionicons name={q.icon} size={16} color={q.color} /></View><Text style={styles.quickLabel}>{q.label}</Text></View>)}</View></View>
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
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 12, height: 80 },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: { width: 24, backgroundColor: '#7C3AED', borderRadius: 4 },
  barLabel: { color: '#94A3B8', fontSize: 10, marginTop: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155' },
  quickIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
});
