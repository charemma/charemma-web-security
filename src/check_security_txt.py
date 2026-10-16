"""Fail when html/.well-known/security.txt is close to its RFC 9116 Expires date."""

import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

SECURITY_TXT = Path(__file__).resolve().parent.parent / "html" / ".well-known" / "security.txt"
MIN_REMAINING = timedelta(days=30)
EXPIRES_FIELD = "expires:"


def read_expires(path: Path) -> datetime:
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.lower().startswith(EXPIRES_FIELD):
            return datetime.fromisoformat(line[len(EXPIRES_FIELD):].strip())
    raise SystemExit(f"{path}: no Expires field")


def main() -> None:
    remaining = read_expires(SECURITY_TXT) - datetime.now(UTC)
    if remaining < MIN_REMAINING:
        sys.exit(f"security.txt expires in {remaining.days} days, bump the Expires field")
    print(f"security.txt ok, expires in {remaining.days} days")


if __name__ == "__main__":
    main()
