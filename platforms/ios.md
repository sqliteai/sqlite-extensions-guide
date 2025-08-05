Here’s a detailed guide for **loading a SQLite extension on iOS using Swift**, considering the key differences between the two platforms.

---

## 🔧 Requirements

- Xcode installed
- SQLite compiled with loadable extension support
- Swift project (macOS/iOS)

---

## 📱 iOS

### ⚠️ Important Restrictions

* **iOS does not allow dynamic library loading at runtime**.
* `.dylib`/`.so` loading via `sqlite3_load_extension` is blocked by iOS sandbox rules.
* You **must statically link** the extension into your app at build time OR **use an xcframework**.

---

### ✅ Step 1: Add Extension Source Code to Your Project

Instead of building a `.dylib`, include the C files directly (e.g., `my_extension.c`, `my_extension.h`) in your Xcode project.

Ensure `sqlite3_extension_init` is defined in the C file.

---

### ✅ Step 2: Modify the Build Flags

In Xcode, go to:

* **Build Settings → Other C Flags** → add:

  ```
  -DSQLITE_CORE
  ```

This ensures that SQLite recognizes statically linked extensions.

---

### ✅ Step 3: Initialize Extension in Swift

```swift
import Foundation
import SQLite3

var db: OpaquePointer?
if sqlite3_open(":memory:", &db) != SQLITE_OK {
    fatalError("Failed to open database")
}

// Since it's statically linked, no need to call sqlite3_load_extension.
// Just use it:
let stmt = "SELECT my_custom_function(42);"
var query: OpaquePointer?
if sqlite3_prepare_v2(db, stmt, -1, &query, nil) == SQLITE_OK {
    if sqlite3_step(query) == SQLITE_ROW {
        let value = sqlite3_column_int(query, 0)
        print("Result: \(value)")
    }
    sqlite3_finalize(query)
} else {
    let err = String(cString: sqlite3_errmsg(db))
    fatalError("Query failed: \(err)")
}
```
