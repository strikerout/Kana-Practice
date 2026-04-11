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
             ├── Modo de juego
             ├── Preguntas por sesión (10 / 20 / 30 / Todo)
             ├── ☑ Gojūon (puros)
             ├── ☐ Dakuten/Handakuten (impuros)
             ├── ☐ Yōon (compuestos)
             ├── Fuente: [Base] [Random]
             └── [▶ Empezar]
                      │
              ┌───────┴──────────┐
              ▼                  ▼
         [Partida]          [Resultado]
         progreso X/Y       % aciertos
         ✓ correctas        [Repetir] [Inicio]
         ✗ incorrectas
```

---

## Datos: cobertura de caracteres

### Gojūon (básico)
- 46 hiragana + 46 katakana
- Filas: vocales, k, s, t, n, h, m, y, r, w, n

### Dakuten (tenten ゛)
- Filas G, Z, D, B — 20 caracteres por alfabeto

### Handakuten (maru ゜)
- Fila P — 5 caracteres por alfabeto

### Yōon (compuestos)
- Combinaciones con や/ゆ/よ pequeños — 33 por alfabeto

### Palabras
- **103 palabras en Hiragana** — palabras nativas japonesas
  - Animales, naturaleza, clima, estaciones, colores, comida, cuerpo, objetos cotidianos, personas, conceptos
- **90 palabras en Katakana** — loanwords
  - Bebidas, comida, tecnología, transporte, deportes, música, ropa, animales, hogar, entretenimiento
- Cada palabra incluye: kana, romaji, emoji y significado en español
- La selección se baraja aleatoriamente en cada sesión

---

## Modos de juego

| Modo | Descripción |
|---|---|
| **Opción múltiple** | Ves el carácter, elegís entre 4 opciones de romaji |
| **Escribir** | Ves el carácter, tipeás el romaji vos mismo |
| **Emparejar** | Dos columnas: unís cada carácter con su romaji |
| **Palabras** | Palabra completa con emoji → tipeás el romaji |
| **🎲 Random** | Mezcla aleatoria de todos los modos, incluyendo palabras |

---

## Configuración de práctica

- **Alfabeto**: Hiragana o Katakana
- **Sets de caracteres**: Gojūon / Dakuten+Handakuten / Yōon (combinables)
- **Modo de juego**: cualquiera de los 5 modos
- **Preguntas por sesión**: 10 / 20 / 30 / Todo
- **Fuente**: Base (Noto Sans JP siempre) o Random (varía por pregunta)

*Nota: en modo Palabras y Random los sets de caracteres aplican solo a las preguntas de tipo carácter.*

---

## Variación de fuentes

Para evitar acostumbrarse a una sola tipografía:

- Pool de **5 fuentes japonesas** vía Google Fonts:
  - Noto Sans JP (limpia, estándar)
  - Noto Serif JP (con serifa, más formal)
  - M PLUS Rounded 1c (redondeada, amigable)
  - Sawarabi Mincho (mincho/serif, caligráfica)
  - Zen Kurenaido (estilo brush)
- Configurable por sesión: **fuente base** o **fuentes random**
- En modo palabras, la fuente se elige una vez por palabra entera — nunca mezcla dentro de una misma palabra

---

## Tabla de referencia

- 3 pestañas: Gojūon / Dakuten+Handakuten / Yōon
- Colores por fila (cada consonante tiene un tono distinto)
- Muestra el carácter grande y el romaji pequeño debajo

---

## Persistencia (localStorage)

Se guardan entre sesiones:
- Alfabeto seleccionado
- Sets activos (gojūon, dakuten, yōon)
- Modo de juego
- Preguntas por sesión
- Preferencia de fuente (base/random)
- Tema (claro/oscuro)
- Sonido activado/desactivado

---

## Tech stack

- HTML + CSS + JS vanilla — sin frameworks, sin build step
- Archivos separados por responsabilidad: `data.js`, `state.js`, `game.js`, `render.js`, `sound.js`
- Google Fonts para las 5 fuentes japonesas
- Web Audio API para los sonidos (generados proceduralmente, sin archivos de audio)
- LocalStorage para persistencia de preferencias
- CSS Grid para las tablas, Flexbox para los juegos
- Responsive: mobile y desktop

---

## Estructura del proyecto

```
hiraganapractice/
├── index.html          — punto de entrada, imports, botones persistentes
├── css/
│   └── style.css       — todo el CSS: variables, layout, dark mode, responsive
├── js/
│   ├── data.js         — todos los caracteres, palabras, fuentes, layouts de tabla
│   ├── state.js        — estado de la app + localStorage
│   ├── game.js         — lógica de juego: colas, verificación, puntaje
│   ├── render.js       — renderizado de pantallas y eventos
│   └── sound.js        — sonidos procedurales via Web Audio API
├── img/
│   └── strikeroutlogo.png
└── plan.md
```
