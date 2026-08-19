import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { Screen, Card, Badge, Button, Row, EmptyState } from '../components/UI';
import { colors, fmtDate } from '../theme';

const TYPES = [
  { key: 'casual', label: 'Casual', color: '#0d9488' },
  { key: 'sick', label: 'Sick', color: '#dc2626' },
  { key: 'earned', label: 'Earned', color: '#2563eb' },
  { key: 'optional', label: 'Optional', color: '#7c3aed' },
];

export default function LeavesScreen({ navigation }) {
  const [balances, setBalances] = useState({});
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [b, m] = await Promise.all([Api.leaveBalances(), Api.myLeaves()]);
    setBalances(b.balances);
    setRequests(m.requests);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Leave</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={(r) => String(r.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState title="No leaves" subtitle="Your leave history will show up here." />}
        ListHeaderComponent={
          <View>
            <Card>
              <Text style={styles.label}>Balances</Text>
              <Row style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {TYPES.map(t => {
                  const b = balances[t.key] || { remaining: 0, total: 0, used: 0 };
                  return (
                    <View key={t.key} style={[styles.bal, { borderColor: t.color + '55' }]}>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: t.color }}>{b.remaining}</Text>
                      <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 2 }}>{t.label}</Text>
                      <Text style={{ fontSize: 10, color: colors.subtext }}>{b.used}/{b.total} used</Text>
                    </View>
                  );
                })}
              </Row>
            </Card>
            <Text style={styles.sectionTitle}>My requests</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', textTransform: 'capitalize' }}>{item.leave_type} leave · {item.days}d</Text>
              <Badge text={item.status} />
            </Row>
            <Text style={{ color: colors.subtext, marginTop: 6 }}>
              {fmtDate(item.from_date)} → {fmtDate(item.to_date)}
            </Text>
            <Text style={{ marginTop: 6 }}>{item.reason}</Text>
          </Card>
        )}
      />
      <View style={{ padding: 16 }}>
        <Button title="+ Apply for leave" onPress={() => navigation.navigate('NewLeave', { onCreated: load })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  label: { color: colors.subtext, fontWeight: '700', fontSize: 13 },
  bal: { width: '23%', minWidth: 70, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', margin: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginHorizontal: 20, marginTop: 10, marginBottom: 4 },
});
