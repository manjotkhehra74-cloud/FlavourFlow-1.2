import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { Input, Button, PulseMark } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getBiometricSupport, hasBiometricCredentials, saveBiometricCredentials } from '../utils/permissions';

export default function LoginScreen() {
  const { login, loginWithBiometrics } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bioType, setBioType] = useState(null);
  const [hasBioCreds, setHasBioCreds] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getBiometricSupport();
      setBioType(t);
      const has = await hasBiometricCredentials();
      setHasBioCreds(has);
    })();
  }, []);

  const onLogin = async () => {
    if (!email || !password) return Alert.alert('Missing', 'Please enter email and password.');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      if (bioType && bioType !== 'Enroll needed') {
        await saveBiometricCredentials(email.trim().toLowerCase(), password);
      }
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onBiometricLogin = async () => {
    setBioLoading(true);
    try {
      await loginWithBiometrics();
    } catch (e) {
      Alert.alert('Biometric login failed', e.message);
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <LinearGradient
                colors={['#7C3AED', '#4F46E5']}
                style={styles.logoWrap}
              >
                <PulseMark color="#fff" size={40} />
              </LinearGradient>
              <Text style={styles.brand}>Pulse HR</Text>
              <Text style={styles.tagline}>People. Purpose. Performance.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.welcome}>Welcome Back! 👋</Text>
              <Text style={styles.subWelcome}>Login to continue</Text>

              <Input
                label="Email or Mobile"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@pulsehr.app"
              />
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                placeholder="Enter password"
              />

              <View style={styles.rememberRow}>
                <TouchableOpacity style={styles.check} onPress={() => setRemember((v) => !v)}>
                  <Ionicons
                    name={remember ? 'checkbox' : 'square-outline'}
                    size={20} color={remember ? colors.primary : colors.subtext}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={{ marginRight: 14 }}>
                    <Text style={styles.forgot}>{showPw ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Reset password', 'Please contact your admin.')}>
                    <Text style={styles.forgot}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Login"
                onPress={onLogin}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />

              {bioType && bioType !== 'Enroll needed' ? (
                <TouchableOpacity
                  onPress={onBiometricLogin}
                  disabled={bioLoading}
                  style={[styles.bioBtn, hasBioCreds ? styles.bioBtnActive : styles.bioBtnInactive]}
                >
                  <LinearGradient
                    colors={hasBioCreds ? ['#7C3AED', '#4F46E5'] : ['#E5E7EB', '#E5E7EB']}
                    style={styles.bioGrad}
                  >
                    <Ionicons name={bioType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} size={22} color={hasBioCreds ? '#fff' : colors.subtext} />
                    <Text style={[styles.bioText, { color: hasBioCreds ? '#fff' : colors.subtext }]}>
                      {bioLoading ? 'Verifying...' : hasBioCreds ? `Login with ${bioType}` : `Enable ${bioType} (login once)`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : bioType === 'Enroll needed' ? (
                <View style={styles.bioHint}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.orange} />
                  <Text style={styles.bioHintText}>Biometric not enrolled — enable fingerprint/face in device settings to use quick login & punch.</Text>
                </View>
              ) : null}

              <Text style={styles.or}>or continue with</Text>

              <View style={styles.socials}>
                {[
                  { n: 'logo-google', c: '#EA4335' },
                  { n: 'logo-microsoft', c: '#0078D4' },
                  { n: 'logo-apple', c: colors.text },
                ].map((s, i) => (
                  <TouchableOpacity key={i} style={styles.socialBtn}>
                    <Ionicons name={s.n} size={20} color={s.c} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.footer}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text></Text>

              <TouchableOpacity
                style={styles.demoFill}
                onPress={() => { setEmail('admin@pulsehr.app'); setPassword('password'); }}
              >
                <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
                <Text style={styles.demoText}>  Use demo admin account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 80, paddingBottom: 28 },
  logoWrap: {
    width: 88, height: 88, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C3AED', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  brand: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 14, letterSpacing: 0.5 },
  tagline: { color: '#A5B4FC', fontSize: 13, marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 28,
  },
  welcome: { fontSize: 22, fontWeight: '900', color: colors.text },
  subWelcome: { color: colors.subtext, marginTop: 4, marginBottom: 20 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  check: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 6, color: colors.textLight, fontSize: 13 },
  forgot: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  or: { textAlign: 'center', color: colors.subtext, fontSize: 12, marginVertical: 18, textTransform: 'uppercase' },
  socials: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  socialBtn: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  footer: { textAlign: 'center', color: colors.subtext, fontSize: 13, marginTop: 18 },
  demoFill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 14, padding: 10, backgroundColor: colors.primarySoft, borderRadius: 12,
  },
  demoText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  bioBtn: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  bioBtnActive: { opacity: 1 },
  bioBtnInactive: { opacity: 0.95 },
  bioGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  bioText: { fontWeight: '800', fontSize: 14, marginLeft: 8 },
  bioHint: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.orange + '14', borderRadius: 12, padding: 12, marginTop: 14, gap: 8 },
  bioHintText: { flex: 1, color: colors.textLight, fontSize: 12, lineHeight: 16 },
});
