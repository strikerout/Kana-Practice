# かな練習 — Kana Practice

> A beautiful, mobile-friendly web app for practicing Japanese Hiragana and Katakana.  
> No installation. No account. Just open and learn.

---

## ✨ Features

- **Two alphabets** — Hiragana (あ) and Katakana (ア), fully switchable
- **Six game modes** — multiple choice, write, match, words, complete the table, and random mix
- **193 vocabulary words** with emoji and Spanish meanings, shuffled every session
- **Macron notation for long vowels** — ā ī ū ē ō, with a built-in helper bar so you can type them on any device
- **Reference guide** — built-in explanation of Gojūon, Dakuten, Yōon, and long vowels with examples
- **Font rotation** — characters appear in up to 5 different Japanese typefaces per session
- **Sound effects** — chime on correct, thud on wrong (Web Audio API, no files needed)
- **Dark mode** — toggle anytime, preference saved
- **Fully responsive** — optimized for mobile and desktop

---

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **Opción múltiple** | See a character, choose from 4 romaji options |
| **Escribir** | See a character, type the romaji yourself |
| **Emparejar** | Match two columns — characters on the left, romaji on the right |
| **Palabras** | Full word with emoji hint → type its romaji (JP→Rom or Rom→JP with on-screen kana keyboard) |
| **📋 Completa la tabla** | Fill in the romaji for the entire kana table — 3 difficulty levels |
| **🎲 Random** | Wild mix of all modes and word questions in one session |

---

## ⚙️ Configuration

Every session is configurable:

| Option | Choices |
|--------|---------|
| **Alphabet** | Hiragana / Katakana |
| **Character sets** | Gojūon · Dakuten+Handakuten · Yōon · Vocales largas |
| **Questions per session** | 10 / 20 / 30 / All |
| **Word direction** | JP → Romaji / Romaji → JP |
| **Font style** | Base font / Random (rotates per question) |
| **Table fill level** | Level 1: Gojūon · Level 2: +Impuros · Level 3: +Yōon |

Character set selection also filters the word pool — enabling *vocales largas* guarantees a proportion of words with long vowels (ー, おう…) appear in the session.

All preferences are saved in localStorage.

---

## 📋 Completa la Tabla

A dedicated mode for memorizing the full kana table:

- Three levels of difficulty
- Type the romaji for each character — the table is all visible at once
- Active cell is highlighted; scroll the table while the input bar stays pinned at the top
- Auto-verifies when the last cell is filled
- Results show which cells were correct (green) and which need review (red with the correct answer)

---

## 🔤 Long Vowel Support

Long vowels in Japanese are written with macrons in standard Hepburn romanization:

| Katakana | Hiragana | Romaji |
|----------|----------|--------|
| コーヒー | — | kōhī |
| ラーメン | — | rāmen |
| — | がっこう | gakkō |
| — | ちょう | chō |

When typing long vowel answers, a **[ ā ][ ī ][ ū ][ ē ][ ō ]** helper bar appears above the input. Tapping a button inserts the macron vowel at the cursor — no need to dig through special character menus. The doubled-vowel spelling (koohii, raamen…) is also accepted as a correct answer.

---

## 📖 Built-in Guide

The **📖 Guía** tab (inside Ver Tabla) explains all character types with examples:

- **Gojūon** — the 46 base characters
- **Dakuten / Handakuten** — how ゛ and ゜ change a sound (か→が, は→ぱ)
- **Yōon** — compound sounds and why き + ゃ ≠ き + や
- **Vocales largas** — ー in katakana, vowel extension in hiragana, romaji equivalences

---

## 🌸 Character Coverage

| Set | Hiragana | Katakana |
|-----|----------|----------|
| Gojūon | 46 | 46 |
| Dakuten | 20 | 20 |
| Handakuten | 5 | 5 |
| Yōon | 33 | 33 |
| **Words** | **103** | **90** |

---

## 📖 How to Use

```bash
# Clone the repo
git clone https://github.com/strikerout/Kana-Practice.git

# Open in browser — no server needed
open index.html
```

Or visit directly: **[strikerout.github.io/Kana-Practice](https://strikerout.github.io/Kana-Practice/)**

---

## 🗂 Project Structure

```
Kana-Practice/
├── index.html          # Entry point — structure, imports, persistent controls
├── css/
│   └── style.css       # All styles: variables, layout, components, dark mode
├── js/
│   ├── data.js         # Kana data, word lists, keyboard layouts, helpers
│   ├── state.js        # App state + localStorage persistence
│   ├── game.js         # Game logic: queues, answer checking, scoring
│   ├── render.js       # DOM rendering and event wiring for every screen
│   └── sound.js        # Procedural sound effects via Web Audio API
└── img/
    └── strikeroutlogo.png
```

Each file has a single, clear responsibility. No frameworks, no build step.

---

## 🛠 Tech Stack

- **Vanilla HTML / CSS / JavaScript** — zero dependencies
- **Google Fonts** — Noto Sans JP, Noto Serif JP, M PLUS Rounded 1c, Sawarabi Mincho, Zen Kurenaido
- **localStorage** — saves alphabet, character sets, game mode, session length, font style, word direction, dark mode, sound on/off
- **Web Audio API** — procedural sound effects, no audio files required

---

## 📱 Screenshots

> *Light mode · Dark mode · Match game · Words mode*

| Home | Practice | Match | Dark |
|------|----------|-------|------|
| ![home](https://placehold.co/180x320/eef2ff/4f46e5?text=Home) | ![practice](https://placehold.co/180x320/f0fdf4/16a34a?text=Practice) | ![match](https://placehold.co/180x320/fff7ed/d97706?text=Match) | ![dark](https://placehold.co/180x320/111111/818cf8?text=Dark+Mode) |

---

## 🙌 Credits

Created by **StrikerOut**

---

*Learn the kana. One character at a time.*
