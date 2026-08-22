import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

class PunchEvidence {
  const PunchEvidence({this.latitude, this.longitude, this.selfiePath});
  final double? latitude;
  final double? longitude;
  final String? selfiePath;
}

class PunchEvidenceCollector {
  PunchEvidenceCollector({ImagePicker? picker}) : _picker = picker ?? ImagePicker();
  final ImagePicker _picker;

  Future<PunchEvidence> collect({required bool includeSelfie}) async {
    final position = await _position();
    XFile? selfie;
    if (includeSelfie) selfie = await _picker.pickImage(source: ImageSource.camera, imageQuality: 75, maxWidth: 1280);
    return PunchEvidence(latitude: position?.latitude, longitude: position?.longitude, selfiePath: selfie?.path);
  }

  Future<Position?> _position() async {
    if (!await Geolocator.isLocationServiceEnabled()) return null;
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) return null;
    return Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high));
  }
}
