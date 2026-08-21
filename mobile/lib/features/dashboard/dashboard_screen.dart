import 'package:flutter/material.dart';

import '../../core/app_settings_controller.dart';
import '../../core/theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.settings});
  final AppSettingsController settings;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FC),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
          children: [
            Row(children: [
              Container(
                width: 43,
                height: 43,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  gradient: const LinearGradient(
                    colors: [HRMateTheme.blue, HRMateTheme.green],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Center(
                  child: Text('HR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17)),
                ),
              ),
              const SizedBox(width: 10),
              const Text('HRMate', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22, color: Color(0xFF102A43))),
              const Spacer(),
              _CircleIcon(icon: Icons.notifications_none_rounded, onTap: () {}),
              const SizedBox(width: 8),
              const CircleAvatar(radius: 20, backgroundColor: Color(0xFFE1EEFF), child: Text('MK', style: TextStyle(color: HRMateTheme.blue, fontWeight: FontWeight.w800))),
            ]),
            const SizedBox(height: 26),
            const Text('Sat Sri Akal, Manjot', style: TextStyle(fontSize: 27, height: 1.2, color: Color(0xFF102A43), fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            const Text('G.D. Foods Mfg (I) Pvt. Ltd. · Khadur Sahib', style: TextStyle(fontSize: 14, color: Color(0xFF58728B))),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(21),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(27),
                gradient: const LinearGradient(colors: [Color(0xFF1664D9), Color(0xFF25BB68)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                boxShadow: const [BoxShadow(color: Color(0x331E6FE0), blurRadius: 22, offset: Offset(0, 10))],
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Friday, 21 August', style: TextStyle(color: Color(0xDFFFFFFF), fontWeight: FontWeight.w600)),
                const SizedBox(height: 7),
                const Text('Ready to punch in', style: TextStyle(color: Colors.white, fontSize: 23, fontWeight: FontWeight.w800)),
                const SizedBox(height: 17),
                Row(children: [
                  Expanded(child: _Pill(icon: Icons.location_on_outlined, label: 'GPS verified')),
                  const SizedBox(width: 9),
                  Expanded(child: _Pill(icon: Icons.camera_alt_outlined, label: 'Selfie optional')),
                ]),
                const SizedBox(height: 18),
                SizedBox(width: double.infinity, child: FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: HRMateTheme.blue, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(17))),
                  icon: const Icon(Icons.fingerprint_rounded, size: 25),
                  label: const Text('Punch in', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                  onPressed: () {},
                )),
              ]),
            ),
            const SizedBox(height: 25),
            const Text('Today at a glance', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF102A43))),
            const SizedBox(height: 13),
            Row(children: const [
              Expanded(child: _StatCard(value: '124', label: 'Present', color: Color(0xFF22A865))),
              SizedBox(width: 10),
              Expanded(child: _StatCard(value: '06', label: 'On leave', color: Color(0xFF2776E5))),
              SizedBox(width: 10),
              Expanded(child: _StatCard(value: '03', label: 'Late', color: Color(0xFFF59E0B))),
            ]),
            const SizedBox(height: 26),
            const Text('Your workspace', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF102A43))),
            const SizedBox(height: 13),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.65,
              children: const [
                _ActionCard(icon: Icons.calendar_month_outlined, label: 'Attendance', tint: Color(0xFFE7F0FF), color: HRMateTheme.blue),
                _ActionCard(icon: Icons.beach_access_outlined, label: 'Apply leave', tint: Color(0xFFE7F8EF), color: HRMateTheme.green),
                _ActionCard(icon: Icons.groups_2_outlined, label: 'My team', tint: Color(0xFFFFF3DB), color: Color(0xFFF29B16)),
                _ActionCard(icon: Icons.insert_chart_outlined_rounded, label: 'Reports', tint: Color(0xFFF1ECFF), color: Color(0xFF7B61D9)),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (_) {},
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Attendance'),
          NavigationDestination(icon: Icon(Icons.beach_access_outlined), label: 'Leave'),
          NavigationDestination(icon: Icon(Icons.person_outline_rounded), label: 'Profile'),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.icon, required this.label});
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
    decoration: BoxDecoration(color: Colors.white.withOpacity(.16), borderRadius: BorderRadius.circular(12)),
    child: Row(children: [Icon(icon, size: 16, color: Colors.white), const SizedBox(width: 5), Expanded(child: Text(label, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)))]),
  );
}

class _CircleIcon extends StatelessWidget {
  const _CircleIcon({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Material(color: Colors.white, borderRadius: BorderRadius.circular(14), child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(14), child: SizedBox(width: 43, height: 43, child: Icon(icon, color: const Color(0xFF36526B)))));
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.value, required this.label, required this.color});
  final String value;
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(vertical: 15),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
    child: Column(children: [Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800)), const SizedBox(height: 3), Text(label, style: const TextStyle(color: Color(0xFF627A90), fontSize: 11, fontWeight: FontWeight.w600))]),
  );
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.icon, required this.label, required this.tint, required this.color});
  final IconData icon;
  final String label;
  final Color tint;
  final Color color;
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white,
    borderRadius: BorderRadius.circular(19),
    child: InkWell(borderRadius: BorderRadius.circular(19), onTap: () {}, child: Padding(
      padding: const EdgeInsets.all(14),
      child: Row(children: [Container(padding: const EdgeInsets.all(9), decoration: BoxDecoration(color: tint, borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: color, size: 21)), const SizedBox(width: 10), Expanded(child: Text(label, style: const TextStyle(color: Color(0xFF18344C), fontSize: 13, fontWeight: FontWeight.w700)))]),
    )),
  );
}
