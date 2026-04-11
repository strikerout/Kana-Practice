/* ═══════════════════════════════════════════════════════════════
   data.js — All kana character data, word lists, font pool,
             table layouts, and data-access helpers.
             No DOM, no state. Pure data.
   ═══════════════════════════════════════════════════════════════ */

// ─── Font pool ───────────────────────────────────────────────────
// Index 0 is the "base" font used when font-rotation is off.
const FONTS = [
  "'Noto Sans JP', sans-serif",
  "'Noto Serif JP', serif",
  "'M PLUS Rounded 1c', sans-serif",
  "'Sawarabi Mincho', serif",
  "'Zen Kurenaido', cursive",
];

// ─── Hiragana — Gojūon (46) ─────────────────────────────────────
const HIRAGANA_GOJUON = [
  // Vowels
  { char: 'あ', romaji: 'a'   },
  { char: 'い', romaji: 'i'   },
  { char: 'う', romaji: 'u'   },
  { char: 'え', romaji: 'e'   },
  { char: 'お', romaji: 'o'   },
  // K-row
  { char: 'か', romaji: 'ka'  },
  { char: 'き', romaji: 'ki'  },
  { char: 'く', romaji: 'ku'  },
  { char: 'け', romaji: 'ke'  },
  { char: 'こ', romaji: 'ko'  },
  // S-row
  { char: 'さ', romaji: 'sa'  },
  { char: 'し', romaji: 'shi', alt: ['si'] },
  { char: 'す', romaji: 'su'  },
  { char: 'せ', romaji: 'se'  },
  { char: 'そ', romaji: 'so'  },
  // T-row
  { char: 'た', romaji: 'ta'  },
  { char: 'ち', romaji: 'chi', alt: ['ti'] },
  { char: 'つ', romaji: 'tsu', alt: ['tu'] },
  { char: 'て', romaji: 'te'  },
  { char: 'と', romaji: 'to'  },
  // N-row
  { char: 'な', romaji: 'na'  },
  { char: 'に', romaji: 'ni'  },
  { char: 'ぬ', romaji: 'nu'  },
  { char: 'ね', romaji: 'ne'  },
  { char: 'の', romaji: 'no'  },
  // H-row
  { char: 'は', romaji: 'ha'  },
  { char: 'ひ', romaji: 'hi'  },
  { char: 'ふ', romaji: 'fu',  alt: ['hu'] },
  { char: 'へ', romaji: 'he'  },
  { char: 'ほ', romaji: 'ho'  },
  // M-row
  { char: 'ま', romaji: 'ma'  },
  { char: 'み', romaji: 'mi'  },
  { char: 'む', romaji: 'mu'  },
  { char: 'め', romaji: 'me'  },
  { char: 'も', romaji: 'mo'  },
  // Y-row
  { char: 'や', romaji: 'ya'  },
  { char: 'ゆ', romaji: 'yu'  },
  { char: 'よ', romaji: 'yo'  },
  // R-row
  { char: 'ら', romaji: 'ra'  },
  { char: 'り', romaji: 'ri'  },
  { char: 'る', romaji: 'ru'  },
  { char: 'れ', romaji: 're'  },
  { char: 'ろ', romaji: 'ro'  },
  // W-row + ん
  { char: 'わ', romaji: 'wa'  },
  { char: 'を', romaji: 'wo',  alt: ['o'] },
  { char: 'ん', romaji: 'n'   },
];

// ─── Hiragana — Dakuten / voiced (20) ───────────────────────────
const HIRAGANA_DAKUTEN = [
  { char: 'が', romaji: 'ga'  },
  { char: 'ぎ', romaji: 'gi'  },
  { char: 'ぐ', romaji: 'gu'  },
  { char: 'げ', romaji: 'ge'  },
  { char: 'ご', romaji: 'go'  },
  { char: 'ざ', romaji: 'za'  },
  { char: 'じ', romaji: 'ji',  alt: ['zi'] },
  { char: 'ず', romaji: 'zu'  },
  { char: 'ぜ', romaji: 'ze'  },
  { char: 'ぞ', romaji: 'zo'  },
  { char: 'だ', romaji: 'da'  },
  { char: 'ぢ', romaji: 'di',  alt: ['dji', 'dzi'] },
  { char: 'づ', romaji: 'du',  alt: ['dzu'] },
  { char: 'で', romaji: 'de'  },
  { char: 'ど', romaji: 'do'  },
  { char: 'ば', romaji: 'ba'  },
  { char: 'び', romaji: 'bi'  },
  { char: 'ぶ', romaji: 'bu'  },
  { char: 'べ', romaji: 'be'  },
  { char: 'ぼ', romaji: 'bo'  },
];

// ─── Hiragana — Handakuten / semi-voiced (5) ────────────────────
const HIRAGANA_HANDAKUTEN = [
  { char: 'ぱ', romaji: 'pa'  },
  { char: 'ぴ', romaji: 'pi'  },
  { char: 'ぷ', romaji: 'pu'  },
  { char: 'ぺ', romaji: 'pe'  },
  { char: 'ぽ', romaji: 'po'  },
];

// ─── Hiragana — Yōon / compound (33) ────────────────────────────
const HIRAGANA_YOUON = [
  { char: 'きゃ', romaji: 'kya' },
  { char: 'きゅ', romaji: 'kyu' },
  { char: 'きょ', romaji: 'kyo' },
  { char: 'しゃ', romaji: 'sha', alt: ['sya'] },
  { char: 'しゅ', romaji: 'shu', alt: ['syu'] },
  { char: 'しょ', romaji: 'sho', alt: ['syo'] },
  { char: 'ちゃ', romaji: 'cha', alt: ['tya'] },
  { char: 'ちゅ', romaji: 'chu', alt: ['tyu'] },
  { char: 'ちょ', romaji: 'cho', alt: ['tyo'] },
  { char: 'にゃ', romaji: 'nya' },
  { char: 'にゅ', romaji: 'nyu' },
  { char: 'にょ', romaji: 'nyo' },
  { char: 'ひゃ', romaji: 'hya' },
  { char: 'ひゅ', romaji: 'hyu' },
  { char: 'ひょ', romaji: 'hyo' },
  { char: 'みゃ', romaji: 'mya' },
  { char: 'みゅ', romaji: 'myu' },
  { char: 'みょ', romaji: 'myo' },
  { char: 'りゃ', romaji: 'rya' },
  { char: 'りゅ', romaji: 'ryu' },
  { char: 'りょ', romaji: 'ryo' },
  { char: 'ぎゃ', romaji: 'gya' },
  { char: 'ぎゅ', romaji: 'gyu' },
  { char: 'ぎょ', romaji: 'gyo' },
  { char: 'じゃ', romaji: 'ja',  alt: ['jya', 'zya'] },
  { char: 'じゅ', romaji: 'ju',  alt: ['jyu', 'zyu'] },
  { char: 'じょ', romaji: 'jo',  alt: ['jyo', 'zyo'] },
  { char: 'びゃ', romaji: 'bya' },
  { char: 'びゅ', romaji: 'byu' },
  { char: 'びょ', romaji: 'byo' },
  { char: 'ぴゃ', romaji: 'pya' },
  { char: 'ぴゅ', romaji: 'pyu' },
  { char: 'ぴょ', romaji: 'pyo' },
];

// ─── Katakana — Gojūon (46) ─────────────────────────────────────
const KATAKANA_GOJUON = [
  { char: 'ア', romaji: 'a'   },
  { char: 'イ', romaji: 'i'   },
  { char: 'ウ', romaji: 'u'   },
  { char: 'エ', romaji: 'e'   },
  { char: 'オ', romaji: 'o'   },
  { char: 'カ', romaji: 'ka'  },
  { char: 'キ', romaji: 'ki'  },
  { char: 'ク', romaji: 'ku'  },
  { char: 'ケ', romaji: 'ke'  },
  { char: 'コ', romaji: 'ko'  },
  { char: 'サ', romaji: 'sa'  },
  { char: 'シ', romaji: 'shi', alt: ['si'] },
  { char: 'ス', romaji: 'su'  },
  { char: 'セ', romaji: 'se'  },
  { char: 'ソ', romaji: 'so'  },
  { char: 'タ', romaji: 'ta'  },
  { char: 'チ', romaji: 'chi', alt: ['ti'] },
  { char: 'ツ', romaji: 'tsu', alt: ['tu'] },
  { char: 'テ', romaji: 'te'  },
  { char: 'ト', romaji: 'to'  },
  { char: 'ナ', romaji: 'na'  },
  { char: 'ニ', romaji: 'ni'  },
  { char: 'ヌ', romaji: 'nu'  },
  { char: 'ネ', romaji: 'ne'  },
  { char: 'ノ', romaji: 'no'  },
  { char: 'ハ', romaji: 'ha'  },
  { char: 'ヒ', romaji: 'hi'  },
  { char: 'フ', romaji: 'fu',  alt: ['hu'] },
  { char: 'ヘ', romaji: 'he'  },
  { char: 'ホ', romaji: 'ho'  },
  { char: 'マ', romaji: 'ma'  },
  { char: 'ミ', romaji: 'mi'  },
  { char: 'ム', romaji: 'mu'  },
  { char: 'メ', romaji: 'me'  },
  { char: 'モ', romaji: 'mo'  },
  { char: 'ヤ', romaji: 'ya'  },
  { char: 'ユ', romaji: 'yu'  },
  { char: 'ヨ', romaji: 'yo'  },
  { char: 'ラ', romaji: 'ra'  },
  { char: 'リ', romaji: 'ri'  },
  { char: 'ル', romaji: 'ru'  },
  { char: 'レ', romaji: 're'  },
  { char: 'ロ', romaji: 'ro'  },
  { char: 'ワ', romaji: 'wa'  },
  { char: 'ヲ', romaji: 'wo',  alt: ['o'] },
  { char: 'ン', romaji: 'n'   },
];

// ─── Katakana — Dakuten / voiced (20) ───────────────────────────
const KATAKANA_DAKUTEN = [
  { char: 'ガ', romaji: 'ga'  },
  { char: 'ギ', romaji: 'gi'  },
  { char: 'グ', romaji: 'gu'  },
  { char: 'ゲ', romaji: 'ge'  },
  { char: 'ゴ', romaji: 'go'  },
  { char: 'ザ', romaji: 'za'  },
  { char: 'ジ', romaji: 'ji',  alt: ['zi'] },
  { char: 'ズ', romaji: 'zu'  },
  { char: 'ゼ', romaji: 'ze'  },
  { char: 'ゾ', romaji: 'zo'  },
  { char: 'ダ', romaji: 'da'  },
  { char: 'ヂ', romaji: 'di',  alt: ['dji', 'dzi'] },
  { char: 'ヅ', romaji: 'du',  alt: ['dzu'] },
  { char: 'デ', romaji: 'de'  },
  { char: 'ド', romaji: 'do'  },
  { char: 'バ', romaji: 'ba'  },
  { char: 'ビ', romaji: 'bi'  },
  { char: 'ブ', romaji: 'bu'  },
  { char: 'ベ', romaji: 'be'  },
  { char: 'ボ', romaji: 'bo'  },
];

// ─── Katakana — Handakuten (5) ───────────────────────────────────
const KATAKANA_HANDAKUTEN = [
  { char: 'パ', romaji: 'pa'  },
  { char: 'ピ', romaji: 'pi'  },
  { char: 'プ', romaji: 'pu'  },
  { char: 'ペ', romaji: 'pe'  },
  { char: 'ポ', romaji: 'po'  },
];

// ─── Katakana — Yōon (33) ───────────────────────────────────────
const KATAKANA_YOUON = [
  { char: 'キャ', romaji: 'kya' },
  { char: 'キュ', romaji: 'kyu' },
  { char: 'キョ', romaji: 'kyo' },
  { char: 'シャ', romaji: 'sha', alt: ['sya'] },
  { char: 'シュ', romaji: 'shu', alt: ['syu'] },
  { char: 'ショ', romaji: 'sho', alt: ['syo'] },
  { char: 'チャ', romaji: 'cha', alt: ['tya'] },
  { char: 'チュ', romaji: 'chu', alt: ['tyu'] },
  { char: 'チョ', romaji: 'cho', alt: ['tyo'] },
  { char: 'ニャ', romaji: 'nya' },
  { char: 'ニュ', romaji: 'nyu' },
  { char: 'ニョ', romaji: 'nyo' },
  { char: 'ヒャ', romaji: 'hya' },
  { char: 'ヒュ', romaji: 'hyu' },
  { char: 'ヒョ', romaji: 'hyo' },
  { char: 'ミャ', romaji: 'mya' },
  { char: 'ミュ', romaji: 'myu' },
  { char: 'ミョ', romaji: 'myo' },
  { char: 'リャ', romaji: 'rya' },
  { char: 'リュ', romaji: 'ryu' },
  { char: 'リョ', romaji: 'ryo' },
  { char: 'ギャ', romaji: 'gya' },
  { char: 'ギュ', romaji: 'gyu' },
  { char: 'ギョ', romaji: 'gyo' },
  { char: 'ジャ', romaji: 'ja',  alt: ['jya', 'zya'] },
  { char: 'ジュ', romaji: 'ju',  alt: ['jyu', 'zyu'] },
  { char: 'ジョ', romaji: 'jo',  alt: ['jyo', 'zyo'] },
  { char: 'ビャ', romaji: 'bya' },
  { char: 'ビュ', romaji: 'byu' },
  { char: 'ビョ', romaji: 'byo' },
  { char: 'ピャ', romaji: 'pya' },
  { char: 'ピュ', romaji: 'pyu' },
  { char: 'ピョ', romaji: 'pyo' },
];

// ─── Word lists ──────────────────────────────────────────────────
const WORDS_HIRAGANA = [
  // Animales
  { word: 'いぬ',     romaji: 'inu',       emoji: '🐕',  meaning: 'perro' },
  { word: 'ねこ',     romaji: 'neko',      emoji: '🐱',  meaning: 'gato' },
  { word: 'さかな',   romaji: 'sakana',    emoji: '🐟',  meaning: 'pez' },
  { word: 'とり',     romaji: 'tori',      emoji: '🐦',  meaning: 'pájaro' },
  { word: 'うま',     romaji: 'uma',       emoji: '🐴',  meaning: 'caballo' },
  { word: 'うし',     romaji: 'ushi',      emoji: '🐄',  meaning: 'vaca' },
  { word: 'くま',     romaji: 'kuma',      emoji: '🐻',  meaning: 'oso' },
  { word: 'うさぎ',   romaji: 'usagi',     emoji: '🐰',  meaning: 'conejo' },
  { word: 'かめ',     romaji: 'kame',      emoji: '🐢',  meaning: 'tortuga' },
  { word: 'さる',     romaji: 'saru',      emoji: '🐒',  meaning: 'mono' },
  { word: 'へび',     romaji: 'hebi',      emoji: '🐍',  meaning: 'serpiente' },
  { word: 'かに',     romaji: 'kani',      emoji: '🦀',  meaning: 'cangrejo' },
  { word: 'たこ',     romaji: 'tako',      emoji: '🐙',  meaning: 'pulpo' },
  { word: 'とら',     romaji: 'tora',      emoji: '🐯',  meaning: 'tigre' },
  { word: 'きつね',   romaji: 'kitsune',   emoji: '🦊',  meaning: 'zorro' },
  { word: 'ねずみ',   romaji: 'nezumi',    emoji: '🐭',  meaning: 'ratón' },
  { word: 'かえる',   romaji: 'kaeru',     emoji: '🐸',  meaning: 'rana' },
  { word: 'ちょう',   romaji: 'chou',      emoji: '🦋',  meaning: 'mariposa' },
  { word: 'はと',     romaji: 'hato',      emoji: '🕊️',  meaning: 'paloma' },
  { word: 'しか',     romaji: 'shika',     emoji: '🦌',  meaning: 'ciervo' },
  { word: 'ぞう',     romaji: 'zou',       emoji: '🐘',  meaning: 'elefante' },
  { word: 'たぬき',   romaji: 'tanuki',    emoji: '🦝',  meaning: 'mapache japonés' },
  { word: 'くじら',   romaji: 'kujira',    emoji: '🐋',  meaning: 'ballena' },
  { word: 'いるか',   romaji: 'iruka',     emoji: '🐬',  meaning: 'delfín' },
  { word: 'こうもり', romaji: 'koumori',   emoji: '🦇',  meaning: 'murciélago' },
  // Naturaleza
  { word: 'はな',     romaji: 'hana',      emoji: '🌸',  meaning: 'flor' },
  { word: 'き',       romaji: 'ki',        emoji: '🌳',  meaning: 'árbol' },
  { word: 'やま',     romaji: 'yama',      emoji: '⛰️',  meaning: 'montaña' },
  { word: 'かわ',     romaji: 'kawa',      emoji: '🏞️',  meaning: 'río' },
  { word: 'うみ',     romaji: 'umi',       emoji: '🌊',  meaning: 'mar' },
  { word: 'しま',     romaji: 'shima',     emoji: '🏝️',  meaning: 'isla' },
  { word: 'もり',     romaji: 'mori',      emoji: '🌲',  meaning: 'bosque' },
  { word: 'そら',     romaji: 'sora',      emoji: '🌤️',  meaning: 'cielo' },
  { word: 'くも',     romaji: 'kumo',      emoji: '☁️',  meaning: 'nube' },
  { word: 'たいよう', romaji: 'taiyou',    emoji: '☀️',  meaning: 'sol' },
  { word: 'つき',     romaji: 'tsuki',     emoji: '🌙',  meaning: 'luna' },
  { word: 'ほし',     romaji: 'hoshi',     emoji: '⭐',  meaning: 'estrella' },
  { word: 'にじ',     romaji: 'niji',      emoji: '🌈',  meaning: 'arcoíris' },
  { word: 'みず',     romaji: 'mizu',      emoji: '💧',  meaning: 'agua' },
  { word: 'さくら',   romaji: 'sakura',    emoji: '🌸',  meaning: 'flor de cerezo' },
  // Clima / estaciones
  { word: 'あめ',     romaji: 'ame',       emoji: '🌧️',  meaning: 'lluvia' },
  { word: 'ゆき',     romaji: 'yuki',      emoji: '❄️',  meaning: 'nieve' },
  { word: 'かぜ',     romaji: 'kaze',      emoji: '🌬️',  meaning: 'viento' },
  { word: 'かみなり', romaji: 'kaminari',  emoji: '⚡',  meaning: 'trueno' },
  { word: 'はる',     romaji: 'haru',      emoji: '🌱',  meaning: 'primavera' },
  { word: 'なつ',     romaji: 'natsu',     emoji: '🌻',  meaning: 'verano' },
  { word: 'あき',     romaji: 'aki',       emoji: '🍂',  meaning: 'otoño' },
  { word: 'ふゆ',     romaji: 'fuyu',      emoji: '⛄',  meaning: 'invierno' },
  // Colores
  { word: 'あか',     romaji: 'aka',       emoji: '🔴',  meaning: 'rojo' },
  { word: 'あお',     romaji: 'ao',        emoji: '🔵',  meaning: 'azul' },
  { word: 'しろ',     romaji: 'shiro',     emoji: '⬜',  meaning: 'blanco' },
  { word: 'くろ',     romaji: 'kuro',      emoji: '⬛',  meaning: 'negro' },
  { word: 'きいろ',   romaji: 'kiiro',     emoji: '🟡',  meaning: 'amarillo' },
  { word: 'みどり',   romaji: 'midori',    emoji: '🟢',  meaning: 'verde' },
  // Comida y bebida
  { word: 'ごはん',   romaji: 'gohan',     emoji: '🍚',  meaning: 'arroz / comida' },
  { word: 'おちゃ',   romaji: 'ocha',      emoji: '🍵',  meaning: 'té verde' },
  { word: 'すし',     romaji: 'sushi',     emoji: '🍣',  meaning: 'sushi' },
  { word: 'おにぎり', romaji: 'onigiri',   emoji: '🍙',  meaning: 'onigiri' },
  { word: 'うどん',   romaji: 'udon',      emoji: '🍜',  meaning: 'udon' },
  { word: 'そば',     romaji: 'soba',      emoji: '🍝',  meaning: 'soba' },
  { word: 'みそ',     romaji: 'miso',      emoji: '🫕',  meaning: 'miso' },
  { word: 'たまご',   romaji: 'tamago',    emoji: '🥚',  meaning: 'huevo' },
  { word: 'にく',     romaji: 'niku',      emoji: '🥩',  meaning: 'carne' },
  { word: 'やさい',   romaji: 'yasai',     emoji: '🥦',  meaning: 'verdura' },
  { word: 'りんご',   romaji: 'ringo',     emoji: '🍎',  meaning: 'manzana' },
  { word: 'みかん',   romaji: 'mikan',     emoji: '🍊',  meaning: 'mandarina' },
  { word: 'いちご',   romaji: 'ichigo',    emoji: '🍓',  meaning: 'frutilla' },
  { word: 'もも',     romaji: 'momo',      emoji: '🍑',  meaning: 'durazno' },
  { word: 'ぶどう',   romaji: 'budou',     emoji: '🍇',  meaning: 'uva' },
  { word: 'すいか',   romaji: 'suika',     emoji: '🍉',  meaning: 'sandía' },
  { word: 'さけ',     romaji: 'sake',      emoji: '🍶',  meaning: 'sake' },
  // Cuerpo
  { word: 'め',       romaji: 'me',        emoji: '👁️',  meaning: 'ojo' },
  { word: 'みみ',     romaji: 'mimi',      emoji: '👂',  meaning: 'oreja' },
  { word: 'くち',     romaji: 'kuchi',     emoji: '👄',  meaning: 'boca' },
  { word: 'て',       romaji: 'te',        emoji: '✋',  meaning: 'mano' },
  { word: 'あし',     romaji: 'ashi',      emoji: '🦵',  meaning: 'pie / pierna' },
  { word: 'かお',     romaji: 'kao',       emoji: '😊',  meaning: 'cara' },
  { word: 'あたま',   romaji: 'atama',     emoji: '🗣️',  meaning: 'cabeza' },
  { word: 'は',       romaji: 'ha',        emoji: '🦷',  meaning: 'diente' },
  // Objetos y vida cotidiana
  { word: 'くるま',   romaji: 'kuruma',    emoji: '🚗',  meaning: 'auto' },
  { word: 'でんしゃ', romaji: 'densha',    emoji: '🚃',  meaning: 'tren' },
  { word: 'いえ',     romaji: 'ie',        emoji: '🏠',  meaning: 'casa' },
  { word: 'まち',     romaji: 'machi',     emoji: '🏙️',  meaning: 'ciudad' },
  { word: 'がっこう', romaji: 'gakkou',    emoji: '🏫',  meaning: 'escuela' },
  { word: 'ほん',     romaji: 'hon',       emoji: '📚',  meaning: 'libro' },
  { word: 'かさ',     romaji: 'kasa',      emoji: '☂️',  meaning: 'paraguas' },
  { word: 'くつ',     romaji: 'kutsu',     emoji: '👟',  meaning: 'zapatos' },
  { word: 'でんわ',   romaji: 'denwa',     emoji: '📞',  meaning: 'teléfono' },
  { word: 'とけい',   romaji: 'tokei',     emoji: '⏰',  meaning: 'reloj' },
  { word: 'えんぴつ', romaji: 'enpitsu',   emoji: '✏️',  meaning: 'lápiz' },
  { word: 'かみ',     romaji: 'kami',      emoji: '📄',  meaning: 'papel' },
  { word: 'まど',     romaji: 'mado',      emoji: '🪟',  meaning: 'ventana' },
  { word: 'べんとう', romaji: 'bentou',    emoji: '🍱',  meaning: 'bento' },
  { word: 'かばん',   romaji: 'kaban',     emoji: '👜',  meaning: 'bolso' },
  { word: 'くすり',   romaji: 'kusuri',    emoji: '💊',  meaning: 'medicina' },
  { word: 'はし',     romaji: 'hashi',     emoji: '🥢',  meaning: 'palillos' },
  // Personas y conceptos
  { word: 'こども',   romaji: 'kodomo',    emoji: '👶',  meaning: 'niño' },
  { word: 'ともだち', romaji: 'tomodachi', emoji: '👫',  meaning: 'amigo' },
  { word: 'せんせい', romaji: 'sensei',    emoji: '👩‍🏫',  meaning: 'maestro' },
  { word: 'おとこ',   romaji: 'otoko',     emoji: '👨',  meaning: 'hombre' },
  { word: 'おんな',   romaji: 'onna',      emoji: '👩',  meaning: 'mujer' },
  { word: 'にほん',   romaji: 'nihon',     emoji: '🗾',  meaning: 'Japón' },
  { word: 'うた',     romaji: 'uta',       emoji: '🎵',  meaning: 'canción' },
  { word: 'おんがく', romaji: 'ongaku',    emoji: '🎶',  meaning: 'música' },
  { word: 'まつり',   romaji: 'matsuri',   emoji: '🎆',  meaning: 'festival' },
  { word: 'ゆめ',     romaji: 'yume',      emoji: '💭',  meaning: 'sueño' },
  { word: 'こころ',   romaji: 'kokoro',    emoji: '❤️',  meaning: 'corazón' },
  { word: 'むら',     romaji: 'mura',      emoji: '🏘️',  meaning: 'aldea' },
  { word: 'ひかり',   romaji: 'hikari',    emoji: '💡',  meaning: 'luz' },
];

const WORDS_KATAKANA = [
  // Bebidas
  { word: 'コーヒー',       romaji: 'koohii',      emoji: '☕',  meaning: 'café' },
  { word: 'ジュース',       romaji: 'juusu',       emoji: '🧃',  meaning: 'jugo' },
  { word: 'ミルク',         romaji: 'miruku',      emoji: '🥛',  meaning: 'leche' },
  { word: 'ビール',         romaji: 'biiru',       emoji: '🍺',  meaning: 'cerveza' },
  { word: 'ワイン',         romaji: 'wain',        emoji: '🍷',  meaning: 'vino' },
  { word: 'アイスティー',   romaji: 'aisutii',     emoji: '🧋',  meaning: 'té helado' },
  // Comida
  { word: 'パン',           romaji: 'pan',         emoji: '🍞',  meaning: 'pan' },
  { word: 'ケーキ',         romaji: 'keeki',       emoji: '🎂',  meaning: 'torta' },
  { word: 'ピザ',           romaji: 'piza',        emoji: '🍕',  meaning: 'pizza' },
  { word: 'バナナ',         romaji: 'banana',      emoji: '🍌',  meaning: 'banana' },
  { word: 'アイス',         romaji: 'aisu',        emoji: '🍦',  meaning: 'helado' },
  { word: 'チョコレート',   romaji: 'chokoreeto',  emoji: '🍫',  meaning: 'chocolate' },
  { word: 'ラーメン',       romaji: 'raamen',      emoji: '🍜',  meaning: 'ramen' },
  { word: 'カレー',         romaji: 'karee',       emoji: '🍛',  meaning: 'curry' },
  { word: 'サラダ',         romaji: 'sarada',      emoji: '🥗',  meaning: 'ensalada' },
  { word: 'ハンバーガー',   romaji: 'hanbaagaa',   emoji: '🍔',  meaning: 'hamburguesa' },
  { word: 'サンドイッチ',   romaji: 'sandoicchi',  emoji: '🥪',  meaning: 'sándwich' },
  { word: 'チーズ',         romaji: 'chiizu',      emoji: '🧀',  meaning: 'queso' },
  { word: 'バター',         romaji: 'bataa',       emoji: '🧈',  meaning: 'mantequilla' },
  { word: 'ヨーグルト',     romaji: 'yooguruto',   emoji: '🫙',  meaning: 'yogur' },
  { word: 'クッキー',       romaji: 'kukkii',      emoji: '🍪',  meaning: 'galleta' },
  { word: 'ドーナツ',       romaji: 'doonatsu',    emoji: '🍩',  meaning: 'dona' },
  { word: 'プリン',         romaji: 'purin',       emoji: '🍮',  meaning: 'flan' },
  { word: 'チキン',         romaji: 'chikin',      emoji: '🍗',  meaning: 'pollo' },
  { word: 'ポテト',         romaji: 'poteto',      emoji: '🍟',  meaning: 'papas fritas' },
  { word: 'アイスクリーム', romaji: 'aisukuriimu', emoji: '🍨',  meaning: 'helado' },
  { word: 'オレンジ',       romaji: 'orenji',      emoji: '🍊',  meaning: 'naranja' },
  { word: 'ストロベリー',   romaji: 'sutoroberii', emoji: '🍓',  meaning: 'frutilla' },
  // Tecnología
  { word: 'カメラ',         romaji: 'kamera',      emoji: '📷',  meaning: 'cámara' },
  { word: 'テレビ',         romaji: 'terebi',      emoji: '📺',  meaning: 'televisión' },
  { word: 'スマホ',         romaji: 'sumaho',      emoji: '📱',  meaning: 'smartphone' },
  { word: 'コンピュータ',   romaji: 'konpyuuta',   emoji: '💻',  meaning: 'computadora' },
  { word: 'タブレット',     romaji: 'taburetto',   emoji: '📱',  meaning: 'tablet' },
  { word: 'インターネット', romaji: 'intaanetto',  emoji: '🌐',  meaning: 'internet' },
  { word: 'イヤホン',       romaji: 'iyahon',      emoji: '🎧',  meaning: 'auriculares' },
  { word: 'スピーカー',     romaji: 'supiikaa',    emoji: '🔊',  meaning: 'parlante' },
  { word: 'ロボット',       romaji: 'robotto',     emoji: '🤖',  meaning: 'robot' },
  { word: 'ゲーム',         romaji: 'geemu',       emoji: '🎮',  meaning: 'videojuego' },
  { word: 'プリンター',     romaji: 'purintaa',    emoji: '🖨️',  meaning: 'impresora' },
  // Transporte
  { word: 'タクシー',       romaji: 'takushii',    emoji: '🚕',  meaning: 'taxi' },
  { word: 'バス',           romaji: 'basu',        emoji: '🚌',  meaning: 'autobús' },
  { word: 'バイク',         romaji: 'baiku',       emoji: '🏍️',  meaning: 'moto' },
  { word: 'トラック',       romaji: 'torakku',     emoji: '🚛',  meaning: 'camión' },
  { word: 'ヘリコプター',   romaji: 'herikoputaa', emoji: '🚁',  meaning: 'helicóptero' },
  { word: 'ロケット',       romaji: 'roketto',     emoji: '🚀',  meaning: 'cohete' },
  { word: 'ボート',         romaji: 'booto',       emoji: '⛵',  meaning: 'bote' },
  // Lugares
  { word: 'ホテル',         romaji: 'hoteru',      emoji: '🏨',  meaning: 'hotel' },
  { word: 'レストラン',     romaji: 'resutoran',   emoji: '🍽️',  meaning: 'restaurante' },
  { word: 'コンビニ',       romaji: 'konbini',     emoji: '🏪',  meaning: 'tienda 24h' },
  { word: 'アパート',       romaji: 'apaato',      emoji: '🏢',  meaning: 'departamento' },
  { word: 'スーパー',       romaji: 'suupaa',      emoji: '🛒',  meaning: 'supermercado' },
  { word: 'デパート',       romaji: 'depaato',     emoji: '🏬',  meaning: 'tienda departamental' },
  { word: 'プール',         romaji: 'puuru',       emoji: '🏊',  meaning: 'pileta' },
  { word: 'カフェ',         romaji: 'kafe',        emoji: '☕',  meaning: 'cafetería' },
  { word: 'スタジアム',     romaji: 'sutajiamu',   emoji: '🏟️',  meaning: 'estadio' },
  { word: 'ビーチ',         romaji: 'biichi',      emoji: '🏖️',  meaning: 'playa' },
  // Deportes
  { word: 'サッカー',       romaji: 'sakkaa',      emoji: '⚽',  meaning: 'fútbol' },
  { word: 'テニス',         romaji: 'tenisu',      emoji: '🎾',  meaning: 'tenis' },
  { word: 'バスケット',     romaji: 'basuketto',   emoji: '🏀',  meaning: 'básquet' },
  { word: 'バレー',         romaji: 'baree',       emoji: '🏐',  meaning: 'vóley' },
  { word: 'スキー',         romaji: 'sukii',       emoji: '⛷️',  meaning: 'esquí' },
  { word: 'ゴルフ',         romaji: 'gorufu',      emoji: '⛳',  meaning: 'golf' },
  { word: 'ダンス',         romaji: 'dansu',       emoji: '💃',  meaning: 'danza' },
  { word: 'ヨガ',           romaji: 'yoga',        emoji: '🧘',  meaning: 'yoga' },
  { word: 'ボクシング',     romaji: 'bokushingu',  emoji: '🥊',  meaning: 'boxeo' },
  // Música
  { word: 'ギター',         romaji: 'gitaa',       emoji: '🎸',  meaning: 'guitarra' },
  { word: 'ピアノ',         romaji: 'piano',       emoji: '🎹',  meaning: 'piano' },
  { word: 'ドラム',         romaji: 'doramu',      emoji: '🥁',  meaning: 'batería' },
  { word: 'バイオリン',     romaji: 'baiorin',     emoji: '🎻',  meaning: 'violín' },
  { word: 'トランペット',   romaji: 'torampetto',  emoji: '🎺',  meaning: 'trompeta' },
  { word: 'マイク',         romaji: 'maiku',       emoji: '🎤',  meaning: 'micrófono' },
  // Ropa
  { word: 'ジャケット',     romaji: 'jaketto',     emoji: '🧥',  meaning: 'chaqueta' },
  { word: 'スカート',       romaji: 'sukaato',     emoji: '👗',  meaning: 'falda' },
  { word: 'セーター',       romaji: 'seetaa',      emoji: '🧣',  meaning: 'suéter' },
  { word: 'ジーンズ',       romaji: 'jiinzu',      emoji: '👖',  meaning: 'jeans' },
  { word: 'マスク',         romaji: 'masuku',      emoji: '😷',  meaning: 'mascarilla' },
  // Animales (loanwords)
  { word: 'パンダ',         romaji: 'panda',       emoji: '🐼',  meaning: 'panda' },
  { word: 'コアラ',         romaji: 'koara',       emoji: '🐨',  meaning: 'koala' },
  { word: 'ペンギン',       romaji: 'pengin',      emoji: '🐧',  meaning: 'pingüino' },
  { word: 'フラミンゴ',     romaji: 'furamingo',   emoji: '🦩',  meaning: 'flamenco' },
  { word: 'キリン',         romaji: 'kirin',       emoji: '🦒',  meaning: 'jirafa' },
  { word: 'ライオン',       romaji: 'raion',       emoji: '🦁',  meaning: 'león' },
  { word: 'ゴリラ',         romaji: 'gorira',      emoji: '🦍',  meaning: 'gorila' },
  // Hogar / objetos
  { word: 'ベッド',         romaji: 'beddo',       emoji: '🛏️',  meaning: 'cama' },
  { word: 'ソファ',         romaji: 'sofa',        emoji: '🛋️',  meaning: 'sofá' },
  { word: 'テーブル',       romaji: 'teeburn',     emoji: '🪑',  meaning: 'mesa' },
  { word: 'エアコン',       romaji: 'eakon',       emoji: '❄️',  meaning: 'aire acondicionado' },
  { word: 'シャワー',       romaji: 'shawaa',      emoji: '🚿',  meaning: 'ducha' },
  { word: 'トイレ',         romaji: 'toire',       emoji: '🚽',  meaning: 'baño' },
  { word: 'バッグ',         romaji: 'baggu',       emoji: '👜',  meaning: 'bolso' },
  // Entretenimiento
  { word: 'アニメ',         romaji: 'anime',       emoji: '📺',  meaning: 'anime' },
  { word: 'マンガ',         romaji: 'manga',       emoji: '📖',  meaning: 'manga' },
  { word: 'ドラマ',         romaji: 'dorama',      emoji: '🎭',  meaning: 'serie / drama' },
  { word: 'ニュース',       romaji: 'nyuusu',      emoji: '📰',  meaning: 'noticias' },
  { word: 'チケット',       romaji: 'chiketto',    emoji: '🎫',  meaning: 'ticket' },
];

// ─── Table layout definitions ────────────────────────────────────
// Each row: label (displayed) + romajis (used to look up the kana char) + rowClass (CSS color)
// null in romajis = empty cell

const TABLE_GOJUON_ROWS = [
  { label: '—',  romajis: ['a',  'i',   'u',   'e',  'o'],  rowClass: 'row-vowel' },
  { label: 'k',  romajis: ['ka', 'ki',  'ku',  'ke', 'ko'], rowClass: 'row-k' },
  { label: 's',  romajis: ['sa', 'shi', 'su',  'se', 'so'], rowClass: 'row-s' },
  { label: 't',  romajis: ['ta', 'chi', 'tsu', 'te', 'to'], rowClass: 'row-t' },
  { label: 'n',  romajis: ['na', 'ni',  'nu',  'ne', 'no'], rowClass: 'row-n' },
  { label: 'h',  romajis: ['ha', 'hi',  'fu',  'he', 'ho'], rowClass: 'row-h' },
  { label: 'm',  romajis: ['ma', 'mi',  'mu',  'me', 'mo'], rowClass: 'row-m' },
  { label: 'y',  romajis: ['ya', null,  'yu',  null, 'yo'], rowClass: 'row-y' },
  { label: 'r',  romajis: ['ra', 'ri',  'ru',  're', 'ro'], rowClass: 'row-r' },
  { label: 'w',  romajis: ['wa', null,  null,  null, 'wo'], rowClass: 'row-w' },
  { label: 'n',  romajis: [null, null,  'n',   null, null], rowClass: 'row-nn' },
];

const TABLE_DAKUTEN_ROWS = [
  { label: 'g',  romajis: ['ga', 'gi', 'gu', 'ge', 'go'], rowClass: 'row-g' },
  { label: 'z',  romajis: ['za', 'ji', 'zu', 'ze', 'zo'], rowClass: 'row-z' },
  { label: 'd',  romajis: ['da', 'di', 'du', 'de', 'do'], rowClass: 'row-d' },
  { label: 'b',  romajis: ['ba', 'bi', 'bu', 'be', 'bo'], rowClass: 'row-b' },
  { label: 'p',  romajis: ['pa', 'pi', 'pu', 'pe', 'po'], rowClass: 'row-p' },
];

// Yōon columns: ya / yu / yo
const TABLE_YOUON_ROWS = [
  { label: 'ky', romajis: ['kya', 'kyu', 'kyo'], rowClass: 'row-k' },
  { label: 'sh', romajis: ['sha', 'shu', 'sho'], rowClass: 'row-s' },
  { label: 'ch', romajis: ['cha', 'chu', 'cho'], rowClass: 'row-t' },
  { label: 'ny', romajis: ['nya', 'nyu', 'nyo'], rowClass: 'row-n' },
  { label: 'hy', romajis: ['hya', 'hyu', 'hyo'], rowClass: 'row-h' },
  { label: 'my', romajis: ['mya', 'myu', 'myo'], rowClass: 'row-m' },
  { label: 'ry', romajis: ['rya', 'ryu', 'ryo'], rowClass: 'row-r' },
  { label: 'gy', romajis: ['gya', 'gyu', 'gyo'], rowClass: 'row-g' },
  { label: 'j',  romajis: ['ja',  'ju',  'jo'],  rowClass: 'row-z' },
  { label: 'by', romajis: ['bya', 'byu', 'byo'], rowClass: 'row-b' },
  { label: 'py', romajis: ['pya', 'pyu', 'pyo'], rowClass: 'row-p' },
];

// ─── Lookup maps: romaji → kana character ────────────────────────
function _buildLookup(arrays) {
  const map = {};
  arrays.forEach(arr => arr.forEach(c => { map[c.romaji] = c.char; }));
  return map;
}

const HIRAGANA_LOOKUP = _buildLookup([
  HIRAGANA_GOJUON, HIRAGANA_DAKUTEN, HIRAGANA_HANDAKUTEN, HIRAGANA_YOUON,
]);

const KATAKANA_LOOKUP = _buildLookup([
  KATAKANA_GOJUON, KATAKANA_DAKUTEN, KATAKANA_HANDAKUTEN, KATAKANA_YOUON,
]);

// ─── Public data-access helpers ──────────────────────────────────

/**
 * Returns the flat character array for the given alphabet and enabled sets.
 * sets = { gojuon: bool, dakuten: bool, youon: bool }
 * Note: dakuten includes handakuten (both are "impuros").
 */
function getData(alphabet, sets) {
  const H = alphabet === 'hiragana';
  return [
    ...(sets.gojuon  ? (H ? HIRAGANA_GOJUON    : KATAKANA_GOJUON)    : []),
    ...(sets.dakuten ? (H ? [...HIRAGANA_DAKUTEN, ...HIRAGANA_HANDAKUTEN]
                          : [...KATAKANA_DAKUTEN, ...KATAKANA_HANDAKUTEN]) : []),
    ...(sets.youon   ? (H ? HIRAGANA_YOUON      : KATAKANA_YOUON)     : []),
  ];
}

/** Returns the word list for the given alphabet. */
function getWords(alphabet) {
  return alphabet === 'hiragana' ? WORDS_HIRAGANA : WORDS_KATAKANA;
}

/** Returns the romaji→char lookup map for the given alphabet. */
function getLookup(alphabet) {
  return alphabet === 'hiragana' ? HIRAGANA_LOOKUP : KATAKANA_LOOKUP;
}

/** Returns a random font from the pool. */
function randomFont() {
  return FONTS[Math.floor(Math.random() * FONTS.length)];
}

/** Fisher-Yates shuffle (returns a new array). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
