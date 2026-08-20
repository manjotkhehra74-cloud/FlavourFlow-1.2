import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
export default function BenefitsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.headerTitle}>Benefits & Insurance</Text><Text style={styles.headerSub}>Health, life and wellness</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.hero}><Text style={styles.heroTitle}>Your well-being, Our Priority</Text><Text style={styles.heroSub}>Explore all your company benefits and insurance programs</Text></View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Ionicons name="shield-checkmark" size={18} color={colors.blue} /><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Total Benefits</Text></View>
          <View style={styles.stat}><Ionicons name="medkit" size={18} color={colors.green} /><Text style={styles.statValue}>06</Text><Text style={styles.statLabel}>Insurance</Text></View>
          <View style={styles.stat}><Ionicons name="cash" size={18} color={colors.orange} /><Text style={styles.statValue}>₹15.6 L</Text><Text style={styles.statLabel}>Total Coverage</Text></View>
        </View>
        <View style={styles.card}><Text style={styles.cardTitle}>Your Benefits</Text>{[
          { title: 'Health Insurance', sub: 'Medical coverage for you & family', val: '₹5.00 L', color: colors.purple },
          { title: 'Term Life Insurance', sub: 'Life cover for financial security', val: '₹10.00 L', color: colors.blue },
          { title: 'Accident Insurance', sub: 'Personal accident coverage', val: '₹15.00 L', color: colors.orange },
        ].map((b,i)=><View key={i} style={styles.benefitRow}><View style={[styles.benefitIcon, { backgroundColor: b.color+'18' }]}><Ionicons name="heart" size={16} color={b.color} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.benefitTitle}>{b.title}</Text><Text style={styles.benefitSub}>{b.sub}</Text></View><Text style={styles.benefitVal}>{b.val}</Text></View>)}</View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#334155' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  hero: { backgroundColor: '#4C1D95', borderRadius: 16, padding: 16, marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  heroSub: { color: '#E9D5FF', fontSize: 11, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  statLabel: { color: '#94A3B8', fontSize: 9, marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  benefitIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  benefitSub: { color: '#94A3B8', fontSize: 10 },
  benefitVal: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
