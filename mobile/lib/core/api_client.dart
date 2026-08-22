import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? httpClient}) : _http = httpClient ?? http.Client();

  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://hrmate.duckdns.org/api/v1',
  );
  static const _tokenKey = 'auth_token';
  final http.Client _http;
  String? _token;

  Future<void> restoreToken() async => _token = (await SharedPreferences.getInstance()).getString(_tokenKey);
  Future<void> saveToken(String token) async {
    _token = token;
    await (await SharedPreferences.getInstance()).setString(_tokenKey, token);
  }
  Future<void> clearToken() async {
    _token = null;
    await (await SharedPreferences.getInstance()).remove(_tokenKey);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {bool authenticated = true}) async {
    final response = await _http.post(Uri.parse('$baseUrl$path'), headers: _headers(authenticated), body: jsonEncode(body));
    return _decode(response);
  }

  Future<Map<String, dynamic>> get(String path) async {
    final response = await _http.get(Uri.parse('$baseUrl$path'), headers: _headers(true));
    return _decode(response);
  }

  Future<Map<String, dynamic>> uploadSelfie(String filePath) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/uploads/selfie'));
    request.headers.addAll(_headers(true)..remove('Content-Type'));
    request.files.add(await http.MultipartFile.fromPath('selfie', filePath));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _decode(response);
  }

  Map<String, String> _headers(bool authenticated) => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    if (authenticated && _token != null) 'Authorization': 'Bearer $_token',
  };

  Map<String, dynamic> _decode(http.Response response) {
    final data = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) throw ApiException(data['error']?.toString() ?? 'Request failed', statusCode: response.statusCode);
    return data;
  }
}
