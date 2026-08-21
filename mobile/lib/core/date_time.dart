/// India Standard Time without requiring a device-specific timezone database.
DateTime istNow() => DateTime.now().toUtc().add(const Duration(minutes: 330));
