/**
 * Comprehensive example for loading and using all SQLite extensions from @sqliteai
 *
 * This example demonstrates:
 * - Loading all four extensions: vector, sync, js, and ai
 * - Getting version information
 * - Quick examples of each extension's capabilities
 * - Combining extensions for powerful workflows
 *
 * Usage:
 *   npm install better-sqlite3 @sqliteai/sqlite-vector @sqliteai/sqlite-sync @sqliteai/sqlite-js @sqliteai/sqlite-ai
 *   node basic-usage.js
 */

const Database = require('better-sqlite3');

/**
 * Extension registry with metadata
 */
const EXTENSIONS = {
  vector: {
    package: '@sqliteai/sqlite-vector',
    versionFunction: 'vector_version',
    description: 'Vector search and similarity matching',
  },
  sync: {
    package: '@sqliteai/sqlite-sync',
    versionFunction: 'cloudsync_version',
    description: 'Database synchronization',
  },
  js: {
    package: '@sqliteai/sqlite-js',
    versionFunction: 'js_version',
    description: 'JavaScript user-defined functions',
  },
  ai: {
    package: '@sqliteai/sqlite-ai',
    versionFunction: 'ai_version',
    description: 'On-device AI inference',
  },
};

/**
 * Load all available extensions into a database
 * @param {Database} db - better-sqlite3 database instance
 * @returns {Object} Loaded extensions info
 */
function loadExtensions(db) {
  const loaded = {};

  console.log('═'.repeat(60));
  console.log('Loading SQLite Extensions');
  console.log('═'.repeat(60));
  console.log();

  for (const [name, extension] of Object.entries(EXTENSIONS)) {
    try {
      const { getExtensionPath } = require(extension.package);
      const path = getExtensionPath();

      db.loadExtension(path);

      // Get version
      let version = null;
      try {
        version = db.prepare(`SELECT ${extension.versionFunction}()`).pluck().get();
      } catch (e) {
        // Version function might not exist
      }

      loaded[name] = {
        ...extension,
        path,
        version,
      };

      console.log(`✓ ${name.padEnd(10)} v${version || 'unknown'}`);
      console.log(`  ${extension.description}`);
      console.log();

    } catch (error) {
      console.log(`✗ ${name.padEnd(10)} Not installed`);
      console.log(`  Install with: npm install ${extension.package}`);
      console.log();
    }
  }

  return loaded;
}

/**
 * Example: Vector search with embeddings
 */
function exampleVector(db) {
  console.log('═'.repeat(60));
  console.log('Example 1: Vector Search');
  console.log('═'.repeat(60));
  console.log();

  // Create a table with vector embeddings
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      embedding BLOB
    );
  `);

  // Initialize vector search (384-dimensional Float32 embeddings)
  db.prepare("SELECT vector_init('documents', 'embedding', 'type=FLOAT32,dimension=384')").run();
  console.log('✓ Vector search initialized (384 dimensions, FLOAT32)');

  // Helper function to generate normalized random embeddings
  function generateEmbedding(dimension = 384) {
    const embedding = new Float32Array(dimension);
    for (let i = 0; i < dimension; i++) {
      embedding[i] = Math.random() * 2 - 1;
    }
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    for (let i = 0; i < dimension; i++) {
      embedding[i] /= magnitude;
    }
    return embedding;
  }

  // Insert sample documents with embeddings
  const docs = [
    'Machine learning and artificial intelligence',
    'Database systems and query optimization',
    'Web development with JavaScript',
    'Vector embeddings for semantic search',
  ];

  const insertStmt = db.prepare('INSERT INTO documents (content, embedding) VALUES (?, ?)');
  for (const doc of docs) {
    const embedding = generateEmbedding();
    insertStmt.run(doc, Buffer.from(embedding.buffer));
  }
  console.log(`✓ Inserted ${docs.length} documents with embeddings`);

  // Quantize vectors for fast approximate search
  db.prepare("SELECT vector_quantize('documents', 'embedding')").run();
  // Optional preload quantized version in memory (for a 4x/5x speedup)
  db.prepare("SELECT vector_quantize_preload('documents', 'embedding')").run();
  console.log('✓ Vectors quantized for fast search');
  console.log();

  // Perform similarity search
  const queryEmbedding = generateEmbedding();
  const results = db.prepare(`
    SELECT d.content, v.distance
    FROM documents AS d
    JOIN vector_quantize_scan('documents', 'embedding', ?, 3) AS v
      ON d.id = v.rowid
    ORDER BY v.distance ASC
  `).all(Buffer.from(queryEmbedding.buffer));

  console.log('Top 3 similar documents:');
  results.forEach((row, i) => {
    console.log(`  ${i + 1}. ${row.content}`);
    console.log(`     Distance: ${row.distance.toFixed(4)}`);
  });
  console.log();
}

/**
 * Example: Database synchronization
 */
function exampleSync(db) {
  console.log('═'.repeat(60));
  console.log('Example 2: Database Synchronization');
  console.log('═'.repeat(60));
  console.log();

  // Create a table for sync
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Initialize CloudSync with CLS CRDT algorithm
  db.prepare("SELECT cloudsync_init('tasks', 'cls')").run();
  console.log('✓ CloudSync initialized for tasks table (CLS algorithm)');

  // Insert some data using cloudsync_uuid() for primary keys
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, completed, created_at)
    VALUES (cloudsync_uuid(), ?, ?, ?)
  `);

  insertTask.run('Write documentation', 1, Date.now());
  insertTask.run('Test extensions', 0, Date.now());
  insertTask.run('Deploy to production', 0, Date.now());
  console.log('✓ Inserted 3 tasks with auto-generated UUIDs');

  // Get sync status
  const isEnabled = db.prepare("SELECT cloudsync_is_enabled('tasks')").pluck().get();
  console.log(`✓ Sync enabled: ${isEnabled === 1 ? 'Yes' : 'No'}`);

  console.log();
  console.log('Note: To sync with a remote server, use:');
  console.log('  cloudsync_network_init("connection-string")');
  console.log('  cloudsync_network_sync()');
  console.log();
}

/**
 * Example: JavaScript user-defined functions
 */
function exampleJS(db) {
  console.log('═'.repeat(60));
  console.log('Example 3: JavaScript Functions');
  console.log('═'.repeat(60));
  console.log();

  // Create a scalar function to slugify text
  db.prepare(`
    SELECT js_create_scalar('slugify',
      '(function(args) {
        return args[0].toString().toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      })'
    )
  `).run();
  console.log('✓ Created slugify() function');

  // Use the custom function
  const slug = db.prepare("SELECT slugify('Hello World! This is a Test')").pluck().get();
  console.log(`  slugify("Hello World! This is a Test") = "${slug}"`);
  console.log();

  // Create a custom function to calculate factorial
  db.prepare(`
    SELECT js_create_scalar('factorial',
      '(function(args) {
        const n = args[0];
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
      })'
    )
  `).run();
  console.log('✓ Created factorial() function');

  const fact5 = db.prepare("SELECT factorial(5)").pluck().get();
  console.log(`  factorial(5) = ${fact5}`);
  console.log();

  // Evaluate JavaScript directly
  const result = db.prepare("SELECT js_eval('Math.PI * 2')").pluck().get();
  console.log('✓ Direct JavaScript evaluation:');
  console.log(`  js_eval("Math.PI * 2") = ${result}`);
  console.log();
}

/**
 * Example: AI inference (placeholder)
 */
function exampleAI(db) {
  console.log('═'.repeat(60));
  console.log('Example 4: AI Inference');
  console.log('═'.repeat(60));
  console.log();

  console.log('AI extension loaded successfully!');
  console.log();
  console.log('To use AI features:');
  console.log('  1. Load a GGUF model:');
  console.log('     SELECT llm_model_load(\'models/llama-2-7b.gguf\', \'context_size=4096,n_gpu_layers=99\');');
  console.log();
  console.log('  2. Create an inference context:');
  console.log('     SELECT llm_context_create("n_ctx=2048,n_threads=6")');
  console.log();
  console.log('  3. Generate text:');
  console.log('     SELECT llm_text_generate(\'What is the most beautiful city in Italy?\');');
  console.log();
  console.log('  4. Generate embeddings:');
  console.log('     SELECT llm_embed_generate(\'hello world\', \'json_output=1\');');
  console.log();
}

function exampleCombination(db, loaded) {
  if (!loaded.vector || !loaded.js) return;

  console.log('═'.repeat(60));
  console.log('Example 5: Combining Extensions');
  console.log('═'.repeat(60));
  console.log();

  console.log('✓ Vector + Sync: Synchronized vector databases');
  console.log('✓ Vector + AI: Generate embeddings with AI models');
  console.log('✓ All combined: AI-powered semantic search with sync');
  console.log();
}

function main() {
  // Create in-memory database
  const db = new Database(':memory:');

  console.log();
  console.log('SQLite Extensions - Comprehensive Example');
  console.log();

  // Load all available extensions
  const loaded = loadExtensions(db);

  const loadedCount = Object.keys(loaded).length;
  if (loadedCount === 0) {
    console.log('No extensions loaded. Install at least one extension to continue.');
    console.log('Run: npm install');
    db.close();
    return;
  }

  console.log(`Loaded ${loadedCount} extension(s)\n`);

  // Run examples for each loaded extension
  if (loaded.vector) {
    exampleVector(db);
  }

  if (loaded.sync) {
    exampleSync(db);
  }

  if (loaded.js) {
    exampleJS(db);
  }

  if (loaded.ai) {
    exampleAI(db);
  }

  // Show combination possibilities
  if (loadedCount > 1) {
    exampleCombination(db, loaded);
  }

  // Cleanup
  db.close();
  console.log('═'.repeat(60));
  console.log('Database closed.');
  console.log('═'.repeat(60));
}

// Run the example
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = { loadExtensions, EXTENSIONS };
