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
  'sat_sri_akal': {AppLanguage.en: 'Sat Sri Akal', AppLanguage.pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', AppLanguage.hi: 'सत श्री अकाल', AppLanguage.gu: 'Sat Sri Akal', AppLanguage.mr: 'Sat Sri Akal', AppLanguage.bn: 'Sat Sri Akal', AppLanguage.ta: 'Sat Sri Akal', AppLanguage.te: 'Sat Sri Akal'},
  'sample_name': {AppLanguage.en: 'Manjot', AppLanguage.pa: 'ਮਨਜੋਤ', AppLanguage.hi: 'मनजोत', AppLanguage.gu: 'Manjot', AppLanguage.mr: 'Manjot', AppLanguage.bn: 'Manjot', AppLanguage.ta: 'Manjot', AppLanguage.te: 'Manjot'},
  'company_location': {AppLanguage.en: 'G.D. Foods Mfg (I) Pvt. Ltd. · Khadur Sahib', AppLanguage.pa: 'ਜੀ.ਡੀ. ਫੂਡਜ਼ ਮੈਨੂਫੈਕਚਰਿੰਗ · ਖਡੂਰ ਸਾਹਿਬ', AppLanguage.hi: 'जी.डी. फूड्स मैन्युफैक्चरिंग · खडूर साहिब', AppLanguage.gu: 'G.D. Foods · Khadur Sahib', AppLanguage.mr: 'G.D. Foods · Khadur Sahib', AppLanguage.bn: 'G.D. Foods · Khadur Sahib', AppLanguage.ta: 'G.D. Foods · Khadur Sahib', AppLanguage.te: 'G.D. Foods · Khadur Sahib'},
  'today_date': {AppLanguage.en: 'Friday, 21 August', AppLanguage.pa: 'ਸ਼ੁੱਕਰਵਾਰ, 21 ਅਗਸਤ', AppLanguage.hi: 'शुक्रवार, 21 अगस्त', AppLanguage.gu: 'Friday, 21 August', AppLanguage.mr: 'Friday, 21 August', AppLanguage.bn: 'Friday, 21 August', AppLanguage.ta: 'Friday, 21 August', AppLanguage.te: 'Friday, 21 August'},
  'ready_to_punch': {AppLanguage.en: 'Ready to punch in', AppLanguage.pa: 'ਪੰਚ ਇਨ ਲਈ ਤਿਆਰ', AppLanguage.hi: 'पंच इन के लिए तैयार', AppLanguage.gu: 'Ready to punch in', AppLanguage.mr: 'Ready to punch in', AppLanguage.bn: 'Ready to punch in', AppLanguage.ta: 'Ready to punch in', AppLanguage.te: 'Ready to punch in'},
  'productive_day': {AppLanguage.en: "Let's make it a productive day!", AppLanguage.pa: 'ਆਓ ਅੱਜ ਦਾ ਦਿਨ ਉਤਪਾਦਕ ਬਣਾਈਏ!', AppLanguage.hi: 'आइए आज का दिन उत्पादक बनाएं!', AppLanguage.gu: "Let's make it a productive day!", AppLanguage.mr: "Let's make it a productive day!", AppLanguage.bn: "Let's make it a productive day!", AppLanguage.ta: "Let's make it a productive day!", AppLanguage.te: "Let's make it a productive day!"},
  'punch': {AppLanguage.en: 'PUNCH', AppLanguage.pa: 'ਪੰਚ', AppLanguage.hi: 'पंच', AppLanguage.gu: 'PUNCH', AppLanguage.mr: 'PUNCH', AppLanguage.bn: 'PUNCH', AppLanguage.ta: 'PUNCH', AppLanguage.te: 'PUNCH'},
  'gps_verified': {AppLanguage.en: 'GPS Verified', AppLanguage.pa: 'ਜੀਪੀਐਸ ਤਸਦੀਕਸ਼ੁਦਾ', AppLanguage.hi: 'जीपीएस सत्यापित', AppLanguage.gu: 'GPS Verified', AppLanguage.mr: 'GPS Verified', AppLanguage.bn: 'GPS Verified', AppLanguage.ta: 'GPS Verified', AppLanguage.te: 'GPS Verified'},
  'selfie_optional': {AppLanguage.en: 'Selfie optional', AppLanguage.pa: 'ਸੈਲਫੀ ਵਿਕਲਪਿਕ', AppLanguage.hi: 'सेल्फी वैकल्पिक', AppLanguage.gu: 'Selfie optional', AppLanguage.mr: 'Selfie optional', AppLanguage.bn: 'Selfie optional', AppLanguage.ta: 'Selfie optional', AppLanguage.te: 'Selfie optional'},
  'this_week': {AppLanguage.en: 'this week', AppLanguage.pa: 'ਇਸ ਹਫ਼ਤੇ', AppLanguage.hi: 'इस सप्ताह', AppLanguage.gu: 'this week', AppLanguage.mr: 'this week', AppLanguage.bn: 'this week', AppLanguage.ta: 'this week', AppLanguage.te: 'this week'},
  'your_workspace': {AppLanguage.en: 'Your workspace', AppLanguage.pa: 'ਤੁਹਾਡਾ ਵਰਕਸਪੇਸ', AppLanguage.hi: 'आपका कार्यक्षेत्र', AppLanguage.gu: 'Your workspace', AppLanguage.mr: 'Your workspace', AppLanguage.bn: 'Your workspace', AppLanguage.ta: 'Your workspace', AppLanguage.te: 'Your workspace'},
  'apply_leave': {AppLanguage.en: 'Apply leave', AppLanguage.pa: 'ਛੁੱਟੀ ਅਪਲਾਈ ਕਰੋ', AppLanguage.hi: 'छुट्टी लागू करें', AppLanguage.gu: 'Apply leave', AppLanguage.mr: 'Apply leave', AppLanguage.bn: 'Apply leave', AppLanguage.ta: 'Apply leave', AppLanguage.te: 'Apply leave'},
  'my_team': {AppLanguage.en: 'My team', AppLanguage.pa: 'ਮੇਰੀ ਟੀਮ', AppLanguage.hi: 'मेरी टीम', AppLanguage.gu: 'My team', AppLanguage.mr: 'My team', AppLanguage.bn: 'My team', AppLanguage.ta: 'My team', AppLanguage.te: 'My team'},
  'reports': {AppLanguage.en: 'Reports', AppLanguage.pa: 'ਰਿਪੋਰਟਾਂ', AppLanguage.hi: 'रिपोर्ट', AppLanguage.gu: 'Reports', AppLanguage.mr: 'Reports', AppLanguage.bn: 'Reports', AppLanguage.ta: 'Reports', AppLanguage.te: 'Reports'},
  'present': {AppLanguage.en: 'Present', AppLanguage.pa: 'ਹਾਜ਼ਰ', AppLanguage.hi: 'उपस्थित', AppLanguage.gu: 'Present', AppLanguage.mr: 'Present', AppLanguage.bn: 'Present', AppLanguage.ta: 'Present', AppLanguage.te: 'Present'},
  'late': {AppLanguage.en: 'Late', AppLanguage.pa: 'ਦੇਰੀ ਨਾਲ', AppLanguage.hi: 'देर से', AppLanguage.gu: 'Late', AppLanguage.mr: 'Late', AppLanguage.bn: 'Late', AppLanguage.ta: 'Late', AppLanguage.te: 'Late'},
  'home': {AppLanguage.en: 'Home', AppLanguage.pa: 'ਹੋਮ', AppLanguage.hi: 'होम', AppLanguage.gu: 'Home', AppLanguage.mr: 'Home', AppLanguage.bn: 'Home', AppLanguage.ta: 'Home', AppLanguage.te: 'Home'},
  'team': {AppLanguage.en: 'Team', AppLanguage.pa: 'ਟੀਮ', AppLanguage.hi: 'टीम', AppLanguage.gu: 'Team', AppLanguage.mr: 'Team', AppLanguage.bn: 'Team', AppLanguage.ta: 'Team', AppLanguage.te: 'Team'},
  'more': {AppLanguage.en: 'More', AppLanguage.pa: 'ਹੋਰ', AppLanguage.hi: 'और', AppLanguage.gu: 'More', AppLanguage.mr: 'More', AppLanguage.bn: 'More', AppLanguage.ta: 'More', AppLanguage.te: 'More'},
  'calendar': {AppLanguage.en: 'Calendar', AppLanguage.pa: 'ਕੈਲੰਡਰ', AppLanguage.hi: 'कैलेंडर', AppLanguage.gu: 'Calendar', AppLanguage.mr: 'Calendar', AppLanguage.bn: 'Calendar', AppLanguage.ta: 'Calendar', AppLanguage.te: 'Calendar'},
  'view_history': {AppLanguage.en: 'View history', AppLanguage.pa: 'ਇਤਿਹਾਸ ਵੇਖੋ', AppLanguage.hi: 'इतिहास देखें', AppLanguage.gu: 'View history', AppLanguage.mr: 'View history', AppLanguage.bn: 'View history', AppLanguage.ta: 'View history', AppLanguage.te: 'View history'},
  'request_time_off': {AppLanguage.en: 'Request time off', AppLanguage.pa: 'ਛੁੱਟੀ ਮੰਗੋ', AppLanguage.hi: 'छुट्टी मांगें', AppLanguage.gu: 'Request time off', AppLanguage.mr: 'Request time off', AppLanguage.bn: 'Request time off', AppLanguage.ta: 'Request time off', AppLanguage.te: 'Request time off'},
  'team_overview': {AppLanguage.en: 'Team overview', AppLanguage.pa: 'ਟੀਮ ਸੰਖੇਪ', AppLanguage.hi: 'टीम अवलोकन', AppLanguage.gu: 'Team overview', AppLanguage.mr: 'Team overview', AppLanguage.bn: 'Team overview', AppLanguage.ta: 'Team overview', AppLanguage.te: 'Team overview'},
  'insights_stats': {AppLanguage.en: 'Insights & stats', AppLanguage.pa: 'ਅੰਕੜੇ', AppLanguage.hi: 'जानकारी और आँकड़े', AppLanguage.gu: 'Insights & stats', AppLanguage.mr: 'Insights & stats', AppLanguage.bn: 'Insights & stats', AppLanguage.ta: 'Insights & stats', AppLanguage.te: 'Insights & stats'},
  'welcome_back': {AppLanguage.en: 'Welcome to HRMate', AppLanguage.pa: 'ਐਚਆਰਮੇਟ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ', AppLanguage.hi: 'एचआरमेट में आपका स्वागत है', AppLanguage.gu: 'Welcome to HRMate', AppLanguage.mr: 'Welcome to HRMate', AppLanguage.bn: 'Welcome to HRMate', AppLanguage.ta: 'Welcome to HRMate', AppLanguage.te: 'Welcome to HRMate'},
  'login_subtitle': {AppLanguage.en: 'Sign in to manage your workday', AppLanguage.pa: 'ਆਪਣਾ ਕੰਮ-ਦਿਨ ਸੰਭਾਲਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ', AppLanguage.hi: 'अपने कार्यदिवस को संभालने के लिए साइन इन करें', AppLanguage.gu: 'Sign in to manage your workday', AppLanguage.mr: 'Sign in to manage your workday', AppLanguage.bn: 'Sign in to manage your workday', AppLanguage.ta: 'Sign in to manage your workday', AppLanguage.te: 'Sign in to manage your workday'},
  'phone_number': {AppLanguage.en: 'Phone number', AppLanguage.pa: 'ਫੋਨ ਨੰਬਰ', AppLanguage.hi: 'फोन नंबर', AppLanguage.gu: 'Phone number', AppLanguage.mr: 'Phone number', AppLanguage.bn: 'Phone number', AppLanguage.ta: 'Phone number', AppLanguage.te: 'Phone number'},
  'password': {AppLanguage.en: 'Password', AppLanguage.pa: 'ਪਾਸਵਰਡ', AppLanguage.hi: 'पासवर्ड', AppLanguage.gu: 'Password', AppLanguage.mr: 'Password', AppLanguage.bn: 'Password', AppLanguage.ta: 'Password', AppLanguage.te: 'Password'},
  'sign_in': {AppLanguage.en: 'Sign in', AppLanguage.pa: 'ਸਾਈਨ ਇਨ', AppLanguage.hi: 'साइन इन', AppLanguage.gu: 'Sign in', AppLanguage.mr: 'Sign in', AppLanguage.bn: 'Sign in', AppLanguage.ta: 'Sign in', AppLanguage.te: 'Sign in'},
};

String tr(String key, {AppLanguage language = AppLanguage.en}) =>
    translations[key]?[language] ?? translations[key]?[AppLanguage.en] ?? key;
