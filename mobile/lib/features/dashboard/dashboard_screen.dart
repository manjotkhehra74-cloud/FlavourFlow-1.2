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
      appBar: AppBar(title: Text(tr('app_name'))),
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(20), children: [
          Text('${tr('good_morning')}!', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          const Text('G.D. Foods Mfg (I) Pvt. Ltd. · Khadur Sahib'),
          const SizedBox(height: 28),
          FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: HRMateTheme.blue, padding: const EdgeInsets.all(18)),
            onPressed: () {}, icon: const Icon(Icons.fingerprint_rounded), label: Text(tr('punch_in')),
          ),
          const SizedBox(height: 20),
          Wrap(spacing: 12, runSpacing: 12, children: [
            _FeatureCard(icon: Icons.calendar_today_rounded, label: tr('attendance')),
            _FeatureCard(icon: Icons.beach_access_rounded, label: tr('leave')),
            _FeatureCard(icon: Icons.groups_rounded, label: tr('employees')),
          ]),
        ]),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({required this.icon, required this.label});
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: 160, child: Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(
      mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start,
      children: [Icon(icon, color: HRMateTheme.green), const SizedBox(height: 18), Text(label), const SizedBox(height: 4), Text(tr('coming_soon'), style: Theme.of(context).textTheme.bodySmall)],
    ))),
  );
}
