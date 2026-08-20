import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function RecruitmentScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Recruitment Admin (ATS)</Text><Text style={styles.headerSub}>Manage jobs, applicants and interviews</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.topGrid}>
          <View style={styles.topCard}><View style={[styles.topIcon, { backgroundColor: '#7C3AED18' }]}><Ionicons name="briefcase" size={18} color="#7C3AED" /></View><Text style={styles.topLabel}>Total Jobs</Text><Text style={styles.topVal}>18</Text><Text style={styles.topSub}>↑ 3 this month</Text></View>
          <View style={styles.topCard}><View style={[styles.topIcon, { backgroundColor: '#3B82F618' }]}><Ionicons name="people" size={18} color="#3B82F6" /></View><Text style={styles.topLabel}>Total Applicants</Text><Text style={styles.topVal}>245</Text><Text style={styles.topSub}>↑ 28 this month</Text></View>
          <View style={styles.topCard}><View style={[styles.topIcon, { backgroundColor: '#10B98118' }]}><Ionicons name="checkmark-done" size={18} color="#10B981" /></View><Text style={styles.topLabel}>In Progress</Text><Text style={styles.topVal}>62</Text><Text style={styles.topSub}>↑ 12 this month</Text></View>
          <View style={styles.topCard}><View style={[styles.topIcon, { backgroundColor: '#F59E0B18' }]}><Ionicons name="star" size={18} color="#F59E0B" /></View><Text style={styles.topLabel}>Hired</Text><Text style={styles.topVal}>16</Text><Text style={styles.topSub}>↑ 4 this month</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Recruitment Pipeline</Text><TouchableOpacity><Text style={styles.link}>View Details</Text></TouchableOpacity></View>
          <View style={styles.pipeline}>
            <View style={styles.pipeStep}><View style={[styles.pipeDot, { backgroundColor: '#7C3AED' }]}><Ionicons name="document-text" size={12} color="#fff" /></View><Text style={styles.pipeLabel}>Applied</Text><Text style={styles.pipeVal}>245</Text></View>
            <View style={styles.pipeLine} />
            <View style={styles.pipeStep}><View style={[styles.pipeDot, { backgroundColor: '#3B82F6' }]}><Ionicons name="search" size={12} color="#fff" /></View><Text style={styles.pipeLabel}>Screening</Text><Text style={styles.pipeVal}>142</Text></View>
            <View style={styles.pipeLine} />
            <View style={styles.pipeStep}><View style={[styles.pipeDot, { backgroundColor: '#10B981' }]}><Ionicons name="people" size={12} color="#fff" /></View><Text style={styles.pipeLabel}>Interview</Text><Text style={styles.pipeVal}>62</Text></View>
            <View style={styles.pipeLine} />
            <View style={styles.pipeStep}><View style={[styles.pipeDot, { backgroundColor: '#F59E0B' }]}><Ionicons name="mail" size={12} color="#fff" /></View><Text style={styles.pipeLabel}>Offer</Text><Text style={styles.pipeVal}>24</Text></View>
            <View style={styles.pipeLine} />
            <View style={styles.pipeStep}><View style={[styles.pipeDot, { backgroundColor: '#10B981' }]}><Ionicons name="checkmark" size={12} color="#fff" /></View><Text style={styles.pipeLabel}>Hired</Text><Text style={styles.pipeVal}>16</Text></View>
          </View>
          <View style={styles.convBar}><Text style={styles.convLabel}>Conversion Rate</Text><View style={styles.convTrack}><View style={[styles.convFill, { width: '12.4%' }]} /></View><Text style={styles.convVal}>12.4%</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Open Job Positions</Text><TouchableOpacity><Text style={styles.link}>View All Jobs</Text></TouchableOpacity></View>
          {[
            { title: 'HR Executive', dept: 'Human Resources • Full Time', count: 12, icon: 'briefcase', color: '#7C3AED' },
            { title: 'Payroll Specialist', dept: 'Finance • Full Time', count: 18, icon: 'wallet', color: '#3B82F6' },
            { title: 'Talent Acquisition Manager', dept: 'Human Resources • Full Time', count: 25, icon: 'people', color: '#10B981' },
          ].map((j,i)=><View key={i} style={styles.jobRow}><View style={[styles.jobIcon, { backgroundColor: j.color }]}><Ionicons name={j.icon} size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.jobTitle}>{j.title}</Text><Text style={styles.jobSub}>{j.dept}</Text></View><View style={styles.jobRight}><Text style={styles.jobCount}>{j.count}</Text><Text style={styles.jobApplicants}>Applicants</Text></View></View>)}
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
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  topCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  topIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  topLabel: { color: '#94A3B8', fontSize: 10 },
  topVal: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  topSub: { color: '#10B981', fontSize: 9, marginTop: 2 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  link: { color: '#8B5CF6', fontSize: 11, fontWeight: '700' },
  pipeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  pipeStep: { alignItems: 'center', flex: 1 },
  pipeDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pipeLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4 },
  pipeVal: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 2 },
  pipeLine: { flex: 1, height: 2, backgroundColor: '#334155', marginHorizontal: 2 },
  convBar: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  convLabel: { color: '#94A3B8', fontSize: 10 },
  convTrack: { flex: 1, height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  convFill: { height: 6, backgroundColor: '#7C3AED', borderRadius: 3 },
  convVal: { color: '#fff', fontSize: 10, fontWeight: '700' },
  jobRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  jobIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  jobSub: { color: '#94A3B8', fontSize: 10 },
  jobRight: { alignItems: 'flex-end' },
  jobCount: { color: '#fff', fontSize: 14, fontWeight: '800' },
  jobApplicants: { color: '#94A3B8', fontSize: 10 },
});
