import 'package:flutter/material.dart';

import 'app.dart';
import 'core/app_settings_controller.dart';
import 'features/auth/session_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final settings = AppSettingsController();
  final session = SessionController();
  await Future.wait([settings.load(), session.restore()]);
  runApp(HRMateApp(settings: settings, session: session));
}
