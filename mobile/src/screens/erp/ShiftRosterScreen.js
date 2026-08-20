import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function ShiftRosterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Shift & Roster Management</Text><Text style={styles.headerSub}>View and manage your shifts</Text></View>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="calendar" size={18} color="#fff" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Shift</Text>
          <View style={styles.todayShift}>
            <View style={[styles.shiftIcon, { backgroundColor: '#7C3AED22' }]}><Ionicons name="time" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.shiftName}>General Shift - A</Text>
              <Text style={styles.shiftTime}>09:00 AM - 06:00 PM • In Progress</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.green+'22' }]}><Text style={[styles.badgeText, { color: colors.green }]}>In Progress</Text></View>
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.gridCard}><View style={[styles.gridIcon, { backgroundColor: '#3B82F618' }]}><Ionicons name="calendar" size={20} color={colors.blue} /></View><Text style={styles.gridLabel}>My Schedule</Text><Text style={styles.gridSub}>View your shifts & roster</Text></View>
          <View style={styles.gridCard}><View style={[styles.gridIcon, { backgroundColor: '#10B98118' }]}><Ionicons name="people" size={20} color={colors.green} /></View><Text style={styles.gridLabel}>Team Roster</Text><Text style={styles.gridSub}>View team schedule</Text></View>
          <View style={styles.gridCard}><View style={[styles.gridIcon, { backgroundColor: '#F59E0B18' }]}><Ionicons name="swap-horizontal" size={20} color={colors.orange} /></View><Text style={styles.gridLabel}>Shift Swap Requests</Text><Text style={styles.gridCount}>02</Text></View>
          <View style={styles.gridCard}><View style={[styles.gridIcon, { backgroundColor: '#8B5CF618' }]}><Ionicons name="calendar" size={20} color={colors.purple} /></View><Text style={styles.gridLabel}>Shift Calendar</Text><Text style={styles.gridSub}>Monthly shift overview</Text></View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'swap-horizontal', label: 'Request Swap', color: colors.primary },
              { icon: 'create', label: 'Request Change', color: colors.green },
              { icon: 'options', label: 'Shift Preference', color: colors.orange },
              { icon: 'checkmark-circle', label: 'Availability', color: colors.teal },
            ].map((q,i)=>(
              <View key={i} style={styles.quickTile}>
                <View style={[styles.quickIcon, { backgroundColor: q.color+'18' }]}><Ionicons name={q.icon} size={18} color={q.color} /></View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.bottomNav}><View style={styles.navItem}><Ionicons name="home" size={18} color={colors.primary} /><Text style={[styles.navLabel, { color: colors.primary }]}>Home</Text></View><View style={styles.navItem}><Ionicons name="time" size={18} color="#64748B" /><Text style={styles.navLabel}>Attendance</Text></View><View style={styles.navItem}><Ionicons name="grid" size={18} color="#64748B" /><Text style={styles.navLabel}>Dashboard</Text></View></View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  todayShift: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#0F172A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
  shiftIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shiftName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  shiftTime: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  gridCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  gridIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gridLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },
  gridSub: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  gridCount: { color: colors.orange, fontSize: 12, fontWeight: '800', marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155' },
  quickIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', justifyContent: 'space-around', marginTop: 8 },
  navItem: { alignItems: 'center' },
  navLabel: { color: '#64748B', fontSize: 9, marginTop: 4 },
});
