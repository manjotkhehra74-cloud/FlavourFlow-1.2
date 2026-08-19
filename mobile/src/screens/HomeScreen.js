import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Screen, Card, Button, Row, StatPill, Badge } from '../components/UI';
import { colors, fmtTime } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [today, setToday] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const isManager = user?.role !== 'employee';

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([Api.summary(), Api.attendanceToday()]);
      setSummary(s);
      setToday(t.today);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  };

  const clock = async (action) => {
    setBusy(true);
    try {
      let coords = {};
      if (action === 'in') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({}).catch(() => null);
          if (loc) coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        }
      }
      await Api.clock(action, coords);
      await load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  const initial = (user?.name || '').split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <Screen style={{ backgroundColor: colors.bg }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hi}>Hi {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subHi}>{user?.designation} · {user?.emp_code}</Text>
          </View>
          <View style={styles.avatar}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{initial}</Text></View>
        </View>

        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.label}>Today's attendance</Text>
              <Text style={styles.big}>
                {today ? (today.status === 'late' ? '⏰ Marked late' : `✅ ${today.status.replace('_', ' ')}`) : 'Not marked yet'}
              </Text>
              {today?.clock_in ? <Text style={styles.mini}>In: {fmtTime(today.clock_in)}{today.clock_out ? `  ·  Out: ${fmtTime(today.clock_out)}` : ''}</Text> : null}
            </View>
            <Badge text={today?.status || 'pending'} tone="solid" />
          </Row>
          <Row style={{ marginTop: 14, gap: 10 }}>
            {!today?.clock_in ? (
              <Button title="📷 Mark attendance" onPress={() => clock('in')} style={{ flex: 1 }} disabled={busy} />
            ) : !today?.clock_out ? (
              <Button title="Clock out" variant="outline" onPress={() => clock('out')} style={{ flex: 1 }} disabled={busy} />
            ) : (
              <Text style={{ color: colors.subtext }}>You're all done for today. 🌙</Text>
            )}
          </Row>
        </Card>

        <Card>
          <Text style={styles.label}>This month ({summary?.month})</Text>
          <Row style={{ gap: 10, marginTop: 10 }}>
            <StatPill label="Present" value={summary?.monthStats?.present || 0} color={colors.green} />
            <StatPill label="Late" value={summary?.monthStats?.late || 0} color={colors.orange} />
            <StatPill label="WFH" value={summary?.monthStats?.wfh || 0} color={colors.blue} />
          </Row>
        </Card>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          <QuickTile icon="calendar-outline" label="Apply leave" color={colors.purple} onPress={() => navigation.navigate('Leaves')} />
          <QuickTile icon="time-outline" label="Regularise" color={colors.orange} onPress={() => navigation.navigate('AttendanceRequests')} />
          <QuickTile icon="people-outline" label="Team" color={colors.teal} onPress={() => navigation.navigate('Team')} />
          <QuickTile icon="gift-outline" label="Wishes" color={colors.pink} onPress={() => navigation.navigate('Social')} />
          <QuickTile icon="headset-outline" label="Helpdesk" color={colors.blue} onPress={() => navigation.navigate('Helpdesk')} />
          <QuickTile icon="document-text-outline" label="Profile" color={colors.brand} onPress={() => navigation.navigate('Profile', { id: user.id })} />
        </View>

        {isManager ? (
          <Card style={{ backgroundColor: colors.brand }}>
            <Text style={[styles.label, { color: '#a7f3d0' }]}>Manager dashboard</Text>
            <Row style={{ gap: 10, marginTop: 10 }}>
              <StatPill label="Team size" value={summary?.teamCount || 0} color={colors.brand} />
              <StatPill label="Present today" value={summary?.teamPresentToday || 0} color={colors.green} />
              <StatPill label="Pending" value={summary?.pending?.teamApprovals || 0} color={colors.orange} />
            </Row>
            <TouchableOpacity style={styles.approvalBtn} onPress={() => navigation.navigate('Approvals')}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Review approvals →</Text>
            </TouchableOpacity>
          </Card>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </Screen>
  );
}

function QuickTile({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.tileIcon, { backgroundColor: color + '1a' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  hi: { fontSize: 24, fontWeight: '900', color: colors.text },
  subHi: { color: colors.subtext, marginTop: 2 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { color: colors.subtext, fontWeight: '600', fontSize: 13 },
  big: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 },
  mini: { color: colors.subtext, marginTop: 4, fontSize: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, justifyContent: 'space-between' },
  tile: {
    width: '30%', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center',
    margin: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tileIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileLabel: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  approvalBtn: {
    marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12, borderRadius: 12, alignItems: 'center',
  },
});
