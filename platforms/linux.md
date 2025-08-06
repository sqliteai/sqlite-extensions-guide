# Loading SQLite Extensions on Linux

SQLite on Linux supports dynamic extension loading via `.so` shared libraries. 

This guide walks through how to load an extension named `my_extension.so` on common Linux distributions via SQLite3 Command Line. 

See the `examples` folder for language specific examples.

---

## Install SQLite (Per Distribution)

### Ubuntu / Debian

```bash
sudo apt install sqlite3
```

### Fedora

```bash
sudo dnf install sqlite
```

### Alpine Linux

```bash
apk add sqlite
```

### Arch Linux

```bash
pacman -Sy sqlite3
```

---

## Load Extension from CLI

```bash
sqlite3
```

```sql
.load ./my_extension.so
SELECT my_custom_function();
```

---

## Troubleshooting

| Problem                                    | Solution                                                              |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `no such file or directory`                | Ensure path to `.so` is correct and matches your platform.            |
| `incompatible architecture`                | Download extension for your Linux system (e.g., x86\_64 vs arm64).    |
