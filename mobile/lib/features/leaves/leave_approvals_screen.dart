import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../auth/session_controller.dart';

class LeaveApprovalsScreen extends StatefulWidget {
  const LeaveApprovalsScreen({super.key, required this.session});
  final SessionController session;
  @override
  State<LeaveApprovalsScreen> createState() => _LeaveApprovalsScreenState();
}

class _LeaveApprovalsScreenState extends State<LeaveApprovalsScreen> {
  bool _loading = true;
  String? _error;
  List<dynamic> _requests = [];
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async { setState(() { _loading = true; _error = null; }); try { final data = await widget.session.pendingLeaves(); if (mounted) setState(() => _requests = data as List<dynamic>); } on ApiException catch (e) { if (mounted) setState(() => _error = e.message); } finally { if (mounted) setState(() => _loading = false); } }
  Future<void> _review(Map<String,dynamic> leave, String decision) async { try { await widget.session.reviewLeave(leave['id'] as int, decision); if (mounted) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Leave ${decision}'))); _load(); } } on ApiException catch (e) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message))); } }
  @override Widget build(BuildContext context) => Scaffold(backgroundColor: const Color(0xFFF5F8FC), appBar: AppBar(backgroundColor: const Color(0xFFF5F8FC), title: const Text('Leave approvals', style: TextStyle(color: Color(0xFF0F2440), fontWeight: FontWeight.w800))), body: RefreshIndicator(onRefresh: _load, child: ListView(padding: const EdgeInsets.all(20), children: [_Counts(pending: _requests.length), const SizedBox(height: 22), if (_loading) const Center(child: Padding(padding: EdgeInsets.all(50), child: CircularProgressIndicator())) else if (_error != null) Text(_error!) else if (_requests.isEmpty) const Center(child: Padding(padding: EdgeInsets.all(50), child: Text('No pending leave requests'))) else for (final item in _requests) _ApprovalCard(leave: item as Map<String,dynamic>, onReview: _review)]))); }
class _Counts extends StatelessWidget { const _Counts({required this.pending}); final int pending; @override Widget build(BuildContext context)=>Row(children:[_count('$pending','Pending',HRMateTheme.blue),_count('—','Approved',HRMateTheme.green),_count('—','Rejected',const Color(0xFFEF3737)),_count('📅','Calendar',const Color(0xFFE99212))]); Widget _count(String value,String label,Color color)=>Expanded(child:Container(margin:const EdgeInsets.only(right:7),padding:const EdgeInsets.symmetric(vertical:12),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(14)),child:Column(children:[Text(value,style:TextStyle(color:color,fontWeight:FontWeight.w900,fontSize:18)),Text(label,style:const TextStyle(fontSize:10,color:Color(0xFF71859A)))]))); }
class _ApprovalCard extends StatelessWidget { const _ApprovalCard({required this.leave,required this.onReview}); final Map<String,dynamic> leave; final Future<void> Function(Map<String,dynamic>,String) onReview; @override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Row(children:[const CircleAvatar(child:Icon(Icons.person)),const SizedBox(width:10),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(leave['name']?.toString()??'Employee',style:const TextStyle(fontWeight:FontWeight.w800)),Text(leave['department']?.toString()??'',style:const TextStyle(color:HRMateTheme.blue,fontSize:12))])),Text('${leave['days']} days',style:const TextStyle(color:Color(0xFF71859A)))]),const SizedBox(height:12),Text('${leave['leave_type']} leave · ${leave['start_date']} – ${leave['end_date']}'),const SizedBox(height:14),Row(children:[Expanded(child:OutlinedButton(onPressed:()=>onReview(leave,'rejected'),child:const Text('Reject'))),const SizedBox(width:10),Expanded(child:FilledButton(style:FilledButton.styleFrom(backgroundColor:HRMateTheme.green),onPressed:()=>onReview(leave,'approved'),child:const Text('Approve')))])]))); }
