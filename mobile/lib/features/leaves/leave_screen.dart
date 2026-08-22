import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../auth/session_controller.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key, required this.session});
  final SessionController session;
  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  bool _loading = true;
  Map<String, dynamic>? _balance;
  List<dynamic> _requests = [];
  String? _error;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try { final response = await widget.session.leaveMe(); if (mounted) setState(() { _balance = response['balance'] as Map<String, dynamic>?; _requests = response['requests'] as List<dynamic>? ?? []; }); }
    on ApiException catch (error) { if (mounted) setState(() => _error = error.message); }
    finally { if (mounted) setState(() => _loading = false); }
  }
  Future<void> _apply() async {
    final type = await showModalBottomSheet<String>(context: context, builder: (context) => SafeArea(child: Padding(padding: const EdgeInsets.all(20), child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [const Text('Apply for leave', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)), const SizedBox(height: 14), for (final value in ['casual', 'sick', 'earned']) OutlinedButton(onPressed: () => Navigator.pop(context, value), child: Text(value.toUpperCase())),]))));
    if (type == null || !mounted) return;
    final start = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: DateTime.now());
    if (start == null || !mounted) return;
    final end = await showDatePicker(context: context, firstDate: start, lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: start);
    if (end == null) return;
    String iso(DateTime value) => value.toIso8601String().substring(0, 10);
    try { await widget.session.applyLeave(leaveType: type, startDate: iso(start), endDate: iso(end)); if (mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave request submitted'))); _load(); } }
    on ApiException catch (error) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message))); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F8FC),
    appBar: AppBar(backgroundColor: const Color(0xFFF5F8FC), title: const Text('Leave', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800))),
    body: RefreshIndicator(
      onRefresh: _load,
      child: ListView(padding: const EdgeInsets.all(20), children: [
        if (_loading) const Padding(padding: EdgeInsets.all(60), child: Center(child: CircularProgressIndicator()))
        else if (_error != null) _Retry(message: _error!, action: _load)
        else ...[
          _BalanceCard(balance: _balance),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: _apply, style: FilledButton.styleFrom(backgroundColor: HRMateTheme.blue, padding: const EdgeInsets.symmetric(vertical: 17)), icon: const Icon(Icons.add), label: const Text('Apply for leave'))),
          const SizedBox(height: 26),
          const Text('Recent requests', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19, color: Color(0xFF0F2440))),
          const SizedBox(height: 12),
          for (final request in _requests) _LeaveCard(request: request as Map<String, dynamic>),
        ],
      ]),
    ),
  );
}
class _BalanceCard extends StatelessWidget { const _BalanceCard({required this.balance}); final Map<String,dynamic>? balance; @override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.all(20),decoration:BoxDecoration(gradient:const LinearGradient(colors:[HRMateTheme.blue,HRMateTheme.green]),borderRadius:BorderRadius.circular(22)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('Leave balance',style:TextStyle(color:Colors.white,fontSize:20,fontWeight:FontWeight.w800)),const SizedBox(height:16),Row(children:[_amount('Casual',balance?['casual']),_amount('Sick',balance?['sick']),_amount('Earned',balance?['earned'])])])); Widget _amount(String name,dynamic value)=>Expanded(child:Container(margin:const EdgeInsets.only(right:7),padding:const EdgeInsets.symmetric(vertical:12),decoration:BoxDecoration(color:Colors.white.withValues(alpha:.92),borderRadius:BorderRadius.circular(13)),child:Column(children:[Text('${value ?? 0}',style:const TextStyle(color:Color(0xFF0F2440),fontWeight:FontWeight.w900,fontSize:18)),Text(name,style:const TextStyle(color:Color(0xFF5E7184),fontSize:10))]))); }
class _LeaveCard extends StatelessWidget {
  const _LeaveCard({required this.request});
  final Map<String, dynamic> request;
  @override
  Widget build(BuildContext context) {
    final status = request['status']?.toString() ?? 'pending';
    final color = status == 'approved' ? const Color(0xFF159947) : status == 'rejected' ? const Color(0xFFEF3737) : const Color(0xFFE99212);
    return Card(child: ListTile(
      leading: CircleAvatar(backgroundColor: color.withValues(alpha: .12), child: Icon(Icons.beach_access_outlined, color: color)),
      title: Text('${request['leave_type']} leave'),
      subtitle: Text('${request['start_date']} – ${request['end_date']}'),
      trailing: Text(status.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 11)),
    ));
  }
}
class _Retry extends StatelessWidget { const _Retry({required this.message,required this.action}); final String message;final VoidCallback action;@override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(20),child:Column(children:[Text(message),OutlinedButton(onPressed:action,child:const Text('Try again'))]))); }
