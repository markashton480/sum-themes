"""
Name: Theme A Guardrails - Build Fingerprint Generator
Path: themes/theme_a/build_fingerprint.py
Purpose: Prevent compiled Tailwind CSS drift and regressions
Family: Themes / Toolchain
Dependencies: filesystem, hashlib, pytest
"""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path


def get_theme_a_root() -> Path:
    """Get the root directory of Theme A."""
    return Path(__file__).parent


def compute_fingerprint(theme_root: Path) -> str:
    """Compute deterministic fingerprint from all Tailwind build inputs.

    Fingerprint inputs (in order):
    1. tailwind/tailwind.config.js
    2. tailwind/postcss.config.js (or empty string if missing)
    3. static/theme_a/css/input.css
    4. All templates/**/*.html files (sorted alphabetically)

    Args:
        theme_root: Path to theme_a directory

    Returns:
        SHA256 hexdigest of all inputs

    Raises:
        FileNotFoundError: If required input files are missing
    """
    hasher = hashlib.sha256()

    # 1. tailwind/tailwind.config.js (required)
    tailwind_config = theme_root / "tailwind" / "tailwind.config.js"
    if not tailwind_config.exists():
        raise FileNotFoundError(
            f"Required file not found: {tailwind_config}\n"
            "Cannot generate fingerprint without Tailwind configuration."
        )
    hasher.update(tailwind_config.read_bytes())

    # 2. tailwind/postcss.config.js (optional - use empty string if missing)
    postcss_config = theme_root / "tailwind" / "postcss.config.js"
    if postcss_config.exists():
        hasher.update(postcss_config.read_bytes())
    else:
        hasher.update(b"")

    # 3. input.css (required)
    input_css = theme_root / "static" / "theme_a" / "css" / "input.css"
    if not input_css.exists():
        raise FileNotFoundError(
            f"Required file not found: {input_css}\n"
            "Cannot generate fingerprint without Tailwind input CSS."
        )
    hasher.update(input_css.read_bytes())

    # 4. All template files (sorted for determinism)
    templates_dir = theme_root / "templates"
    if not templates_dir.exists():
        raise FileNotFoundError(
            f"Templates directory not found: {templates_dir}\n"
            "Cannot generate fingerprint without template files."
        )

    template_files = sorted(templates_dir.rglob("*.html"))
    if not template_files:
        raise FileNotFoundError(
            f"No HTML templates found in {templates_dir}\n"
            "Cannot generate fingerprint without template files."
        )

    for template_path in template_files:
        hasher.update(template_path.read_bytes())

    return hasher.hexdigest()


def write_fingerprint(theme_root: Path, fingerprint: str) -> None:
    """Write fingerprint to .build_fingerprint file.

    Args:
        theme_root: Path to theme_a directory
        fingerprint: SHA256 hash to write
    """
    output_path = theme_root / "static" / "theme_a" / "css" / ".build_fingerprint"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(fingerprint + "\n")
    print(f"✓ Fingerprint written to {output_path}")
    print(f"  Hash: {fingerprint}")


def main() -> int:
    """Generate and write build fingerprint for Theme A.

    Returns:
        0 on success, 1 on error
    """
    try:
        theme_root = get_theme_a_root()
        print(f"Computing fingerprint for Theme A at {theme_root}")

        fingerprint = compute_fingerprint(theme_root)
        write_fingerprint(theme_root, fingerprint)

        print("\n✓ Build fingerprint generated successfully")
        print("\nNext steps:")
        print("  1. Commit the updated .build_fingerprint file")
        print("  2. Run 'make test' to verify guardrails pass")

        return 0

    except FileNotFoundError as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
