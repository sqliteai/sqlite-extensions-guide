# Android Integration

This guide shows how to integrate a SQLite extension named `extension.so` into your Android application. Since extension loading is disabled by default in Android's SQLite implementation, you need an alternative SQLite library that supports extensions. 

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
`app/src/main/assets/lib/extension.so`

### 3. Basic Integration

```kotlin
import android.content.Context
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
        val inputStream = assetManager.open("lib/extension.so")

        val outFile = File(context.filesDir, "extension.so")
        inputStream.use { input ->
            FileOutputStream(outFile).use { output ->
                input.copyTo(output)
            }
        }
        return outFile
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Copy extension from assets to filesystem
        val extensionFile = copyExtensionToFilesDir(this)
        val extensionPath = extensionFile.absolutePath
        
        // Create extension configuration
        val cloudSyncExtension = SQLiteCustomExtension(extensionPath, null)

        // Configure database with extension
        val config = SQLiteDatabaseConfiguration(
            "${filesDir.path}/test.db",
            SQLiteDatabase.CREATE_IF_NECESSARY or SQLiteDatabase.OPEN_READWRITE,
            emptyList<SQLiteCustomFunction>(),
            emptyList<SQLiteFunction>(),
            listOf(cloudSyncExtension)
        )

        // Open database
        val db = SQLiteDatabase.openDatabase(config, null, null)

        // Test extension loading
        lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                val cursor = db.rawQuery("SELECT my_custom_function();", null)
                val version = if (cursor.moveToFirst()) cursor.getString(0) else null
                cursor.close()

                if (version != null) {
                    println("SQLite extension loaded successfully.")
                } else {
                    println("Failed to load SQLite extension")
                }
            }
        }
    }
}
```

For detailed SQLite Sync API documentation, see the main [documentation](../../README.md).
