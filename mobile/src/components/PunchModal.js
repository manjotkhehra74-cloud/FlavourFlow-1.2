import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { colors } from '../theme';
import { Button } from './UI';
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
      } catch {}
    })();
  }, [visible]);

  const now = new Date();
  const isLate = now.getHours() >= 10;
  const clockTime = manualTime;
  const isManualLate = clockTime.getHours() >= 10;

  const startPunch = async () => {
    if (alreadyIn) return submitPunch(); // clock out
    if (step === 'submitting' || step === 'confirming') return;
    setStep('confirming');
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      if (isLate && !showLateFlow) {
        setShowLateFlow(true);
        setStep('idle');
        return;
      }
      if (showLateFlow && !reasonId) {
        Alert.alert('Reason chahida', 'Late attendance lai reason select karo.');
        setStep('idle');
        return;
      }
      let biometricOk = true;
      if (useBiometric && biometricLabel) {
        biometricOk = await authenticateBiometric('Punch attendance with ' + biometricLabel);
        if (!biometricOk) {
          Alert.alert('Biometric fail', 'Fingerprint/face match nahi hoya. Dobara koshish karo.');
          setStep('idle');
          return;
        }
      }
      await submitPunch(loc);
    } catch (e) {
      Alert.alert('Location / permission error', e.message + '\n\nLocation on kar ke pher try karo.');
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

  const selectedReason = useMemo(() => reasons.find(r => r.id === reasonId), [reasons, reasonId]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{alreadyIn ? 'Clock out' : 'Mark attendance'}</Text>
            <TouchableOpacity onPress={resetAndClose}><Ionicons name="close" size={22} color={colors.subtext} /></TouchableOpacity>
          </View>

          <ScrollView>
            {alreadyIn ? (
              <Text style={styles.info}>Tu clock-in ho chuka hai. Clock out karn lai thalle button dabao.</Text>
            ) : !showLateFlow ? (
              <>
                <View style={styles.clockRow}>
                  <Ionicons name="time-outline" size={22} color={isLate ? colors.red : colors.brand} />
                  <Text style={[styles.clockText, { color: isLate ? colors.red : colors.text }]}>
                    {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isLate && <Text style={styles.latePill}>LATE</Text>}
                </View>

                {biometricLabel && (
                  <TouchableOpacity
                    style={[styles.option, useBiometric && styles.optionOn]}
                    onPress={() => setUseBiometric(v => !v)}
                  >
                    <Ionicons name={useBiometric ? 'checkbox' : 'square-outline'} size={22} color={colors.brand} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.optionTitle}>Use {biometricLabel}</Text>
                      <Text style={styles.optionSub}>Punch karan to pehlaan fingerprint/face verify hovega</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.option} onPress={openLocationSettings}>
                  <Ionicons name="location-outline" size={22} color={colors.blue} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.optionTitle}>Location open karo</Text>
                    <Text style={styles.optionSub}>GPS on karo te exact location capture hove</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                </TouchableOpacity>

                {isLate && (
                  <View style={styles.warnBox}>
                    <Ionicons name="alert-circle" size={20} color={colors.red} />
                    <Text style={styles.warnText}>
                      10 AM to baad attendance late lagdi hai. Reason puchhe jayega.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.section}>Late attendance reason</Text>
                {reasons.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reasonRow, reasonId === r.id && styles.reasonRowOn]}
                    onPress={() => setReasonId(r.id)}
                  >
                    <Ionicons
                      name={reasonId === r.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={colors.brand}
                    />
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.section, { marginTop: 16 }]}>Check-in time (manual)</Text>
                <TouchableOpacity style={styles.timeRow} onPress={() => DateTimePicker && setShowPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={colors.brand} />
                  <Text style={styles.timeText}>
                    {clockTime.toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>
                {!DateTimePicker && (
                  <Text style={styles.warnInline}>
                    Native picker is not in this build. Rebuild from Codemagic to enable it.
                  </Text>
                )}
                {showPicker && DateTimePicker && (
                  <DateTimePicker
                    value={clockTime}
                    mode="datetime"
                    is24Hour={false}
                    display="default"
                    onChange={(e, d) => { setShowPicker(false); if (d) setManualTime(d); }}
                  />
                )}
                {isManualLate && <Text style={styles.warnInline}>Is time naal attendance LATE mark hovegi.</Text>}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {showLateFlow && (
              <Button title="« Back" variant="outline" style={{ marginBottom: 8 }} onPress={() => setShowLateFlow(false)} />
            )}
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
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 24 },
  handle: { width: 44, height: 5, backgroundColor: '#cbd5e1', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  title: { fontSize: 18, fontWeight: '800' },
  info: { paddingHorizontal: 20, color: colors.subtext },
  clockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, marginHorizontal: 16, backgroundColor: colors.bg, borderRadius: 14 },
  clockText: { fontSize: 28, fontWeight: '900' },
  latePill: { backgroundColor: colors.red + '22', color: colors.red, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontSize: 12, marginLeft: 'auto' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginHorizontal: 16, marginTop: 10 },
  optionOn: { borderColor: colors.brand, backgroundColor: colors.brand + '10' },
  optionTitle: { fontWeight: '700' },
  optionSub: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  warnBox: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: colors.red + '10', borderRadius: 12, margin: 16 },
  warnText: { color: colors.red, flex: 1, flexShrink: 1 },
  section: { fontWeight: '800', marginTop: 12, marginBottom: 6, paddingHorizontal: 18 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginHorizontal: 16, marginVertical: 4 },
  reasonRowOn: { borderColor: colors.brand, backgroundColor: colors.brand + '0d' },
  reasonLabel: { flex: 1, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 16 },
  timeText: { fontWeight: '700', fontSize: 16 },
  warnInline: { color: colors.red, fontSize: 12, marginHorizontal: 18, marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
});
