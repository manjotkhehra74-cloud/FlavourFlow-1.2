import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function CalendarScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Calendar & Events</Text><Text style={styles.headerSub}>Stay organized with schedule</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Ionicons name="calendar" size={18} color={colors.purple} /><Text style={styles.statValue}>26</Text><Text style={styles.statLabel}>Total Events</Text></View>
          <View style={styles.stat}><Ionicons name="gift" size={18} color={colors.green} /><Text style={styles.statValue}>06</Text><Text style={styles.statLabel}>Birthdays</Text></View>
          <View style={styles.stat}><Ionicons name="notifications" size={18} color={colors.orange} /><Text style={styles.statValue}>08</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>May 2025</Text><View style={styles.calendarGrid}>{Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <View key={d} style={[styles.day, d === 15 && styles.daySelected, d === 20 && styles.dayToday]}><Text style={[styles.dayText, (d === 15 || d === 20) && { color: '#fff' }]}>{d}</Text></View>
        ))}</View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Today's Schedule</Text>{[
          { time: '09:30 AM', title: 'Monthly Production Review', loc: 'Meeting Room A' },
          { time: '11:00 AM', title: 'HACCP Training Session', loc: 'Training Hall' },
          { time: '02:00 PM', title: '1:1 with Manager', loc: 'Manager Cabin' },
        ].map((e,i)=><View key={i} style={styles.eventRow}><View style={styles.eventDot} /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.eventTitle}>{e.title}</Text><Text style={styles.eventSub}>{e.time} • {e.loc}</Text></View></View>)}</View>
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
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12 },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' },
  daySelected: { backgroundColor: '#F59E0B' },
  dayToday: { backgroundColor: '#3B82F6' },
  dayText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  eventTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  eventSub: { color: '#94A3B8', fontSize: 10 },
});
