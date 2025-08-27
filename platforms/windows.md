## Windows

This guide explains how to install SQLite on Windows with support for loading extensions.

## Using SQLite with Python

1. **Download Python**  
  Get the latest Python for Windows from [python.org](https://www.python.org/downloads/windows/).

2. **Install Python**  
  - Run the installer.
  - Make sure to check **"Add Python to PATH"**.
  - SQLite comes bundled with Python, no extra steps needed.

3. **Check your installation**  
  Open Command Prompt and run:
  ```bash
  python --version
  python -c "import sqlite3; print('SQLite version:', sqlite3.sqlite_version)"
  ```

See the [Python example](../examples/python/load_extension.py) for how to load SQLite extensions.

## Using SQLite with C#

- Download [NuGet package manager](https://learn.microsoft.com/en-us/nuget/install-nuget-client-tools?tabs=windows).
- Install the NuGet package for SQLite: [`Microsoft.Data.Sqlite`](https://www.nuget.org/packages/Microsoft.Data.Sqlite).

```bash
dotnet add package Microsoft.Data.Sqlite
```

For C# examples and setup instructions, check the [examples/c-sharp](../examples/c-sharp/) folder.