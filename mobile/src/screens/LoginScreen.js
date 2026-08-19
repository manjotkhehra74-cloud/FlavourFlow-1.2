import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { colors } from '../theme';

const demoAccounts = [
  { label: 'Manager — Akshay', email: 'akshay@pulsehr.app' },
  { label: 'Employee — Deepak C.', email: 'deepak.c@pulsehr.app' },
  { label: 'Employee — Anuj Jain', email: 'anuj@pulsehr.app' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('akshay@pulsehr.app');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.hero}>
          <Text style={styles.brand}>🌿 Pulse HR</Text>
          <Text style={styles.heroTitle}>Namaste! 👋</Text>
          <Text style={styles.heroSubtitle}>Attendance, leaves & team — sab kuch ek jagah.</Text>
        </View>

        <View style={styles.form}>
          <Input label="Work email" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={submit} disabled={loading} />

          <Text style={styles.hint}>Demo accounts (password: <Text style={{ fontWeight: '700' }}>password</Text>):</Text>
          {demoAccounts.map(a => (
            <TouchableOpacity key={a.email} style={styles.chip}
              onPress={() => setEmail(a.email)}>
              <Text style={styles.chipText}>• {a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.brand,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brand: { color: '#a7f3d0', fontWeight: '700', marginBottom: 24 },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '900' },
  heroSubtitle: { color: '#d1fae5', marginTop: 8, fontSize: 15 },
  form: { padding: 24, marginTop: 8 },
  hint: { marginTop: 22, fontSize: 12, color: colors.subtext, marginBottom: 6 },
  chip: { paddingVertical: 6 },
  chipText: { color: colors.brand, fontWeight: '600' },
});
