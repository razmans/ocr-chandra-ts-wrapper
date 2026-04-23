from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any


def _error(code: str, message: str, details: dict[str, Any] | None = None) -> dict:
    return {
        "ok": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
    }


def _collect_output_files(output_dir: Path) -> dict[str, Any]:
    markdown = None
    html = None
    metadata = {}
    json_payload = None
    images: list[dict[str, Any]] = []

    for path in output_dir.rglob("*"):
        if not path.is_file():
            continue

        if path.suffix == ".md" and markdown is None:
            markdown = path.read_text(encoding="utf-8", errors="ignore")
        elif path.suffix == ".html" and html is None:
            html = path.read_text(encoding="utf-8", errors="ignore")
        elif path.name.endswith("_metadata.json"):
            try:
                metadata = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                metadata = {"rawPath": str(path)}
        elif path.suffix == ".json" and json_payload is None and not path.name.endswith("_metadata.json"):
            try:
                json_payload = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                json_payload = {"rawPath": str(path)}
        elif path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
            images.append(
                {
                    "name": path.name,
                    "path": str(path),
                }
            )

    return {
        "markdown": markdown,
        "html": html,
        "json": json_payload,
        "layout": [],
        "images": images,
        "pages": [],
        "metadata": metadata,
    }


def _build_chandra_command(input_path: Path, output_dir: Path, options: dict[str, Any]) -> list[str]:
    command = ["chandra", str(input_path), str(output_dir)]

    page_range = options.get("pageRange")
    if page_range:
        command.extend(["--page-range", str(page_range)])

    include_images = options.get("includeImages")
    if include_images is False:
        command.append("--no-images")
    elif include_images is True:
        command.append("--include-images")

    include_headers_footers = options.get("includeHeadersFooters")
    if include_headers_footers is True:
        command.append("--include-headers-footers")
    elif include_headers_footers is False:
        command.append("--no-headers-footers")

    max_output_tokens = options.get("maxOutputTokens")
    if max_output_tokens:
        command.extend(["--max-output-tokens", str(max_output_tokens)])

    batch_size = options.get("batchSize")
    if batch_size:
        command.extend(["--batch-size", str(batch_size)])

    max_workers = options.get("maxWorkers")
    if max_workers:
        command.extend(["--max-workers", str(max_workers)])

    return command


def process_file(input_path: str, options: dict[str, Any] | None = None) -> dict:
    path = Path(input_path)
    if not path.exists():
        return _error(
            "FILE_NOT_FOUND",
            f"The provided file path does not exist: {input_path}",
            {"inputPath": input_path},
        )

    if not path.is_file():
        return _error(
            "INVALID_INPUT",
            f"The provided path is not a file: {input_path}",
            {"inputPath": input_path},
        )

    options = options or {}

    managed_chandra = os.getenv("CHANDRA_MANAGED_CHANDRA_BIN")
    chandra_bin = managed_chandra if managed_chandra and Path(managed_chandra).exists() else shutil.which("chandra")
    if not chandra_bin:
        return _error(
            "PYTHON_PACKAGE_MISSING",
            "Chandra CLI was not found in PATH. Install chandra-ocr so the `chandra` command is available.",
            {"command": "chandra", "managedChandra": managed_chandra},
        )

    requested_output_dir = options.get("outputDir")
    temp_dir: tempfile.TemporaryDirectory[str] | None = None
    if requested_output_dir:
        output_dir = Path(requested_output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        temp_dir = tempfile.TemporaryDirectory(prefix="chandra-ts-output-")
        output_dir = Path(temp_dir.name)

    command = _build_chandra_command(path, output_dir, options)
    command[0] = chandra_bin
    start = time.time()

    try:
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
    except Exception as exc:
        if temp_dir:
            temp_dir.cleanup()
        return _error(
            "PROCESSING_FAILED",
            f"Failed to execute Chandra CLI: {exc}",
            {"command": command},
        )

    processing_ms = int((time.time() - start) * 1000)

    if completed.returncode != 0:
        if temp_dir:
            temp_dir.cleanup()
        return _error(
            "PROCESSING_FAILED",
            "Chandra CLI returned a non-zero exit code.",
            {
                "command": command,
                "returncode": completed.returncode,
                "stdout": completed.stdout,
                "stderr": completed.stderr,
            },
        )

    result = _collect_output_files(output_dir)
    result["metadata"] = {
        **(result.get("metadata") or {}),
        "processingMs": processing_ms,
        "outputDir": str(output_dir),
        "command": command,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
    }
    result["json"] = result.get("json") or {
        "stub": False,
        "inputPath": str(path),
        "options": options,
    }

    if temp_dir:
        result["metadata"]["ephemeralOutputDir"] = True

    return {
        "ok": True,
        "result": result,
    }


def process_upload(filename: str, options: dict[str, Any] | None = None, upload_bytes: bytes | None = None) -> dict:
    options = options or {}
    if upload_bytes is None:
        return _error("INVALID_INPUT", "No upload payload was provided.")

    suffix = Path(filename).suffix or ".bin"
    with tempfile.TemporaryDirectory(prefix="chandra-ts-upload-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        temp_input = temp_dir / f"upload{suffix}"
        temp_input.write_bytes(upload_bytes)
        return process_file(str(temp_input), options)
