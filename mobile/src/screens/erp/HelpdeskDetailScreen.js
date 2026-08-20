import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function HelpdeskDetailScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Helpdesk / HR Ticketing</Text><Text style={styles.headerSub}>We are here to help you</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.hero}><Text style={styles.heroTitle}>Welcome, Manjot Singh 👋</Text><Text style={styles.heroSub}>Raise a ticket / Get help / Track status</Text></View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.purple }]}>24</Text><Text style={styles.statLabel}>Total Tickets</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.orange }]}>8</Text><Text style={styles.statLabel}>Open</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.blue }]}>10</Text><Text style={styles.statLabel}>In Progress</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Recent Tickets</Text>{[
          { title: 'Leave Balance Not Updated', cat: 'Leave Management', id: 'TK-2025-0516', status: 'Open', color: colors.orange },
          { title: 'Payroll Deduction Query', cat: 'Payroll', id: 'TK-2025-0514', status: 'In Progress', color: colors.blue },
          { title: 'Laptop Issue – Not Powering On', cat: 'IT Support', id: 'TK-2025-0512', status: 'Resolved', color: colors.green },
        ].map((t,i)=><View key={i} style={styles.ticketRow}><View style={[styles.ticketIcon, { backgroundColor: t.color+'18' }]}><Ionicons name="ticket" size={16} color={t.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.ticketTitle}>{t.title}</Text><Text style={styles.ticketSub}>{t.cat} • {t.id}</Text></View><View style={[styles.badge, { backgroundColor: t.color+'22' }]}><Text style={[styles.badgeText, { color: t.color }]}>{t.status}</Text></View></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  hero: { backgroundColor: '#1E1B4B', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  heroTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  heroSub: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  ticketRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  ticketIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  ticketTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  ticketSub: { color: '#94A3B8', fontSize: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '800' },
});
