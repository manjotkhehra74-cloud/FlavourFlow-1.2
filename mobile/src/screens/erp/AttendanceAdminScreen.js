import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

function Stat({ label, value, sub, color, icon }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}><Ionicons name={icon} size={16} color={color} /></View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}
function Donut({ total, segments }) {
  return (
    <View style={styles.donutWrap}>
      <View style={styles.donut}><Text style={styles.donutTotal}>{total}</Text><Text style={styles.donutLabel}>Total</Text></View>
      <View style={styles.ring} />
    </View>
  );
}

export default function AttendanceAdminScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Attendance Admin & Biometric</Text>
          <Text style={styles.headerSub}>Monitor, manage and secure your attendance system</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="search" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="calendar" size={18} color="#fff" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.topStats}>
          <Stat label="Total Employees" value="842" sub="Active Employees" color={colors.green} icon="people" />
          <Stat label="Present Today" value="612" sub="72.68% ↑" color={colors.blue} icon="calendar" />
          <Stat label="Absent Today" value="154" sub="18.29% ↓" color={colors.red} icon="person-remove" />
          <Stat label="Late Today" value="52" sub="6.18%" color="#8B5CF6" icon="time" />
          <Stat label="Early Leave" value="24" sub="2.85% ↓" color={colors.teal} icon="log-out" />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Live Attendance Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Donut total="842" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.green }]} /><Text style={styles.legText}>Present 612 (72.68%)</Text></View>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.red }]} /><Text style={styles.legText}>Absent 154 (18.29%)</Text></View>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.orange }]} /><Text style={styles.legText}>Late 52 (6.18%)</Text></View>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.blue }]} /><Text style={styles.legText}>Early Leave 24 (2.85%)</Text></View>
              </View>
            </View>
            <Text style={styles.sync}>Last updated: 09:41 AM</Text>
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Biometric Device Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Donut total="12" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.green }]} /><Text style={styles.legText}>Online 10 (83.33%)</Text></View>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.red }]} /><Text style={styles.legText}>Offline 2 (16.67%)</Text></View>
                <View style={styles.leg}><View style={[styles.dot, { backgroundColor: colors.orange }]} /><Text style={styles.legText}>Maintenance 0</Text></View>
              </View>
            </View>
            <Text style={styles.sync}>Last synced: 09:40 AM</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'phone-portrait', label: 'Add Device', color: colors.green },
              { icon: 'person-add', label: 'Add Employee', color: '#8B5CF6' },
              { icon: 'settings', label: 'Attendance Rules', color: colors.orange },
              { icon: 'calendar', label: 'Shift Management', color: colors.blue },
              { icon: 'create', label: 'Manual Correction', color: colors.orange },
              { icon: 'cloud-upload', label: 'Bulk Punch Upload', color: colors.green },
              { icon: 'download', label: 'Export Logs', color: colors.teal },
              { icon: 'notifications', label: 'Send Alert', color: colors.orange },
            ].map((q,i)=>(
              <View key={i} style={styles.quickTile}>
                <View style={[styles.quickIcon, { backgroundColor: q.color+'18' }]}><Ionicons name={q.icon} size={18} color={q.color} /></View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Punch Logs</Text>
          {[
            { name: 'Manpreet Singh', id: 'EMP1001', dept: 'Production', in: '09:02 AM', out: '06:11 PM', status: 'Present' },
            { name: 'Priya Sharma', id: 'EMP1002', dept: 'HR', in: '09:18 AM', out: '05:10 PM', status: 'Late' },
            { name: 'Amit Kumar', id: 'EMP1003', dept: 'Maintenance', in: '-', out: '-', status: 'Absent' },
          ].map((r,i)=>(
            <View key={i} style={styles.logRow}>
              <View style={{ flex: 1 }}><Text style={styles.logName}>{r.name}</Text><Text style={styles.logSub}>{r.id} • {r.dept}</Text></View>
              <Text style={[styles.logTime, { color: r.status==='Late'? colors.orange : colors.green }]}>{r.in}</Text>
              <Text style={styles.logTime}>{r.out}</Text>
              <View style={[styles.badge, { backgroundColor: r.status==='Present'? colors.green+'22' : r.status==='Late'? colors.orange+'22' : colors.red+'22' }]}><Text style={[styles.badgeText, { color: r.status==='Present'? colors.green : r.status==='Late'? colors.orange : colors.red }]}>{r.status}</Text></View>
            </View>
          ))}
        </View>
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
  topStats: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 2 },
  statSub: { color: '#64748B', fontSize: 9, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginHorizontal: 16, marginTop: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  donutWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  donut: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: colors.green, borderRightColor: colors.red, borderBottomColor: colors.orange },
  donutTotal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  donutLabel: { color: '#94A3B8', fontSize: 9 },
  leg: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legText: { color: '#94A3B8', fontSize: 10, marginLeft: 6 },
  sync: { color: '#64748B', fontSize: 10, marginTop: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center' },
  quickIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155', gap: 8 },
  logName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  logSub: { color: '#94A3B8', fontSize: 10 },
  logTime: { color: '#fff', fontSize: 11, fontWeight: '700', width: 70, textAlign: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
