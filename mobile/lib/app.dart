import 'package:flutter/material.dart';

import 'core/app_settings_controller.dart';
import 'core/i18n.dart';
import 'core/theme.dart';
import 'features/dashboard/dashboard_screen.dart';

class HRMateApp extends StatelessWidget {
  const HRMateApp({super.key, required this.settings});

  final AppSettingsController settings;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: settings,
      builder: (context, _) => MaterialApp(
        title: 'HRMate',
        debugShowCheckedModeBanner: false,
        theme: HRMateTheme.light(settings.textScale),
        darkTheme: HRMateTheme.dark(settings.textScale),
        themeMode: settings.themeMode,
        home: DashboardScreen(settings: settings),
        supportedLocales: AppLanguage.values.map((language) => language.locale),
      ),
    );
  }
}
