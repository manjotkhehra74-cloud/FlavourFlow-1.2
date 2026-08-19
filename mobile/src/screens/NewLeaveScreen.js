import React, { useState } from 'react';
import { ScrollView, Alert, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

function todayISO() { return new Date().toISOString().slice(0, 10); }

const TYPES = ['casual', 'sick', 'earned', 'optional'];

export default function NewLeaveScreen({ navigation, route }) {
  const [leaveType, setLeaveType] = useState('casual');
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return Alert.alert('Reason required');
    setLoading(true);
    try {
      await Api.requestLeave({ leave_type: leaveType, from_date: from, to_date: to, reason });
      await route.params?.onCreated?.();
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Apply leave</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Leave type</Text>
        <Row style={{ gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <TouchableOpacity key={t} onPress={() => setLeaveType(t)}
              style={[styles.chip, leaveType === t && styles.chipActive]}>
              <Text style={[{ fontWeight: '700', textTransform: 'capitalize' }, leaveType === t && { color: '#fff' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <Input label="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} autoCapitalize="none" />
        <Input label="To (YYYY-MM-DD)" value={to} onChangeText={setTo} autoCapitalize="none" />
        <Input label="Reason" value={reason} onChangeText={setReason} multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }} placeholder="Reason for leave..." />
        <Button title={loading ? 'Submitting...' : 'Submit'} onPress={submit} disabled={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', color: colors.subtext, marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
});
