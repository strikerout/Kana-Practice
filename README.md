# かな練習 — Kana Practice

> A beautiful, mobile-friendly web app for practicing Japanese Hiragana and Katakana.  
> No installation. No account. Just open and learn.

---

## ✨ Features

- **Two alphabets** — Hiragana (あ) and Katakana (ア), fully switchable
- **Three character sets**
  - Gojūon (五十音) — the 46 base characters
  - Dakuten / Handakuten — voiced and semi-voiced (が、ぱ…)
  - Yōon — compound sounds (きゃ、しゅ、ちょ…)
- **Five game modes**
  - Multiple choice — pick the correct romaji from 4 options
  - Write — type the romaji from memory
  - Match — pair characters with their romaji in two columns
  - Words — read full words and type their romaji (with emoji hint + Spanish meaning revealed after answering)
  - 🎲 Random — wild mix of all the above, including words
- **193 vocabulary words** with emoji and Spanish meanings
  - 103 Hiragana words (animals, nature, seasons, colors, food, body parts, objects, people…)
  - 90 Katakana words (loanwords: drinks, food, tech, transport, sports, music, clothing, animals…)
  - Shuffled randomly every session
- **Font rotation** — characters appear in up to 5 different Japanese typefaces so you learn to recognize them beyond a single style
- **Configurable sessions** — choose how many questions per round (10 / 20 / 30 / all)
- **Sound effects** — chime on correct, thud on wrong (Web Audio API, no audio files needed)
- **Dark mode** — clean dark theme, toggle anytime
- **Fully responsive** — works great on mobile and desktop
- **No backend** — open `index.html` directly in any browser, no server needed

---

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **Opción múltiple** | See a character, pick from 4 romaji options |
| **Escribir** | See a character, type the romaji yourself |
| **Emparejar** | Match columns of characters to their romaji |
| **Palabras** | See a full word with emoji hint, type its romaji |
| **🎲 Random** | Each question is a surprise — any mode, any type |

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
├── index.html          # Entry point — structure & script imports
├── css/
│   └── style.css       # All styles: variables, layout, components, dark mode
├── js/
│   ├── data.js         # All kana data, word lists, font pool, table layouts
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
- **localStorage** — persists your preferences (alphabet, character sets, game mode, session length, font style, dark mode, sound on/off)
- **Web Audio API** — procedural sound effects, no audio files required

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
