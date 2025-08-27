using System;
using Microsoft.Data.Sqlite;

class Program
{
    static void Main()
    {
        // Example DB file; can also use :memory:
        var cs = new SqliteConnectionStringBuilder
        {
            DataSource = "example.db",
            Mode = SqliteOpenMode.ReadWriteCreate
        }.ToString();

        using var conn = new SqliteConnection(cs);
        conn.Open();

        // 1) Allow loading extensions in this connection
        conn.EnableExtensions();

        // 2) Load the native extension (DLL must be next to the EXE or on PATH)
        // You can pass an absolute path if you prefer.
        conn.LoadExtension("sqlite-vector");

        // 3) (Optional) Verify extension features are available
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT sqlite_version();";
        Console.WriteLine("SQLite version: " + cmd.ExecuteScalar());

        // Example: call a function or create a virtual table that the extension provides
        // cmd.CommandText = "SELECT vector_version();";
        // Console.WriteLine("vector_version(): " + cmd.ExecuteScalar());
    }
}