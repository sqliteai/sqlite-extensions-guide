# Flutter / Dart Integration

This guide shows how to use SQLite extensions in Flutter and Dart applications using the `sqlite_vector` package.

**Requirements:** Dart 3.10+ / Flutter 3.38+

---

## Installation

```bash
flutter pub add sqlite_vector
```

Or add to `pubspec.yaml`:

```yaml
dependencies:
  sqlite3: ^3.0.0
  sqlite_vector: ^0.9.70
```

The package uses Dart build hooks to automatically bundle the correct native library for each platform. No additional configuration is needed.

---

## Supported Platforms

| Platform | Architectures |
|----------|---------------|
| Android  | arm64, arm, x64 |
| iOS      | arm64 (device + simulator) |
| macOS    | arm64, x64 |
| Linux    | arm64, x64 |
| Windows  | x64 |

---

## Usage

### With `sqlite3`

```dart
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite_vector/sqlite_vector.dart';

void main() {
  // Load extension once at app startup
  sqlite3.loadSqliteVectorExtension();

  final db = sqlite3.openInMemory();

  // Create a regular table with a BLOB column for vectors
  db.execute('CREATE TABLE items (id INTEGER PRIMARY KEY, embedding BLOB)');

  // Insert vectors
  final stmt = db.prepare('INSERT INTO items (embedding) VALUES (vector_as_f32(?))');
  stmt.execute(['[1.0, 2.0, 3.0, 4.0]']);
  stmt.execute(['[5.0, 6.0, 7.0, 8.0]']);
  stmt.dispose();

  // Initialize the vector index
  db.execute("SELECT vector_init('items', 'embedding', 'type=FLOAT32,dimension=4')");

  // Find nearest neighbors
  final results = db.select('''
    SELECT e.id, v.distance FROM items AS e
    JOIN vector_full_scan('items', 'embedding', vector_as_f32('[1.0, 2.0, 3.0, 4.0]'), 2) AS v
    ON e.id = v.rowid
  ''');

  for (final row in results) {
    print('id=${row['id']}, distance=${row['distance']}');
  }

  db.dispose();
}
```

### With `drift`

[drift](https://pub.dev/packages/drift) is a popular ORM built on top of `sqlite3`. The extension integrates seamlessly:

```dart
import 'dart:io';
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite_vector/sqlite_vector.dart';
import 'package:drift/native.dart';

Sqlite3 loadExtensions() {
  sqlite3.loadSqliteVectorExtension();
  return sqlite3;
}

// Use when creating your database connection
LazyDatabase openConnection() {
  return LazyDatabase(() async {
    final file = File('path/to/db.sqlite');
    return NativeDatabase.createInBackground(
      file,
      sqlite3: loadExtensions,
    );
  });
}
```

---

## How It Works

The `sqlite_vector` package uses Dart's native assets system (build hooks) introduced in Dart 3.10 / Flutter 3.38. This is the same mechanism used by the `sqlite3` package itself.

Key points:

- **No Gradle, CocoaPods, or CMake configuration needed** — the build hook handles everything
- **Pre-built binaries** are bundled in the package and selected at build time based on target platform/architecture
- The `@Native` FFI annotation resolves `sqlite3_vector_init` from the bundled native library
- `loadSqliteVectorExtension()` calls `ensureExtensionLoaded()` which registers the extension with SQLite

---

## API Reference

See the full [sqlite-vector API documentation](https://github.com/sqliteai/sqlite-vector/blob/main/API.md) for all available functions:

- `vector_version()` — Returns the extension version
- `vector_init()` — Initialize a vector column
- `vector_as_f32()`, `vector_as_f16()`, `vector_as_i8()`, etc. — Convert JSON arrays to vector BLOBs
- `vector_full_scan()` — Find nearest neighbors
- `vector_quantize()` — Quantize vectors for faster search

---

## Example Project

A complete Flutter example app is available at:
[examples/flutter](../examples/flutter)

```bash
cd examples/flutter
flutter pub get
flutter run
```

---

## Troubleshooting

### "Pre-built binary not found"

This error occurs when running on a platform/architecture that doesn't have a bundled binary. The package supports the platforms listed above.

### Extension loads but virtual table functions don't work

Make sure you're using regular tables with BLOB columns, not virtual tables. sqlite-vector doesn't use virtual tables for storage — see the [main documentation](https://github.com/sqliteai/sqlite-vector) for the correct usage pattern.

### "Dart SDK version too old"

Build hooks require Dart 3.10+ / Flutter 3.38+. Update your SDK:

```bash
flutter upgrade
```
