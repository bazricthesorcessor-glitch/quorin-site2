from pathlib import Path

PROJECT_DIR = Path("/home/dmannu/quorin site")
OUTPUT_FILE = "clean_codebase.txt"

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
    "images",
}

IGNORE_FILES = {
    "package-lock.json",
}

IGNORE_PATH_CONTAINS = {
    "src/components/ui/",
    "public/loading-frames/",
}

INCLUDE_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".md",
    ".html",
    ".css",
}

MAX_FILE_SIZE_MB = 1.5


def should_ignore(path: Path):
    path_str = str(path)

    for part in path.parts:
        if part in IGNORE_DIRS:
            return True

    if path.name in IGNORE_FILES:
        return True

    for item in IGNORE_PATH_CONTAINS:
        if item in path_str:
            return True

    return False


with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    out.write("===== QUORIN CLEAN CODEBASE =====\n\n")

    for file_path in PROJECT_DIR.rglob("*"):
        if not file_path.is_file():
            continue

        if should_ignore(file_path):
            continue

        if file_path.suffix.lower() not in INCLUDE_EXTENSIONS:
            continue

        size_mb = file_path.stat().st_size / (1024 * 1024)

        if size_mb > MAX_FILE_SIZE_MB:
            continue

        relative_path = file_path.relative_to(PROJECT_DIR)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            out.write("\n")
            out.write("=" * 80 + "\n")
            out.write(f"FILE: {relative_path}\n")
            out.write("=" * 80 + "\n\n")
            out.write(content)
            out.write("\n\n")

            print(f"Added: {relative_path}")

        except Exception as e:
            print(f"Failed: {relative_path} -> {e}")

print(f"\nSaved to {OUTPUT_FILE}")
