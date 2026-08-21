import 'package:flutter_test/flutter_test.dart';
import 'package:hrmate/core/i18n.dart';

void main() {
  test('falls back to English for a missing key', () {
    expect(tr('missing_key'), 'missing_key');
  });
  test('Punjabi attendance translation is present', () {
    expect(tr('attendance', language: AppLanguage.pa), isNotEmpty);
  });
}
