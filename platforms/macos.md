## macOS

This guide explains how to install SQLite on macOS with support for loading extensions.

## macOS and xcframework

On recent versions of macOS, the recommended way to load a SQLite extension is through the [.xcframework](https://github.com/sqliteai/sqlite-extensions-guide/blob/main/platforms/ios.md) approach, the same method used on iOS.


## macOS and dylib

On macOS, dynamic libraries (`.dylib`) can be loaded at runtime using SQLite’s `sqlite3_load_extension` API.

### Step 1: Add Bridging Header (if using Swift only)

Create a `bridging-header.h` file:

```c
#include <sqlite3.h>
```

Set it in your Xcode project under **Build Settings → Objective-C Bridging Header**.

### Step 2: Swift Code to Load Extension

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


## Python on macOS

The default Python on macOS doesn't support loading SQLite extensions. 
Install Python from the [official package](https://www.python.org/downloads/macos/) or use Homebrew Python instead:

```bash
brew install python
```

Verify that you are using the Homebrew-installed `python3` by running:

```bash
which python3

# /opt/homebrew/bin/python3
```

After installing Python with Homebrew, the `python` command now uses the Homebrew version.  
You can now load SQLite extensions in Python as shown in the [Python example](examples/python).