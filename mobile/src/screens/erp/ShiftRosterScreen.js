import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function ShiftRosterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Shift & Roster Management</Text><Text style={styles.headerSub}>Plan shifts, rosters and swaps</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}><Text style={styles.cardTitle}>Today's Shift</Text><View style={styles.shiftRow}><Ionicons name="time" size={20} color={colors.primary} /><View style={{ marginLeft: 10 }}><Text style={styles.shiftTitle}>General Shift - A</Text><Text style={styles.shiftSub}>09:00 AM - 06:00 PM • In Progress</Text></View><View style={styles.badge}><Text style={styles.badgeText}>In Progress</Text></View></View></View>
        <View style={styles.grid}>
          {[
            { label: 'My Schedule', icon: 'calendar', color: colors.blue },
            { label: 'Team Roster', icon: 'people', color: colors.green },
            { label: 'Shift Swap', icon: 'swap-horizontal', color: colors.orange },
            { label: 'Shift Calendar', icon: 'calendar', color: colors.purple },
          ].map((it,i)=>(
            <View key={i} style={styles.gridTile}><View style={[styles.gridIcon, { backgroundColor: it.color+'18' }]}><Ionicons name={it.icon} size={18} color={it.color} /></View><Text style={styles.gridLabel}>{it.label}</Text></View>
          ))}
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Quick Actions</Text><View style={styles.quickGrid}>{['Request Swap','Request Change','Shift Preference','Availability'].map((l,i)=><View key={i} style={styles.quickTile}><Ionicons name="add-circle" size={20} color={colors.primary} /><Text style={styles.quickLabel}>{l}</Text></View>)}</View></View>
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
  shiftRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#0F172A', borderRadius: 12, padding: 12 },
  shiftTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  shiftSub: { color: '#94A3B8', fontSize: 11 },
  badge: { backgroundColor: colors.green+'22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.green, fontSize: 10, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  gridTile: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  gridIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gridLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickTile: { width: '22%', alignItems: 'center' },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
});
