import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function PerformanceScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Performance</Text><Text style={styles.headerSub}>KRA, KPI & Appraisal</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}><View style={styles.scoreRow}><View><Text style={styles.scoreLabel}>Overall Rating</Text><Text style={styles.scoreValue}>4.6</Text><Text style={styles.scoreSub}>Excellent Performer</Text></View><View style={styles.scoreDonut}><Text style={styles.scorePct}>92%</Text><Text style={styles.scoreSmall}>vs Last Year</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>KRA / KPI Summary</Text><View style={styles.kpiGrid}><View style={styles.kpi}><Text style={styles.kpiLabel}>Total KRAs</Text><Text style={styles.kpiVal}>8</Text></View><View style={[styles.kpi, { backgroundColor: colors.green+'14' }]}><Text style={styles.kpiLabel}>Achieved</Text><Text style={[styles.kpiVal, { color: colors.green }]}>6</Text></View><View style={styles.kpi}><Text style={styles.kpiLabel}>In Progress</Text><Text style={styles.kpiVal}>2</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>KRA / KPI Progress</Text>{[
          { title: 'Improve Team Productivity', prog: 90, color: colors.green },
          { title: 'Employee Engagement', prog: 80, color: colors.green },
          { title: 'Project Delivery & Quality', prog: 70, color: colors.green },
          { title: 'Process Improvement', prog: 50, color: colors.orange },
        ].map((k,i)=><View key={i} style={styles.kpiRow}><View style={[styles.kpiIcon, { backgroundColor: k.color+'18' }]}><Ionicons name="trending-up" size={14} color={k.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.kpiTitle}>{k.title}</Text><View style={styles.bar}><View style={[styles.fill, { width: `${k.prog}%`, backgroundColor: k.color }]} /></View></View><Text style={styles.kpiPct}>{k.prog}%</Text></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreLabel: { color: '#94A3B8', fontSize: 11 },
  scoreValue: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  scoreSub: { color: colors.green, fontSize: 11, marginTop: 2 },
  scoreDonut: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#334155' },
  scorePct: { color: '#fff', fontSize: 18, fontWeight: '900' },
  scoreSmall: { color: '#94A3B8', fontSize: 9 },
  kpiGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  kpi: { flex: 1, backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  kpiLabel: { color: '#94A3B8', fontSize: 9 },
  kpiVal: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  kpiRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  kpiTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bar: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginTop: 6 },
  fill: { height: 6, borderRadius: 3 },
  kpiPct: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 8 },
});
