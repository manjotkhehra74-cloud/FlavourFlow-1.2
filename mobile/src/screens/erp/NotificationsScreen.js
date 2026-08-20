import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function NotificationsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Notifications & Announcements</Text><Text style={styles.headerSub}>Stay updated with alerts</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tabs}><View style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>All Notifications</Text></View><View style={styles.tab}><Text style={styles.tabText}>Announcements</Text></View></View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>126</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.blue }]}>12</Text><Text style={styles.statLabel}>Unread</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>8</Text><Text style={styles.statLabel}>Announcements</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Today</Text>{[
          { title: 'Leave Request Approved', desc: 'Your leave request for 3 days has been approved', time: '10:30 AM', icon: 'document', color: colors.purple },
          { title: 'Attendance Marked – Check In', desc: 'You have checked in at 09:15 AM', time: '09:15 AM', icon: 'checkmark-done', color: colors.orange },
          { title: 'Payroll Processed', desc: 'Your salary for May 2025 has been processed', time: 'Yesterday', icon: 'notifications', color: colors.red },
        ].map((n,i)=><View key={i} style={styles.notifRow}><View style={[styles.notifIcon, { backgroundColor: n.color+'18' }]}><Ionicons name={n.icon} size={16} color={n.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.notifTitle}>{n.title}</Text><Text style={styles.notifDesc}>{n.desc}</Text></View><Text style={styles.notifTime}>{n.time}</Text></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 999, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 999 },
  tabActive: { backgroundColor: '#7C3AED' },
  tabText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#fff', fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  notifIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  notifDesc: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  notifTime: { color: '#64748B', fontSize: 10, marginLeft: 8 },
});
