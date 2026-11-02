import secrets
import string
import unicodedata

_SYMBOLS = "!#$"


def generate_temp_password(name: str) -> str:
    """Memorable temporary password: Name + 3 digits + 1 symbol (e.g. "Juan704#"); the random part differs each time."""
    # Normalize: first token, no accents, ASCII letters only, capitalized.
    first_token = name.strip().split(" ")[0] if name and name.strip() else ""
    normalized = unicodedata.normalize("NFKD", first_token)
    ascii_only = "".join(c for c in normalized if c.isascii() and c.isalpha())
    base = ascii_only.capitalize() or "User"

    digits = "".join(secrets.choice(string.digits) for _ in range(3))
    symbol = secrets.choice(_SYMBOLS)
    return f"{base}{digits}{symbol}"
