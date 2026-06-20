#!/usr/bin/env python3
"""
MarkItDown runner — converts a document to Markdown and writes JSON to stdout.
Accepts the file path as the first CLI argument.
Exit 0 on success, 1 on error. Always emits valid JSON.
"""
import sys
import json


def main() -> None:
    if len(sys.argv) < 2:
        _fail("No file path provided")
        return

    file_path = sys.argv[1]

    try:
        from markitdown import MarkItDown
        md = MarkItDown()
        result = md.convert(file_path)
        content = result.text_content or ""
        sys.stdout.write(json.dumps({"success": True, "markdown": content}))
    except ImportError as exc:
        _fail(f"markitdown not installed: {exc}")
    except FileNotFoundError:
        _fail(f"File not found: {file_path}")
    except Exception as exc:  # noqa: BLE001
        _fail(str(exc))


def _fail(message: str) -> None:
    sys.stdout.write(json.dumps({"success": False, "error": message}))
    sys.exit(1)


if __name__ == "__main__":
    main()
