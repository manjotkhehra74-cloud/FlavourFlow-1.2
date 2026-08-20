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
        <View style={styles.headerTabs}><Text style={styles.tabActive}>My Documents</Text><Text style={styles.tabInactive}>Company Documents</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.statsGrid}>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#7C3AED18' }]}><Ionicons name="folder" size={16} color="#7C3AED" /></View><Text style={styles.statValue}>126</Text><Text style={styles.statLabel}>Total Documents</Text><Text style={styles.statSub}>All Types</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#3B82F618' }]}><Ionicons name="cloud-upload" size={16} color="#3B82F6" /></View><Text style={styles.statValue}>32</Text><Text style={styles.statLabel}>Uploaded by Me</Text><Text style={styles.statSub}>This Year</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#10B98118' }]}><Ionicons name="shield-checkmark" size={16} color="#10B981" /></View><Text style={styles.statValue}>98</Text><Text style={styles.statLabel}>Verified</Text><Text style={[styles.statSub, { color: '#10B981' }]}>77% Verified</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#F59E0B18' }]}><Ionicons name="time" size={16} color="#F59E0B" /></View><Text style={styles.statValue}>8</Text><Text style={styles.statLabel}>Expiring Soon</Text><Text style={[styles.statSub, { color: '#F59E0B' }]}>Next 60 Days</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>My Folders</Text><TouchableOpacity><Text style={styles.link}>View All</Text></TouchableOpacity></View>
          <View style={styles.folderGrid}>
            {[
              { label: 'Personal', count: '24', icon: 'person', color: '#7C3AED' },
              { label: 'Employment', count: '18', icon: 'briefcase', color: '#3B82F6' },
              { label: 'Education', count: '16', icon: 'school', color: '#10B981' },
              { label: 'ID Proofs', count: '12', icon: 'card', color: '#F59E0B' },
              { label: 'Benefits', count: '10', icon: 'heart', color: '#EC4899' },
              { label: 'Training', count: '8', icon: 'easel', color: '#6366F1' },
            ].map((f,i)=><View key={i} style={styles.folder}><View style={[styles.folderIcon, { backgroundColor: f.color }]}><Ionicons name={f.icon} size={16} color="#fff" /></View><Text style={styles.folderLabel}>{f.label}</Text><Text style={styles.folderCount}>{f.count} Documents</Text></View>)}
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Recent Documents</Text><TouchableOpacity><Text style={styles.link}>View All</Text></TouchableOpacity></View>
          {[
            { name: 'Offer Letter.pdf', meta: 'Uploaded on 12 May 2025 • 1.2 MB', tag: 'Company', status: 'Verified', color: colors.green, icon: 'document' },
            { name: 'Experience Certificate.docx', meta: 'Uploaded on 03 May 2025 • 0.8 MB', tag: 'Personal', status: 'Verified', color: colors.green, icon: 'document-text' },
            { name: 'Salary Slip - Apr 2025.xlsx', meta: 'Uploaded on 01 May 2025 • 0.4 MB', tag: 'Payroll', status: 'Verified', color: colors.green, icon: 'grid' },
            { name: 'Aadhaar Card.pdf', meta: 'Uploaded on 28 Apr 2025 • 1.1 MB', tag: 'ID Proof', status: 'Verified', color: colors.green, icon: 'card' },
          ].map((d,i)=><View key={i} style={styles.docRow}><View style={[styles.docIcon, { backgroundColor: d.color==='red'?'#EF4444':'#7C3AED' }]}><Ionicons name={d.icon} size={14} color="#fff" /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.docTitle}>{d.name}</Text><Text style={styles.docSub}>{d.meta}</Text></View><View style={[styles.tag, { backgroundColor: '#334155' }]}><Text style={styles.tagText}>{d.tag}</Text></View><View style={[styles.badge, { backgroundColor: d.color+'22' }]}><Text style={[styles.badgeText, { color: d.color }]}>{d.status}</Text></View></View>)}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 48, left: 16 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  headerSub: { color: '#94A3B8', fontSize: 11, textAlign: 'center', marginTop: 2 },
  headerTabs: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 999, padding: 4, marginTop: 12, alignSelf: 'center', gap: 8, borderWidth: 1, borderColor: '#334155' },
  tabActive: { backgroundColor: '#7C3AED', color: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  tabInactive: { color: '#94A3B8', fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  stat: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 2 },
  statSub: { color: '#94A3B8', fontSize: 9, marginTop: 2 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  link: { color: '#8B5CF6', fontSize: 11, fontWeight: '700' },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  folder: { width: '31%', backgroundColor: '#0F172A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  folderIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  folderLabel: { color: '#fff', fontSize: 10, fontWeight: '700' },
  folderCount: { color: '#94A3B8', fontSize: 9, marginTop: 2 },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  docIcon: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  docTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  docSub: { color: '#94A3B8', fontSize: 9, marginTop: 2 },
  tag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 6 },
  tagText: { color: '#94A3B8', fontSize: 9, fontWeight: '700' },
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '800' },
});
