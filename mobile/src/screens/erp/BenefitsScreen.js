import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function BenefitsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Benefits & Insurance</Text><Text style={styles.headerSub}>Manage your benefits, insurance & wellness</Text></View>
        <TouchableOpacity style={styles.headerIcon}><Ionicons name="notifications" size={18} color="#fff" /></TouchableOpacity>
        <View style={styles.avatar}><Text style={styles.avatarText}>MS</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}><Text style={styles.heroTitle}>Your well-being, Our Priority</Text><Text style={styles.heroSub}>Explore all your company benefits and insurance programs</Text><TouchableOpacity style={styles.exploreBtn}><Text style={styles.exploreText}>Explore Benefits</Text><Ionicons name="arrow-forward" size={14} color="#fff" /></TouchableOpacity></View>
          <View style={styles.heroArt}><Ionicons name="shield-checkmark" size={32} color="#fff" /></View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#3B82F618' }]}><Ionicons name="document-text" size={18} color={colors.blue} /></View><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Total Benefits</Text><Text style={styles.statSub}>Active</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#10B98118' }]}><Ionicons name="medkit" size={18} color={colors.green} /></View><Text style={styles.statValue}>06</Text><Text style={styles.statLabel}>Insurance</Text><Text style={styles.statSub}>Active</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#F59E0B18' }]}><Ionicons name="cash" size={18} color={colors.orange} /></View><Text style={styles.statValue}>₹15.60 L</Text><Text style={styles.statLabel}>Total Coverage</Text><Text style={styles.statSub}>You + Family</Text></View>
          <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: '#EC489918' }]}><Ionicons name="heart" size={18} color={colors.pink} /></View><Text style={styles.statValue}>02</Text><Text style={styles.statLabel}>Claims Status</Text><Text style={[styles.statSub, { color: colors.orange }]}>In Process</Text></View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, { flex: 1.4 }]}>
            <Text style={styles.cardTitle}>Your Benefits</Text>
            {[
              { title: 'Health Insurance', sub: 'Medical coverage for you & family', val: '₹5.00 L', color: '#8B5CF6', icon: 'medkit' },
              { title: 'Term Life Insurance', sub: 'Life cover for financial security', val: '₹10.00 L', color: '#3B82F6', icon: 'shield' },
              { title: 'Accident Insurance', sub: 'Personal accident coverage', val: '₹15.00 L', color: '#F59E0B', icon: 'warning' },
              { title: 'Mediclaim (Top-up)', sub: 'Additional medical protection', val: '₹2.00 L', color: '#10B981', icon: 'add-circle' },
            ].map((b,i)=><View key={i} style={styles.benefitRow}><View style={[styles.benefitIcon, { backgroundColor: b.color+'18' }]}><Ionicons name={b.icon} size={14} color={b.color} /></View><View style={{ flex: 1, marginLeft: 8 }}><Text style={styles.benefitTitle}>{b.title}</Text><Text style={styles.benefitSub}>{b.sub}</Text></View><Text style={styles.benefitVal}>{b.val}</Text><Ionicons name="chevron-forward" size={14} color="#64748B" /></View>)}
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Insurance Coverage</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View style={styles.donut}><Text style={styles.donutVal}>₹15.60 L</Text><Text style={styles.donutLab}>Total Coverage</Text></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} /><Text style={styles.legLabel}>Health ₹5.00 L (32%)</Text></View>
                <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#14B8A6' }]} /><Text style={styles.legLabel}>Term Life ₹10.00 L (64%)</Text></View>
                <View style={styles.legRow}><View style={[styles.dot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.legLabel}>Accident ₹15.00 L (10%)</Text></View>
              </View>
            </View>
            <Text style={styles.cardTitleSmall}>Covered Members</Text>
            <View style={styles.members}><View style={styles.member}><View style={styles.memberAvatar}><Text style={styles.memberText}>Y</Text></View><Text style={styles.memberLabel}>You</Text></View><View style={styles.member}><View style={[styles.memberAvatar, { backgroundColor: '#EC4899' }]}><Text style={styles.memberText}>S</Text></View><Text style={styles.memberLabel}>Spouse</Text></View><View style={styles.member}><View style={[styles.memberAvatar, { backgroundColor: '#3B82F6' }]}><Text style={styles.memberText}>S</Text></View><Text style={styles.memberLabel}>Son</Text></View></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Claims Summary</Text>
          {[
            { title: 'Medical Claim', id: 'CLM-2025-0456', amt: '₹12,450', status: 'In Process', color: colors.orange },
            { title: 'Reimbursement', id: 'CLM-2025-0321', amt: '₹8,750', status: 'Approved', color: colors.green },
            { title: 'Hospitalization', id: 'CLM-2025-0210', amt: '₹22,300', status: 'Settled', color: '#64748B' },
          ].map((c,i)=><View key={i} style={styles.claimRow}><View style={[styles.claimIcon, { backgroundColor: c.color+'18' }]}><Ionicons name={c.status==='Approved'?'checkmark-circle':'medkit'} size={16} color={c.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.claimTitle}>{c.title}</Text><Text style={styles.claimSub}>{c.id}</Text></View><View style={[styles.badge, { backgroundColor: c.color+'22' }]}><Text style={[styles.badgeText, { color: c.color }]}>{c.status}</Text></View><Text style={styles.claimAmt}>{c.amt}</Text></View>)}
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
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  hero: { flexDirection: 'row', backgroundColor: '#4C1D95', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  heroSub: { color: '#E9D5FF', fontSize: 11, marginTop: 4 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', gap: 6 },
  exploreText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroArt: { width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  statLabel: { color: '#fff', fontSize: 9, fontWeight: '700', marginTop: 2 },
  statSub: { color: '#94A3B8', fontSize: 8, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12, flex: 1 },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cardTitleSmall: { color: '#fff', fontSize: 11, fontWeight: '800', marginTop: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  benefitIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  benefitSub: { color: '#94A3B8', fontSize: 9 },
  benefitVal: { color: '#fff', fontSize: 11, fontWeight: '800' },
  donut: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#334155' },
  donutVal: { color: '#fff', fontSize: 10, fontWeight: '900' },
  donutLab: { color: '#94A3B8', fontSize: 8 },
  legRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legLabel: { color: '#94A3B8', fontSize: 9, marginLeft: 6 },
  members: { flexDirection: 'row', gap: 12, marginTop: 10 },
  member: { alignItems: 'center' },
  memberAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  memberText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  memberLabel: { color: '#94A3B8', fontSize: 9, marginTop: 4 },
  claimRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' },
  claimIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  claimTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  claimSub: { color: '#94A3B8', fontSize: 9 },
  claimAmt: { color: '#fff', fontSize: 11, fontWeight: '800', marginLeft: 8 },
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, marginLeft: 8 },
  badgeText: { fontSize: 9, fontWeight: '800' },
});
