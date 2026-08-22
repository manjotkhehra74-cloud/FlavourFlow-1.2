import 'package:flutter/material.dart';

import 'core/app_settings_controller.dart';
import 'core/i18n.dart';
import 'core/theme.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/session_controller.dart';
import 'features/dashboard/dashboard_screen.dart';

class HRMateApp extends StatelessWidget {
  const HRMateApp({super.key, required this.settings, required this.session});
  final AppSettingsController settings;
  final SessionController session;

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: Listenable.merge([settings, session]),
    builder: (context, _) => MaterialApp(
      title: 'HRMate',
      debugShowCheckedModeBanner: false,
      theme: HRMateTheme.light(settings.textScale),
      darkTheme: HRMateTheme.dark(settings.textScale),
      themeMode: settings.themeMode,
      supportedLocales: AppLanguage.values.map((language) => language.locale),
      home: !session.ready ? const _LoadingScreen() : session.isSignedIn ? DashboardScreen(settings: settings, session: session) : LoginScreen(session: session),
    ),
  );
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: CircularProgressIndicator()));
}
