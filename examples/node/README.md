# JavaScript/Node.js Examples

Examples for using SQLite extensions from `@sqliteai` in Node.js applications.

## Available Extensions

| Extension | Package | Repository |
|-----------|---------|------------|
| **vector** | [`@sqliteai/sqlite-vector`](https://www.npmjs.com/package/@sqliteai/sqlite-vector) | [github.com/sqliteai/sqlite-vector](https://github.com/sqliteai/sqlite-vector) |
| **cloudsync** | [`@sqliteai/sqlite-sync`](https://www.npmjs.com/package/@sqliteai/sqlite-sync) | [github.com/sqliteai/sqlite-sync](https://github.com/sqliteai/sqlite-sync) |
| **js** | [`@sqliteai/sqlite-js`](https://www.npmjs.com/package/@sqliteai/sqlite-js) | [github.com/sqliteai/sqlite-js](https://github.com/sqliteai/sqlite-js) |
| **ai** | [`@sqliteai/sqlite-ai`](https://www.npmjs.com/package/@sqliteai/sqlite-ai) | [github.com/sqliteai/sqlite-ai](https://github.com/sqliteai/sqlite-ai) |

## Prerequisites

```bash
# Install required dependencies
npm install better-sqlite3

# Install one or more extensions
npm install @sqliteai/sqlite-vector
npm install @sqliteai/sqlite-sync
npm install @sqliteai/sqlite-js
npm install @sqliteai/sqlite-ai
```

## Example

**File:** [`example.js`](./example.js)

Comprehensive example showing how to load and use all SQLite extensions together.

```bash
npm start
# or
node example.js
```

**Features:**
- Load all four extensions (vector, sync, js, ai)
- Automatic version detection
- Example 1: Vector search with embeddings and quantization
- Example 2: Database synchronization with CloudSync
- Example 3: JavaScript user-defined functions (slugify, factorial, eval)
- Example 4: AI inference setup instructions
- Example 5: Combining extensions for powerful workflows
- Graceful handling of missing extensions

## Quick Start

1. **Clone or download the examples:**
   ```bash
   cd sqlite-extensions-guide/examples/node
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the example:**
   ```bash
   npm start
   ```

## Load Extension

```javascript
const { getExtensionPath } = require('@sqliteai/sqlite-vector'); // or @sqliteai/sqlite-sync @sqliteai/sqlite-js @sqliteai/sqlite-ai
const Database = require('better-sqlite3');

const db = new Database(':memory:');
db.loadExtension(getExtensionPath());

// Get the extension version
db.prepare("SELECT vector_version()").pluck().get(); // or cloudsync_version() js_version() ai_version()
```

## Platform Support

All extensions support:
- **macOS**: ARM64 (Apple Silicon), x64 (Intel)
- **Linux**: ARM64, x64 (both glibc and musl/Alpine)
- **Windows**: x64

Extensions are automatically installed for your platform via `optionalDependencies`.

## Related Documentation

- [SQLite Vector Documentation](https://github.com/sqliteai/sqlite-vector)
- [SQLite Sync Documentation](https://github.com/sqliteai/sqlite-sync)
- [SQLite JS Documentation](https://github.com/sqliteai/sqlite-js)
- [SQLite AI Documentation](https://github.com/sqliteai/sqlite-ai)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)

## Contributing

Found an issue or have an improvement? Please open an issue or pull request on the respective repository.

## License

See individual package licenses for details.
