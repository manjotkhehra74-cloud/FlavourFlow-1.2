import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { Screen, Card, Avatar, Badge, Button, Row, EmptyState } from '../components/UI';
import { colors, avatarColorFor, fmtDate } from '../theme';

export default function ApprovalsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState('attendance');
  const [selected, setSelected] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, l] = await Promise.all([Api.pendingAttendance(), Api.pendingLeaves()]);
      setItems(a.requests);
      setLeaves(l.requests);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggle = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    const list = tab === 'attendance' ? items : leaves;
    if (selected.size === list.length) setSelected(new Set());
    else setSelected(new Set(list.map(x => x.id)));
  };

  const act = async (action) => {
    if (!selected.size) return;
    try {
      if (tab === 'attendance') await Api.bulkAttendance([...selected], action);
      else {
        for (const id of selected) await Api.reviewLeave(id, action);
      }
      setSelected(new Set());
      await load();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const data = tab === 'attendance' ? items : leaves;

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <Tab label={`Attendance (${items.length})`} active={tab === 'attendance'} onPress={() => { setTab('attendance'); setSelected(new Set()); }} />
        <Tab label={`Leaves (${leaves.length})`} active={tab === 'leaves'} onPress={() => { setTab('leaves'); setSelected(new Set()); }} />
      </View>

      {selected.size > 0 ? (
        <View style={styles.actionBar}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{selected.size} selected</Text>
          <Row style={{ gap: 8 }}>
            <TouchableOpacity onPress={() => act('reject')} style={[styles.actBtn, { backgroundColor: colors.red }]}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => act('approve')} style={[styles.actBtn, { backgroundColor: colors.green }]}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Approve</Text>
            </TouchableOpacity>
          </Row>
        </View>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(r) => String(r.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState title="All caught up 🎉" subtitle="Nothing pending right now." />}
        renderItem={({ item }) => {
          const checked = selected.has(item.id);
          return (
            <TouchableOpacity onPress={() => toggle(item.id)} activeOpacity={0.9}>
              <Card style={checked ? { borderColor: colors.brand, borderWidth: 2 } : undefined}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                    {checked ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                  </View>
                  <Avatar name={item.user_name} color={item.avatar_color || avatarColorFor(item.user_name)} size={40} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontWeight: '800' }}>
                      {tab === 'attendance' ? (item.type === 'regularization' ? 'Attendance regularisation' : 'Mark attendance') : `Leave request · ${item.leave_type}`}
                    </Text>
                    <Text style={{ color: colors.subtext, fontSize: 12 }}>
                      {item.user_name} ({item.emp_code})
                    </Text>
                    <Text style={{ marginTop: 6 }}>{item.reason}</Text>
                    <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 4 }}>
                      {tab === 'attendance' ? fmtDate(item.date) : `${fmtDate(item.from_date)} → ${fmtDate(item.to_date)} · ${item.days}d`}
                    </Text>
                  </View>
                  <Badge text="pending" />
                </Row>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      {data.length ? (
        <View style={{ padding: 16 }}>
          <Button title={selected.size === data.length ? 'Clear selection' : 'Select all'} variant="outline" onPress={toggleAll} />
        </View>
      ) : null}
    </Screen>
  );
}

function Tab({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[{ fontWeight: '700', color: colors.subtext }, active && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', padding: 6, margin: 12, borderRadius: 12, gap: 6 },
  tab: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 8 },
  tabActive: { backgroundColor: colors.brand },
  actionBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.brandDark, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 12, borderRadius: 12,
  },
  actBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
});
