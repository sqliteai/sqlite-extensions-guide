# Android Integration

This guide shows how to integrate a SQLite extension named `cloudsync.so` into your Android application. Since extension loading is disabled by default in Android's SQLite implementation, you need an alternative SQLite library that supports extensions.

This example uses the [requery:sqlite-android](https://github.com/requery/sqlite-android) library, but other options include building a custom SQLite with extension support or using other third-party SQLite libraries that enable extension loading.

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
