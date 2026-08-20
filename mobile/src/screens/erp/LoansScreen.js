import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function LoansScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Loans & Advances</Text><Text style={styles.headerSub}>Manage your loans & advances</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.hero}><Text style={styles.heroLabel}>Total Outstanding</Text><Text style={styles.heroValue}>₹1,24,750</Text><View style={styles.heroStats}><View><Text style={styles.heroSub}>Total Approved ₹2,50,000</Text></View><View><Text style={styles.heroSub}>Total Paid ₹1,25,250</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Loans</Text>{[
          { title: 'Personal Loan LN20250012', amt: '₹1,50,000', status: 'Active', color: colors.blue },
          { title: 'Housing Loan LN20240008', amt: '₹8,00,000', status: 'Active', color: colors.green },
          { title: 'Vehicle Loan LN20230005', amt: '₹2,00,000', status: 'Closed', color: '#64748B' },
        ].map((r,i)=><View key={i} style={styles.loanRow}><View style={[styles.loanIcon, { backgroundColor: r.color+'18' }]}><Ionicons name="wallet" size={16} color={r.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.loanTitle}>{r.title}</Text><Text style={styles.loanSub}>{r.amt} • {r.status}</Text></View><Ionicons name="chevron-forward" size={16} color="#64748B" /></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  hero: { backgroundColor: '#1E1B4B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  heroLabel: { color: '#94A3B8', fontSize: 11 },
  heroValue: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  heroSub: { color: '#94A3B8', fontSize: 10 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  loanRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  loanIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  loanTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loanSub: { color: '#94A3B8', fontSize: 10 },
});
