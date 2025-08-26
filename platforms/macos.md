Here’s a detailed guide for **loading a SQLite extension on macOS using Swift**, considering the key differences between the two platforms.

---

## 🔧 Requirements

- Xcode installed
- SQLite compiled with loadable extension support
- Swift project (macOS/iOS)
- For Python: Homebrew-installed Python

---

## 🖥️ macOS

On macOS, dynamic libraries (`.dylib`) can be loaded at runtime using SQLite’s `sqlite3_load_extension` API.

### 🐍 Python on macOS

The default Python on macOS doesn't support loading SQLite extensions. Use Homebrew Python instead:

```bash
brew install python
```

Create a virtual environment using Homebrew Python:

```bash
/usr/local/opt/python@3/libexec/bin/python -m venv my-venv
source my-venv/bin/activate
```

Or create an alias in your shell profile (`.bashrc`, `.zshrc`, ...):

```bash
alias python3-brew="/usr/local/opt/python@3/libexec/bin/python"
```

Then use `python3-brew -m venv my-venv`

Now you can load extensions in Python by following the [Python example](examples/python).


### 🦉 Swift on macOS

### ✅ Step 1: Add Bridging Header (if using Swift only)

Create a `bridging-header.h` file:

```c
#include <sqlite3.h>
```

Set it in your Xcode project under **Build Settings → Objective-C Bridging Header**.

### ✅ Step 2: Swift Code to Load Extension

```swift
import Foundation
import SQLite3

let dbPath = ":memory:" // or a real file path
var db: OpaquePointer?

if sqlite3_open(dbPath, &db) != SQLITE_OK {
    fatalError("Failed to open database")
}

// Enable loading extensions
if sqlite3_enable_load_extension(db, 1) != SQLITE_OK {
    let err = String(cString: sqlite3_errmsg(db))
    fatalError("Enable extension loading failed: \(err)")
}

// Load the extension
let extensionPath = Bundle.main.path(forResource: "my_extension", ofType: "dylib")!
if sqlite3_load_extension(db, extensionPath, nil, nil) != SQLITE_OK {
    let err = String(cString: sqlite3_errmsg(db))
    fatalError("Extension loading failed: \(err)")
}

print("Extension loaded successfully.")
```

> ⚠️ Gatekeeper may block unsigned `.dylib` files. You might need to codesign or use `spctl --add`.

