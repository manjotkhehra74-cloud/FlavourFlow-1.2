import 'package:flutter/widgets.dart';

/// Supported launch languages. Punjabi is the default for G.D. Foods teams.
enum AppLanguage {
  en(Locale('en')),
  pa(Locale('pa')),
  hi(Locale('hi')),
  gu(Locale('gu')),
  mr(Locale('mr')),
  bn(Locale('bn')),
  ta(Locale('ta')),
  te(Locale('te'));

  const AppLanguage(this.locale);
  final Locale locale;
}

/// Keep every visible app string here. Duplicate map keys are compile errors.
const Map<String, Map<AppLanguage, String>> translations = {
  'app_name': {
    AppLanguage.en: 'HRMate',
    AppLanguage.pa: 'ਐਚਆਰਮੇਟ',
    AppLanguage.hi: 'एचआरमेट',
    AppLanguage.gu: 'એચઆરમેટ',
    AppLanguage.mr: 'एचआरमेट',
    AppLanguage.bn: 'এইচআরমেট',
    AppLanguage.ta: 'ஹெச்ஆர்மேட்',
    AppLanguage.te: 'హెచ్ఆర్‌మేట్',
  },
  'good_morning': {
    AppLanguage.en: 'Good morning', AppLanguage.pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    AppLanguage.hi: 'सुप्रभात', AppLanguage.gu: 'સુપ્રભાત',
    AppLanguage.mr: 'सुप्रभात', AppLanguage.bn: 'সুপ্রভাত',
    AppLanguage.ta: 'காலை வணக்கம்', AppLanguage.te: 'శుభోదయం',
  },
  'attendance': {
    AppLanguage.en: 'Attendance', AppLanguage.pa: 'ਹਾਜ਼ਰੀ', AppLanguage.hi: 'उपस्थिति',
    AppLanguage.gu: 'હાજરી', AppLanguage.mr: 'हजेरी', AppLanguage.bn: 'উপস্থিতি',
    AppLanguage.ta: 'வருகை', AppLanguage.te: 'హాజరు',
  },
  'leave': {
    AppLanguage.en: 'Leave', AppLanguage.pa: 'ਛੁੱਟੀ', AppLanguage.hi: 'छुट्टी',
    AppLanguage.gu: 'રજા', AppLanguage.mr: 'रजा', AppLanguage.bn: 'ছুটি',
    AppLanguage.ta: 'விடுப்பு', AppLanguage.te: 'సెలవు',
  },
  'employees': {
    AppLanguage.en: 'Employees', AppLanguage.pa: 'ਕਰਮਚਾਰੀ', AppLanguage.hi: 'कर्मचारी',
    AppLanguage.gu: 'કર્મચારીઓ', AppLanguage.mr: 'कर्मचारी', AppLanguage.bn: 'কর্মচারী',
    AppLanguage.ta: 'ஊழியர்கள்', AppLanguage.te: 'ఉద్యోగులు',
  },
  'punch_in': {
    AppLanguage.en: 'Punch in', AppLanguage.pa: 'ਪੰਚ ਇਨ', AppLanguage.hi: 'पंच इन',
    AppLanguage.gu: 'પંચ ઇન', AppLanguage.mr: 'पंच इन', AppLanguage.bn: 'পাঞ্চ ইন',
    AppLanguage.ta: 'பஞ்ச் இன்', AppLanguage.te: 'పంచ్ ఇన్',
  },
  'coming_soon': {
    AppLanguage.en: 'Coming soon', AppLanguage.pa: 'ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ', AppLanguage.hi: 'जल्द आ रहा है',
    AppLanguage.gu: 'ટૂંક સમયમાં', AppLanguage.mr: 'लवकरच येत आहे', AppLanguage.bn: 'শীঘ্রই আসছে',
    AppLanguage.ta: 'விரைவில் வருகிறது', AppLanguage.te: 'త్వరలో వస్తోంది',
  },
};

String tr(String key, {AppLanguage language = AppLanguage.en}) =>
    translations[key]?[language] ?? translations[key]?[AppLanguage.en] ?? key;
