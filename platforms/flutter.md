# Flutter / Dart Integration

This guide shows how to use SQLiteAI extensions in Flutter and Dart applications.

**Requirements:** Dart 3.10+ / Flutter 3.38+

---

## Available Packages

| Package | Description | pub.dev |
|---------|-------------|---------|
| `sqlite_vector` | Vector similarity search with SIMD-optimized distance functions | [pub.dev](https://pub.dev/packages/sqlite_vector) |
| `sqlite_js` | Execute JavaScript directly in SQLite using QuickJS | [pub.dev](https://pub.dev/packages/sqlite_js) |
| `sqlite_sync` | Real-time sync with SQLite Cloud | [pub.dev](https://pub.dev/packages/sqlite_sync) |
| `sqlite_ai` | On-device LLM inference with llama.cpp | [pub.dev](https://pub.dev/packages/sqlite_ai) |
| `sqlite_agent` | Execute AI agents with MCP capabilities | [pub.dev](https://pub.dev/packages/sqlite_agent) |
| `sqlite_mcp` | Call MCP resources from databases | [pub.dev](https://pub.dev/packages/sqlite_mcp) |

---

## Installation

Install the packages you need:

```bash
# Flutter projects
flutter pub add sqlite_vector
flutter pub add sqlite_js
flutter pub add sqlite_sync
flutter pub add sqlite_ai
flutter pub add sqlite_agent
flutter pub add sqlite_mcp

# Dart projects
dart pub add sqlite_vector
dart pub add sqlite_js
dart pub add sqlite_sync
dart pub add sqlite_ai
dart pub add sqlite_agent
dart pub add sqlite_mcp
```

Or add to `pubspec.yaml`:

```yaml
dependencies:
  sqlite3: ^3.0.0
  # Add the packages you need
  sqlite_vector: ^0.9.85
  sqlite_js: ^1.2.3
  sqlite_sync: ^0.8.64
  sqlite_ai: ^0.7.59
  sqlite_agent: ^0.1.6
  sqlite_mcp: ^0.1.5
```

Each package uses Dart build hooks to automatically bundle the correct native library for each platform. No additional configuration is needed.

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
import 'package:sqlite_js/sqlite_js.dart';
import 'package:sqlite_sync/sqlite_sync.dart';
import 'package:sqlite_ai/sqlite_ai.dart';
import 'package:sqlite_agent/sqlite_agent.dart';
import 'package:sqlite_mcp/sqlite_mcp.dart';

void main() {
  // Load extensions once at app startup
  sqlite3.loadSqliteVectorExtension();
  sqlite3.loadSqliteJsExtension();
  sqlite3.loadSqliteSyncExtension();
  sqlite3.loadSqliteAiExtension();
  sqlite3.loadSqliteAgentExtension();
  sqlite3.loadSqliteMcpExtension();

  final db = sqlite3.openInMemory();

  // Now all extension functions are available
  print(db.select('SELECT vector_version()').first.values.first);
  print(db.select('SELECT js_version()').first.values.first);
  print(db.select('SELECT cloudsync_version()').first.values.first);
  print(db.select('SELECT ai_version()').first.values.first);
  print(db.select('SELECT agent_version()').first.values.first);
  print(db.select('SELECT mcp_version()').first.values.first);

  db.dispose();
}
```

### With `drift`

[drift](https://pub.dev/packages/drift) is a popular ORM built on top of `sqlite3`. The extensions integrate seamlessly:

```dart
import 'dart:io';
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite_vector/sqlite_vector.dart';
import 'package:sqlite_js/sqlite_js.dart';
import 'package:sqlite_sync/sqlite_sync.dart';
import 'package:drift/native.dart';

Sqlite3 loadExtensions() {
  sqlite3.loadSqliteVectorExtension();
  sqlite3.loadSqliteJsExtension();
  sqlite3.loadSqliteSyncExtension();
  // Add other extensions as needed
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

## Extension Examples

### sqlite-vector: Vector Similarity Search

```dart
// Create a table with a BLOB column for vectors
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
```

### sqlite-js: JavaScript Evaluation

```dart
// Evaluate JavaScript expressions
final result = db.select("SELECT js_eval('1 + 2 + 3')").first.values.first;
print('Result: $result'); // Result: 6

// Use JavaScript for complex calculations
final json = db.select("SELECT js_eval('JSON.stringify({a: 1, b: 2})')").first.values.first;
print('JSON: $json'); // JSON: {"a":1,"b":2}
```

### sqlite-sync: UUID Generation

```dart
// Generate UUIDs (UUIDv7) - works without initialization
final uuid1 = db.select('SELECT cloudsync_uuid()').first.values.first;
final uuid2 = db.select('SELECT cloudsync_uuid()').first.values.first;
print('UUID 1: $uuid1');
print('UUID 2: $uuid2');

// For cloud sync features, initialize with your SQLite Cloud connection
// db.execute("SELECT cloudsync_init('sqlitecloud://...')");
```

### sqlite-ai, sqlite-agent, sqlite-mcp

These extensions require additional setup (GGUF models, MCP server connections). See the API documentation for each extension:

- [sqlite-ai API](https://github.com/sqliteai/sqlite-ai/blob/main/API.md)
- [sqlite-agent API](https://github.com/sqliteai/sqlite-agent/blob/main/API.md)
- [sqlite-mcp API](https://github.com/sqliteai/sqlite-mcp/blob/main/API.md)

---

## How It Works

All SQLiteAI packages use Dart's native assets system (build hooks) introduced in Dart 3.10 / Flutter 3.38. This is the same mechanism used by the `sqlite3` package itself.

Key points:

- **No Gradle, CocoaPods, or CMake configuration needed** — the build hook handles everything
- **Pre-built binaries** are bundled in the package and selected at build time based on target platform/architecture
- The `@Native` FFI annotation resolves the extension's init function from the bundled native library
- `loadSqlite*Extension()` calls `ensureExtensionLoaded()` which registers the extension with SQLite

---

## API References

| Extension | API Documentation |
|-----------|-------------------|
| sqlite-vector | [API.md](https://github.com/sqliteai/sqlite-vector/blob/main/API.md) |
| sqlite-js | [API.md](https://github.com/sqliteai/sqlite-js/blob/main/API.md) |
| sqlite-sync | [API.md](https://github.com/sqliteai/sqlite-sync/blob/main/API.md) |
| sqlite-ai | [API.md](https://github.com/sqliteai/sqlite-ai/blob/main/API.md) |
| sqlite-agent | [API.md](https://github.com/sqliteai/sqlite-agent/blob/main/API.md) |
| sqlite-mcp | [API.md](https://github.com/sqliteai/sqlite-mcp/blob/main/API.md) |

---

## Example Project

A complete Flutter example app demonstrating all extensions is available at:
[examples/flutter](../examples/flutter)

```bash
cd examples/flutter

# Generate platform scaffolding (only needed once)
flutter create . --project-name sqliteai_flutter_example

# Install dependencies and run
flutter pub get
flutter run
```

Or run as a Dart CLI (no UI):

```bash
dart pub get
dart run lib/main.dart
```

---

## Troubleshooting

### "Pre-built binary not found"

This error occurs when running on a platform/architecture that doesn't have a bundled binary. The packages support the platforms listed above.

### Extension loads but functions don't work

Make sure you've loaded the extension before opening the database or using its functions:

```dart
// Correct order
sqlite3.loadSqliteVectorExtension(); // Load first
final db = sqlite3.openInMemory();    // Then open database
```

### "Dart SDK version too old"

Build hooks require Dart 3.10+ / Flutter 3.38+. Update your SDK:

```bash
flutter upgrade
```

### Extension-specific errors

Some extensions require initialization before certain functions work:

- **sqlite-sync**: `cloudsync_uuid()` works immediately, but sync features need `cloudsync_init()`
- **sqlite-ai**: Requires a GGUF model file for inference
- **sqlite-mcp**: Requires MCP server connection configuration
- **sqlite-agent**: Requires both sqlite-ai and sqlite-mcp setup
