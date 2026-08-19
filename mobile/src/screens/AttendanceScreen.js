import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { Api } from '../api/client';
import { Screen, Card, Badge, Button, Row, EmptyState, NavHeader, Chip } from '../components/UI';
import { colors, fmtDate } from '../theme';

export default function AttendanceScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [mine, setMine] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('history');

  const load = useCallback(async () => {
    try {
      const [h, m] = await Promise.all([Api.attendanceHistory(), Api.myAttendanceRequests()]);
      setRecords(h.records || []);
      setMine(m.requests || []);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const stats = useMemo(() => {
    const acc = { present: 0, late: 0, absent: 0, wfh: 0, on_leave: 0 };
    records.forEach((r) => { if (acc[r.status] !== undefined) acc[r.status] += 1; });
    return acc;
  }, [records]);

  return (
    <Screen>
      <NavHeader title="My Attendance" navigation={navigation} />
      <View style={styles.tabs}>
        <Chip label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <Chip
          label={`My requests${mine.filter((m) => m.status === 'pending').length ? ' · ' + mine.filter((m) => m.status === 'pending').length : ''}`}
          active={tab === 'requests'}
          onPress={() => setTab('requests')}
        />
      </View>

      {tab === 'history' ? (
        <FlatList
          data={records}
          keyExtractor={(r) => String(r.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <Card style={{ marginHorizontal: 16, marginBottom: 8 }}>
              <Row style={{ alignItems: 'center' }}>
                <Donut present={stats.present} late={stats.late} absent={stats.absent} wfh={stats.wfh} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Legend color={colors.green} label="Present" value={stats.present} />
                  <Legend color={colors.orange} label="Late" value={stats.late} />
                  <Legend color={colors.blue} label="WFH" value={stats.wfh} />
                  <Legend color={colors.red} label="Absent" value={stats.absent} />
                </View>
              </Row>
            </Card>
          }
          ListEmptyComponent={<EmptyState title="No records" subtitle="Mark your attendance to see it here." />}
          renderItem={({ item }) => (
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{fmtDate(item.date)}</Text>
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
                <Text style={{ fontWeight: '700', color: colors.text }}>{String(item.type || '').replace('_', ' ').toUpperCase()}</Text>
                <Badge text={item.status} />
              </Row>
              <Text style={{ color: colors.subtext, marginTop: 6 }}>{fmtDate(item.date)}</Text>
              <Text style={{ marginTop: 6, color: colors.text }}>{item.reason}</Text>
            </Card>
          )}
        />
      )}

      <View style={{ padding: 16 }}>
        <Button title="Request regularisation" icon="add" onPress={() => navigation.navigate('NewAttendance', { onCreated: load })} />
      </View>
    </Screen>
  );
}

function Legend({ color, label, value }) {
  return (
    <Row style={{ marginBottom: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 8 }} />
      <Text style={{ flex: 1, color: colors.subtext, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '800', color: colors.text }}>{value}</Text>
    </Row>
  );
}

function Donut({ present, late, absent, wfh, size = 124 }) {
  const total = Math.max(1, present + late + absent + wfh);
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segs = [
    { n: present, color: colors.green },
    { n: late, color: colors.orange },
    { n: wfh, color: colors.blue },
    { n: absent, color: colors.red },
  ];
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        {segs.map((s, i) => {
          const len = (s.n / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
      <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>{present}</Text>
      <Text style={{ fontSize: 11, color: colors.subtext }}>Present</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12 },
});
