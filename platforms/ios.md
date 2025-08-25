# Load Extension Guide for Swift

This guide will walk you through setting up SQLite in Swift to load SQLiteAI extensions.

## 1. Create a New Swift Project

1. Open Xcode
2. Create a new project
3. Select **Multiplatform** → **App**

## 2. Download and Add CloudSync Framework

1. Download the latest version of `cloudsync-apple-xcframework` from:  
   https://github.com/sqliteai/sqlite-sync/releases

2. In Xcode, click on your project name in the source tree (top left with the Xcode logo)

3. In the new tab that opens, navigate to the left column under the **Targets** section and click on the first target

4. You should now be in the **General** tab. Scroll down to **"Frameworks, Libraries, and Embedded Content"**

5. Click the **+** button → **Add Other...** → **Add Files...**

6. Select the downloaded `CloudSync.xcframework` folder

7. Switch to the **Build Phases** tab and verify that `CloudSync.xcframework` appears under **Embedded Frameworks**

## 3. Handle Security Permissions (macOS)

When you return to the main ContentView file, you may encounter an Apple security error:

1. Click **Done** when the security dialog appears
2. Open **System Settings** → **Privacy & Security**
3. Scroll to the bottom and find the message "Mac blocked CloudSync"
4. Click **Allow Anyway**
5. Close and reopen ContentView in Xcode
6. The same error should appear but now with a third button **Open Anyway** - click it
7. If errors persist, try reopening and closing ContentView multiple times or repeat the security steps above

## 4. Set Up SQLite with Extension Loading

You need a version of SQLite that supports loading extensions. You have two options:

### Option A: Download SQLite Amalgamation (Recommended)
1. Download the amalgamation from: https://sqlite.org/download.html
2. Create a new folder called **SQLite** in your Swift project in Xcode
3. Copy `sqlite3.c` and `sqlite3.h` into this folder by dragging them in
4. Enable all targets and confirm

### Option B: Use CocoaPods

## 5. Configure Objective-C Bridging Header

1. When you add the SQLite files, a popup will appear asking **"Would you like to configure an Objective-C bridging header?"**
2. Click **Create Bridging Header**
3. In the newly created bridging header file, import the SQLite headers:
   ```objc
   #import "sqlite3.h"
   ```

## 6. Test the Setup

To verify that the extension loads correctly in your Swift project, replace your ContentView.swift content with this test code:

```swift
//
//  ContentView.swift
//  loadSQLiteAIExtension
//
//  Created by Gioele Cantoni on 18/08/25.
//

import SwiftUI

struct ContentView: View {
    @State private var statusLines: [String] = []
    private var statusText: String { statusLines.joined(separator: "\n") }

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")

            Divider()

            Text("Status")
                .font(.headline)

            ScrollView {
                Text(statusText.isEmpty ? "No status yet." : statusText)
                    .font(.system(.footnote, design: .monospaced))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .textSelection(.enabled)
                    .padding(.vertical, 4)
            }
            .frame(maxHeight: 260)
        }
        .padding()
        .task {
            log("Starting...")
            var db: OpaquePointer?

            // Open an in-memory database just for demonstrating status updates.
            // Replace with your own URL/path if needed.
            var rc = sqlite3_open(":memory:", &db)
            if rc != SQLITE_OK {
                let msg = db.flatMap { sqlite3_errmsg($0) }.map { String(cString: $0) } ?? "Unknown error"
                log("sqlite3_open failed (\(rc)): \(msg)")
                if let db { sqlite3_close(db) }
                return
            }
            log("Database opened.")

            // Enable loadable extensions
            rc = sqlite3_enable_load_extension(db, 1)
            log("sqlite3_enable_load_extension rc=\(rc)")

            // Locate the extension in the bundle (adjust as needed)
            let vendorBundle = Bundle(identifier: "ai.sqlite.cloudsync")
            let candidatePaths: [String?] = [
                vendorBundle?.path(forResource: "CloudSync", ofType: "dylib"),
                vendorBundle?.path(forResource: "CloudSync", ofType: ""),
                Bundle.main.path(forResource: "CloudSync", ofType: "dylib"),
                Bundle.main.path(forResource: "CloudSync", ofType: "")
            ]
            let cloudsyncPath = candidatePaths.compactMap { $0 }.first
            log("cloudsyncPath: \(cloudsyncPath ?? "Not found")")

            var loaded = false
            if let path = cloudsyncPath {
                var errMsg: UnsafeMutablePointer<Int8>? = nil
                rc = sqlite3_load_extension(db, path, nil, &errMsg)
                if rc != SQLITE_OK {
                    let message = errMsg.map { String(cString: $0) } ?? String(cString: sqlite3_errmsg(db))
                    if let e = errMsg { sqlite3_free(e) }
                    log("sqlite3_load_extension failed rc=\(rc): \(message)")
                } else {
                    loaded = true
                    log("sqlite3_load_extension succeeded.")
                }

                // Optionally disable further extension loading
                _ = sqlite3_enable_load_extension(db, 0)
            } else {
                log("Skipping load: extension file not found in bundle.")
            }

            // Run SELECT cloudsync_version() and log the result
            if loaded {
                let sql = "SELECT cloudsync_version()"
                log("Running query: \(sql)")
                var stmt: OpaquePointer?
                rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nil)
                if rc != SQLITE_OK {
                    let msg = String(cString: sqlite3_errmsg(db))
                    log("sqlite3_prepare_v2 failed (\(rc)): \(msg)")
                } else {
                    defer { sqlite3_finalize(stmt) }
                    rc = sqlite3_step(stmt)
                    if rc == SQLITE_ROW {
                        if let cstr = sqlite3_column_text(stmt, 0) {
                            let version = String(cString: cstr)
                            log("cloudsync_version(): \(version)")
                        } else {
                            log("cloudsync_version(): (null)")
                        }
                    } else if rc == SQLITE_DONE {
                        log("cloudsync_version() returned no rows")
                    } else {
                        let msg = String(cString: sqlite3_errmsg(db))
                        log("sqlite3_step failed (\(rc)): \(msg)")
                    }
                }
            } else {
                log("Extension not loaded; skipping cloudsync_version() query.")
            }

            if let db { sqlite3_close(db) }
            log("Done.")
        }
    }

    @MainActor
    private func log(_ line: String) {
        statusLines.append(line)
    }
}

#Preview {
    ContentView()
}
```

## Expected Results

When you run the test app, you should see status messages in the UI indicating:
- Database connection success
- Extension loading status
- CloudSync version information (if successfully loaded)

This confirms that CloudSync is properly integrated and functional in your Swift project.