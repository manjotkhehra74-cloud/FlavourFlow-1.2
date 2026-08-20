import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function OnboardingScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Onboarding & Offboarding</Text><Text style={styles.headerSub}>Seamless joinings and exits</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>18</Text><Text style={styles.statLabel}>New Joinees</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>07</Text><Text style={styles.statLabel}>In Progress</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>128</Text><Text style={styles.statLabel}>Completed</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Onboarding Journey</Text>{[
          { step: '1', title: 'Preboarding', status: 'Completed', color: colors.green },
          { step: '2', title: 'Document Collection', status: 'In Progress', color: colors.orange },
          { step: '3', title: 'Profile Creation', status: 'Pending', color: '#64748B' },
        ].map((s,i)=><View key={i} style={styles.journeyRow}><View style={[styles.stepDot, { backgroundColor: s.color }]}><Text style={styles.stepText}>{s.step}</Text></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.journeyTitle}>{s.title}</Text><Text style={styles.journeySub}>{s.status}</Text></View></View>)}</View>
        <View style={styles.card}><Text style={styles.cardTitle}>New Joinees (This Month)</Text>{[
          { name: 'Rohan Mehta', role: 'Software Engineer', date: '15 May 2025' },
          { name: 'Priya Sharma', role: 'HR Executive', date: '17 May 2025' },
        ].map((p,i)=><View key={i} style={styles.personRow}><View style={styles.avatar}><Text style={styles.avatarText}>{p.name.split(' ').map(w=>w[0]).join('')}</Text></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.personName}>{p.name}</Text><Text style={styles.personSub}>{p.role} • {p.date}</Text></View><View style={styles.badge}><Text style={styles.badgeText}>Joined</Text></View></View>)}</View>
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
  journeyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  journeyTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  journeySub: { color: '#94A3B8', fontSize: 10 },
  personRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  personName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  personSub: { color: '#94A3B8', fontSize: 10 },
  badge: { backgroundColor: colors.green+'22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.green, fontSize: 10, fontWeight: '800' },
});
