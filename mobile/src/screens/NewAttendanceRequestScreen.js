import React, { useState } from 'react';
import { ScrollView, Alert, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function NewAttendanceRequestScreen({ navigation, route }) {
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState('regularization');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return Alert.alert('Reason required');
    setLoading(true);
    try {
      await Api.createAttendanceRequest(date, type, reason);
      await route.params?.onCreated?.();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>New request</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} autoCapitalize="none" />
        <Text style={styles.label}>Type</Text>
        <Row style={{ gap: 10, marginBottom: 14 }}>
          {['regularization', 'mark_attendance'].map(t => (
            <TouchableOpacity key={t} onPress={() => setType(t)}
              style={[styles.chip, type === t && styles.chipActive]}>
              <Text style={[{ fontWeight: '700' }, type === t ? { color: '#fff' } : { color: colors.text }]}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </Row>
        <Input label="Reason" value={reason} onChangeText={setReason} multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }} placeholder="Explain briefly..." />
        <Button title={loading ? 'Submitting...' : 'Submit request'} onPress={submit} disabled={loading} />
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
