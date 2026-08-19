// Permission + biometric + notification helpers.
// All native-module calls are wrapped so the app never crashes on first launch
// even if a native dependency is missing from the current APK build.

import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';

// Lazily require native modules — if an APK was built without them, importing
// at the top of the file would crash the whole app on launch.
let LocalAuthentication, Notifications, Haptics, IntentLauncher, Location;
try { Location = require('expo-location'); } catch {}
try { LocalAuthentication = require('expo-local-authentication'); } catch {}
try { Notifications = require('expo-notifications'); } catch {}
try { Haptics = require('expo-haptics'); } catch {}
try { IntentLauncher = require('expo-intent-launcher'); } catch {}

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
  if (!LocalAuthentication) return null;
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!has || !enrolled) return null;
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face unlock';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
    return 'Fingerprint';
  } catch {
    return null;
  }
}

export async function authenticateBiometric(promptMessage) {
  if (!LocalAuthentication) return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
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
