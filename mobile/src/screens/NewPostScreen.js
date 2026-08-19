import React, { useState } from 'react';
import { ScrollView, Alert, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { Screen, Input, Button, Row } from '../components/UI';
import { colors } from '../theme';

const BADGES = ['Team Welcome', 'Ship It', 'Kudos', 'Helping Hand', 'On Fire', null];

export default function NewPostScreen({ navigation, route }) {
  const [body, setBody] = useState('');
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!body.trim()) return Alert.alert('Post cannot be empty');
    setLoading(true);
    try {
      await Api.createPost({ body, badge });
      await route.params?.onCreated?.();
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Create post</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input label="What's on your mind?" value={body} onChangeText={setBody}
          multiline style={{ minHeight: 140, textAlignVertical: 'top' }} placeholder="Share an update, kudos, or announcement..." />
        <Text style={styles.label}>Attach a badge (optional)</Text>
        <Row style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {BADGES.map(b => (
            <TouchableOpacity key={b || 'none'} onPress={() => setBadge(b)}
              style={[styles.chip, badge === b && styles.chipActive]}>
              <Text style={[badge === b && { color: '#fff' }, { fontWeight: '700' }]}>{b || 'None'}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <Button title={loading ? 'Posting...' : 'Publish post'} onPress={submit} disabled={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', color: colors.subtext, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
});
