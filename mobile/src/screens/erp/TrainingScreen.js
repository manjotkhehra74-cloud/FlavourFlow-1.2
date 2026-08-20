import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function TrainingScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Training & Learning</Text><Text style={styles.headerSub}>My Learning • Team Learning</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Assigned</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>7</Text><Text style={styles.statLabel}>Completed</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>18h</Text><Text style={styles.statLabel}>Training Hours</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.orange }]}>720</Text><Text style={styles.statLabel}>Points</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Learning Progress 58%</Text><View style={styles.progressBar}><View style={[styles.progressFill, { width: '58%' }]} /></View><View style={styles.legend}><Text style={styles.legendText}>Not Started 3</Text><Text style={styles.legendText}>In Progress 4</Text><Text style={styles.legendText}>Completed 7</Text></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Continue Learning</Text>{['Effective Communication','Information Security','Workplace Health & Safety'].map((t,i)=><View key={i} style={styles.courseRow}><View style={styles.courseThumb}><Ionicons name="book" size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.courseTitle}>{t}</Text><Text style={styles.courseSub}>45% • 2h 30m</Text></View><View style={styles.badge}><Text style={styles.badgeText}>In Progress</Text></View></View>)}</View>
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
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 10, marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.blue, borderRadius: 4 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  legendText: { color: '#94A3B8', fontSize: 10 },
  courseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  courseThumb: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  courseTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  courseSub: { color: '#94A3B8', fontSize: 10 },
  badge: { backgroundColor: colors.blue+'22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.blue, fontSize: 10, fontWeight: '800' },
});
