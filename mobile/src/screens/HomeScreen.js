import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
  Dimensions, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Screen, Card, Button, Row, StatPill, Badge, QuickTile, SectionTitle, GradientView,
} from '../components/UI';
import { colors, radius, spacing, gradients, greeting, fmtTime } from '../theme';
import PunchModal from '../components/PunchModal';
import { scheduleDailyReminder, ensureNotificationPermission, openLocationSettings, getBiometricSupport } from '../utils/permissions';

const W = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [today, setToday] = useState(null);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [punchVisible, setPunchVisible] = useState(false);
  const isPrivileged = user?.role !== 'employee';

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([Api.summary(), Api.attendanceToday()]);
      setSummary(s); setToday(t.today);
      try { setEvents((await Api.events()).events || []); } catch {}
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    (async () => { await ensureNotificationPermission(); await scheduleDailyReminder(10, 0); })();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const initial = (user?.name || '').split(' ').map(w => w[0]).slice(0, 2).join('');
  const hasPunched = !!today?.clock_in;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={['#1E1B4B', '#4C1D95']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting()}{user?.name ? ', ' + user.name.split(' ')[0] : ''} 👋</Text>
              <Text style={styles.role}>{user?.designation || user?.role || 'Member'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { id: user.id })}>
              <LinearGradient colors={gradients.brand} style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Punch card */}
          <View style={styles.punchCard}>
            <View>
              <Text style={styles.punchLabel}>Today's attendance</Text>
              <Text style={styles.punchValue}>{hasPunched ? 'Punched in' : 'Not marked yet'}</Text>
              {hasPunched ? (
                <Text style={styles.punchTime}>In: {fmtTime(today.clock_in)}  {today.status ? `· ${today.status.toUpperCase()}` : ''}</Text>
              ) : (
                <Text style={styles.punchTime}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setPunchVisible(true)}
              style={styles.punchBtn}
              activeOpacity={0.85}
            >
              <LinearGradient colors={gradients.brand} style={styles.punchBtnGrad}>
                <Ionicons name={hasPunched ? 'log-out-outline' : 'finger-print-outline'} size={26} color="#fff" />
                <Text style={styles.punchBtnText}>{hasPunched ? 'Punch out' : 'Punch in'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatMini label="Present" value={summary?.month?.present ?? 0} color={colors.green} icon="checkmark-circle" />
          <StatMini label="Late" value={summary?.month?.late ?? 0} color={colors.orange} icon="time" />
          <StatMini label="WFH" value={summary?.month?.wfh ?? 0} color={colors.blue} icon="home" />
          <StatMini label="Leaves" value={summary?.month?.on_leave ?? 0} color={colors.primary} icon="calendar" />
        </View>

        {/* Stay-on-track banner for managers */}
        {isPrivileged && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Approvals')}
            style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}
          >
            <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Stay on track! 📋</Text>
                <Text style={styles.bannerText}>
                  {(summary?.pending_attendance ?? 0) + (summary?.pending_leaves ?? 0)} approvals pending
                </Text>
              </View>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>Review</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick access */}
        <View style={{ padding: spacing.lg, paddingTop: 0 }}>
          <SectionTitle>Quick Access</SectionTitle>
          <View style={styles.tilesWrap}>
            <QuickTile icon="calendar-outline" label="Apply leave" color={colors.primary}
              onPress={() => navigation.navigate('NewLeave')} />
            <QuickTile icon="time-outline" label="Regularise" color={colors.orange}
              onPress={() => navigation.navigate('NewAttendance')} />
            <QuickTile icon="people-outline" label="Team" color={colors.teal}
              onPress={() => navigation.navigate('Team')} />
            <QuickTile icon="gift-outline" label="Wishes" color={colors.pink}
              onPress={() => navigation.navigate('Social')} />
            <QuickTile icon="headset-outline" label="Helpdesk" color={colors.blue}
              onPress={() => navigation.navigate('Helpdesk')} />
            <QuickTile icon="document-text-outline" label="Profile" color={colors.primary}
              onPress={() => navigation.navigate('Profile', { id: user.id })} />
            {user?.role === 'admin' && (
              <QuickTile icon="people-circle" label="Employees" color={colors.navy}
                onPress={() => navigation.navigate('AdminUsers')} />
            )}
            <QuickTile icon="shield-checkmark" label="Permissions" color={colors.primary}
              onPress={() => navigation.navigate('Permissions')} />
          </View>

          {/* Today's events / birthdays */}
          {events.length > 0 && (
            <>
              <SectionTitle right={<TouchableOpacity onPress={() => navigation.navigate('Social')}><Text style={styles.link}>View all</Text></TouchableOpacity>}>
                Today
              </SectionTitle>
              <Card>
                {events.map((e, i) => (
                  <Row key={i} style={{ paddingVertical: 8, borderBottomWidth: i < events.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                    <View style={[styles.eventIcon, { backgroundColor: (e.type === 'birthday' ? colors.pink : colors.primary) + '18' }]}>
                      <Ionicons name={e.type === 'birthday' ? 'gift-outline' : 'megaphone-outline'}
                        size={18} color={e.type === 'birthday' ? colors.pink : colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontWeight: '700', color: colors.text }}>{e.title}</Text>
                      {e.subtitle ? <Text style={{ color: colors.subtext, fontSize: 12 }}>{e.subtitle}</Text> : null}
                    </View>
                  </Row>
                ))}
              </Card>
            </>
          )}
        </View>
      </ScrollView>

      <PunchModal
        visible={punchVisible}
        today={today}
        onClose={() => setPunchVisible(false)}
        onPunched={() => { setPunchVisible(false); load(); }}
      />
    </Screen>
  );
}

function StatMini({ label, value, color, icon }) {
  return (
    <View style={styles.statMini}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  greeting: { color: '#E0E7FF', fontSize: 14 },
  role: { color: '#A5B4FC', fontSize: 18, fontWeight: '800', marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  punchCard: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  punchLabel: { color: '#C7D2FE', fontSize: 12, fontWeight: '700' },
  punchValue: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  punchTime: { color: '#A5B4FC', fontSize: 12, marginTop: 4 },
  punchBtn: { borderRadius: radius.pill, overflow: 'hidden' },
  punchBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  punchBtnText: { color: '#fff', fontWeight: '800' },
  statsRow: {
    flexDirection: 'row', marginTop: -50,
    marginHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: radius.xl, padding: spacing.md,
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },
  statMini: { flex: 1, alignItems: 'center' },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 10, color: colors.subtext, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  banner: {
    borderRadius: radius.xl, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  bannerTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bannerText: { color: '#E0E7FF', fontSize: 12, marginTop: 2 },
  bannerCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  bannerCtaText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  tilesWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  link: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  eventIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
