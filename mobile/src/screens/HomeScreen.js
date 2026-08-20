import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePunch } from '../context/PunchContext';
import { colors, gradients, radius, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const punch = usePunch();
  const [summary, setSummary] = useState(null);
  const [today, setToday] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([Api.summary().catch(()=>null), Api.attendanceToday().catch(()=>({today:null}))]);
      if (s) setSummary(s);
      if (t) {
        setToday(t.today);
        if (punch.setToday) punch.setToday(t.today);
      }
    } catch (e) { }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const hasPunched = !!today?.clock_in;
  const presentPct = 68.6;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Ionicons name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.greet}>Good Morning, {user?.name?.split(' ')[0] || 'Manjot'}! 👋</Text>
              <Text style={styles.subGreet}>Here's what's happening in your organization today.</Text>
            </View>
            <TouchableOpacity style={styles.headerIcon}><Ionicons name="search" size={18} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}><Ionicons name="notifications-outline" size={18} color="#fff" /><View style={styles.badge}><Text style={styles.badgeText}>8</Text></View></TouchableOpacity>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name||'U').split(' ').map(w=>w[0]).slice(0,2).join('')}</Text></View>
          </View>

          {/* Top Stats */}
          <View style={styles.topStats}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#7C3AED22' }]}><Ionicons name="people" size={18} color={colors.primary} /></View>
              <Text style={styles.statLabel}>Total Employees</Text>
              <Text style={styles.statValue}>1,248</Text>
              <Text style={styles.statSub}>↑ 12 this month</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#10B98122' }]}><Ionicons name="checkmark-circle" size={18} color={colors.green} /></View>
              <Text style={styles.statLabel}>Present Today</Text>
              <Text style={styles.statValue}>856</Text>
              <Text style={[styles.statSub, { color: colors.green }]}>↑ 68.6%</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B22' }]}><Ionicons name="airplane" size={18} color={colors.orange} /></View>
              <Text style={styles.statLabel}>On Leave</Text>
              <Text style={styles.statValue}>98</Text>
              <Text style={styles.statSub}>↑ 7.8%</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F622' }]}><Ionicons name="grid" size={18} color={colors.blue} /></View>
              <Text style={styles.statLabel}>Departments</Text>
              <Text style={styles.statValue}>18</Text>
              <Text style={[styles.statSub, { color: colors.green }]}>↑ Active</Text>
            </View>
          </View>
        </View>

        {/* Attendance Overview */}
        <View style={[styles.card, { marginTop: -18 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Attendance Overview</Text>
            <TouchableOpacity><Text style={styles.viewReport}>View Report</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <View style={styles.donutWrap}>
              <View style={styles.donut}><Text style={styles.donutPct}>{presentPct}%</Text><Text style={styles.donutLabel}>Present</Text></View>
              <View style={[styles.donutRing, { borderColor: colors.primary, borderRightColor: '#334155', borderBottomColor: '#334155' }]} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>Present</Text><Text style={styles.legendVal}>856 (68.6%)</Text></View>
              <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#6B7280' }]} /><Text style={styles.legendText}>Absent</Text><Text style={styles.legendVal}>294 (23.6%)</Text></View>
              <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: colors.orange }]} /><Text style={styles.legendText}>On Leave</Text><Text style={styles.legendVal}>98 (7.8%)</Text></View>
              <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: colors.pink }]} /><Text style={styles.legendText}>Late</Text><Text style={styles.legendVal}>32 (2.6%)</Text></View>
            </View>
            <View style={{ flex: 0.9, marginLeft: 8, height: 80, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
              {[55,85,60,75,70,65,45,30].map((h,i)=><View key={i} style={{ flex: 1, height: h, backgroundColor: i===1? colors.primary : '#475569', borderRadius: 4 }} />)}
            </View>
          </View>
          <Text style={styles.xLabels}>Mon  Tue  Wed  Thu  Fri  Sat  Sun</Text>
        </View>

        {/* Today's Punch */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          <View style={styles.punchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.punchLabel}>{hasPunched ? 'Punched in' : 'Not marked yet'}</Text>
              <Text style={styles.punchTime}>{hasPunched ? today.clock_in.slice(11,16) : new Date().toLocaleDateString('en-IN',{weekday:'long'})}</Text>
            </View>
            <TouchableOpacity onPress={() => punch.openPunch({ today })} style={styles.punchBtn}>
              <LinearGradient colors={gradients.brand} style={styles.punchGrad}>
                <Ionicons name={hasPunched ? 'log-out-outline' : 'finger-print-outline'} size={20} color="#fff" />
                <Text style={styles.punchBtnText}>{hasPunched ? 'Punch out' : 'Punch in'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Quick Actions</Text><TouchableOpacity><Text style={styles.viewReport}>Customize</Text></TouchableOpacity></View>
          <View style={styles.quickGrid}>
            {[
              { icon: 'person-add', label: 'Add Employee', color: colors.primary },
              { icon: 'finger-print', label: 'Mark Attendance', color: colors.green },
              { icon: 'airplane', label: 'Apply Leave', color: colors.orange },
              { icon: 'document-text', label: 'View Payslip', color: colors.blue },
              { icon: 'star', label: 'Performance Review', color: colors.pink },
            ].map((q,i)=>(
              <TouchableOpacity key={i} style={styles.quickTile} onPress={()=>{ if(q.label.includes('Attendance')) punch.openPunch({today}); else if(q.label.includes('Leave')) navigation.navigate('NewLeave'); }}>
                <View style={[styles.quickIcon, { backgroundColor: q.color+'18', borderColor: q.color+'30' }]}><Ionicons name={q.icon} size={18} color={q.color} /></View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Pending Approvals</Text><TouchableOpacity onPress={()=>navigation.navigate('Approvals')}><Text style={styles.viewReport}>View All (12)</Text></TouchableOpacity></View>
          {[
            { title: 'Leave Request', sub: 'Rahul Sharma • Marketing', meta: '2 Days', icon: 'airplane', color: colors.green },
            { title: 'Overtime Request', sub: 'Priya Mehta • Product', meta: '3 Hours', icon: 'time', color: colors.purple },
            { title: 'Expense Claim', sub: 'Amit Verma • Sales', meta: '₹ 4,250', icon: 'receipt', color: colors.orange },
          ].map((it,i)=>(
            <View key={i} style={styles.approvalRow}>
              <View style={[styles.approvalIcon, { backgroundColor: it.color+'18' }]}><Ionicons name={it.icon} size={16} color={it.color} /></View>
              <View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.approvalTitle}>{it.title}</Text><Text style={styles.approvalSub}>{it.sub}</Text></View>
              <Text style={styles.approvalMeta}>{it.meta}</Text>
              <View style={styles.approvalActions}><Ionicons name="checkmark" size={14} color={colors.green} /><Ionicons name="close" size={14} color={colors.red} style={{ marginLeft: 8 }} /></View>
            </View>
          ))}
        </View>

        {/* Department Wise Headcount */}
        <View style={styles.card}>
          <View style={styles.cardHead}><Text style={styles.cardTitle}>Department Wise Headcount</Text><Text style={styles.viewReport}>View All</Text></View>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View style={styles.deptDonut}><Text style={styles.deptTotal}>1,248</Text><Text style={styles.deptLabel}>Total</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {[
                { label: 'Engineering', val: '456 (36.5%)', color: colors.blue },
                { label: 'Marketing', val: '236 (18.9%)', color: colors.green },
                { label: 'Sales', val: '212 (17.0%)', color: colors.orange },
                { label: 'HR', val: '98 (7.8%)', color: colors.purple },
              ].map((d,i)=><View key={i} style={styles.legendRow}><View style={[styles.dot, { backgroundColor: d.color }]} /><Text style={styles.legendText}>{d.label}</Text><Text style={styles.legendVal}>{d.val}</Text></View>)}
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#0F172A', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  menuBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  greet: { color: '#fff', fontSize: 16, fontWeight: '800' },
  subGreet: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  avatarText: { color: '#fff', fontWeight: '800' },
  topStats: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#334155' },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statLabel: { color: '#94A3B8', fontSize: 10 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  statSub: { color: '#64748B', fontSize: 10, marginTop: 2 },
  card: { backgroundColor: '#1E293B', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  viewReport: { color: '#8B5CF6', fontSize: 12, fontWeight: '700' },
  donutWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  donut: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  donutRing: { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 6 },
  donutPct: { color: '#fff', fontSize: 14, fontWeight: '900' },
  donutLabel: { color: '#94A3B8', fontSize: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#94A3B8', fontSize: 11, marginLeft: 6, flex: 1 },
  legendVal: { color: '#fff', fontSize: 11, fontWeight: '700' },
  xLabels: { color: '#64748B', fontSize: 10, textAlign: 'center', marginTop: 8 },
  punchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#0F172A', borderRadius: 12, padding: 12 },
  punchLabel: { color: '#94A3B8', fontSize: 12 },
  punchTime: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 2 },
  punchBtn: { borderRadius: 999, overflow: 'hidden' },
  punchGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  punchBtnText: { color: '#fff', fontWeight: '800', marginLeft: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  quickTile: { width: '18%', alignItems: 'center' },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickLabel: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 6 },
  approvalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  approvalIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  approvalTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  approvalSub: { color: '#94A3B8', fontSize: 11 },
  approvalMeta: { color: '#fff', fontSize: 11, fontWeight: '700', marginRight: 8 },
  approvalActions: { flexDirection: 'row' },
  deptDonut: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#334155' },
  deptTotal: { color: '#fff', fontSize: 14, fontWeight: '900' },
  deptLabel: { color: '#94A3B8', fontSize: 10 },
});
