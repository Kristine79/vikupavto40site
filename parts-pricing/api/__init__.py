"""
API routes package
"""

# Lazy imports to avoid circular import issues
def __getattr__(name):
    if name == "prices":
        from . import prices
        return prices
    elif name == "search":
        from . import search
        return search
    elif name == "damage":
        from .routes import damage
        return damage
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

__all__ = ["prices", "search", "damage"]
