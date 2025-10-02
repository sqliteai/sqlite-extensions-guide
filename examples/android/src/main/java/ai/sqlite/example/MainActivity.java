package ai.sqlite.example;

import android.database.Cursor;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import io.requery.android.database.sqlite.SQLiteCustomExtension;
import io.requery.android.database.sqlite.SQLiteDatabase;
import io.requery.android.database.sqlite.SQLiteDatabaseConfiguration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private TextView resultTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        resultTextView = findViewById(R.id.result_text);
        setupCustomSQLiteWithExtensions();
    }

    private String getLibraryPath(String libraryName) {
        return getApplicationInfo().nativeLibraryDir + "/" + libraryName;
    }

    private List<SQLiteCustomExtension> loadExtensions(String... extensionNames) {
        List<SQLiteCustomExtension> extensions = new ArrayList<>();
        for (String extensionName : extensionNames) {
            extensions.add(new SQLiteCustomExtension(getLibraryPath(extensionName), null));
        }
        return extensions;
    }

    private void setupCustomSQLiteWithExtensions() {
        try {
            List<SQLiteCustomExtension> extensions = loadExtensions("vector", "js");

            SQLiteDatabaseConfiguration config = new SQLiteDatabaseConfiguration(
                getCacheDir().getPath() + "/ext_test.db",
                SQLiteDatabase.CREATE_IF_NECESSARY | SQLiteDatabase.OPEN_READWRITE,
                Collections.emptyList(),
                Collections.emptyList(),
                extensions
            );

            SQLiteDatabase db = SQLiteDatabase.openDatabase(config, null, null);

            testExtVersionWithCustomSQLite(db, "vector");
            testExtVersionWithCustomSQLite(db, "js");

            db.close();
        } catch (Exception e) {
            resultTextView.setText("❌ Error: " + e.getMessage());
        }
    }

    private void testExtVersionWithCustomSQLite(SQLiteDatabase db, String extName) {
        Cursor cursor = db.rawQuery("SELECT " + extName + "_version()", null);
        if (cursor.moveToFirst()) {
            String version = cursor.getString(0);
            resultTextView.append("\n" + extName + "_version(): " + version);
        }
        cursor.close();
    }
}