# Plan: Juego de Práctica Hiragana / Katakana

## Terminología

| Término | Nombre técnico | Ejemplo |
|---|---|---|
| "puros" | Gojūon (五十音) | あ か さ た |
| "impuros" | Dakuten + Handakuten | が ざ ば ぱ |
| "construptos" | Yōon (拗音) | きゃ しゅ ちょ |

---

## Estructura de pantallas

```
┌─────────────────────────────┐
│         HOME                │
│  [Hiragana]  [Katakana]     │
│  ─────────────────────────  │
│  [📋 Ver Tablas]            │
│  [🎮 Practicar]             │
└─────────────────────────────┘
         │
    ┌────┴─────┐
    ▼          ▼
[Ver Tabla]  [Configurar práctica]
             │
             ├── ☑ Gojūon (puros)
             ├── ☑ Dakuten/Handakuten (impuros)
             ├── ☐ Yōon (compuestos)
             └── [▶ Empezar]
                      │
              ┌───────┴───────┐
              ▼               ▼
         [Modo juego]    [Modo juego]
         Escribir        Opción múltiple
         Emparejar       Flashcard
```

---

## Datos: qué incluir

### Gojūon (básico)
- 46 hiragana + 46 katakana
- Filas: vowels, k, s, t, n, h, m, y, r, w, n

### Dakuten (tenten ゛)
- Filas G, Z, D, B — 20 caracteres

### Handakuten (maru ゜)
- Fila P — 5 caracteres

### Yōon (compuestos)
- Combinaciones con や/ゆ/よ pequeños — ~33 pares base + versiones dakuten/handakuten

### Palabras
- ~30-50 palabras comunes con emoji o significado en español

---

## Modos de juego

| Modo | Descripción | Dificultad |
|---|---|---|
| **Flashcard** | Ves el carácter, escribís el romaji | ★★ |
| **Opción múltiple** | Elegís entre 4 opciones | ★ |
| **Emparejar** | Unís 6-8 pares carácter ↔ romaji | ★★ |
| **Palabras** | Palabra completa → escribís romaji | ★★★ |

---

## Flujo de práctica

```
Configuración
→ Seleccionás alfabeto (hiragana/katakana)
→ Seleccionás sets (gojūon, dakuten, yōon)
→ Elegís modo de juego
→ Elegís fuente: [Fuente base] o [Fuentes random]
→ Partida con progreso visible (X/Y correctas)
→ Pantalla de resultado + opción de reiniciar
```

---

## Variación de fuentes

Para evitar acostumbrarse a una sola tipografía (lo que dificultaría el reconocimiento real de los caracteres):

- Se cargan **4-6 fuentes japonesas distintas** vía Google Fonts:
  - Noto Sans JP (limpia, estándar)
  - Noto Serif JP (con serifa, más formal)
  - M PLUS Rounded 1c (redondeada, amigable)
  - Sawarabi Mincho (mincho/serif, más caligráfica)
  - Zen Kurenaido o similar (estilo brush)
- Configurable por sesión: **fuente base** (Noto Sans JP siempre) o **fuentes random** (una del pool por pregunta)
- En modo palabras con fuentes random, la fuente se elige una vez por palabra — **toda la palabra en la misma fuente**
- En la tabla de referencia se puede hacer clic en un carácter para ver cómo luce en todas las fuentes

---

## Tech stack

- **Un solo archivo** `index.html` — HTML + CSS + JS vanilla
- Sin dependencias externas salvo Google Fonts
- CSS Grid para las tablas, Flexbox para los juegos
- Media queries para mobile (breakpoint principal: 600px)
- **LocalStorage** para persistir preferencias entre sesiones:
  - Alfabeto seleccionado (hiragana/katakana)
  - Sets activos (gojūon, dakuten, yōon)
  - Modo de fuente (base/random)
  - Último modo de juego usado

---

## Estructura del código

```
index.html
├── <head>       — Google Fonts (múltiples familias japonesas)
├── <style>      — Todo el CSS (variables de colores, responsive)
└── <script>
    ├── DATA     — Objetos con todos los caracteres, palabras y fonts
    ├── STATE    — Estado actual (pantalla, config, score, font actual)
    ├── RENDER   — Funciones que dibujan cada pantalla
    └── GAME     — Lógica de cada modo de juego
```

---

## Diseño visual

- Paleta: suave, estilo japonés — fondos claros, acentos índigo/rojo
- Cards grandes y tappables para mobile
- Teclado en pantalla opcional para escribir romaji en mobile
- Tabla con colores por fila (cada consonante un tono distinto)
- Animación sutil al cambiar de fuente (fade) para que el cambio sea perceptible
