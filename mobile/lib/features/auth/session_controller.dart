import 'package:flutter/foundation.dart';

import '../../core/api_client.dart';

class SessionController extends ChangeNotifier {
  SessionController({ApiClient? api}) : _api = api ?? ApiClient();
  final ApiClient _api;
  bool _ready = false;
  bool _loading = false;
  Map<String, dynamic>? _user;

  bool get ready => _ready;
  bool get loading => _loading;
  Map<String, dynamic>? get user => _user;
  bool get isSignedIn => _user != null;

  Future<void> restore() async {
    await _api.restoreToken();
    try {
      _user = (await _api.get('/auth/me'))['user'] as Map<String, dynamic>?;
    } on ApiException {
      await _api.clearToken();
    } finally {
      _ready = true;
      notifyListeners();
    }
  }

  Future<void> login(String phone, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final response = await _api.post('/auth/login', {'phone': phone, 'password': password}, authenticated: false);
      await _api.saveToken(response['token'] as String);
      _user = response['user'] as Map<String, dynamic>;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> attendanceMe() => _api.get('/attendance/me');
  Future<Map<String, dynamic>> uploadSelfie(String filePath) => _api.uploadSelfie(filePath);
  Future<Map<String, dynamic>> leaveMe() => _api.get('/leaves/me');
  Future<Map<String, dynamic>> applyLeave({required String leaveType, required String startDate, required String endDate, String? reason}) => _api.post('/leaves', {'leaveType': leaveType, 'startDate': startDate, 'endDate': endDate, 'reason': reason});
  Future<Map<String, dynamic>> employees() => _api.get('/employees');
  Future<Map<String, dynamic>> employee(int id) => _api.get('/employees/$id');
  Future<Map<String, dynamic>> createEmployee(Map<String, dynamic> employee) => _api.post('/employees', employee);
  Future<Map<String, dynamic>> manualAttendance(int employeeId, String status, {String? note, String? punchInAt, String? punchOutAt}) {
    final date = DateTime.now().toIso8601String().substring(0, 10);
    return _api.post('/attendance/manual', {'employeeId': employeeId, 'attendanceDate': date, 'status': status, 'reason': note, 'punchInAt': punchInAt, 'punchOutAt': punchOutAt});
  }
  Future<Map<String, dynamic>> users() => _api.get('/users');
  Future<Map<String, dynamic>> createUser({required String name, required String phone, required String password, required String role}) => _api.post('/users', {'name': name, 'phone': phone, 'password': password, 'role': role});
  Future<Map<String, dynamic>> attendanceSummary(String month) => _api.get('/reports/attendance-summary?month=$month');
  Future<Map<String, dynamic>> notifications() => _api.get('/notifications');
  Future<Map<String, dynamic>> markNotificationsRead() => _api.post('/notifications/read-all', {});
  Future<Map<String, dynamic>> pendingLeaves() => _api.get('/leaves/pending');
  Future<Map<String, dynamic>> reviewLeave(int id, String decision, {String? note}) => _api.post('/leaves/$id/review', {'decision': decision, 'note': note});
  Future<Map<String, dynamic>> punchIn({double? latitude, double? longitude, String? selfieUrl}) => _api.post('/attendance/punch-in', {'latitude': latitude, 'longitude': longitude, 'selfieUrl': selfieUrl});
  Future<Map<String, dynamic>> punchOut({double? latitude, double? longitude, String? selfieUrl}) => _api.post('/attendance/punch-out', {'latitude': latitude, 'longitude': longitude, 'selfieUrl': selfieUrl});

  Future<void> logout() async {
    await _api.clearToken();
    _user = null;
    notifyListeners();
  }
}
