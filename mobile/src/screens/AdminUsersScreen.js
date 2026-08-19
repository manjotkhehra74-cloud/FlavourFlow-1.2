import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  Modal, ScrollView, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { colors, fmtDate } from '../theme';
import { Screen, Card, Button, Avatar, Badge } from '../components/UI';

const emptyForm = {
  name: '', email: '', password: '', role: 'employee',
  department: '', designation: '', phone: '',
};

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await Api.listUsers();
      setUsers(users);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || '', email: u.email || '', password: '',
      role: u.role || 'employee', department: u.department || '',
      designation: u.designation || '', phone: u.phone || '',
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!form.name || !form.email) return Alert.alert('Missing', 'Name and email required');
    if (!editing && !form.password) return Alert.alert('Missing', 'Password required for new user');
    setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await Api.updateUser(editing.id, payload);
      } else {
        await Api.createUser(form);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (u) => {
    Alert.alert(
      'Delete user',
      `Sach vich ${u.name} (${u.email}) nu delete karna hai? Ohna da sara data vi chala jayega.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await Api.deleteUser(u.id);
              load();
            } catch (e) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  const roleBadge = (r) => r === 'admin' ? 'ADMIN' : r === 'manager' ? 'MANAGER' : 'EMPLOYEE';
  const roleColor = (r) => r === 'admin' ? colors.pink : r === 'manager' ? colors.purple : colors.subtext;

  return (
    <Screen>
      <View style={styles.header}>
        <Ionicons name="people-circle-outline" size={24} color="#fff" />
        <Text style={styles.title}>Manage Employees</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={openNew} style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Koi user nahi</Text> : null}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Avatar name={item.name} size={44} color={item.avatar_color} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Badge text={roleBadge(item.role)} color={roleColor(item.role)} />
                </View>
                <Text style={styles.meta}>{item.email}</Text>
                <Text style={styles.meta}>
                  {[item.designation, item.department, item.emp_code].filter(Boolean).join(' · ')}
                </Text>
                <Text style={styles.join}>Joined: {fmtDate(item.hire_date)}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                <Ionicons name="create-outline" size={18} color={colors.brand} />
                <Text style={[styles.actionText, { color: colors.brand }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.red} />
                <Text style={[styles.actionText, { color: colors.red }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit user' : 'New user'}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Field label="Full name*"><TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Akshay Mehta" placeholderTextColor="#94a3b8" /></Field>
              <Field label="Email*"><TextInput style={styles.input} value={form.email} autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => setForm(f => ({ ...f, email: v }))} placeholder="name@pulsehr.app" placeholderTextColor="#94a3b8" /></Field>
              <Field label={editing ? 'New password (chhadd do to keep old)' : 'Password*'}>
                <TextInput style={styles.input} value={form.password} secureTextEntry onChangeText={(v) => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" placeholderTextColor="#94a3b8" />
              </Field>
              <Field label="Role">
                <View style={styles.roleRow}>
                  {['employee', 'manager', 'admin'].map(r => (
                    <TouchableOpacity key={r} onPress={() => setForm(f => ({ ...f, role: r }))}
                      style={[styles.roleChip, form.role === r && styles.roleChipOn]}>
                      <Text style={[styles.roleText, form.role === r && { color: '#fff' }]}>{r.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
              <Field label="Designation"><TextInput style={styles.input} value={form.designation} onChangeText={(v) => setForm(f => ({ ...f, designation: v }))} placeholder="Engineering Manager" placeholderTextColor="#94a3b8" /></Field>
              <Field label="Department"><TextInput style={styles.input} value={form.department} onChangeText={(v) => setForm(f => ({ ...f, department: v }))} placeholder="Engineering" placeholderTextColor="#94a3b8" /></Field>
              <Field label="Phone"><TextInput style={styles.input} value={form.phone} keyboardType="phone-pad" onChangeText={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="9876543210" placeholderTextColor="#94a3b8" /></Field>
            </ScrollView>
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Button title={saving ? 'Saving...' : (editing ? 'Save changes' : 'Create user')} onPress={onSave} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.brand, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 999 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  join: { color: colors.subtext, fontSize: 11, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.subtext, marginTop: 60 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  handle: { width: 44, height: 5, backgroundColor: '#cbd5e1', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 15, color: colors.text },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  roleChipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  roleText: { fontSize: 12, fontWeight: '800', color: colors.subtext },
});
