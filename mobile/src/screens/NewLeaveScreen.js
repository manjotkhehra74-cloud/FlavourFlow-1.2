import React, { useState } from 'react';
import { ScrollView, Alert, Text, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row, Card, NavHeader, Chip } from '../components/UI';
import { colors, spacing } from '../theme';

function todayISO() { return new Date().toISOString().slice(0, 10); }

const TYPES = [
  { key: 'casual', label: 'Casual' },
  { key: 'sick', label: 'Sick' },
  { key: 'earned', label: 'Earned' },
  { key: 'optional', label: 'Optional' },
];

export default function NewLeaveScreen({ navigation, route }) {
  const [leaveType, setLeaveType] = useState('casual');
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return Alert.alert('Reason required', 'Please add a short reason for this leave.');
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
      <NavHeader title="Apply leave" navigation={navigation} mode="back" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.lead}>Tell us the type, dates and why you need time off.</Text>
          <Text style={styles.label}>Leave type</Text>
          <Row style={styles.chips}>
            {TYPES.map((t) => (
              <Chip key={t.key} label={t.label} active={leaveType === t.key} onPress={() => setLeaveType(t.key)} />
            ))}
          </Row>
          <Input label="From (YYYY-MM-DD)" icon="calendar-outline" value={from} onChangeText={setFrom} autoCapitalize="none" />
          <Input label="To (YYYY-MM-DD)" icon="calendar-outline" value={to} onChangeText={setTo} autoCapitalize="none" />
          <Input
            label="Reason"
            icon="create-outline"
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Reason for leave..."
          />
          <Button title={loading ? 'Submitting...' : 'Submit leave'} onPress={submit} disabled={loading} loading={loading} icon="paper-plane-outline" />
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
