#!/usr/bin/env python3
"""
generate_dictionary.py
======================
One-time script that builds js/dictionary.json for かな練習.

What it does
------------
1. Fetches JLPT N5 + N4 + N3 vocabulary from the free Jisho.org API
2. Converts hiragana readings → katakana (codepoint offset +96)
3. Converts hiragana readings → romaji using pykakasi
4. Translates English definitions → Spanish via Claude Haiku API
   (system prompt is cached so only the first batch pays the write cost)
5. Outputs a compact JSON file at js/dictionary.json

Usage
-----
    cd path/to/hiraganapractice
    pip install -r scripts/requirements.txt
    export ANTHROPIC_API_KEY="sk-ant-..."
    python scripts/generate_dictionary.py

Output format (short keys to keep the file small)
--------------------------------------------------
    [{"h":"たべる","k":"タベル","r":"taberu","s":"comer","l":"N5"}, ...]

Field legend
    h  hiragana reading
    k  katakana equivalent (auto-converted)
    r  romaji (Hepburn, via pykakasi)
    s  Spanish meaning (translated by Claude)
    l  JLPT level (N5 / N4 / N3)
"""

import json
import os
import sys
import time
from pathlib import Path

import requests
from deep_translator import GoogleTranslator

# ─── Config ──────────────────────────────────────────────────────────────────

SCRIPT_DIR   = Path(__file__).parent
OUTPUT_PATH  = SCRIPT_DIR.parent / "js" / "dictionary.json"
CACHE_DIR    = SCRIPT_DIR / ".jisho_cache"

LEVELS       = ["n5", "n4", "n3"]
BATCH_SIZE   = 50          # entries per Google Translate batch
JISHO_DELAY  = 0.4         # seconds between Jisho API pages
GT_DELAY     = 1.0         # seconds between translation batches

# ─── Hiragana → Katakana ─────────────────────────────────────────────────────

def hira_to_kata(text: str) -> str:
    """Convert hiragana characters to katakana (codepoint offset = 96)."""
    return "".join(
        chr(ord(c) + 96) if "\u3041" <= c <= "\u3096" else c
        for c in text
    )

# ─── Romaji conversion ────────────────────────────────────────────────────────

def build_romaji_converter():
    """Return a function that converts hiragana/katakana to Hepburn romaji."""
    try:
        import pykakasi
        kks = pykakasi.kakasi()

        def convert(text: str) -> str:
            result = kks.convert(text)
            return "".join(item["hepburn"] for item in result)

        return convert
    except ImportError:
        print(
            "⚠  pykakasi not installed — romaji will be empty.\n"
            "   Run: pip install pykakasi",
            file=sys.stderr,
        )
        return lambda text: ""

# ─── Jisho API ───────────────────────────────────────────────────────────────

def fetch_jlpt_level(level: str) -> list[dict]:
    """
    Fetch all vocabulary for a JLPT level from Jisho.org.
    Results are cached to .jisho_cache/ to avoid re-fetching on reruns.
    """
    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f"jlpt_{level}.json"

    if cache_file.exists():
        print(f"  Using cached data for {level.upper()} …")
        return json.loads(cache_file.read_text(encoding="utf-8"))

    words: list[dict] = []
    page = 1
    print(f"  Fetching {level.upper()} from Jisho ", end="", flush=True)

    while True:
        url = f"https://jisho.org/api/v1/search/words?keyword=%23jlpt-{level}&page={page}"
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json().get("data", [])
            if not data:
                break
            words.extend(data)
            print(".", end="", flush=True)
            page += 1
            time.sleep(JISHO_DELAY)
        except requests.RequestException as exc:
            print(f"\n  ⚠  Error on page {page}: {exc}")
            break

    print(f" {len(words)} words")
    cache_file.write_text(
        json.dumps(words, ensure_ascii=False), encoding="utf-8"
    )
    return words


def extract_entry(item: dict, level: str) -> dict | None:
    """
    Extract the fields we need from a raw Jisho API entry.
    Returns None if the entry has no usable reading.
    """
    japanese = item.get("japanese", [])
    if not japanese:
        return None

    reading = japanese[0].get("reading", "")
    if not reading:
        return None

    # Collect up to 3 English glosses across the first 2 senses
    senses = item.get("senses", [])
    english_parts: list[str] = []
    for sense in senses[:2]:
        for gloss in sense.get("english_definitions", [])[:2]:
            if gloss and gloss not in english_parts:
                english_parts.append(gloss)
        if len(english_parts) >= 3:
            break

    if not english_parts:
        return None

    return {
        "h": reading,
        "english": "; ".join(english_parts),
        "l": level.upper(),
    }

# ─── Claude translation ───────────────────────────────────────────────────────

def translate_batch(entries: list[dict]) -> list[str]:
    """
    Translate a batch of English definitions to Spanish using Google Translate
    (via deep-translator — free, no API key required).
    """
    translator = GoogleTranslator(source="en", target="es")
    results: list[str] = []
    for e in entries:
        try:
            t = translator.translate(e["english"])
            results.append(t or e["english"])
        except Exception:
            results.append(e["english"])
        time.sleep(0.05)
    return results

# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    to_romaji = build_romaji_converter()

    print("📚  Generating dictionary.json for かな練習\n")

    # ── 1. Fetch vocabulary from Jisho ──────────────────────────────────────
    print("Step 1 — Fetching JLPT vocabulary from Jisho.org …")
    all_raw: list[dict] = []
    for level in LEVELS:
        raw = fetch_jlpt_level(level)
        for item in raw:
            item["_level"] = level
        all_raw.extend(raw)

    # ── 2. Extract & deduplicate ─────────────────────────────────────────────
    print("\nStep 2 — Extracting and deduplicating entries …")
    seen: set[str] = set()
    entries: list[dict] = []
    for item in all_raw:
        e = extract_entry(item, item["_level"])
        if not e or e["h"] in seen:
            continue
        seen.add(e["h"])
        entries.append(e)

    print(f"  {len(entries)} unique entries")

    # ── 3. Add katakana & romaji ─────────────────────────────────────────────
    print("\nStep 3 — Converting to katakana and romaji …")
    for e in entries:
        e["k"] = hira_to_kata(e["h"])
        e["r"] = to_romaji(e["h"])
    print("  Done")

    # ── 4. Translate to Spanish via Claude ───────────────────────────────────
    print(f"\nStep 4 — Translating to Spanish ({len(entries)} entries, "
          f"batches of {BATCH_SIZE}) via Google Translate …\n")

    translated    = 0
    errors        = 0
    total_batches = (len(entries) + BATCH_SIZE - 1) // BATCH_SIZE

    for start in range(0, len(entries), BATCH_SIZE):
        batch     = entries[start : start + BATCH_SIZE]
        batch_num = start // BATCH_SIZE + 1

        try:
            translations = translate_batch(batch)
            for j, t in enumerate(translations):
                if j < len(batch):
                    batch[j]["s"] = t
            for e in batch:
                e.setdefault("s", e["english"])
            translated += len(batch)
            print(f"  [{batch_num:3d}/{total_batches}] ✓  {translated}/{len(entries)}")
            time.sleep(GT_DELAY)

        except Exception as exc:
            print(f"  [{batch_num:3d}/{total_batches}] ⚠  {exc} — retrying in 10 s …")
            time.sleep(10)
            try:
                translations = translate_batch(batch)
                for j, t in enumerate(translations):
                    if j < len(batch):
                        batch[j]["s"] = t
                for e in batch:
                    e.setdefault("s", e["english"])
                translated += len(batch)
                print(f"  [{batch_num:3d}/{total_batches}] ✓  {translated}/{len(entries)} (retry ok)")
            except Exception as exc2:
                print(f"  [{batch_num:3d}/{total_batches}] ❌  {exc2}")
                for e in batch:
                    e.setdefault("s", e["english"])
                errors += len(batch)

    # ── 5. Build final output ────────────────────────────────────────────────
    print("\nStep 5 — Writing output …")
    output = [
        {"h": e["h"], "k": e["k"], "r": e["r"], "s": e["s"], "l": e["l"]}
        for e in entries
    ]

    OUTPUT_PATH.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(
        f"\n✅  Saved {len(output)} entries → {OUTPUT_PATH.relative_to(SCRIPT_DIR.parent)}"
        f"  ({size_kb:.0f} KB)"
    )
    if errors:
        print(f"⚠   {errors} entries fell back to English (check logs above)")


if __name__ == "__main__":
    main()
