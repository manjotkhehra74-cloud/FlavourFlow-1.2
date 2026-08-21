import 'package:flutter/material.dart';

import 'app.dart';
import 'core/app_settings_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final settings = AppSettingsController();
  await settings.load();
  runApp(HRMateApp(settings: settings));
}
