import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Screen, Avatar, Badge, EmptyState } from '../components/UI';
import { colors, avatarColorFor } from '../theme';

export default function TeamScreen({ navigation }) {
  const { user } = useAuth();
  const isManager = user?.role !== 'employee';
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = isManager ? await Api.team() : await Api.employees();
    setUsers(isManager ? data.team : data.users);
  }, [isManager]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = users.filter(u =>
    !q || u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.emp_code.toLowerCase().includes(q.toLowerCase()) ||
    u.designation?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>{isManager ? 'My team' : 'Directory'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.subtext} />
        <TextInput
          style={styles.search}
          placeholder="Search name, code, role"
          value={q}
          onChangeText={setQ}
          placeholderTextColor={colors.subtext}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => String(u.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState title="No employees found" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Profile', { id: item.id })}
          >
            <Avatar name={item.name} color={item.avatar_color || avatarColorFor(item.name)} size={46} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.designation} · {item.emp_code}</Text>
            </View>
            {isManager && item.role === 'employee' ? <Badge text="team" color={colors.teal} /> : <Badge text={item.role} />}
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.brand, gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', margin: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  search: { flex: 1, paddingVertical: 12, fontSize: 15 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 4, borderRadius: 12,
  },
  name: { fontWeight: '700', fontSize: 15 },
  role: { color: colors.subtext, fontSize: 12, marginTop: 2 },
});
