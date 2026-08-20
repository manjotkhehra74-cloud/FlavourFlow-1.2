import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function PayrollScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Payroll Admin & Salary</Text><Text style={styles.headerSub}>Gross ₹5.84 Cr • Net ₹4.52 Cr</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statLabel}>Total Employees</Text><Text style={styles.statValue}>1,248</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Gross Payroll</Text><Text style={styles.statValue}>₹5.84 Cr</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Net Payroll</Text><Text style={[styles.statValue, { color: colors.green }]}>₹4.52 Cr</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Payroll Process Flow</Text><View style={styles.flow}><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.green }]}><Ionicons name="lock-closed" size={14} color="#fff" /></View><Text style={styles.flowLabel}>Data Lock</Text></View><View style={styles.flowLine} /><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.orange }]}><Ionicons name="calculator" size={14} color="#fff" /></View><Text style={styles.flowLabel}>Payroll Run</Text></View><View style={styles.flowLine} /><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.blue }]}><Ionicons name="checkmark" size={14} color="#fff" /></View><Text style={styles.flowLabel}>Approval</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Component Summary</Text>{[
          { label: 'Basic Pay', val: '₹2,48,65,000', color: colors.purple },
          { label: 'HRA', val: '₹74,25,000', color: colors.blue },
          { label: 'PF Deduction', val: '₹41,85,000', color: colors.red },
        ].map((r,i)=><View key={i} style={styles.row}><View style={[styles.dot, { backgroundColor: r.color }]} /><Text style={styles.rowLabel}>{r.label}</Text><Text style={styles.rowVal}>{r.val}</Text></View>)}</View>
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
  statValue: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  flow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  flowStep: { alignItems: 'center', flex: 1 },
  flowDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flowLabel: { color: '#94A3B8', fontSize: 10, marginTop: 6, textAlign: 'center' },
  flowLine: { flex: 1, height: 2, backgroundColor: '#334155', marginHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowLabel: { color: '#94A3B8', fontSize: 11, marginLeft: 8, flex: 1 },
  rowVal: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
