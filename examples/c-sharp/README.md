# Load a SQLite Extension on Windows with C# (`Microsoft.Data.Sqlite`) — `sqlite-vector.dll`

This guide shows how to load a native SQLite extension named **`sqlite-vector.dll`** from a C# app on **Windows** using **`Microsoft.Data.Sqlite`**.

> Works with .NET 6/7/8 and x64 Windows. Make sure your app, `e_sqlite3.dll` (the SQLite runtime bundled by `Microsoft.Data.Sqlite`), and `sqlite-vector.dll` are all the **same architecture** (typically x64).

---

## Prerequisites

* Windows x64
* .NET 6+ SDK
* The native extension file: `sqlite-vector.dll` (x64 build)

> If your extension depends on other DLLs, ensure those are available in the same directory or on `PATH`.


---

## Project layout

Place `sqlite-vector.dll` in your project and mark it to copy to the output folder so it sits next to your app at runtime.

**Directory example**

```
MyApp/
  Program.cs
  Native/
    sqlite-vector.dll
  MyApp.csproj
```

## Quickstart (recommended API)

Use the built-in extension APIs: **`EnableExtensions()`** and **`LoadExtension()`**.


## Alternative: SQL `load_extension(...)`

If you prefer raw SQL:

```csharp
using var conn = new SqliteConnection("Data Source=example.db");
conn.Open();
conn.EnableExtensions(); // must still be called

using var load = conn.CreateCommand();
load.CommandText = "SELECT load_extension('sqlite-vector');";
load.ExecuteNonQuery();
```

---

## Where should `sqlite-vector.dll` live?

At runtime, SQLite will search:

1. The **process working directory**
2. The **application base directory** (where your `.exe` lives)
3. Any directories on the **`PATH`** environment variable
4. The full path you provide to `LoadExtension(...)`

Most apps simply copy the DLL to the output folder (next to `MyApp.exe`).
If you prefer a central location, add that folder to `PATH` before starting the app.

---

## Common pitfalls & fixes

* **`SqliteException: not authorized`**
  You forgot to enable extension loading. Call `conn.EnableExtensions()` **before** loading.

* **`SqliteException: The specified module could not be found`**
  `sqlite-vector.dll` isn't in a probed location, or a **dependency DLL** is missing.
  Fix: Put the DLL next to your `.exe`, or use an **absolute path** in `LoadExtension`, and ensure all dependent DLLs are present / on `PATH`.

* **`BadImageFormatException`**
  Architecture mismatch. Ensure your app, `e_sqlite3.dll`, and `sqlite-vector.dll` are **all x64** (or all x86).

* **`EntryPointNotFoundException` or `not an extension`**
  The extension wasn't built as a **SQLite loadable extension** (must export `sqlite3_extension_init` or your specified entry point).

* **Windows "blocked" DLL**
  If you downloaded the DLL from the internet, right-click → **Properties** → check **Unblock** → OK.


## Verifying the extension is active

After loading, call a function or create a virtual table provided by the extension. For example:

```csharp
using var cmd = conn.CreateCommand();
cmd.CommandText = "SELECT vector_version();"; // replace with a function shipped by your extension
var result = cmd.ExecuteScalar();
Console.WriteLine("vector_version(): " + result);
```

If the call succeeds (no `no such function` error), the extension is loaded and working.


## Deployment tips

* Include `sqlite-vector.dll` in your publish output:

  ```bash
  dotnet publish -c Release -r win-x64 --self-contained false
  ```

  Ensure your `.csproj` copy rule (shown above) includes the DLL.

* If your extension has extra native dependencies, ship them **in the same folder** as the app or add their location to `PATH` at app startup.
