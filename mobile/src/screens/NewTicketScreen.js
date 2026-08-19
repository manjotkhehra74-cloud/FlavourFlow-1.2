import React, { useState } from 'react';
import { ScrollView, Alert, Text, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row, Card, NavHeader, Chip } from '../components/UI';
import { colors, spacing } from '../theme';

const CATS = [
  { key: 'it', label: 'IT' },
  { key: 'hr', label: 'HR' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'other', label: 'Other' },
];

export default function NewTicketScreen({ navigation, route }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('it');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) return Alert.alert('Fill all fields', 'Subject and description are required.');
    setLoading(true);
    try {
      await Api.createTicket({ subject, category, description, priority });
      await route.params?.onCreated?.();
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <NavHeader title="New ticket" navigation={navigation} mode="back" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.lead}>Raise a request for IT, HR or facilities. We'll route it to the right team.</Text>
          <Input label="Subject" icon="pricetag-outline" value={subject} onChangeText={setSubject} placeholder="Short summary" />
          <Text style={styles.label}>Category</Text>
          <Row style={styles.chips}>
            {CATS.map((c) => (
              <Chip key={c.key} label={c.label} active={category === c.key} onPress={() => setCategory(c.key)} />
            ))}
          </Row>
          <Text style={styles.label}>Priority</Text>
          <Row style={styles.chips}>
            {['low', 'medium', 'high'].map((p) => (
              <Chip key={p} label={p} active={priority === p} onPress={() => setPriority(p)} />
            ))}
          </Row>
          <Input
            label="Description"
            icon="document-text-outline"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Describe the issue..."
          />
          <Button title={loading ? 'Submitting...' : 'Raise ticket'} onPress={submit} disabled={loading} loading={loading} icon="ticket-outline" />
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
