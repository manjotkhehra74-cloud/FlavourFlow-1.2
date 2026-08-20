import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function DocumentsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Documents & Files</Text><Text style={styles.headerSub}>Secure. Organized. Accessible.</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>126</Text><Text style={styles.statLabel}>Total Documents</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.blue }]}>32</Text><Text style={styles.statLabel}>Uploaded by Me</Text></View>
          <View style={styles.stat}><Text style={[styles.statValue, { color: colors.green }]}>98</Text><Text style={styles.statLabel}>Verified</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>My Folders</Text><View style={styles.folderGrid}>{[
          { label: 'Personal', count: '24', color: '#8B5CF6' },
          { label: 'Employment', count: '18', color: '#3B82F6' },
          { label: 'Education', count: '16', color: colors.green },
          { label: 'ID Proofs', count: '12', color: colors.orange },
        ].map((f,i)=><View key={i} style={styles.folder}><View style={[styles.folderIcon, { backgroundColor: f.color+'18' }]}><Ionicons name="folder" size={18} color={f.color} /></View><Text style={styles.folderLabel}>{f.label}</Text><Text style={styles.folderCount}>{f.count} Documents</Text></View>)}</View></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Recent Documents</Text>{[
          { name: 'Offer Letter.pdf', meta: '12 May 2025 • 1.2 MB', status: 'Verified' },
          { name: 'Experience Certificate.docx', meta: '03 May 2025 • 0.8 MB', status: 'Verified' },
          { name: 'Salary Slip - Apr 2025.xlsx', meta: '01 May 2025 • 0.4 MB', status: 'Verified' },
        ].map((d,i)=><View key={i} style={styles.docRow}><View style={styles.docIcon}><Ionicons name="document" size={16} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.docTitle}>{d.name}</Text><Text style={styles.docSub}>{d.meta}</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{d.status}</Text></View></View>)}</View>
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
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  folder: { width: '48%', backgroundColor: '#0F172A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  folderIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  folderLabel: { color: '#fff', fontSize: 11, fontWeight: '700' },
  folderCount: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  docIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  docTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  docSub: { color: '#94A3B8', fontSize: 10 },
  badge: { backgroundColor: colors.green+'22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.green, fontSize: 10, fontWeight: '800' },
});
