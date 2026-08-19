import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Card, Button, Row, NavHeader } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { openLocationSettings, scheduleDailyReminder } from '../utils/permissions';

export default function PermissionsScreen() {
  const nav = useNavigation();
  const [loc, setLoc] = useState(false);
  const [bio, setBio] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(null);
  const [notif, setNotif] = useState(false);

  const load = async () => {
    const [l, n] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Notifications.getPermissionsAsync(),
    ]);
    setLoc(l.granted);
    setNotif(n.granted);
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBioAvailable(has && enrolled);
  };

  useEffect(() => { load(); }, []);

  const toggleLocation = async () => {
    const cur = await Location.getForegroundPermissionsAsync();
    if (cur.granted) return openLocationSettings();
    const r = await Location.requestForegroundPermissionsAsync();
    setLoc(r.granted);
  };
  const toggleNotif = async () => {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) { setNotif(true); return; }
    const r = await Notifications.requestPermissionsAsync();
    setNotif(r.granted);
    if (r.granted) scheduleDailyReminder(10, 0);
  };
  const toggleBio = async () => {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Verify to enable biometric punch' });
    if (r.success) setBio(true);
  };

  return (
    <Screen>
      <NavHeader title="Permissions" navigation={nav} />
      <ScrollView>
        <Card>
          <Text style={styles.intro}>
            Eh app thalle dittiyan permissions mangdi hai. Bina lorh di permission nao,
            par inna bina attendance/reminder kaam nahi karega.
          </Text>
        </Card>

        <PermissionRow
          icon="location-outline" title="Location" color={colors.blue}
          desc="Attendance punch nal geo-location attach hove (exact GPS coordinates)."
          value={loc} onToggle={toggleLocation}
        />
        <PermissionRow
          icon="finger-print-outline" title="Biometrics (Fingerprint / Face)" color={colors.primary}
          desc={bioAvailable === false ? 'Device enrolled biometric nahi hai — skip kar sakte ho.' : 'Punch to pehlaan identity verify hove.'}
          value={bio} onToggle={toggleBio} disabled={bioAvailable === false}
        />
        <PermissionRow
          icon="notifications-outline" title="Notifications" color={colors.orange}
          desc="10 AM wala reminder je attendance na lage."
          value={notif} onToggle={toggleNotif}
        />

        <Card style={{ backgroundColor: '#fef3c7' }}>
          <Text style={{ fontWeight: '800', marginBottom: 6 }}>Permissions jo app NAHI mangdi</Text>
          <Bullet>Contacts / phone book</Bullet>
          <Bullet>Storage / Photos (selfie direct upload hundi hai)</Bullet>
          <Bullet>Microphone</Bullet>
          <Bullet>Background location (sirf app khul hove te location lainde haan)</Bullet>
        </Card>

        <View style={{ padding: 16 }}>
          <Button title="Theek hai, agge wadh" onPress={() => nav.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function PermissionRow({ icon, title, desc, value, onToggle, color, disabled }) {
  return (
    <Card>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={[styles.iconWrap, { backgroundColor: (color || colors.primary) + '22' }]}>
          <Ionicons name={icon} size={22} color={color || colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
        <Switch
          value={!!value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{ true: colors.primary, false: '#cbd5e1' }}
          thumbColor={value ? '#fff' : '#f1f5f9'}
        />
      </Row>
    </Card>
  );
}

function Bullet({ children }) {
  return (
    <Row style={{ marginVertical: 3 }}>
      <Ionicons name="close-circle-outline" size={16} color={colors.red} />
      <Text style={{ marginLeft: 8, color: colors.text }}>{children}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.subtext, lineHeight: 20 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15 },
  desc: { color: colors.subtext, marginTop: 2, fontSize: 12, lineHeight: 17 },
});
