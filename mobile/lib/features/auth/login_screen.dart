import 'package:flutter/material.dart';

import '../../core/i18n.dart';
import '../../core/theme.dart';
import 'session_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.session});
  final SessionController session;
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  String? _error;
  @override
  void dispose() { _phone.dispose(); _password.dispose(); super.dispose(); }

  Future<void> _login() async {
    setState(() => _error = null);
    try { await widget.session.login(_phone.text.trim(), _password.text); }
    catch (error) { if (mounted) setState(() => _error = error.toString()); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F8FC),
    body: SafeArea(child: Center(child: SingleChildScrollView(padding: const EdgeInsets.all(28), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Center(child: ClipRRect(borderRadius: BorderRadius.circular(24), child: Image.asset('assets/branding/hrmate-app-icon.png', width: 104, height: 104))),
      const SizedBox(height: 22),
      Text(tr('welcome_back'), textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF0F2440), fontSize: 28, fontWeight: FontWeight.w900)),
      const SizedBox(height: 8),
      Text(tr('login_subtitle'), textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF708499))),
      const SizedBox(height: 34),
      TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: tr('phone_number'), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none))),
      const SizedBox(height: 14),
      TextField(controller: _password, obscureText: true, decoration: InputDecoration(labelText: tr('password'), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none))),
      if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: const TextStyle(color: Color(0xFFDB3131)))),
      const SizedBox(height: 22),
      SizedBox(height: 54, child: FilledButton(onPressed: widget.session.loading ? null : _login, style: FilledButton.styleFrom(backgroundColor: HRMateTheme.blue, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))), child: widget.session.loading ? const CircularProgressIndicator(color: Colors.white) : Text(tr('sign_in'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)))),
    ])))), 
  );
}
