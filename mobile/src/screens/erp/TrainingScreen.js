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
        <TouchableOpacity style={styles.tabActive}><Text style={styles.tabActiveText}>My Learning</Text></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#3B82F618' }]}><Ionicons name="book" size={18} color="#3B82F6" /></View><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Assigned Courses</Text><Text style={styles.statSub}>4 In Progress</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#10B98118' }]}><Ionicons name="checkmark-circle" size={18} color="#10B981" /></View><Text style={styles.statValue}>7</Text><Text style={styles.statLabel}>Completed</Text><Text style={[styles.statSub, { color: '#10B981' }]}>This Year</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#8B5CF618' }]}><Ionicons name="time" size={18} color="#8B5CF6" /></View><Text style={styles.statValue}>18</Text><Text style={styles.statLabel}>Training Hours</Text><Text style={styles.statSub}>This Year</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#F59E0B18' }]}><Ionicons name="trophy" size={18} color="#F59E0B" /></View><Text style={styles.statValue}>720</Text><Text style={styles.statLabel}>Learning Points</Text><Text style={[styles.statSub, { color: '#F59E0B' }]}>Earned</Text></View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Learning Progress</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <View style={styles.progressDonut}><Text style={styles.progressPct}>58%</Text><Text style={styles.progressLab}>Overall Progress</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#6B7280' }]} /><Text style={styles.legText}>Not Started</Text><Text style={styles.legVal}>3 (15%)</Text></View>
              <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#3B82F6' }]} /><Text style={styles.legText}>In Progress</Text><Text style={styles.legVal}>4 (20%)</Text></View>
              <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#10B981' }]} /><Text style={styles.legText}>Completed</Text><Text style={styles.legVal}>7 (35%)</Text></View>
              <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legText}>Overdue</Text><Text style={styles.legVal}>2 (10%)</Text></View>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Continue Learning</Text><TouchableOpacity><Text style={styles.link}>View All</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {[
              { title: 'Effective Communication', prog: '45%', time: '2h 30m', color: '#3B82F6' },
              { title: 'Information Security', prog: '30%', time: '1h 45m', color: '#7C3AED' },
              { title: 'Workplace Health & Safety', prog: 'Not Started', time: '2h 15m', color: '#F59E0B' },
            ].map((c,i)=><View key={i} style={styles.courseCard}><View style={[styles.courseThumb, { backgroundColor: c.color+'22' }]}><Ionicons name="book" size={20} color={c.color} /></View><Text style={styles.courseTitle}>{c.title}</Text><Text style={styles.courseSub}>{c.time} • {c.prog}</Text><View style={styles.courseBar}><View style={[styles.courseFill, { width: c.prog.includes('%')? c.prog : '0%', backgroundColor: c.color }]} /></View></View>)}
          </ScrollView>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Certificates</Text>
          <View style={styles.certGrid}>
            {[
              { title: 'Effective Communication', date: '10 May 2025', color: '#F59E0B' },
              { title: 'Information Security', date: '25 Apr 2025', color: '#10B981' },
              { title: 'Customer Service', date: '15 Mar 2025', color: '#3B82F6' },
            ].map((c,i)=><View key={i} style={styles.certCard}><Ionicons name="ribbon" size={20} color={c.color} /><Text style={styles.certTitle}>{c.title}</Text><Text style={styles.certDate}>{c.date}</Text></View>)}
          </View>
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
  tabActive: { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  tabActiveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  statSub: { color: '#94A3B8', fontSize: 8, marginTop: 2 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  link: { color: '#8B5CF6', fontSize: 11, fontWeight: '700' },
  progressDonut: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#334155' },
  progressPct: { color: '#fff', fontSize: 16, fontWeight: '900' },
  progressLab: { color: '#94A3B8', fontSize: 8 },
  legRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legText: { color: '#94A3B8', fontSize: 10, marginLeft: 6, flex: 1 },
  legVal: { color: '#fff', fontSize: 10, fontWeight: '700' },
  courseCard: { width: 140, backgroundColor: '#0F172A', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', marginRight: 8 },
  courseThumb: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  courseTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  courseSub: { color: '#94A3B8', fontSize: 9, marginTop: 2 },
  courseBar: { height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 8 },
  courseFill: { height: 4, borderRadius: 2 },
  certGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  certCard: { flex: 1, backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  certTitle: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  certDate: { color: '#94A3B8', fontSize: 8, marginTop: 2 },
});
