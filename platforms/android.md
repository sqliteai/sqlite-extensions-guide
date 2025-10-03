# Android Integration

This guide shows how to integrate SQLite extensions into your Android application. Since extension loading is disabled by default in Android's SQLite implementation, you need an alternative SQLite library that supports extensions.

We recommend using the [requery:sqlite-android](https://github.com/requery/sqlite-android) library, which provides full SQLite extension support. There are two approaches to using SQLite extensions on Android:

1. **Using AAR packages** (Recommended) - Extensions distributed via Maven Central or JitPack
2. **Manually bundling `.so` files** - For custom or pre-compiled extensions

---

## Method 1: Using AAR Packages (Recommended)

SQLite AI extensions are distributed as AAR (Android Archive) packages via Maven Central and JitPack. This is the easiest method as dependencies are automatically resolved and native libraries are extracted at installation time.

### Available Extensions

- **[sqlite-vector](https://github.com/sqliteai/sqlite-vector)** - Vector similarity search
- **[sqlite-js](https://github.com/sqliteai/sqlite-js)** - JavaScript execution in SQLite
- **[sqlite-sync](https://github.com/sqliteai/sqlite-sync)** - Cloud synchronization
- **[sqlite-ai](https://github.com/sqliteai/sqlite-ai)** - AI/ML functionality

### Installation

Add the required repositories and dependencies to your `build.gradle` or `build.gradle.kts`:

**Gradle (Groovy):**
```groovy
repositories {
    google()
    mavenCentral()
    maven { url 'https://jitpack.io' }
}

dependencies {
    // SQLite library with extension support (required)
    implementation 'com.github.requery:sqlite-android:3.49.0'

    // SQLite AI extensions (Maven Central)
    implementation 'ai.sqlite:vector:0.9.34'
    implementation 'ai.sqlite:js:1.1.12'
    implementation 'ai.sqlite:sync:0.8.41'
    implementation 'ai.sqlite:ai:0.7.55'

    // Alternative: Use JitPack instead
    // implementation 'com.github.sqliteai:sqlite-vector:0.9.32'
    // implementation 'com.github.sqliteai:sqlite-js:1.1.12'
    // implementation 'com.github.sqliteai:sqlite-sync:0.8.41'
    // implementation 'com.github.sqliteai:sqlite-ai:0.7.55'
}
```

**Kotlin Gradle (build.gradle.kts):**
```kotlin
repositories {
    google()
    mavenCentral()
    maven(url = "https://jitpack.io")
}

dependencies {
    // SQLite library with extension support (required)
    implementation("com.github.requery:sqlite-android:3.49.0")

    // SQLite AI extensions (Maven Central)
    implementation("ai.sqlite:vector:0.9.34")
    implementation("ai.sqlite:js:1.1.12")
    implementation("ai.sqlite:sync:0.8.41")
    implementation("ai.sqlite:ai:0.7.55")
}
```

### Enable Native Library Extraction

Add `android:extractNativeLibs="true"` to your `AndroidManifest.xml`:

```xml
<application
    android:extractNativeLibs="true"
    ...>
</application>
```

This is **required** because SQLite's `sqlite3_load_extension()` needs a file path to load extensions. By default, Android API 23+ keeps native libraries compressed inside the APK. Setting `extractNativeLibs="true"` extracts `.so` files to the device filesystem where SQLite can access them.

### Complete Working Example

For a complete, working Android application demonstrating multiple SQLite extensions, see:

**[examples/android](../examples/android/README.md)**

This example shows how to:
- Load multiple extensions (vector, js, sync, ai)
- Configure the database with extension support
- Verify extensions are loaded correctly
- Use extension functions in SQL queries

---

## Method 2: Manually Bundling Extensions

If you have custom `.so` files or pre-compiled extensions not available as AAR packages, you can manually bundle them in your app's assets and load them at runtime.

### Prerequisites

This method uses the [requery:sqlite-android](https://github.com/requery/sqlite-android) library, but other options include building a custom SQLite with extension support or using other third-party SQLite libraries that enable extension loading.

### 1. Add Dependencies

In your `app/build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.github.requery:sqlite-android:3.49.0")
}
```

### 2. Bundle the Extension

Place your `cloudsync.so` file in:
`app/src/main/assets/lib/cloudsync.so`

### 3. Basic Integration

Here’s a complete example showing how to load the extension, create a table, initialize CloudSync, and perform network sync.

```kotlin
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import io.requery.android.database.sqlite.SQLiteCustomExtension
import io.requery.android.database.sqlite.SQLiteCustomFunction
import io.requery.android.database.sqlite.SQLiteDatabase
import io.requery.android.database.sqlite.SQLiteDatabaseConfiguration
import io.requery.android.database.sqlite.SQLiteFunction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

class MainActivity : ComponentActivity() {
    private fun copyExtensionToFilesDir(context: Context): File {
        val assetManager = context.assets
        val inputStream = assetManager.open("lib/cloudsync.so")

        val outFile = File(context.filesDir, "cloudsync.so")
        inputStream.use { input ->
            FileOutputStream(outFile).use { output ->
                input.copyTo(output)
            }
        }
        return outFile
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // --- Copy extension from assets to filesystem ---
        val extensionFile = copyExtensionToFilesDir(this)
        val extensionPath = extensionFile.absolutePath

        // --- Create extension configuration ---
        val cloudSyncExtension = SQLiteCustomExtension(extensionPath, null)

        // --- Configure database with extension ---
        val config = SQLiteDatabaseConfiguration(
            "${filesDir.path}/database_name.db",
            SQLiteDatabase.CREATE_IF_NECESSARY or SQLiteDatabase.OPEN_READWRITE,
            emptyList<SQLiteCustomFunction>(),
            emptyList<SQLiteFunction>(),
            listOf(cloudSyncExtension)
        )

        // --- Open database ---
        val db = SQLiteDatabase.openDatabase(config, null, null)
        val tableName = "table_name"

        lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                // --- Check CloudSync version ---
                val version = db.rawQuery("SELECT cloudsync_version();", null).use { cursor ->
                    if (cursor.moveToFirst()) cursor.getString(0) else null
                }

                if (version == null) {
                    println("CLOUDSYNC-TEST: Failed to load SQLite Sync extension")
                    return@withContext
                }

                println("CLOUDSYNC-TEST: SQLite Sync loaded successfully. Version: $version")

                try {
                    // --- Create test table ---
                    val createTableSQL = """
                        CREATE TABLE IF NOT EXISTS $tableName (
                          id TEXT PRIMARY KEY NOT NULL,
                          value TEXT NOT NULL DEFAULT '',
                          created_at TEXT DEFAULT CURRENT_TIMESTAMP
                        );
                    """.trimIndent()
                    db.execSQL(createTableSQL)

                    // --- Initialize CloudSync for table ---
                    val initResult = db.rawQuery("SELECT cloudsync_init('$tableName');", null).use { it.moveToFirst() }

                    // --- Insert sample data ---
                    db.execSQL("""
                        INSERT INTO $tableName (id, value) VALUES
                            (cloudsync_uuid(), 'test1'),
                            (cloudsync_uuid(), 'test2');
                    """.trimIndent())

                    // --- Initialize network connection ---
                    db.rawQuery("SELECT cloudsync_network_init('<connection-string>');", null).use { it.moveToFirst() }

                    // --- Set API key ---
                    db.rawQuery( "SELECT cloudsync_network_set_apikey('<api-key>');", null).use { it.moveToFirst() }

                    // --- Run network sync multiple times ---
                    // Note: cloudsync_network_sync() returns > 0 if data was sent/received.
                    // It should ideally be called periodically to ensure both sending local
                    // changes and receiving remote changes work reliably.
                    repeat(2) { attempt ->
                        try {
                            val syncResult = db.rawQuery("SELECT cloudsync_network_sync();", null).use { cursor ->
                                if (cursor.moveToFirst()) cursor.getInt(0) else 0
                            }
                            println("CLOUDSYNC-TEST: Network sync attempt ${attempt + 1}: result = $syncResult")
                        } catch (e: Exception) {
                            println("CLOUDSYNC-TEST: Sync attempt ${attempt + 1} failed: ${e.message}")
                        }
                    }
                } catch (e: Exception) {
                    println("CLOUDSYNC-TEST: Error - ${e.message}")
                } finally {
                    // --- Terminate CloudSync ---
                    db.rawQuery("SELECT cloudsync_terminate();", null).use { it.moveToFirst() }

                    // Close the database
                    db.close()
                }
            }
        }
    }
}
```

### 4. Notes on SQLite Usage in Android

CloudSync functions must be executed with `SELECT`. In Android, use `rawQuery()` to call them, and always call `moveToFirst()` (or `moveToNext()`) on the cursor to ensure the query actually executes.

For detailed SQLite Sync API documentation, see the main [documentation](https://github.com/sqliteai/sqlite-sync/blob/main/README.md).
