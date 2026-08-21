import 'package:flutter/material.dart';

import '../../core/app_settings_controller.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.settings});
  final AppSettingsController settings;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F8FC),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          children: [
            const _TopBar(),
            const SizedBox(height: 25),
            Text(
              '${tr('sat_sri_akal')}, ${tr('sample_name')} 🙏',
              style: const TextStyle(color: Color(0xFF0F2440), fontSize: 27, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 7),
            Text(tr('company_location'), style: const TextStyle(color: Color(0xFF698098), fontSize: 14)),
            const SizedBox(height: 22),
            const _PunchCard(),
            const SizedBox(height: 23),
            const _StatsRow(),
            const SizedBox(height: 25),
            Text(tr('your_workspace'), style: const TextStyle(color: Color(0xFF0F2440), fontSize: 19, fontWeight: FontWeight.w800)),
            const SizedBox(height: 13),
            const _WorkspaceGrid(),
          ],
        ),
      ),
      bottomNavigationBar: const _BottomNav(),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();
  @override
  Widget build(BuildContext context) => Row(children: [
    ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset('assets/branding/hrmate-app-icon.png', width: 42, height: 42, fit: BoxFit.cover),
    ),
    const SizedBox(width: 9),
    RichText(text: const TextSpan(style: TextStyle(fontSize: 21), children: [
      TextSpan(text: 'HR', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w900)),
      TextSpan(text: 'Mate', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w400)),
    ])),
    const Spacer(),
    Container(
      height: 42,
      width: 42,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x0D0F2440), blurRadius: 12, offset: Offset(0, 4))]),
      child: const Icon(Icons.notifications_none_rounded, color: Color(0xFF25415D)),
    ),
    const SizedBox(width: 9),
    const CircleAvatar(radius: 21, backgroundColor: Color(0xFFE3EEFF), child: Text('MK', style: TextStyle(color: HRMateTheme.blue, fontWeight: FontWeight.w800))),
  ]);
}

class _PunchCard extends StatelessWidget {
  const _PunchCard();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x120F2440), blurRadius: 20, offset: Offset(0, 8))]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(tr('today_date'), style: const TextStyle(color: Color(0xFF6B8298), fontWeight: FontWeight.w600)),
      const SizedBox(height: 7),
      Text(tr('ready_to_punch'), style: const TextStyle(color: Color(0xFF0F2440), fontSize: 22, fontWeight: FontWeight.w800)),
      const SizedBox(height: 5),
      Text(tr('productive_day'), style: const TextStyle(color: Color(0xFF72869A), fontSize: 13)),
      const SizedBox(height: 17),
      Row(children: [
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _StatusChip(icon: Icons.location_on_rounded, labelKey: 'gps_verified', green: true),
          SizedBox(height: 9),
          _StatusChip(icon: Icons.camera_alt_outlined, labelKey: 'selfie_optional', green: false),
        ])),
        const SizedBox(width: 14),
        InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(47),
          child: Ink(
            width: 94,
            height: 94,
            decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [HRMateTheme.blue, HRMateTheme.green], begin: Alignment.topLeft, end: Alignment.bottomRight)),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.fingerprint_rounded, color: Colors.white, size: 35),
              const SizedBox(height: 2),
              Text(tr('punch'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
            ]),
          ),
        ),
      ]),
    ]),
  );
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.icon, required this.labelKey, required this.green});
  final IconData icon;
  final String labelKey;
  final bool green;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
    decoration: BoxDecoration(color: green ? const Color(0xFFE8F8EF) : const Color(0xFFEAF2FF), borderRadius: BorderRadius.circular(10)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 16, color: green ? HRMateTheme.green : HRMateTheme.blue), const SizedBox(width: 6), Text(tr(labelKey), style: TextStyle(color: green ? const Color(0xFF19874A) : HRMateTheme.blue, fontWeight: FontWeight.w700, fontSize: 12))]),
  );
}

class _StatsRow extends StatelessWidget {
  const _StatsRow();
  @override
  Widget build(BuildContext context) => const Row(children: [
    Expanded(child: _StatCard(value: '124', labelKey: 'present', trendKey: 'this_week', color: Color(0xFF22A865))),
    SizedBox(width: 10),
    Expanded(child: _StatCard(value: '06', labelKey: 'leave', trendKey: 'this_week', color: Color(0xFFF29B16))),
    SizedBox(width: 10),
    Expanded(child: _StatCard(value: '03', labelKey: 'late', trendKey: 'this_week', color: Color(0xFFEA5455))),
  ]);
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.value, required this.labelKey, required this.trendKey, required this.color});
  final String value;
  final String labelKey;
  final String trendKey;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(17), boxShadow: const [BoxShadow(color: Color(0x0A0F2440), blurRadius: 10, offset: Offset(0, 4))]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(value, style: TextStyle(color: color, fontSize: 23, fontWeight: FontWeight.w800)),
      const SizedBox(height: 2),
      Text(tr(labelKey), style: const TextStyle(color: Color(0xFF28445E), fontWeight: FontWeight.w700, fontSize: 12)),
      const SizedBox(height: 5),
      Text('+12 ${tr(trendKey)}', style: const TextStyle(color: Color(0xFF8A9CAD), fontSize: 10)),
    ]),
  );
}

class _WorkspaceGrid extends StatelessWidget {
  const _WorkspaceGrid();
  @override
  Widget build(BuildContext context) => GridView.count(
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    crossAxisCount: 2,
    crossAxisSpacing: 12,
    mainAxisSpacing: 12,
    childAspectRatio: 1.53,
    children: const [
      _WorkspaceCard(icon: Icons.calendar_month_rounded, labelKey: 'attendance', color: HRMateTheme.blue, tint: Color(0xFFEAF2FF)),
      _WorkspaceCard(icon: Icons.beach_access_outlined, labelKey: 'apply_leave', color: Color(0xFF22A865), tint: Color(0xFFE8F8EF)),
      _WorkspaceCard(icon: Icons.groups_rounded, labelKey: 'my_team', color: Color(0xFFF29B16), tint: Color(0xFFFFF3DB)),
      _WorkspaceCard(icon: Icons.bar_chart_rounded, labelKey: 'reports', color: Color(0xFF7B61D9), tint: Color(0xFFF1ECFF)),
    ],
  );
}

class _WorkspaceCard extends StatelessWidget {
  const _WorkspaceCard({required this.icon, required this.labelKey, required this.color, required this.tint});
  final IconData icon;
  final String labelKey;
  final Color color;
  final Color tint;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x0A0F2440), blurRadius: 10, offset: Offset(0, 4))]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(padding: const EdgeInsets.all(9), decoration: BoxDecoration(color: tint, borderRadius: BorderRadius.circular(11)), child: Icon(icon, color: color, size: 22)),
      const SizedBox(height: 9),
      Text(tr(labelKey), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800, fontSize: 14)),
    ]),
  );
}

class _BottomNav extends StatelessWidget {
  const _BottomNav();
  @override
  Widget build(BuildContext context) => SizedBox(
    height: 82,
    child: Stack(clipBehavior: Clip.none, alignment: Alignment.topCenter, children: [
      Container(decoration: const BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Color(0x120F2440), blurRadius: 14, offset: Offset(0, -3))]), child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: const [
        _NavItem(icon: Icons.home_rounded, labelKey: 'home', active: true),
        _NavItem(icon: Icons.calendar_month_outlined, labelKey: 'leave', active: false),
        SizedBox(width: 62),
        _NavItem(icon: Icons.groups_2_outlined, labelKey: 'team', active: false),
        _NavItem(icon: Icons.more_horiz_rounded, labelKey: 'more', active: false),
      ])),
      Positioned(top: -26, child: Container(width: 62, height: 62, decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [HRMateTheme.blue, HRMateTheme.green])), child: const Icon(Icons.fingerprint_rounded, color: Colors.white, size: 31))),
    ]),
  );
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.labelKey, required this.active});
  final IconData icon;
  final String labelKey;
  final bool active;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(top: 22), child: Column(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 22, color: active ? HRMateTheme.blue : const Color(0xFF8A9CAD)), const SizedBox(height: 2), Text(tr(labelKey), style: TextStyle(color: active ? HRMateTheme.blue : const Color(0xFF8A9CAD), fontSize: 10, fontWeight: FontWeight.w700)), if (active) Container(margin: const EdgeInsets.only(top: 3), height: 2, width: 14, color: HRMateTheme.blue)]));
}
