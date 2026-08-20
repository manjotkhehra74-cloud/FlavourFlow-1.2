import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function HRPoliciesScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>HR Policies & Handbook</Text><Text style={styles.headerSub}>Company policies and handbook</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>128</Text><Text style={styles.statLabel}>Total Policies</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.blue }]}>96</Text><Text style={styles.statLabel}>Mandatory</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>32</Text><Text style={styles.statLabel}>Acknowledged</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Featured Policy</Text><Text style={styles.featuredTitle}>Code of Conduct</Text><Text style={styles.featuredSub}>Our code of conduct defines the ethical standards and professional behavior expected from all employees.</Text><TouchableOpacity style={styles.readBtn}><Text style={styles.readText}>Read Now</Text><Ionicons name="arrow-forward" size={14} color={colors.primary} /></TouchableOpacity></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Policy Directory</Text>{[
          { title: 'Employee Code of Conduct', ver: 'Version 2.0 • Updated: 10 May 2025', status: 'Acknowledged', color: colors.green },
          { title: 'Leave Policy', ver: 'Version 3.1 • Updated: 08 May 2025', status: 'Pending', color: colors.orange },
          { title: 'Compensation & Benefits Policy', ver: 'Version 2.4 • Updated: 05 May 2025', status: 'Acknowledged', color: colors.green },
        ].map((p,i)=><View key={i} style={styles.policyRow}><View style={styles.policyIcon}><Ionicons name="document-text" size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.policyTitle}>{p.title}</Text><Text style={styles.policySub}>{p.ver}</Text></View><View style={[styles.badge, { backgroundColor: p.color+'22' }]}><Text style={[styles.badgeText, { color: p.color }]}>{p.status}</Text></View></View>)}</View>
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
  featuredTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 8 },
  featuredSub: { color: '#94A3B8', fontSize: 11, marginTop: 4, lineHeight: 16 },
  readBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#334155', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', gap: 6 },
  readText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  policyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  policyIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  policyTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  policySub: { color: '#94A3B8', fontSize: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
