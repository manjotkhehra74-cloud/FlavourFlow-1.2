import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function RecruitmentScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Recruitment (ATS)</Text><Text style={styles.headerSub}>Manage jobs and candidates</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsGrid}>
          <View style={styles.stat}><Ionicons name="briefcase" size={20} color={colors.purple} /><Text style={styles.statValue}>18</Text><Text style={styles.statLabel}>Total Jobs</Text></View>
          <View style={styles.stat}><Ionicons name="people" size={20} color={colors.blue} /><Text style={styles.statValue}>245</Text><Text style={styles.statLabel}>Applicants</Text></View>
          <View style={styles.stat}><Ionicons name="checkmark-done" size={20} color={colors.green} /><Text style={styles.statValue}>16</Text><Text style={styles.statLabel}>Hired</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Recruitment Pipeline</Text><View style={styles.pipeline}><View style={styles.pipeStep}><Text style={styles.pipeVal}>245</Text><Text style={styles.pipeLabel}>Applied</Text></View><View style={styles.pipeLine} /><View style={styles.pipeStep}><Text style={styles.pipeVal}>142</Text><Text style={styles.pipeLabel}>Screening</Text></View><View style={styles.pipeLine} /><View style={styles.pipeStep}><Text style={styles.pipeVal}>62</Text><Text style={styles.pipeLabel}>Interview</Text></View></View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Open Job Positions</Text>{['HR Executive','Payroll Specialist','Talent Acquisition Manager'].map((t,i)=><View key={i} style={styles.jobRow}><View style={styles.jobIcon}><Ionicons name="briefcase" size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.jobTitle}>{t}</Text><Text style={styles.jobSub}>Human Resources • Full Time</Text></View><Text style={styles.jobCount}>{[12,18,25][i]} Applicants</Text></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 6 },
  statLabel: { color: '#94A3B8', fontSize: 10, marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  pipeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  pipeStep: { alignItems: 'center' },
  pipeVal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  pipeLabel: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  pipeLine: { flex: 1, height: 2, backgroundColor: '#334155', marginHorizontal: 4 },
  jobRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  jobIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  jobTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  jobSub: { color: '#94A3B8', fontSize: 10 },
  jobCount: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
});
