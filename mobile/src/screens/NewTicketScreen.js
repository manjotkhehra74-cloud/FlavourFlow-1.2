import React, { useState } from 'react';
import { ScrollView, Alert, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { Screen, Input, Button, Row } from '../components/UI';
import { colors } from '../theme';

const CATS = [
  { key: 'it', label: '💻 IT' },
  { key: 'hr', label: '🧑‍💼 HR' },
  { key: 'facilities', label: '🏢 Facilities' },
  { key: 'other', label: '❓ Other' },
];

export default function NewTicketScreen({ navigation, route }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('it');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) return Alert.alert('Fill all fields');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>New ticket</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="Short summary" />
        <Text style={styles.label}>Category</Text>
        <Row style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {CATS.map(c => (
            <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)}
              style={[styles.chip, category === c.key && styles.chipActive]}>
              <Text style={[category === c.key && { color: '#fff' }, { fontWeight: '700' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <Text style={styles.label}>Priority</Text>
        <Row style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {['low', 'medium', 'high'].map(p => (
            <TouchableOpacity key={p} onPress={() => setPriority(p)}
              style={[styles.chip, priority === p && styles.chipActive]}>
              <Text style={[priority === p && { color: '#fff' }, { fontWeight: '700', textTransform: 'capitalize' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <Input label="Description" value={description} onChangeText={setDescription}
          multiline style={{ minHeight: 120, textAlignVertical: 'top' }} placeholder="Describe the issue..." />
        <Button title={loading ? 'Submitting...' : 'Raise ticket'} onPress={submit} disabled={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', color: colors.subtext, marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
});
