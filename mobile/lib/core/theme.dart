import 'package:flutter/material.dart';

abstract final class HRMateTheme {
  static const blue = Color(0xFF1E6FE0);
  static const green = Color(0xFF22C55E);

  static ThemeData light(double textScale) => _theme(Brightness.light, textScale);
  static ThemeData dark(double textScale) => _theme(Brightness.dark, textScale);

  static ThemeData _theme(Brightness brightness, double textScale) {
    final scheme = ColorScheme.fromSeed(seedColor: blue, brightness: brightness)
        .copyWith(secondary: green);
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      textTheme: Typography.material2021().black.apply(fontSizeFactor: textScale),
      appBarTheme: const AppBarTheme(centerTitle: false),
      cardTheme: CardThemeData(clipBehavior: Clip.antiAlias, elevation: 0),
    );
  }
}
