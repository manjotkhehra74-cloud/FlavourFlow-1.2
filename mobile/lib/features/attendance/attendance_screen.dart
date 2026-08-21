import 'package:flutter/material.dart';

import '../../core/i18n.dart';
import '../../core/theme.dart';

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F8FC),
    appBar: AppBar(backgroundColor: const Color(0xFFF5F8FC), title: Text(tr('attendance'), style: const TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800)), leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded), onPressed: () => Navigator.pop(context))),
    body: ListView(padding: const EdgeInsets.all(20), children: [
      const _WeekStrip(),
      const SizedBox(height: 22),
      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22), boxShadow: const [BoxShadow(color: Color(0x100F2440), blurRadius: 18, offset: Offset(0, 7))]), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Today', style: TextStyle(color: Color(0xFF0F2440), fontSize: 19, fontWeight: FontWeight.w800)),
        const SizedBox(height: 22),
        _timelineRow(Icons.login_rounded, 'Punched in 08:54 AM', const Color(0xFF159947), 'GPS verified · G.D. Foods Plant'),
        Container(margin: const EdgeInsets.only(left: 13), height: 28, width: 2, color: const Color(0xFFE0E8F0)),
        _timelineRow(Icons.logout_rounded, 'Punch out —', const Color(0xFF8A9CAD), 'Selfie optional'),
      ])),
      const SizedBox(height: 20),
      SizedBox(width: double.infinity, child: FilledButton.icon(style: FilledButton.styleFrom(backgroundColor: HRMateTheme.blue, padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))), onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Punch out action is ready for API connection'))), icon: const Icon(Icons.fingerprint_rounded), label: const Text('Punch Out', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)))),
      const SizedBox(height: 26),
      const Text('This month', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800, fontSize: 19)),
      const SizedBox(height: 12),
      const Row(children: [Expanded(child: _MonthStat('18', 'Present', Color(0xFF159947))), SizedBox(width: 9), Expanded(child: _MonthStat('2', 'Late', Color(0xFFEF3737))), SizedBox(width: 9), Expanded(child: _MonthStat('1', 'Half day', Color(0xFFE99212))), SizedBox(width: 9), Expanded(child: _MonthStat('0', 'Absent', Color(0xFF71859A)))]),
    ]),
  );

  Widget _timelineRow(IconData icon, String title, Color color, String subtitle) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: .12)), child: Icon(icon, color: color)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16)),
        const SizedBox(height: 4),
        Text(subtitle, style: const TextStyle(color: Color(0xFF708499), fontSize: 12)),
      ])),
    ],
  );
}

class _WeekStrip extends StatelessWidget {
  const _WeekStrip();
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 8), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
    _Day('Sun', '17', false), _Day('Mon', '18', false), _Day('Tue', '19', false), _Day('Wed', '20', false), _Day('Thu', '21', true), _Day('Fri', '22', false), _Day('Sat', '23', false),
  ]));
}
class _Day extends StatelessWidget {
  const _Day(this.day, this.date, this.active);
  final String day;
  final String date;
  final bool active;
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(day, style: const TextStyle(fontSize: 10, color: Color(0xFF71859A))),
    const SizedBox(height: 7),
    Container(
      width: 30,
      height: 30,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: active ? HRMateTheme.blue : Colors.transparent, borderRadius: BorderRadius.circular(10)),
      child: Text(date, style: TextStyle(color: active ? Colors.white : const Color(0xFF0F2440), fontWeight: FontWeight.w800)),
    ),
    if (!active) const Padding(padding: EdgeInsets.only(top: 5), child: CircleAvatar(radius: 3, backgroundColor: HRMateTheme.green)),
  ]);
}
class _MonthStat extends StatelessWidget { const _MonthStat(this.value,this.label,this.color); final String value,label; final Color color; @override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.symmetric(vertical:13),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(15)),child:Column(children:[Text(value,style:TextStyle(color:color,fontSize:22,fontWeight:FontWeight.w900)),const SizedBox(height:3),Text(label,textAlign:TextAlign.center,style:const TextStyle(color:Color(0xFF62778D),fontSize:10,fontWeight:FontWeight.w600))])); }
