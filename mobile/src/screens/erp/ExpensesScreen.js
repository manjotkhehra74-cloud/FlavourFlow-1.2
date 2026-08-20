import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function ExpensesScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Expenses & Reimbursements</Text><Text style={styles.headerSub}>Submit, track and get reimbursed</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.hero}><View style={styles.heroStat}><Text style={styles.heroLabel}>Total Expenses</Text><Text style={styles.heroValue}>₹86,450</Text></View><View style={styles.heroStat}><Text style={styles.heroLabel}>My Claims 12</Text><Text style={styles.heroValue}>₹52,800</Text></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Expense Claims</Text>{[
          { title: 'Mumbai Office Visit', cat: 'Travel', amt: '₹8,750', status: 'Pending', color: colors.orange },
          { title: 'Team Lunch with Client', cat: 'Meals', amt: '₹2,350', status: 'Approved', color: colors.green },
          { title: 'Office Stationery Purchase', cat: 'Office Supplies', amt: '₹1,250', status: 'Approved', color: colors.green },
        ].map((e,i)=><View key={i} style={styles.expRow}><View style={[styles.expIcon, { backgroundColor: e.color+'18' }]}><Ionicons name="receipt" size={16} color={e.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.expTitle}>{e.title}</Text><Text style={styles.expSub}>{e.cat} • {e.amt}</Text></View><View style={[styles.badge, { backgroundColor: e.color+'22' }]}><Text style={[styles.badgeText, { color: e.color }]}>{e.status}</Text></View></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  hero: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  heroStat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  heroLabel: { color: '#94A3B8', fontSize: 10 },
  heroValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  expRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  expIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  expTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  expSub: { color: '#94A3B8', fontSize: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
