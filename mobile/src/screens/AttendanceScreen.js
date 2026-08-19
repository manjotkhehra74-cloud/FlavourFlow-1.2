import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { Screen, Card, Badge, Button, Row, EmptyState } from '../components/UI';
import { colors, fmtDate } from '../theme';

export default function AttendanceScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [mine, setMine] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('history');

  const load = useCallback(async () => {
    try {
      const [h, m] = await Promise.all([Api.attendanceHistory(), Api.myAttendanceRequests()]);
      setRecords(h.records);
      setMine(m.requests);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>My Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <Tab label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <Tab label="My requests" active={tab === 'requests'} onPress={() => setTab('requests')} badge={mine.filter(m => m.status === 'pending').length} />
      </View>

      {tab === 'history' ? (
        <FlatList
          data={records}
          keyExtractor={(r) => String(r.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No records" subtitle="Mark your attendance to see it here." />}
          renderItem={({ item }) => (
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontWeight: '700' }}>{fmtDate(item.date)}</Text>
                  <Text style={{ color: colors.subtext, marginTop: 4, fontSize: 12 }}>
                    {item.clock_in ? new Date(item.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    {'  →  '}
                    {item.clock_out ? new Date(item.clock_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Text>
                </View>
                <Badge text={item.status} />
              </Row>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={mine}
          keyExtractor={(r) => String(r.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No requests" subtitle="Tap below to raise a regularization." />}
          renderItem={({ item }) => (
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                <Badge text={item.status} />
              </Row>
              <Text style={{ color: colors.subtext, marginTop: 6 }}>{fmtDate(item.date)}</Text>
              <Text style={{ marginTop: 6 }}>{item.reason}</Text>
            </Card>
          )}
        />
      )}

      <View style={{ padding: 16 }}>
        <Button title="+ Request regularisation / mark attendance" onPress={() => navigation.navigate('NewAttendanceRequest', { onCreated: load })} />
      </View>
    </Screen>
  );
}

function Tab({ label, active, onPress, badge }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && { color: '#fff' }]}>{label}</Text>
      {badge ? <View style={styles.badgeDot}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{badge}</Text></View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', padding: 6, margin: 12, borderRadius: 12, gap: 6 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 6 },
  tabActive: { backgroundColor: colors.brand },
  tabText: { fontWeight: '700', color: colors.subtext },
  badgeDot: { backgroundColor: colors.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
});
