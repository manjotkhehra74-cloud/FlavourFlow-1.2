import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function EmployeeLifecycleScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Employee Lifecycle</Text><Text style={styles.headerSub}>Transfers, Promotions & Role Changes</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>14</Text><Text style={styles.statLabel}>Transfers</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>08</Text><Text style={styles.statLabel}>Promotions</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>06</Text><Text style={styles.statLabel}>Role Changes</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Recent Lifecycle Requests</Text>{[
          { name: 'Rohan Mehta', type: 'Transfer', from: 'IT Development', to: 'IT Product', status: 'Pending' },
          { name: 'Priya Sharma', type: 'Promotion', from: 'HR Executive', to: 'HR Specialist', status: 'Pending' },
          { name: 'Amit Kumar', type: 'Role Change', from: 'Officer', to: 'Senior Officer', status: 'Approved' },
        ].map((r,i)=><View key={i} style={styles.reqRow}><View style={{ flex: 1 }}><Text style={styles.reqName}>{r.name}</Text><Text style={styles.reqSub}>{r.type} • {r.from} → {r.to}</Text></View><View style={[styles.badge, { backgroundColor: r.status==='Pending'? colors.orange+'22' : colors.green+'22' }]}><Text style={[styles.badgeText, { color: r.status==='Pending'? colors.orange : colors.green }]}>{r.status}</Text></View></View>)}</View>
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
  reqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  reqName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  reqSub: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
