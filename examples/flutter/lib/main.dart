import 'package:flutter/material.dart';
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite_vector/sqlite_vector.dart';
import 'package:sqlite_js/sqlite_js.dart';
import 'package:sqlite_sync/sqlite_sync.dart';
import 'package:sqlite_ai/sqlite_ai.dart';
import 'package:sqlite_agent/sqlite_agent.dart';
import 'package:sqlite_mcp/sqlite_mcp.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SQLiteAI Extensions Demo',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple)),
      home: const ExtensionsTestPage(),
    );
  }
}

class ExtensionsTestPage extends StatefulWidget {
  const ExtensionsTestPage({super.key});

  @override
  State<ExtensionsTestPage> createState() => _ExtensionsTestPageState();
}

class _ExtensionsTestPageState extends State<ExtensionsTestPage> {
  String _result = 'Running tests...';

  @override
  void initState() {
    super.initState();
    _runTests();
  }

  void _runTests() {
    try {
      // Load all extensions at startup
      sqlite3.loadSqliteVectorExtension();
      sqlite3.loadSqliteJsExtension();
      sqlite3.loadSqliteSyncExtension();
      sqlite3.loadSqliteAiExtension();
      sqlite3.loadSqliteAgentExtension();
      sqlite3.loadSqliteMcpExtension();

      final db = sqlite3.openInMemory();
      final buf = StringBuffer();

      // Test sqlite-vector
      buf.writeln('=== sqlite-vector ===');
      final vectorVersion = db.select('SELECT vector_version()').first.values.first;
      buf.writeln('Version: $vectorVersion');

      db.execute('CREATE TABLE items (id INTEGER PRIMARY KEY, embedding BLOB)');
      final stmt = db.prepare('INSERT INTO items (embedding) VALUES (vector_as_f32(?))');
      stmt.execute(['[1.0, 2.0, 3.0, 4.0]']);
      stmt.execute(['[5.0, 6.0, 7.0, 8.0]']);
      stmt.execute(['[1.1, 2.1, 3.1, 4.1]']);
      stmt.dispose();

      db.execute("SELECT vector_init('items', 'embedding', 'type=FLOAT32,dimension=4')");
      final results = db.select('''
        SELECT e.id, v.distance FROM items AS e
        JOIN vector_full_scan('items', 'embedding', vector_as_f32('[1.0, 2.0, 3.0, 4.0]'), 2) AS v
        ON e.id = v.rowid
      ''');
      buf.writeln('Nearest neighbors:');
      for (final row in results) {
        buf.writeln('  id=${row['id']}, distance=${row['distance']}');
      }
      buf.writeln();

      // Test sqlite-js
      buf.writeln('=== sqlite-js ===');
      final jsVersion = db.select('SELECT js_version()').first.values.first;
      buf.writeln('Version: $jsVersion');
      final jsResult = db.select("SELECT js_eval('1 + 2 + 3')").first.values.first;
      buf.writeln('js_eval("1 + 2 + 3") = $jsResult');
      buf.writeln();

      // Test sqlite-sync
      buf.writeln('=== sqlite-sync ===');
      final syncVersion = db.select('SELECT cloudsync_version()').first.values.first;
      buf.writeln('Version: $syncVersion');

      // Generate UUIDs (UUIDv7) - works without initialization
      final uuid1 = db.select('SELECT cloudsync_uuid()').first.values.first;
      final uuid2 = db.select('SELECT cloudsync_uuid()').first.values.first;
      buf.writeln('cloudsync_uuid() examples:');
      buf.writeln('  $uuid1');
      buf.writeln('  $uuid2');
      buf.writeln('(Cloud sync requires cloudsync_init() and network config)');
      buf.writeln();

      // Test sqlite-ai
      buf.writeln('=== sqlite-ai ===');
      final aiVersion = db.select('SELECT ai_version()').first.values.first;
      buf.writeln('Version: $aiVersion');
      buf.writeln('(Requires GGUF model for inference - see API.md)');
      buf.writeln();

      // Test sqlite-mcp
      buf.writeln('=== sqlite-mcp ===');
      final mcpVersion = db.select('SELECT mcp_version()').first.values.first;
      buf.writeln('Version: $mcpVersion');
      buf.writeln('(Requires MCP server connection - see API.md)');
      buf.writeln();

      // Test sqlite-agent
      buf.writeln('=== sqlite-agent ===');
      final agentVersion = db.select('SELECT agent_version()').first.values.first;
      buf.writeln('Version: $agentVersion');
      buf.writeln('(Requires sqlite-ai + sqlite-mcp setup - see API.md)');

      db.dispose();

      final resultStr = buf.toString();
      debugPrint(resultStr);
      setState(() => _result = resultStr);
    } catch (e) {
      debugPrint('Error: $e');
      setState(() => _result = 'Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('SQLiteAI Extensions'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Text(_result, style: const TextStyle(fontSize: 14, fontFamily: 'monospace')),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _runTests,
        tooltip: 'Run tests',
        child: const Icon(Icons.play_arrow),
      ),
    );
  }
}
