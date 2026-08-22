import 'package:flutter/material.dart';

import '../../core/app_settings_controller.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../attendance/attendance_screen.dart';
import '../auth/session_controller.dart';
import '../leaves/leave_screen.dart';
import '../employees/employees_screen.dart';
import '../auth/profile_settings_screen.dart';
import 'reports_screen.dart';
import 'notifications_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.settings, required this.session});
  final AppSettingsController settings;
  final SessionController session;

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F8FC),
    body: SafeArea(child: ListView(padding: const EdgeInsets.fromLTRB(18, 18, 18, 134), children: [
      _ReferenceHeader(onNotifications: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => NotificationsScreen(session: session)))),
      SizedBox(height: 24),
      _ReferencePunchCard(),
      SizedBox(height: 22),
      _ReferenceStats(),
      SizedBox(height: 27),
      _WorkspaceTitle(),
      SizedBox(height: 14),
      _ReferenceWorkspace(onAttendance: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => AttendanceScreen(session: session))), onLeave: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => LeaveScreen(session: session))), onTeam: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => EmployeesScreen(session: session))), onReports: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ReportsScreen(session: session)))),
    ])),
    bottomNavigationBar: _ReferenceBottomNav(onCalendar: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => LeaveScreen(session: session))), onTeam: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => EmployeesScreen(session: session))), onMore: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileSettingsScreen(session: session, settings: settings))), onPunch: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => AttendanceScreen(session: session)))),
  );
}

class _ReferenceHeader extends StatelessWidget {
  const _ReferenceHeader({required this.onNotifications});
  final VoidCallback onNotifications;
  @override
  Widget build(BuildContext context) => Row(children: [
    Container(width: 62, height: 62, padding: const EdgeInsets.all(3), decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white, boxShadow: [BoxShadow(color: Color(0x150F2440), blurRadius: 10)]), child: ClipOval(child: Image.asset('assets/branding/hrmate-app-icon.png', fit: BoxFit.cover))),
    const SizedBox(width: 13),
    Expanded(child: Text('${tr('sat_sri_akal')}, ${tr('sample_name')} 🙏', maxLines: 2, style: const TextStyle(color: Color(0xFF0F2440), fontSize: 23, height: 1.15, fontWeight: FontWeight.w800))),
    _HeaderIcon(icon: Icons.notifications_none_rounded, dot: true, onTap: onNotifications),
    const SizedBox(width: 10),
    Container(width: 57, height: 57, padding: const EdgeInsets.all(3), decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white, boxShadow: [BoxShadow(color: Color(0x150F2440), blurRadius: 10)]), child: const CircleAvatar(backgroundColor: Color(0xFF173D72), child: Icon(Icons.person_rounded, color: Colors.white, size: 31))),
  ]);
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon({required this.icon, required this.dot, this.onTap});
  final IconData icon;
  final bool dot;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => GestureDetector(onTap: onTap, child: Stack(clipBehavior: Clip.none, children: [
    Container(width: 57, height: 57, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: const [BoxShadow(color: Color(0x150F2440), blurRadius: 10)]), child: Icon(icon, color: const Color(0xFF0F2440), size: 29)),
    if (dot) const Positioned(right: 5, top: 5, child: CircleAvatar(radius: 5, backgroundColor: HRMateTheme.blue)),
  ]));
}

class _ReferencePunchCard extends StatelessWidget {
  const _ReferencePunchCard();
  @override
  Widget build(BuildContext context) => Container(
    height: 273,
    padding: const EdgeInsets.fromLTRB(22, 24, 17, 20),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: const [BoxShadow(color: Color(0x180F2440), blurRadius: 25, offset: Offset(0, 10))]),
    child: Stack(children: [
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [const _SoftIcon(icon: Icons.calendar_month_rounded, color: HRMateTheme.blue), const SizedBox(width: 10), Text(tr('today_date'), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800, fontSize: 17))]),
        const SizedBox(height: 31),
        SizedBox(width: 230, child: Text(tr('ready_to_punch'), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w900, fontSize: 29, height: 1.08))),
        const SizedBox(height: 10),
        SizedBox(width: 225, child: Text(tr('productive_day'), style: const TextStyle(color: Color(0xFF60758B), fontSize: 15))),
        const Spacer(),
        const Row(children: [
          _RoundedChip(icon: Icons.location_on_rounded, labelKey: 'gps_verified', green: true),
          SizedBox(width: 9),
          _RoundedChip(icon: Icons.face_retouching_natural_rounded, labelKey: 'selfie_optional', green: false),
        ]),
      ]),
      Positioned(right: 0, top: 31, child: InkWell(
        onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('ready_to_punch')))),
        borderRadius: BorderRadius.circular(76),
        child: Ink(width: 143, height: 143, decoration: BoxDecoration(shape: BoxShape.circle, gradient: const LinearGradient(colors: [HRMateTheme.blue, HRMateTheme.green], begin: Alignment.topLeft, end: Alignment.bottomRight), border: Border.all(color: Colors.white, width: 6), boxShadow: const [BoxShadow(color: Color(0x4422C55E), blurRadius: 24, spreadRadius: 5)]), child: const Icon(Icons.fingerprint_rounded, color: Colors.white, size: 72)),
      )),
    ]),
  );
}

class _SoftIcon extends StatelessWidget {
  const _SoftIcon({required this.icon, required this.color});
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: .10)), child: Icon(icon, color: color, size: 22));
}

class _RoundedChip extends StatelessWidget {
  const _RoundedChip({required this.icon, required this.labelKey, required this.green});
  final IconData icon;
  final String labelKey;
  final bool green;
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9), decoration: BoxDecoration(color: green ? const Color(0xFFE6F8ED) : const Color(0xFFE8F1FF), borderRadius: BorderRadius.circular(20)), child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, color: green ? const Color(0xFF159947) : HRMateTheme.blue, size: 20), const SizedBox(width: 6), Text(tr(labelKey), style: TextStyle(color: green ? const Color(0xFF159947) : HRMateTheme.blue, fontWeight: FontWeight.w700, fontSize: 12))]));
}

class _ReferenceStats extends StatelessWidget {
  const _ReferenceStats();
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF1F5FC), borderRadius: BorderRadius.circular(27)), child: const Row(children: [
    Expanded(child: _DetailedStat(icon: Icons.groups_rounded, labelKey: 'present', value: '124', trend: '+12', color: Color(0xFF149550), tint: Color(0xFFE8F8EF))),
    SizedBox(width: 8),
    Expanded(child: _DetailedStat(icon: Icons.calendar_month_rounded, labelKey: 'leave', value: '06', trend: '-2', color: Color(0xFFE99212), tint: Color(0xFFFFF1D9))),
    SizedBox(width: 8),
    Expanded(child: _DetailedStat(icon: Icons.access_time_rounded, labelKey: 'late', value: '03', trend: '+1', color: Color(0xFFEF3737), tint: Color(0xFFFFE8E8))),
  ]));
}

class _DetailedStat extends StatelessWidget {
  const _DetailedStat({required this.icon, required this.labelKey, required this.value, required this.trend, required this.color, required this.tint});
  final IconData icon;
  final String labelKey;
  final String value;
  final String trend;
  final Color color;
  final Color tint;
  @override
  Widget build(BuildContext context) => Container(height: 161, padding: const EdgeInsets.fromLTRB(12, 13, 8, 12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x0C0F2440), blurRadius: 9)]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _SoftIcon(icon: icon, color: color),
    const SizedBox(height: 8),
    Text(tr(labelKey), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w700, fontSize: 13)),
    const SizedBox(height: 2),
    Text(value, style: TextStyle(color: color, fontSize: 29, fontWeight: FontWeight.w900)),
    const Spacer(),
    Row(children: [Icon(Icons.trending_up_rounded, color: color, size: 15), const SizedBox(width: 3), Text('$trend ${tr('this_week')}', style: const TextStyle(color: Color(0xFF73869A), fontSize: 10))]),
  ]));
}

class _WorkspaceTitle extends StatelessWidget {
  const _WorkspaceTitle();
  @override
  Widget build(BuildContext context) => Text(tr('your_workspace'), style: const TextStyle(color: Color(0xFF0F2440), fontSize: 22, fontWeight: FontWeight.w900));
}

class _ReferenceWorkspace extends StatelessWidget {
  const _ReferenceWorkspace({required this.onAttendance, required this.onLeave, required this.onTeam, required this.onReports});
  final VoidCallback onAttendance;
  final VoidCallback onLeave;
  final VoidCallback onTeam;
  final VoidCallback onReports;
  @override
  Widget build(BuildContext context) => Row(children: [
    Expanded(child: _WorkspaceItem(icon: Icons.calendar_month_rounded, labelKey: 'attendance', subKey: 'view_history', color: HRMateTheme.blue, onTap: onAttendance)),
    const SizedBox(width: 8),
    Expanded(child: _WorkspaceItem(icon: Icons.note_add_outlined, labelKey: 'apply_leave', subKey: 'request_time_off', color: const Color(0xFF159947), onTap: onLeave)),
    const SizedBox(width: 8),
    Expanded(child: _WorkspaceItem(icon: Icons.groups_2_outlined, labelKey: 'my_team', subKey: 'team_overview', color: const Color(0xFF814FE8), onTap: onTeam)),
    const SizedBox(width: 8),
    Expanded(child: _WorkspaceItem(icon: Icons.bar_chart_rounded, labelKey: 'reports', subKey: 'insights_stats', color: const Color(0xFF1596CA), onTap: onReports)),
  ]);
}

class _WorkspaceItem extends StatelessWidget {
  const _WorkspaceItem({required this.icon, required this.labelKey, required this.subKey, required this.color, this.onTap});
  final IconData icon;
  final String labelKey;
  final String subKey;
  final Color color;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => InkWell(onTap: onTap, borderRadius: BorderRadius.circular(20), child: Container(height: 174, padding: const EdgeInsets.fromLTRB(9, 16, 6, 11), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x0D0F2440), blurRadius: 12, offset: Offset(0, 4))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_SoftIcon(icon: icon, color: color), const Spacer(), Text(tr(labelKey), maxLines: 2, style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800, fontSize: 11)), const SizedBox(height: 4), Text(tr(subKey), maxLines: 2, style: const TextStyle(color: Color(0xFF7B8DA1), fontSize: 9))])));
}

class _ReferenceBottomNav extends StatelessWidget {
  const _ReferenceBottomNav({required this.onCalendar, required this.onTeam, required this.onMore, required this.onPunch});
  final VoidCallback onCalendar;
  final VoidCallback onTeam;
  final VoidCallback onMore;
  final VoidCallback onPunch;
  @override
  Widget build(BuildContext context) => SizedBox(height: 112, child: Stack(clipBehavior: Clip.none, alignment: Alignment.topCenter, children: [
    Container(margin: const EdgeInsets.only(top: 25), decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(29)), boxShadow: [BoxShadow(color: Color(0x180F2440), blurRadius: 18, offset: Offset(0, -2))]), child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
      const _NavEntry(icon: Icons.home_rounded, labelKey: 'home', active: true), _NavEntry(icon: Icons.calendar_month_outlined, labelKey: 'calendar', active: false, onTap: onCalendar), const SizedBox(width: 68), _NavEntry(icon: Icons.groups_2_outlined, labelKey: 'team', active: false, onTap: onTeam), _NavEntry(icon: Icons.menu_rounded, labelKey: 'more', active: false, onTap: onMore),
    ])),
    Positioned(top: -11, child: GestureDetector(onTap: onPunch, child: Column(children: [Container(width: 100, height: 100, padding: const EdgeInsets.all(7), decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white, boxShadow: [BoxShadow(color: Color(0x250F2440), blurRadius: 15)]), child: Container(decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [HRMateTheme.blue, HRMateTheme.green], begin: Alignment.topLeft, end: Alignment.bottomRight)), child: const Icon(Icons.fingerprint_rounded, color: Colors.white, size: 48))), Text(tr('punch'), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800, fontSize: 12))]))),
  ]));
}

class _NavEntry extends StatelessWidget {
  const _NavEntry({required this.icon, required this.labelKey, required this.active, this.onTap});
  final IconData icon;
  final String labelKey;
  final bool active;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => InkWell(onTap: onTap, child: Padding(padding: const EdgeInsets.only(top: 30), child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(icon, color: active ? HRMateTheme.blue : const Color(0xFF71859A), size: 27), const SizedBox(height: 4), Text(tr(labelKey), style: TextStyle(color: active ? HRMateTheme.blue : const Color(0xFF596F85), fontWeight: active ? FontWeight.w800 : FontWeight.w600, fontSize: 11)), if (active) Container(margin: const EdgeInsets.only(top: 5), height: 3, width: 28, decoration: BoxDecoration(color: HRMateTheme.blue, borderRadius: BorderRadius.circular(4)))])));
}
