import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppSettingsController extends ChangeNotifier {
  static const _themeKey = 'theme_mode';
  static const _textScaleKey = 'text_scale';
  ThemeMode _themeMode = ThemeMode.system;
  double _textScale = 1;

  ThemeMode get themeMode => _themeMode;
  double get textScale => _textScale;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _themeMode = ThemeMode.values.byName(prefs.getString(_themeKey) ?? 'system');
    _textScale = prefs.getDouble(_textScaleKey) ?? 1;
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode value) async {
    _themeMode = value;
    notifyListeners();
    (await SharedPreferences.getInstance()).setString(_themeKey, value.name);
  }

  Future<void> setTextScale(double value) async {
    _textScale = value.clamp(.85, 1.35);
    notifyListeners();
    (await SharedPreferences.getInstance()).setDouble(_textScaleKey, _textScale);
  }
}
