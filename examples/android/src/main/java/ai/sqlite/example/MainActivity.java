package ai.sqlite.example;

import android.database.Cursor;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import io.requery.android.database.sqlite.SQLiteCustomExtension;
import io.requery.android.database.sqlite.SQLiteDatabase;
import io.requery.android.database.sqlite.SQLiteDatabaseConfiguration;
import java.util.Collections;

public class MainActivity extends AppCompatActivity {
    private TextView resultTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        resultTextView = findViewById(R.id.result_text);
        setupCustomSQLiteWithExtension();
    }

    private String getLibraryPath(String libraryName) {
        return getApplicationInfo().nativeLibraryDir + "/" + libraryName;
    }

    private void setupCustomSQLiteWithExtension() {
        try {
            SQLiteCustomExtension vectorExtension = new SQLiteCustomExtension(getLibraryPath("vector"), null);
            SQLiteDatabaseConfiguration config = new SQLiteDatabaseConfiguration(
                getCacheDir().getPath() + "/vector_test.db",
                SQLiteDatabase.CREATE_IF_NECESSARY | SQLiteDatabase.OPEN_READWRITE,
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.singletonList(vectorExtension)
            );

            SQLiteDatabase db = SQLiteDatabase.openDatabase(config, null, null);
            testVectorVersionWithCustomSQLite(db);

        } catch (Exception e) {
            resultTextView.setText("❌ Error: " + e.getMessage());
        }
    }

    private void testVectorVersionWithCustomSQLite(SQLiteDatabase db) {
        Cursor cursor = db.rawQuery("SELECT vector_version()", null);
        if (cursor.moveToFirst()) {
            String version = cursor.getString(0);
            resultTextView.setText("vector_version(): " + version);
        }
        cursor.close();
        db.close();
    }
}