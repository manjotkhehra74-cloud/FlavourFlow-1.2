import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Api } from '../api/client';
import { Screen, Card, Badge, Button, Row, EmptyState, NavHeader } from '../components/UI';
import { colors } from '../theme';

const CATEGORIES = { it: '💻 IT', hr: '🧑‍💼 HR', payroll: '💰 Payroll', facilities: '🏢 Facilities' };

export default function HelpdeskScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const t = await Api.tickets();
    setTickets(t.tickets);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const cycle = async (t) => {
    const order = ['open', 'in_progress', 'resolved', 'closed'];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    await Api.updateTicketStatus(t.id, next);
    await load();
  };

  return (
    <Screen>
      <NavHeader title="Helpdesk" navigation={navigation} />

      <FlatList
        data={tickets}
        keyExtractor={(t) => String(t.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState title="No tickets" subtitle="Raise a request for IT, HR or facilities." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => cycle(item)}>
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', flex: 1 }}>{item.subject}</Text>
                <Badge text={item.status} />
              </Row>
              {item.user_name ? <Text style={{ color: colors.subtext, marginTop: 4, fontSize: 12 }}>by {item.user_name}</Text> : null}
              <Text style={{ marginTop: 6, color: colors.text }}>{item.description}</Text>
              <Row style={{ marginTop: 10 }}>
                <Badge text={CATEGORIES[item.category] || item.category} color={colors.blue} />
                <View style={{ width: 8 }} />
                <Badge text={item.priority} color={item.priority === 'high' ? colors.red : colors.subtext} />
              </Row>
              <Text style={{ marginTop: 8, fontSize: 11, color: colors.subtext }}>Tap to advance status →</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <View style={{ padding: 16 }}>
        <Button title="Raise a ticket" icon="add" onPress={() => navigation.navigate('NewTicket', { onCreated: load })} />
      </View>
    </Screen>
  );
}
