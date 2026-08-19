import React, { useState } from 'react';
import { ScrollView, Alert, Text, StyleSheet } from 'react-native';
import { Api } from '../api/client';
import { Screen, Input, Button, Row, Card, NavHeader, Chip } from '../components/UI';
import { colors, spacing } from '../theme';

const BADGES = ['Team Welcome', 'Ship It', 'Kudos', 'Helping Hand', 'On Fire'];

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
      <NavHeader title="Create post" navigation={navigation} mode="back" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.lead}>Share an update, kudos, or announcement with the team.</Text>
          <Input
            label="What's on your mind?"
            icon="create-outline"
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="Share an update..."
          />
          <Text style={styles.label}>Attach a badge (optional)</Text>
          <Row style={styles.chips}>
            <Chip label="None" active={badge === null} onPress={() => setBadge(null)} />
            {BADGES.map((b) => (
              <Chip key={b} label={b} active={badge === b} onPress={() => setBadge(b)} />
            ))}
          </Row>
          <Button title={loading ? 'Posting...' : 'Publish post'} onPress={submit} disabled={loading} loading={loading} icon="megaphone-outline" />
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
