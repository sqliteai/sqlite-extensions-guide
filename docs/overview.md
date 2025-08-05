# Overview: What Are SQLite Extensions?

SQLite extensions allow developers to extend SQLite’s capabilities by adding:

- New scalar or aggregate functions
- Custom collation sequences
- Virtual tables
- User-defined data types
- Enhanced I/O or full-text indexing

The official SQLite extension guide is available at [https://sqlite.org/loadext.html](https://sqlite.org/loadext.html)

---

## Extension Formats

Depending on the platform, compiled extensions will have different formats:

| Platform | File Extension |
|----------|----------------|
| Linux    | `.so`          |
| Android  | `.so`          |
| macOS    | `.dylib`       |
| iOS      | `.dylib`       |
| Windows  | `.dll`         |

---

## Typical Use Cases

- Add vector similarity search to SQLite (e.g., `sqlite-vector`)
- Implement AI/ML inference at the edge (e.g., `sqlite-ai`)
- Enable JavaScript inside SQLite (e.g., `sqlite-js`)
- Sync data to the cloud (e.g., `sqlite-sync`)

---

## Loading Extensions

Extensions can be loaded dynamically at runtime via:

- Programmatic APIs (`sqlite3_load_extension`)
- SQL command (`SELECT load_extension(...)`)
- Automatic loading (when supported)

See the [Loading Extensions](loading.md) section for examples.

---

## Security Considerations

By default, some SQLite builds (especially in Python or mobile platforms) **disable extension loading** due to security risks. You'll need to explicitly enable it in most environments.
