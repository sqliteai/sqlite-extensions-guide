# SQLite Extension Installation Guide

This repository provides detailed, cross-platform documentation for installing and using SQLite extensions in different environments.

Whether you're working with Python, C, Node.js, or on iOS/Android, this guide walks you through building, loading, and troubleshooting SQLite extensions.

---

## What Are SQLite Extensions?

SQLite extensions allow developers to extend SQLite’s capabilities by adding:

* New scalar or aggregate functions
* Custom collation sequences
* Virtual tables
* User-defined data types
* Enhanced I/O or full-text indexing

The official SQLite extension guide is available at [https://sqlite.org/loadext.html](https://sqlite.org/loadext.html)

---

## Extension Formats

Depending on the platform, compiled extensions will have different formats:

| Platform | File Extension |
| -------- | -------------- |
| Linux    | `.so`          |
| Android  | `.so`          |
| macOS    | `.dylib`       |
| iOS      | `.dylib`       |
| Windows  | `.dll`         |

### Notes:

* **.dylib** is used for iOS/macOS, for Intel and ARM processors. Apple (macOS/iOS) also provides a mechanism to embed different processor architectures (known as “fat” or “universal” binaries) into the same library. This is **not supported** on Linux and Windows.
* **.so** is used for Linux and Android.
* **.dll** is used for Windows.

### Example: Linux Architecture Selection

On Windows and Linux, since universal binaries are not supported, you must explicitly load the extension that matches your system architecture. For example:

```c
if (is_linux_arm) {
    load_extension("sqlite-vector_linux_arm");
} else {
    load_extension("sqlite-vector_linux_x86");
}
```

Note that **you can skip the file extension when loading**. Only the extension name (with full path) is required.
For details, see: [https://www.sqlite.org/c3ref/load\_extension.html](https://www.sqlite.org/c3ref/load_extension.html)

---

## Typical Use Cases

In the examples and sample code throughout this document, we’ll reference specific extensions that we’ve built (such as [sqlite-vector](https://github.com/sqliteai/sqlite-vector), [sqlite-ai](https://github.com/sqliteai/sqlite-ai), [sqlite-js](https://github.com/sqliteai/sqlite-js), and [sqlite-sync](https://github.com/sqliteai/sqlite-sync)). These are concrete illustrations of what’s possible, but the same code patterns and explanations apply to any SQLite extension you might want to develop or integrate. Whether you’re extending SQLite with your own custom functionality or adopting third-party extensions, the techniques remain consistent.
* Add vector similarity search to SQLite (e.g., `sqlite-vector`)
* Implement AI/ML inference at the edge (e.g., `sqlite-ai`)
* Enable JavaScript inside SQLite (e.g., `sqlite-js`)
* Sync data to the cloud (e.g., `sqlite-sync`)

---

## Loading Extensions

Extensions can be loaded dynamically at runtime via:

* Programmatic APIs (`sqlite3_load_extension`)
* SQL command (`SELECT load_extension(...)`)
* Automatic loading (when supported)

Refer to the platform-specific **loading instructions** below:

* [Loading extension on Linux](platforms/linux.md)
* [Loading extension on macOS](platforms/macos.md)
* [Loading extension on Windows](platforms/windows.md)
* [Loading extension on iOS](platforms/ios.md)
* [Loading extension on Android](platforms/android.md)

You can find practical **code samples** for loading SQLite extensions in various programming languages in the [examples](examples) directory.

---

## Security Considerations

By default, some SQLite builds (especially in Python or mobile platforms) **disable extension loading** due to security risks. You'll need to explicitly enable it in most environments.
