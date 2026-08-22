import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../auth/session_controller.dart';
import 'punch_evidence.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key, required this.session});
  final SessionController session;
  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _loading = true;
  bool _saving = false;
  String? _error;
  Map<String, dynamic>? _today;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final response = await widget.session.attendanceMe();
      final records = (response['records'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
      if (mounted) setState(() => _today = records.isEmpty ? null : records.first);
    } on ApiException catch (error) { if (mounted) setState(() => _error = error.message); }
    finally { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _punch() async {
    setState(() => _saving = true);
    try {
      final evidence = await PunchEvidenceCollector().collect(includeSelfie: false);
      String? selfieUrl;
      if (evidence.selfiePath != null) selfieUrl = (await widget.session.uploadSelfie(evidence.selfiePath!))['url'] as String?;
      final response = _today?['punch_in_at'] == null
          ? await widget.session.punchIn(latitude: evidence.latitude, longitude: evidence.longitude, selfieUrl: selfieUrl)
          : await widget.session.punchOut(latitude: evidence.latitude, longitude: evidence.longitude, selfieUrl: selfieUrl);
      if (mounted) setState(() => _today = response['attendance'] as Map<String, dynamic>);
    } on ApiException catch (error) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message))); }
    finally { if (mounted) setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F8FC),
    appBar: AppBar(backgroundColor: const Color(0xFFF5F8FC), title: const Text('Attendance', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800)), leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded), onPressed: () => Navigator.pop(context))),
    body: RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(20), children: [
      const _WeekStrip(), const SizedBox(height: 22),
      if (_loading) const Padding(padding: EdgeInsets.all(50), child: Center(child: CircularProgressIndicator()))
      else if (_error != null) _ErrorCard(message: _error!, retry: _load)
      else ...[
        _TimelineCard(record: _today),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: HRMateTheme.blue, padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
            onPressed: _saving ? null : _punch,
            icon: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.fingerprint_rounded),
            label: Text(_today?['punch_in_at'] == null ? 'Punch In' : _today?['punch_out_at'] == null ? 'Punch Out' : 'Attendance complete', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
          ),
        ),
        const SizedBox(height: 26),
        const _MonthSummary(),
      ],
    ])),
  );
}

class _ErrorCard extends StatelessWidget { const _ErrorCard({required this.message, required this.retry}); final String message; final VoidCallback retry; @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [Text(message, textAlign: TextAlign.center), const SizedBox(height: 12), OutlinedButton(onPressed: retry, child: const Text('Try again'))]))); }
class _TimelineCard extends StatelessWidget { const _TimelineCard({required this.record}); final Map<String,dynamic>? record; @override Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Today', style: TextStyle(color: Color(0xFF0F2440), fontSize: 19, fontWeight: FontWeight.w800)), const SizedBox(height: 22), _row(Icons.login_rounded, record?['punch_in_at'] == null ? 'Not punched in' : 'Punched in ${_time(record!['punch_in_at'])}', const Color(0xFF159947), 'GPS verified · G.D. Foods Plant'), const SizedBox(height: 22), _row(Icons.logout_rounded, record?['punch_out_at'] == null ? 'Punch out —' : 'Punched out ${_time(record!['punch_out_at'])}', const Color(0xFF71859A), 'Selfie optional') ])); Widget _row(IconData icon,String title,Color color,String sub)=>Row(children:[Icon(icon,color:color),const SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:TextStyle(color:color,fontWeight:FontWeight.w800)),Text(sub,style:const TextStyle(color:Color(0xFF71859A),fontSize:12))]))]); String _time(String iso)=>iso.length>=16?iso.substring(11,16):iso; }
class _WeekStrip extends StatelessWidget { const _WeekStrip(); @override Widget build(BuildContext context)=>Container(height:72, alignment:Alignment.center, decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(20)),child:const Text('Sun 17   Mon 18   Tue 19   Wed 20   Thu 21   Fri 22   Sat 23',style:TextStyle(color:Color(0xFF0F2440),fontWeight:FontWeight.w700))); }
class _MonthSummary extends StatelessWidget { const _MonthSummary(); @override Widget build(BuildContext context)=>Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('This month',style:TextStyle(color:Color(0xFF0F2440),fontWeight:FontWeight.w800,fontSize:19)),const SizedBox(height:12),Row(children:const [Expanded(child:_Mini('18','Present',Color(0xFF159947))),SizedBox(width:8),Expanded(child:_Mini('2','Late',Color(0xFFEF3737))),SizedBox(width:8),Expanded(child:_Mini('1','Half day',Color(0xFFE99212))),SizedBox(width:8),Expanded(child:_Mini('0','Absent',Color(0xFF71859A)))])]); }
class _Mini extends StatelessWidget { const _Mini(this.number,this.label,this.color);final String number,label;final Color color;@override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.symmetric(vertical:13),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(15)),child:Column(children:[Text(number,style:TextStyle(color:color,fontSize:22,fontWeight:FontWeight.w900)),Text(label,style:const TextStyle(fontSize:10,color:Color(0xFF71859A)))])); }
