"""Apply Android requirements for Flutter plugins after `flutter create` generates android/."""
from pathlib import Path
import re

path = Path('android/app/build.gradle.kts')
if not path.exists():
    raise SystemExit(f'Missing generated Android build file: {path}')

source = path.read_text()
if 'isCoreLibraryDesugaringEnabled' not in source:
    source, count = re.subn(
        r'(targetCompatibility\s*=\s*JavaVersion\.VERSION_\d+)',
        r'\1\n        isCoreLibraryDesugaringEnabled = true',
        source,
        count=1,
    )
    if count != 1:
        raise SystemExit('Could not enable core library desugaring in compileOptions.')

if 'coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:' not in source:
    source += '\n\ndependencies {\n    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")\n}\n'

path.write_text(source)
print('Android plugin requirements prepared VERIFIED ✓')
