// Permission + biometric + notification helpers.
// All native-module calls are wrapped so the app never crashes on first launch
// even if a native dependency is missing from the current APK build.

import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';

// Lazily require native modules — if an APK was built without them, importing
// at the top of the file would crash the whole app on launch.
let LocalAuthentication, Notifications, Haptics, IntentLauncher, Location, SecureStore;
try { Location = require('expo-location'); } catch {}
try { LocalAuthentication = require('expo-local-authentication'); } catch {}
try { Notifications = require('expo-notifications'); } catch {}
try { Haptics = require('expo-haptics'); } catch {}
try { IntentLauncher = require('expo-intent-launcher'); } catch {}
try { SecureStore = require('expo-secure-store'); } catch {}

if (Notifications?.setNotificationHandler) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
  } catch {}
}

export async function ensureLocationPermission() {
  if (!Location) return false;
  try {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) return true;
    const req = await Location.requestForegroundPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function getCurrentLocation() {
  if (!Location) return null;
  try {
    const granted = await ensureLocationPermission();
    if (!granted) return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
  } catch {
    return null;
  }
}

export async function openLocationSettings() {
  try {
    const choice = await new Promise((resolve) =>
      Alert.alert(
        'Location permission needed',
        'Attendance mark karan lai location on karni zaroori hai. Settings kholni hai?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Open settings', onPress: () => resolve(true) },
        ]
      )
    ).catch(() => false);
    if (!choice) return;
    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
    else if (IntentLauncher) await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
  } catch {}
}

export async function getBiometricSupport() {
  if (Platform.OS === 'web') return null;
  if (!LocalAuthentication) return null;
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    if (!has) return null;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return 'Enroll needed';
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) || types.includes(1)) return 'Fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
    return 'Biometrics';
  } catch {
    return null;
  }
}

export async function authenticateBiometric(promptMessage) {
  if (Platform.OS === 'web') return false;
  if (!LocalAuthentication) return false;
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!has || !enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || 'Authenticate',
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (result.success) return true;
    return false;
  } catch (e) {
    console.log('authenticateBiometric error', e);
    return false;
  }
}

// SecureStore helpers for biometric login
const BIO_EMAIL_KEY = 'biometric_email';
const BIO_PASS_KEY = 'biometric_pass';
const BIO_ENABLED_KEY = 'biometric_enabled';

export async function saveBiometricCredentials(email, password) {
  if (!SecureStore) return false;
  try {
    await SecureStore.setItemAsync(BIO_EMAIL_KEY, email);
    await SecureStore.setItemAsync(BIO_PASS_KEY, password);
    await SecureStore.setItemAsync(BIO_ENABLED_KEY, '1');
    return true;
  } catch { return false; }
}
export async function getBiometricCredentials() {
  if (!SecureStore) return null;
  try {
    const email = await SecureStore.getItemAsync(BIO_EMAIL_KEY);
    const pass = await SecureStore.getItemAsync(BIO_PASS_KEY);
    const enabled = await SecureStore.getItemAsync(BIO_ENABLED_KEY);
    if (email && pass && enabled === '1') return { email, password: pass };
    return null;
  } catch { return null; }
}
export async function hasBiometricCredentials() {
  const c = await getBiometricCredentials();
  return !!c;
}
export async function clearBiometricCredentials() {
  if (!SecureStore) return;
  try {
    await SecureStore.deleteItemAsync(BIO_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIO_PASS_KEY);
    await SecureStore.deleteItemAsync(BIO_ENABLED_KEY);
  } catch {}
}
export async function isBiometricEnabled() {
  if (!SecureStore) return false;
  try { return (await SecureStore.getItemAsync(BIO_ENABLED_KEY)) === '1'; } catch { return false; }
}

export async function ensureNotificationPermission() {
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(hour = 10, minute = 0) {
  if (!Notifications) return false;
  try {
    await ensureNotificationPermission();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Attendance reminder',
        body: "Tuc attendance nahi lagai — kripya apni attendance mark karo. Late ho rahi ho te reason vi chuno.",
        sound: 'default',
        data: { screen: 'Home' },
      },
      trigger: { hour, minute, repeats: true },
    });
    return true;
  } catch {
    return false;
  }
}

export async function vibrate(type = 'success') {
  if (!Haptics) return;
  try {
    if (type === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === 'error') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else await Haptics.selectionAsync();
  } catch {}
}
