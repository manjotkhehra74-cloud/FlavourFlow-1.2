import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function PayrollScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Payroll Admin & Salary Management 💰</Text><Text style={styles.headerSub}>Manage payroll, salaries, compliances and payouts</Text></View>
        <TouchableOpacity style={styles.headerBadge}><Text style={styles.badgeText}>May 2025</Text></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.topGrid}>
          {[
            { label: 'Total Employees', val: '1,248', sub: 'Active Employees', icon: 'people', color: '#7C3AED' },
            { label: 'Gross Payroll', val: '₹5,84,32,100', sub: 'This Month', icon: 'wallet', color: '#3B82F6' },
            { label: 'Net Payroll', val: '₹4,52,81,670', sub: 'This Month', icon: 'cash', color: '#10B981' },
            { label: 'Payouts Done', val: '1,196', sub: '95.82%', icon: 'checkmark-circle', color: '#8B5CF6' },
          ].map((s,i)=>(
            <View key={i} style={styles.topCard}>
              <View style={[styles.topIcon, { backgroundColor: s.color+'18' }]}><Ionicons name={s.icon} size={16} color={s.color} /></View>
              <Text style={styles.topLabel}>{s.label}</Text>
              <Text style={styles.topVal}>{s.val}</Text>
              <Text style={styles.topSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={[styles.card, { flex: 1.2 }]}>
            <Text style={styles.cardTitle}>Payroll Overview (This Month)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View style={styles.donut}><Text style={styles.donutVal}>₹5.84 Cr</Text><Text style={styles.donutLab}>Total Gross</Text></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                {[
                  { label: 'Basic Pay', pct: '42.46%', val: '₹2.48 Cr', color: '#8B5CF6' },
                  { label: 'Allowances', pct: '30.65%', val: '₹1.79 Cr', color: '#3B82F6' },
                  { label: 'Deductions', pct: '18.32%', val: '₹1.07 Cr', color: '#10B981' },
                ].map((r,i)=><View key={i} style={styles.legRow}><View style={[styles.dot, { backgroundColor: r.color }]} /><Text style={styles.legLabel}>{r.label}</Text><Text style={styles.legVal}>{r.val}</Text></View>)}
              </View>
            </View>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Payroll Process Flow</Text>
            <View style={styles.flow}><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.green }]}><Ionicons name="lock-closed" size={12} color="#fff" /></View><Text style={styles.flowLabel}>Data Lock</Text></View><View style={styles.flowLine} /><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.orange }]}><Text style={styles.flowNum}>2</Text></View><Text style={styles.flowLabel}>Payroll Run</Text></View><View style={styles.flowLine} /><View style={styles.flowStep}><View style={[styles.flowDot, { backgroundColor: colors.blue }]}><Text style={styles.flowNum}>3</Text></View><Text style={styles.flowLabel}>Review</Text></View></View>
            <View style={styles.statusPill}><Text style={styles.statusText}>Step 3: Review & Verify • PR-0525-001</Text></View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Payroll Run Summary</Text>
            {[
              ['Payroll Month','May 2025'],
              ['Run ID','PR-0525-001'],
              ['Status','In Review'],
            ].map(([k,v],i)=><View key={i} style={styles.kv}><Text style={styles.k}>{k}</Text><Text style={[styles.v, v==='In Review'&&{color: colors.orange}]}>{v}</Text></View>)}
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Component Summary</Text>
            {[
              ['Basic Pay','₹2,48,65,000'],
              ['HRA','₹74,25,000'],
              ['PF','₹41,85,000'],
            ].map(([k,v],i)=><View key={i} style={styles.kv}><Text style={styles.k}>{k}</Text><Text style={styles.v}>{v}</Text></View>)}
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Payout Summary</Text>
            <View style={styles.payoutDonut}><Text style={styles.payoutPct}>95.82%</Text><Text style={styles.payoutSub}>Completed</Text></View>
            <Text style={styles.payoutLabel}>Paid 1,196 • Pending 52</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Employee Payroll Overview</Text>
          {[
            { name: 'Rohan Mehta', id: 'E00124', dept: 'IT', gross: '₹82,500', status: 'Paid' },
            { name: 'Priya Sharma', id: 'E00145', dept: 'HR', gross: '₹68,000', status: 'Paid' },
            { name: 'Neha Gupta', id: 'E00211', dept: 'Quality', gross: '₹45,000', status: 'Pending' },
          ].map((e,i)=><View key={i} style={styles.empRow}><View style={styles.avatar}><Text style={styles.avatarText}>{e.name.split(' ').map(w=>w[0]).join('')}</Text></View><View style={{ flex: 1, marginLeft: 8 }}><Text style={styles.empName}>{e.name}</Text><Text style={styles.empSub}>{e.dept} • {e.id}</Text></View><Text style={styles.empGross}>{e.gross}</Text><View style={[styles.badge, { backgroundColor: e.status==='Paid'? colors.green+'22' : colors.orange+'22' }]}><Text style={[styles.badgeText, { color: e.status==='Paid'? colors.green : colors.orange }]}>{e.status}</Text></View></View>)}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  headerBadge: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  topCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
  topIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  topLabel: { color: '#94A3B8', fontSize: 10 },
  topVal: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 2 },
  topSub: { color: '#64748B', fontSize: 9, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12, flex: 1 },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  donut: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#334155' },
  donutVal: { color: '#fff', fontSize: 11, fontWeight: '900' },
  donutLab: { color: '#94A3B8', fontSize: 9 },
  legRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legLabel: { color: '#94A3B8', fontSize: 10, marginLeft: 6, flex: 1 },
  legVal: { color: '#fff', fontSize: 10, fontWeight: '700' },
  flow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  flowStep: { alignItems: 'center', flex: 1 },
  flowDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  flowNum: { color: '#fff', fontSize: 11, fontWeight: '800' },
  flowLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4, textAlign: 'center' },
  flowLine: { flex: 1, height: 2, backgroundColor: '#334155' },
  statusPill: { backgroundColor: colors.orange+'22', padding: 6, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  statusText: { color: colors.orange, fontSize: 10, fontWeight: '700' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  k: { color: '#94A3B8', fontSize: 10 },
  v: { color: '#fff', fontSize: 10, fontWeight: '700' },
  payoutDonut: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 10, borderWidth: 4, borderColor: colors.green },
  payoutPct: { color: '#fff', fontSize: 12, fontWeight: '900' },
  payoutSub: { color: '#94A3B8', fontSize: 8 },
  payoutLabel: { color: '#94A3B8', fontSize: 10, textAlign: 'center', marginTop: 6 },
  empRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  empName: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empSub: { color: '#94A3B8', fontSize: 9 },
  empGross: { color: '#fff', fontSize: 11, fontWeight: '700', marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
