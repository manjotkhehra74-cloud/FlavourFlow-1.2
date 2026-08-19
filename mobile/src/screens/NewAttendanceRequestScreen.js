import React, { useState } from 'react';
import { ScrollView, Alert, Text, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row, Card, NavHeader, Chip } from '../components/UI';
import { colors, spacing } from '../theme';

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const TYPES = [
  { key: 'regularization', label: 'Regularisation' },
  { key: 'mark_attendance', label: 'Mark attendance' },
];

export default function NewAttendanceRequestScreen({ navigation, route }) {
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState('regularization');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return Alert.alert('Reason required', 'Please explain this request briefly.');
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
      <NavHeader title="Regularise attendance" navigation={navigation} mode="back" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.lead}>Raise a regularisation or ask your manager to mark a missed day.</Text>
          <Input label="Date (YYYY-MM-DD)" icon="calendar-outline" value={date} onChangeText={setDate} autoCapitalize="none" />
          <Text style={styles.label}>Type</Text>
          <Row style={styles.chips}>
            {TYPES.map((t) => (
              <Chip key={t.key} label={t.label} active={type === t.key} onPress={() => setType(t.key)} />
            ))}
          </Row>
          <Input
            label="Reason"
            icon="chatbubble-ellipses-outline"
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Explain briefly..."
          />
          <Button title={loading ? 'Submitting...' : 'Submit request'} onPress={submit} disabled={loading} loading={loading} icon="send-outline" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: 40 },
  lead: { color: colors.subtext, marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexWrap: 'wrap', marginBottom: 16 },
});
