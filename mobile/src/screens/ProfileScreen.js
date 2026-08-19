import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Screen, Avatar, Card, Row, Badge, Button, Input } from '../components/UI';
import { colors, avatarColorFor, fmtDate } from '../theme';

const ACTIONS = [
  { key: 'resignation', label: 'Resignation', icon: 'walk-outline', color: '#ef4444' },
  { key: 'transfer', label: 'Transfer', icon: 'git-compare-outline', color: '#f59e0b' },
  { key: 'on_duty', label: 'On Duty', icon: 'briefcase-outline', color: '#dc2626' },
  { key: 'assign_shift', label: 'Assign shift', icon: 'calendar-outline', color: '#7c3aed' },
  { key: 'restriction', label: 'Restriction', icon: 'eye-off-outline', color: '#0d9488' },
];

export default function ProfileScreen({ navigation, route }) {
  const { user: me } = useAuth();
  const id = route.params?.id || me.id;
  const [u, setU] = useState(null);
  const [modal, setModal] = useState(null); // action_type
  const [payloadText, setPayloadText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMe = id === me.id;
  const canAction = me.role !== 'employee' && !isMe;

  const load = useCallback(async () => {
    const { user } = await Api.employee(id);
    setU(user);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!u) return <Screen />;

  const doAction = async () => {
    setSubmitting(true);
    try {
      await Api.createTeamAction(u.id, modal, { note: payloadText });
      Alert.alert('Requested', `${modal.replace('_', ' ')} request raised for ${u.name}.`);
      setModal(null); setPayloadText('');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <Screen>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        ) : <View style={{ width: 24 }} />}
        <Text style={styles.headerTitle}>{u.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.heroCard}>
          <Avatar name={u.name} color={u.avatar_color || avatarColorFor(u.name)} size={82} />
          <Text style={styles.name}>{u.name}</Text>
          <Text style={styles.role}>{u.designation}</Text>
          <Row style={{ gap: 6, marginTop: 8 }}>
            <Badge text={u.role} tone="solid" />
            <Badge text={u.department} color={colors.teal} />
          </Row>
        </View>

        <Card>
          <Row style={{ gap: 10, marginVertical: 4 }}>
            <Ionicons name="mail-outline" size={18} color={colors.subtext} />
            <Text style={{ flex: 1 }}>{u.email}</Text>
          </Row>
          <Row style={{ gap: 10, marginVertical: 4 }}>
            <Ionicons name="call-outline" size={18} color={colors.subtext} />
            <Text style={{ flex: 1 }}>{u.phone || '—'}</Text>
          </Row>
          <Row style={{ gap: 10, marginVertical: 4 }}>
            <Ionicons name="barcode-outline" size={18} color={colors.subtext} />
            <Text style={{ flex: 1 }}>{u.emp_code}</Text>
          </Row>
          <Row style={{ gap: 10, marginVertical: 4 }}>
            <Ionicons name="cake-outline" size={18} color={colors.subtext} />
            <Text style={{ flex: 1 }}>Birthday: {u.birthday || '—'}</Text>
          </Row>
          <Row style={{ gap: 10, marginVertical: 4 }}>
            <Ionicons name="ribbon-outline" size={18} color={colors.subtext} />
            <Text style={{ flex: 1 }}>Joined: {fmtDate(u.hire_date)}</Text>
          </Row>
        </Card>

        {canAction ? (
          <Card>
            <Text style={styles.section}>Actions</Text>
            {ACTIONS.map(a => (
              <TouchableOpacity key={a.key} style={styles.actionRow}
                onPress={() => { setModal(a.key); setPayloadText(''); }}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '1a' }]}>
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={{ flex: 1, fontWeight: '600' }}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
              </TouchableOpacity>
            ))}
          </Card>
        ) : null}

        {isMe ? (
          <View style={{ padding: 16 }}>
            <Button title="Log out" variant="outline" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalBg}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{modal?.replace('_', ' ')} — {u.name}</Text>
            <Input label="Note / details" value={payloadText} onChangeText={setPayloadText}
              multiline style={{ minHeight: 90, textAlignVertical: 'top' }}
              placeholder="Add any context for this request..." />
            <Row style={{ gap: 10, marginTop: 8 }}>
              <Button title="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Button title={submitting ? 'Sending...' : 'Raise request'} style={{ flex: 1 }} onPress={doAction} disabled={submitting} />
            </Row>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  heroCard: { alignItems: 'center', backgroundColor: colors.brand, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  name: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 10 },
  role: { color: '#d1fae5', marginTop: 2 },
  section: { fontWeight: '800', fontSize: 15, marginBottom: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, textTransform: 'capitalize' },
});
