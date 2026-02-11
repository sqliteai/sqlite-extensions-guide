# Flutter SQLiteAI Extensions Example

A Flutter app demonstrating how to use multiple SQLiteAI extensions together.

## Requirements

- Dart 3.10+ / Flutter 3.38+

## Running

### As a Flutter app (with UI)

```bash
# Generate platform scaffolding (only needed once)
flutter create . --project-name sqliteai_flutter_example

# Install dependencies and run
flutter pub get
flutter run
```

### As a Dart CLI (no UI)

```bash
dart pub get
dart run lib/main.dart
```

## Available Extensions

| Package | Description |
|---------|-------------|
| `sqlite_vector` | Vector similarity search with SIMD-optimized distance functions |
| `sqlite_js` | Execute JavaScript directly in SQLite using QuickJS |
| `sqlite_sync` | Real-time sync with SQLite Cloud |
| `sqlite_ai` | On-device LLM inference with llama.cpp |
| `sqlite_agent` | Connect to MCP servers for AI agent capabilities |
| `sqlite_mcp` | Expose databases as MCP resources |

## What it does

1. Loads all 6 SQLite extensions at startup
2. **sqlite-vector**: Vector similarity search with nearest neighbors
3. **sqlite-js**: JavaScript evaluation with `js_eval()`
4. **sqlite-sync**: UUID generation with `cloudsync_uuid()`
5. **sqlite-ai**: Version check (requires GGUF model for full features)
6. **sqlite-mcp**: Version check (requires MCP server for full features)
7. **sqlite-agent**: Version check (requires sqlite-ai + sqlite-mcp setup)

## Expected output

```
=== sqlite-vector ===
Version: 0.9.85
Nearest neighbors:
  id=1, distance=0.0
  id=3, distance=0.1999998688697815

=== sqlite-js ===
Version: 1.2.3
js_eval("1 + 2 + 3") = 6

=== sqlite-sync ===
Version: 0.8.64
cloudsync_uuid() examples:
  01956a8b-1234-7abc-8def-0123456789ab
  01956a8b-1235-7abc-8def-0123456789ab
(Cloud sync requires cloudsync_init() and network config)

=== sqlite-ai ===
Version: 0.7.59
(Requires GGUF model for inference - see API.md)

=== sqlite-mcp ===
Version: 0.1.5
(Requires MCP server connection - see API.md)

=== sqlite-agent ===
Version: 0.1.6
(Requires sqlite-ai + sqlite-mcp setup - see API.md)
```

## Learn more

- [Flutter Integration Guide](../../platforms/flutter.md)
- [sqlite_vector on pub.dev](https://pub.dev/packages/sqlite_vector)
- [sqlite_js on pub.dev](https://pub.dev/packages/sqlite_js)
- [sqlite_sync on pub.dev](https://pub.dev/packages/sqlite_sync)
- [sqlite_ai on pub.dev](https://pub.dev/packages/sqlite_ai)
- [sqlite_agent on pub.dev](https://pub.dev/packages/sqlite_agent)
- [sqlite_mcp on pub.dev](https://pub.dev/packages/sqlite_mcp)
