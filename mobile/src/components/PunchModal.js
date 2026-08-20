import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Api } from '../api/client';
import { colors, gradients, radius, spacing } from '../theme';
import { Button, Input } from './UI';
import {
  getCurrentLocation, authenticateBiometric, getBiometricSupport,
  openLocationSettings, vibrate,
} from '../utils/permissions';

// DateTimePicker has a native module — lazily load it so the app still opens on
// an old APK that doesn't bundle it (it just falls back to plain text input).
let DateTimePicker = null;
try { DateTimePicker = require('@react-native-community/datetimepicker').default; } catch {}

export default function PunchModal({ visible, onClose, onPunched, today }) {
  const alreadyIn = !!today?.clock_in;
  const [reasons, setReasons] = useState([]);
  const [useBiometric, setUseBiometric] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState(null);
  const [step, setStep] = useState('idle'); // idle | confirming | submitting
  const [showLateFlow, setShowLateFlow] = useState(false);
  const [reasonId, setReasonId] = useState(null);
  const [note, setNote] = useState('');
  const [manualTime, setManualTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const [r, label] = await Promise.all([Api.lateReasons(), getBiometricSupport()]);
        setReasons(r.reasons || []);
        setBiometricLabel(label);
        if (label && label !== 'Enroll needed') setUseBiometric(true);
      } catch {}
    })();
  }, [visible]);

  const now = new Date();
  const isLate = now.getHours() >= 10;
  const clockTime = manualTime;
  const isManualLate = clockTime.getHours() >= 10;

  const startPunch = async () => {
    if (alreadyIn) return submitPunch();
    if (step === 'submitting' || step === 'confirming') return;
    setStep('confirming');
    try {
      if (isLate && !showLateFlow) {
        setShowLateFlow(true);
        setStep('idle');
        return;
      }
      if (showLateFlow && !reasonId) {
        Alert.alert('Reason required', 'Please select a reason for late attendance.');
        setStep('idle');
        return;
      }
      // Speed fix: run location + biometric in parallel (was sequential 4-5 sec)
      const needBiometric = biometricLabel && biometricLabel !== 'Enroll needed' && useBiometric;
      const locPromise = getCurrentLocation();
      const bioPromise = needBiometric ? authenticateBiometric('Punch attendance with ' + biometricLabel) : Promise.resolve(true);
      const [loc, biometricOk] = await Promise.all([locPromise, bioPromise]);
      setLocation(loc);
      if (needBiometric && !biometricOk) {
        Alert.alert('Biometric failed', 'Fingerprint / face did not match or was cancelled. Please try again. Make sure fingerprint/face is enrolled in device settings.');
        setStep('idle');
        return;
      }
      await submitPunch(loc);
    } catch (e) {
      Alert.alert('Location / permission error', (e && e.message) + '\n\nTurn on location and try again.');
      setStep('idle');
    }
  };

  const submitPunch = async (loc = location) => {
    setStep('submitting');
    try {
      const payload = alreadyIn
        ? { action: 'out', latitude: loc?.latitude, longitude: loc?.longitude }
        : {
            action: 'in',
            latitude: loc?.latitude,
            longitude: loc?.longitude,
            source: useBiometric ? 'biometric' : 'selfie',
            biometric_used: useBiometric && !!biometricLabel,
            reason_id: showLateFlow ? reasonId : undefined,
            note: showLateFlow ? note : undefined,
            manual_clock_in: showLateFlow ? clockTime.toISOString() : undefined,
          };
      const res = await Api.clock(payload);
      await vibrate(res.ok ? 'success' : 'error');
      onPunched?.(res);
      resetAndClose();
    } catch (e) {
      await vibrate('error');
      Alert.alert('Punch failed', e.message);
      setStep('idle');
    }
  };

  const resetAndClose = () => {
    setStep('idle');
    setShowLateFlow(false);
    setReasonId(null);
    setNote('');
    setManualTime(new Date());
    setLocation(null);
    onClose();
  };

  const selectedReason = useMemo(() => reasons.find((r) => r.id === reasonId), [reasons, reasonId]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>{alreadyIn ? 'Wrap up your day' : 'Pulse check-in'}</Text>
                <Text style={styles.title}>{alreadyIn ? 'Clock out' : 'Mark attendance'}</Text>
              </View>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            {alreadyIn ? (
              <Text style={styles.info}>You are already clocked in. Tap the button below to clock out.</Text>
            ) : !showLateFlow ? (
              <>
                <View style={styles.clockRow}>
                  <View style={[styles.clockIcon, { backgroundColor: (isLate ? colors.red : colors.primary) + '18' }]}>
                    <Ionicons name="time-outline" size={22} color={isLate ? colors.red : colors.primary} />
                  </View>
                  <Text style={[styles.clockText, { color: isLate ? colors.red : colors.text }]}>
                    {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isLate ? <Text style={styles.latePill}>LATE</Text> : null}
                </View>

                {biometricLabel ? (
                  biometricLabel === 'Enroll needed' ? (
                    <View style={[styles.option, { borderColor: colors.orange, backgroundColor: colors.orange + '10' }]}>
                      <Ionicons name="alert-circle-outline" size={22} color={colors.orange} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.optionTitle}>Biometric not enrolled</Text>
                        <Text style={styles.optionSub}>Please enable fingerprint/face in device settings. Punch will work without it for now.</Text>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.option, useBiometric && styles.optionOn]}
                      onPress={() => setUseBiometric((v) => !v)}
                    >
                      <View style={[styles.bioIcon, { backgroundColor: useBiometric ? colors.primary : colors.border }]}>
                        <Ionicons name={useBiometric ? 'finger-print' : 'finger-print-outline'} size={18} color={useBiometric ? '#fff' : colors.subtext} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.optionTitle}>{useBiometric ? `✓ ${biometricLabel} enabled` : `Enable ${biometricLabel}`}</Text>
                        <Text style={styles.optionSub}>{useBiometric ? 'Attendance will be verified with biometrics' : 'Tap to verify fingerprint / face before punching'}</Text>
                      </View>
                      <Ionicons name={useBiometric ? 'checkbox' : 'square-outline'} size={20} color={useBiometric ? colors.primary : colors.subtext} />
                    </TouchableOpacity>
                  )
                ) : null}

                <TouchableOpacity style={styles.option} onPress={openLocationSettings}>
                  <Ionicons name="location-outline" size={22} color={colors.blue} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.optionTitle}>Location settings</Text>
                    <Text style={styles.optionSub}>GPS must be on so we can geo-tag this punch</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                </TouchableOpacity>

                {isLate ? (
                  <View style={styles.warnBox}>
                    <Ionicons name="alert-circle" size={20} color={colors.red} />
                    <Text style={styles.warnText}>
                      After 10 AM this punch is marked late. You will be asked for a reason.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.section}>Late attendance reason</Text>
                {reasons.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reasonRow, reasonId === r.id && styles.reasonRowOn]}
                    onPress={() => setReasonId(r.id)}
                  >
                    <Ionicons
                      name={reasonId === r.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                  </TouchableOpacity>
                ))}

                <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                  <Input
                    label="Note (optional)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    placeholder="Anything else we should know?"
                  />
                </View>

                <Text style={[styles.section, { marginTop: 4 }]}>Check-in time (manual)</Text>
                <TouchableOpacity style={styles.timeRow} onPress={() => DateTimePicker && setShowPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.timeText}>
                    {clockTime.toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
                {!DateTimePicker ? (
                  <Text style={styles.warnInline}>
                    Native picker is not in this build. Rebuild from Codemagic to enable it.
                  </Text>
                ) : null}
                {showPicker && DateTimePicker ? (
                  <DateTimePicker
                    value={clockTime}
                    mode="datetime"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => { setShowPicker(false); if (d) setManualTime(d); }}
                  />
                ) : null}
                {isManualLate ? <Text style={styles.warnInline}>This time will still be marked LATE.</Text> : null}
                {selectedReason ? (
                  <Text style={styles.selectedHint}>Selected: {selectedReason.label}</Text>
                ) : null}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {showLateFlow ? (
              <Button title="Back" variant="outline" style={{ marginBottom: 10 }} onPress={() => setShowLateFlow(false)} />
            ) : null}
            <Button
              title={
                step === 'submitting' ? 'Punching...'
                : step === 'confirming' ? 'Checking...'
                : alreadyIn ? 'Clock out'
                : showLateFlow ? 'Submit late punch'
                : `Punch in${useBiometric ? ' with ' + (biometricLabel || 'biometrics') : ''}`
              }
              onPress={startPunch}
              disabled={step !== 'idle'}
              loading={step !== 'idle'}
              icon={alreadyIn ? 'log-out-outline' : 'finger-print-outline'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  hero: { paddingBottom: 16 },
  handle: { width: 44, height: 5, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
  kicker: { color: '#DDD6FE', fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  info: { paddingHorizontal: 20, paddingTop: 18, color: colors.subtext, lineHeight: 20 },
  clockRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, marginHorizontal: 16, marginTop: 16,
    backgroundColor: colors.bg, borderRadius: radius.lg,
  },
  clockIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clockText: { fontSize: 28, fontWeight: '900', flex: 1 },
  latePill: {
    backgroundColor: colors.red + '22', color: colors.red, fontWeight: '800',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontSize: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14,
    marginHorizontal: 16, marginTop: 10, backgroundColor: '#fff',
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  bioIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontWeight: '700', color: colors.text },
  optionSub: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  warnBox: { flexDirection: 'row', padding: 12, backgroundColor: colors.redSoft, borderRadius: 12, margin: 16 },
  warnText: { color: colors.red, flex: 1, flexShrink: 1, marginLeft: 10, lineHeight: 18 },
  section: { fontWeight: '800', marginTop: 16, marginBottom: 6, paddingHorizontal: 18, color: colors.text },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    marginHorizontal: 16, marginVertical: 4, backgroundColor: '#fff',
  },
  reasonRowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  reasonLabel: { flex: 1, fontWeight: '600', marginLeft: 10, color: colors.text },
  timeRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    marginHorizontal: 16, backgroundColor: colors.bg,
  },
  timeText: { fontWeight: '700', fontSize: 16, marginLeft: 10, color: colors.text },
  warnInline: { color: colors.red, fontSize: 12, marginHorizontal: 18, marginTop: 8 },
  selectedHint: { color: colors.primary, fontSize: 12, fontWeight: '700', marginHorizontal: 18, marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: spacing.xl },
});
