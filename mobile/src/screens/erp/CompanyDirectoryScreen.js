import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
const EMPLOYEES = [
  { name: 'Manjot Singh', role: 'HR Manager', dept: 'Human Resources', email: 'manjot.singh@gdfoods.com' },
  { name: 'Priya Sharma', role: 'Talent Acquisition Specialist', dept: 'HR', email: 'priya.sharma@gdfoods.com' },
  { name: 'Rahul Sharma', role: 'Senior UI/UX Designer', dept: 'Design', email: 'rahul.sharma@gdfoods.com' },
  { name: 'Neha Gupta', role: 'Quality Executive', dept: 'Quality', email: 'neha.gupta@company.com' },
  { name: 'Amit Kumar', role: 'Accounts Officer', dept: 'Finance', email: 'amit.kumar@company.com' },
];
export default function CompanyDirectoryScreen({ navigation }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return EMPLOYEES;
    const lower = q.toLowerCase();
    return EMPLOYEES.filter(e => e.name.toLowerCase().includes(lower) || e.role.toLowerCase().includes(lower) || e.dept.toLowerCase().includes(lower) || e.email.toLowerCase().includes(lower));
  }, [q]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Company Directory</Text><Text style={styles.headerSub}>Find and connect with colleagues</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.searchBar}><Ionicons name="search" size={18} color="#64748B" /><TextInput style={styles.searchInput} placeholder="Search by name, designation, department..." placeholderTextColor="#64748B" value={q} onChangeText={setQ} /><Ionicons name="filter" size={18} color="#64748B" /></View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{filtered.length}</Text><Text style={styles.statLabel}>Filtered</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>18</Text><Text style={styles.statLabel}>Departments</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>7</Text><Text style={styles.statLabel}>Locations</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Employee List • {filtered.length}</Text>{filtered.map((e,i)=><View key={i} style={styles.empRow}><View style={styles.avatar}><Text style={styles.avatarText}>{e.name.split(' ').map(w=>w[0]).join('')}</Text></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.empName}>{e.name}</Text><Text style={styles.empRole}>{e.role} • {e.dept}</Text><Text style={styles.empEmail}>{e.email}</Text></View><TouchableOpacity style={styles.actionIcon}><Ionicons name="mail" size={14} color={colors.purple} /></TouchableOpacity></View>)}{filtered.length===0 && <Text style={styles.empty}>No results for "{q}"</Text>}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#334155', gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, color: '#fff', fontSize: 12, paddingVertical: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  empRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  empName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empRole: { color: '#94A3B8', fontSize: 10 },
  empEmail: { color: '#64748B', fontSize: 10 },
  actionIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7C3AED22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#7C3AED44' },
  empty: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 12 },
});
