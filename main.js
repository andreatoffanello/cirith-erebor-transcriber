// ============================================================
// Cirth Erebor Transcriber – Old English → Angerthas Runes
// Dan Smith "Cirth Erebor" font family (cirth_ds charset)
//
// Mode: Angerthas Daeron baseline with Erebor reversions
// (certh 12=n, 29=r, 34=s, 54=h per Appendix E)
//
// OE Phonology: context-sensitive allophonic rules applied
// ============================================================

// --- Font mapping: certh number → ASCII key in the Erebor font ---
const CERTH_TO_KEY = {
  1: '1',   // p
  2: '2',   // b
  3: '3',   // f
  4: '4',   // v
  5: '5',   // hw
  6: '6',   // m
  7: '7',   // mb
  8: '8',   // t
  9: '9',   // d
  10: '0',  // θ (voiceless th, þ)
  11: '!',  // ð (voiced th, ð)
  12: '@',  // n
  13: '#',  // x (velar fricative, as in German "ach")
  14: '$',  // j / ʤ (palatal)
  15: '%',  // ʃ (sh)
  16: 'q',  // ʒ (zh)
  18: 'e',  // k
  19: 'r',  // g (velar stop)
  20: 't',  // kh
  21: 'y',  // ɣ (voiced velar fricative — gh)
  22: 'u',  // ŋ (ng, weak/final)
  23: 'i',  // kw
  24: 'o',  // gw
  25: 'p',  // khw
  27: 'W',  // ngw
  29: 'R',  // r
  30: 'T',  // rh (voiceless r)
  31: 'a',  // l
  32: 's',  // lh (voiceless l)
  33: 'd',  // nd
  34: 'f',  // s
  35: 'g',  // z (voiced s)
  36: 'h',  // ŋg (ng, Erebor)
  38: 'k',  // nd (variant)
  39: 'l',  // i (vowel)
  40: ';',  // j (consonantal y)
  42: 'S',  // u (vowel)
  44: 'F',  // w
  45: 'G',  // y (OE front rounded vowel /y/)
  46: 'z',  // e (vowel)
  47: 'x',  // ē (long e)
  48: 'c',  // a (vowel)
  49: 'v',  // ā (long a)
  50: 'b',  // o (vowel)
  51: 'n',  // ō (long o)
  54: '.',  // h
};

const PUNCT = {
  SPACE: ' ',
  WORD_SEP: '\\',
  SENTENCE: 'P',
  MID_DOT: 'I',
};

function K(certh) { return CERTH_TO_KEY[certh]; }

// --- Vowel helpers ---
const VOWELS = new Set('aeiouyæǣāēīōūȳ');
function isVowel(ch) { return ch && VOWELS.has(ch.toLowerCase()); }

const FRONT_VOWELS = new Set('eiæēīǣyȳ');
function isFrontVowel(ch) { return ch && FRONT_VOWELS.has(ch.toLowerCase()); }

const BACK_VOWELS = new Set('aouāōū');
function isBackVowel(ch) { return ch && BACK_VOWELS.has(ch.toLowerCase()); }

// ============================================================
// OE Phonological Context Analysis
// ============================================================

/**
 * OE 'c' palatalization:
 * - c before front vowel (e, i, æ, y) at word-initial → /tʃ/ (certh 15, ʃ-like)
 *   In Tolkien's Cirth there's no dedicated /tʃ/; we use certh 15 (ʃ)
 *   which is the closest approximation
 * - c before back vowel or consonant → /k/ (certh 18)
 * - cc → /tʃ/ or /kk/ depending on environment
 *
 * Note: This is a heuristic. True OE palatalization depends on
 * historical phonology, not just synchronic environment.
 * Words like "cēosan" → /tʃ/, but "cū" → /k/.
 */
function analyzeCSound(word, pos) {
  const next = word[pos + 1];
  // 'cw' and 'sc' are handled as digraphs before this
  if (!next) return { certh: 18, ipa: '/k/', desc: 'c → C18 (/k/)' };

  if (isFrontVowel(next)) {
    return { certh: 15, ipa: '/tʃ/', desc: 'c → C15 (/tʃ/ palatal)' };
  }
  return { certh: 18, ipa: '/k/', desc: 'c → C18 (/k/)' };
}

/**
 * OE 'g' context analysis:
 * 1. Word-initial before front vowel → palatal /j/ (certh 14)
 *    e.g., "gesetu" ge- = /je-/
 * 2. Word-initial before back vowel/consonant → velar /g/ (certh 19)
 *    e.g., "gōd" = /go:d/
 * 3. After front vowel (medial/final) → palatal /j/ (certh 14 or 40)
 *    e.g., "dæg" = /dæj/
 * 4. After back vowel or 'n' → voiced velar fricative /ɣ/ (certh 21)
 *    e.g., "boga" = /boɣa/, "mago" = /maɣo/
 * 5. In 'ng' cluster → handled separately as digraph
 */
function analyzeGSound(word, pos) {
  const prev = pos > 0 ? word[pos - 1] : null;
  const next = word[pos + 1];

  // Don't process if part of 'ng' digraph (handled separately)
  if (prev && prev === 'n') return null; // let 'ng' digraph rule handle it

  // Word-initial
  if (pos === 0 || !prev || !isVowel(prev)) {
    if (next && isFrontVowel(next)) {
      return { certh: 14, ipa: '/j/', desc: 'g → C14 (/j/ palatal, initial)' };
    }
    return { certh: 19, ipa: '/g/', desc: 'g → C19 (/g/ velar)' };
  }

  // After vowel (medial/final position)
  if (isVowel(prev)) {
    if (isFrontVowel(prev)) {
      // After front vowel → palatal approximant /j/
      return { certh: 40, ipa: '/j/', desc: 'g → C40 (/j/ post-front)' };
    }
    // After back vowel → voiced velar fricative /ɣ/
    return { certh: 21, ipa: '/ɣ/', desc: 'g → C21 (/ɣ/ fricative)' };
  }

  return { certh: 19, ipa: '/g/', desc: 'g → C19 (/g/)' };
}

/**
 * OE 'f' allophony:
 * - Between voiced sounds (vowels, nasals, liquids) → /v/ (certh 4)
 * - Elsewhere (initial, final, before voiceless) → /f/ (certh 3)
 *   e.g., "ofer" = /over/, "fæder" = /fæder/
 */
function analyzeFSound(word, pos) {
  const prev = pos > 0 ? word[pos - 1] : null;
  const next = word[pos + 1];

  if (prev && next && isVowel(prev) && isVowel(next)) {
    return { certh: 4, ipa: '/v/', desc: 'f → C4 (/v/ intervocalic)' };
  }
  return { certh: 3, ipa: '/f/', desc: 'f → C3 (/f/)' };
}

/**
 * OE 's' allophony:
 * - Between voiced sounds → /z/ (certh 35)
 * - Elsewhere → /s/ (certh 34)
 *   e.g., "rīsan" = /ri:zan/, but "stān" = /sta:n/
 */
function analyzeSSound(word, pos) {
  const prev = pos > 0 ? word[pos - 1] : null;
  const next = word[pos + 1];

  if (prev && next && isVowel(prev) && isVowel(next)) {
    return { certh: 35, ipa: '/z/', desc: 's → C35 (/z/ intervocalic)' };
  }
  return { certh: 34, ipa: '/s/', desc: 's → C34 (/s/)' };
}

/**
 * OE 'þ'/'ð' allophony:
 * In OE manuscripts, þ and ð were used interchangeably.
 * Phonemically: voiceless /θ/ (certh 10) vs voiced /ð/ (certh 11)
 * Rule: between voiced sounds → /ð/, elsewhere → /θ/
 */
function analyzeThSound(word, pos, grapheme) {
  const prev = pos > 0 ? word[pos - 1] : null;
  const next = word[pos + 1];

  // If the author wrote ð, respect that as voiced
  if (grapheme === 'ð') {
    return { certh: 11, ipa: '/ð/', desc: 'ð → C11 (/ð/)' };
  }

  // þ: check intervocalic voicing
  if (prev && next && isVowel(prev) && isVowel(next)) {
    return { certh: 11, ipa: '/ð/', desc: 'þ → C11 (/ð/ intervocalic)' };
  }
  return { certh: 10, ipa: '/θ/', desc: 'þ → C10 (/θ/)' };
}

// ============================================================
// Static rules table (order matters: longest match first)
// ============================================================
const STATIC_RULES = [
  // Diphthongs
  ['ēa',  () => K(47) + K(48),  'ēa (diph: ē+a, C47+C48)'],
  ['ea',   () => K(46) + K(48),  'ea (diph: e+a, C46+C48)'],
  ['ēo',  () => K(47) + K(50),  'ēo (diph: ē+o, C47+C50)'],
  ['eo',   () => K(46) + K(50),  'eo (diph: e+o, C46+C50)'],

  // Consonant clusters with h (OE-specific)
  ['hw',   () => K(5),           'hw → C5 (/hw/)'],
  ['hl',   () => K(54) + K(31),  'hl → C54+C31 (/hl/ voiceless l)'],
  ['hr',   () => K(54) + K(29),  'hr → C54+C29 (/hr/ voiceless r)'],
  ['hn',   () => K(54) + K(12),  'hn → C54+C12 (/hn/ voiceless n)'],

  // Consonant digraphs
  ['cw',   () => K(23),          'cw → C23 (/kw/)'],
  ['sc',   () => K(15),          'sc → C15 (/ʃ/)'],
  ['cg',   () => K(14) + K(14),  'cg → C14×2 (/dʒ/ geminate)'],
  ['ng',   () => K(36),          'ng → C36 (/ŋg/)'],
  ['nd',   () => K(33),          'nd → C33 (/nd/)'],
  ['mb',   () => K(7),           'mb → C7 (/mb/)'],
  ['th',   () => K(10),          'th → C10 (/θ/)'],
  ['dh',   () => K(11),          'dh → C11 (/ð/)'],
  ['ch',   () => K(13),          'ch → C13 (/x/)'],

  // Long vowels with macrons
  ['ǣ',   () => K(49) + K(47),  'ǣ → C49+C47 (long æ)'],
  ['æ',    () => K(48) + K(46),  'æ → C48+C46 (a+e)'],
  ['ā',   () => K(49),           'ā → C49'],
  ['ē',   () => K(47),           'ē → C47'],
  ['ī',   () => K(39) + K(39),   'ī → C39×2'],
  ['ō',   () => K(51),           'ō → C51'],
  ['ū',   () => K(42) + K(42),   'ū → C42×2'],
  ['ȳ',   () => K(45) + K(45),   'ȳ → C45×2'],

  // Simple consonants (non-context-sensitive)
  ['p',    () => K(1),            'p → C1'],
  ['b',    () => K(2),            'b → C2'],
  ['v',    () => K(4),            'v → C4'],
  ['m',    () => K(6),            'm → C6'],
  ['t',    () => K(8),            't → C8'],
  ['d',    () => K(9),            'd → C9'],
  ['n',    () => K(12),           'n → C12'],
  ['k',    () => K(18),           'k → C18'],
  ['r',    () => K(29),           'r → C29'],
  ['l',    () => K(31),           'l → C31'],
  ['w',    () => K(44),           'w → C44'],
  ['h',    () => K(54),           'h → C54'],
  ['j',    () => K(14),           'j → C14'],

  // Single vowels
  ['a',    () => K(48),           'a → C48'],
  ['e',    () => K(46),           'e → C46'],
  ['i',    () => K(39),           'i → C39'],
  ['o',    () => K(50),           'o → C50'],
  ['u',    () => K(42),           'u → C42'],
  ['y',    () => K(45),           'y → C45 (/y/)'],
];

// Context-sensitive consonants — handled before static rules
const CONTEXT_CONSONANTS = new Set(['c', 'g', 'f', 's', 'þ', 'ð']);

// ============================================================
// Transcription Engine
// ============================================================

function transcribeWord(word) {
  const segments = [];
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    let matched = false;
    const ch = lower[i];

    // --- Context-sensitive consonants ---
    if (CONTEXT_CONSONANTS.has(ch)) {
      // But first check if a static digraph starting with this char matches
      // (e.g., 'cw', 'sc', 'ng', etc. take priority)
      let digraphMatch = false;
      for (const [pattern, keysFn, desc] of STATIC_RULES) {
        if (pattern.length > 1 && lower.startsWith(pattern, i)) {
          segments.push({
            oe: word.substring(i, i + pattern.length),
            cirth: keysFn(),
            desc
          });
          i += pattern.length;
          matched = true;
          digraphMatch = true;
          break;
        }
      }

      if (!digraphMatch) {
        let analysis = null;
        if (ch === 'c') analysis = analyzeCSound(lower, i);
        else if (ch === 'g') analysis = analyzeGSound(lower, i);
        else if (ch === 'f') analysis = analyzeFSound(lower, i);
        else if (ch === 's') analysis = analyzeSSound(lower, i);
        else if (ch === 'þ' || ch === 'ð') analysis = analyzeThSound(lower, i, ch);

        if (analysis) {
          segments.push({
            oe: word.substring(i, i + 1),
            cirth: K(analysis.certh),
            desc: analysis.desc
          });
          i++;
          matched = true;
        }
      }
    }

    // --- Static rules ---
    if (!matched) {
      for (const [pattern, keysFn, desc] of STATIC_RULES) {
        if (lower.startsWith(pattern, i)) {
          segments.push({
            oe: word.substring(i, i + pattern.length),
            cirth: keysFn(),
            desc
          });
          i += pattern.length;
          matched = true;
          break;
        }
      }
    }

    // --- Fallback ---
    if (!matched) {
      segments.push({ oe: word[i], cirth: '', desc: '? (unmapped)' });
      i++;
    }
  }

  return {
    keys: segments.map(s => s.cirth).join(''),
    segments
  };
}

function transcribeText(text) {
  const result = [];
  const tokens = text.match(/[\wæǣāēīōūȳþðÆǢĀĒĪŌŪȲÞÐ]+|[^\s\wæǣāēīōūȳþðÆǢĀĒĪŌŪȲÞÐ]+|\s+/gi) || [];

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      result.push({ type: 'space', oe: ' ', keys: '' });
    } else if (/^[?!.,;:]+$/.test(token)) {
      const pKeys = token.split('').map(ch => {
        if (ch === '?' || ch === '!') return PUNCT.SENTENCE;
        if (ch === '.' || ch === ',') return PUNCT.WORD_SEP;
        if (ch === ';' || ch === ':') return PUNCT.MID_DOT;
        return '';
      }).join('');
      result.push({ type: 'punct', oe: token, keys: pKeys });
    } else {
      const { keys: k, segments } = transcribeWord(token);
      result.push({ type: 'word', oe: token, keys: k, segments });
    }
  }

  return result;
}

// --- Display builder ---
function buildDisplayString(tokens, useCirthSep) {
  const parts = [];
  for (const token of tokens) {
    if (token.type === 'word') {
      parts.push({ text: token.keys, type: 'rune' });
    } else if (token.type === 'punct') {
      parts.push({ text: ' ' + token.keys + ' ', type: 'punct' });
    } else if (token.type === 'space') {
      parts.push(useCirthSep
        ? { text: ' ' + PUNCT.WORD_SEP + ' ', type: 'sep' }
        : { text: '  ', type: 'space' });
    }
  }
  return parts;
}

// ============================================================
// Complete Phoneme Reference Table
// ============================================================
const REFERENCE_TABLE = [
  { section: 'Consonants (Stops)' },
  { certh: 1,  key: '1', ipa: '/p/',   oe: 'p',  example: 'pæþ (path)' },
  { certh: 2,  key: '2', ipa: '/b/',   oe: 'b',  example: 'bān (bone)' },
  { certh: 8,  key: '8', ipa: '/t/',   oe: 't',  example: 'tūn (town)' },
  { certh: 9,  key: '9', ipa: '/d/',   oe: 'd',  example: 'dæg (day)' },
  { certh: 18, key: 'e', ipa: '/k/',   oe: 'c (back)',  example: 'cū (cow)' },
  { certh: 19, key: 'r', ipa: '/g/',   oe: 'g (initial+back)', example: 'gōd (good)' },

  { section: 'Consonants (Fricatives)' },
  { certh: 3,  key: '3', ipa: '/f/',   oe: 'f (initial/final)', example: 'fæder (father)' },
  { certh: 4,  key: '4', ipa: '/v/',   oe: 'f (intervocalic)',  example: 'ofer (over)' },
  { certh: 10, key: '0', ipa: '/θ/',   oe: 'þ (initial/final)', example: 'þing (thing)' },
  { certh: 11, key: '!', ipa: '/ð/',   oe: 'ð, þ (intervocalic)', example: 'oðer (other)' },
  { certh: 34, key: 'f', ipa: '/s/',   oe: 's (initial/final)', example: 'stān (stone)' },
  { certh: 35, key: 'g', ipa: '/z/',   oe: 's (intervocalic)',  example: 'rīsan (rise)' },
  { certh: 15, key: '%', ipa: '/ʃ/',   oe: 'sc',               example: 'scip (ship)' },
  { certh: 13, key: '#', ipa: '/x/',   oe: 'ch, h (velar)',     example: 'niht (night)' },
  { certh: 54, key: '.', ipa: '/h/',   oe: 'h (initial)',       example: 'hūs (house)' },
  { certh: 21, key: 'y', ipa: '/ɣ/',   oe: 'g (post-back-V)',   example: 'boga (bow)' },

  { section: 'Consonants (Palatals)' },
  { certh: 14, key: '$', ipa: '/j~tʃ/', oe: 'g (palatal), ġ',  example: 'ġeār (year)' },
  { certh: 15, key: '%', ipa: '/tʃ/',   oe: 'c (palatal), ċ',  example: 'ċild (child)' },
  { certh: 40, key: ';', ipa: '/j/',    oe: 'g (post-front-V)', example: 'dæg (day, final)' },

  { section: 'Consonants (Nasals)' },
  { certh: 6,  key: '6', ipa: '/m/',   oe: 'm',  example: 'mann (man)' },
  { certh: 12, key: '@', ipa: '/n/',   oe: 'n',  example: 'nama (name)' },
  { certh: 36, key: 'h', ipa: '/ŋg/',  oe: 'ng', example: 'singan (sing)' },

  { section: 'Consonants (Clusters)' },
  { certh: 5,  key: '5', ipa: '/hw/',  oe: 'hw',  example: 'hwæt (what)' },
  { certh: 23, key: 'i', ipa: '/kw/',  oe: 'cw',  example: 'cwēn (queen)' },
  { certh: 33, key: 'd', ipa: '/nd/',  oe: 'nd',  example: 'sindon (are)' },
  { certh: 7,  key: '7', ipa: '/mb/',  oe: 'mb',  example: 'symbla (feast)' },

  { section: 'Consonants (Liquids & Glides)' },
  { certh: 29, key: 'R', ipa: '/r/',   oe: 'r',  example: 'rīce (kingdom)' },
  { certh: 31, key: 'a', ipa: '/l/',   oe: 'l',  example: 'lēoht (light)' },
  { certh: 44, key: 'F', ipa: '/w/',   oe: 'w',  example: 'weard (guard)' },

  { section: 'Short Vowels' },
  { certh: 48, key: 'c', ipa: '/a/',   oe: 'a',  example: 'mann (man)' },
  { certh: 46, key: 'z', ipa: '/e/',   oe: 'e',  example: 'setl (seat)' },
  { certh: 39, key: 'l', ipa: '/i/',   oe: 'i',  example: 'scip (ship)' },
  { certh: 50, key: 'b', ipa: '/o/',   oe: 'o',  example: 'god (god)' },
  { certh: 42, key: 'S', ipa: '/u/',   oe: 'u',  example: 'full (full)' },
  { certh: 45, key: 'G', ipa: '/y/',   oe: 'y',  example: 'cynn (kin)' },

  { section: 'Long Vowels' },
  { certh: 49, key: 'v', ipa: '/aː/',  oe: 'ā',  example: 'bān (bone)' },
  { certh: 47, key: 'x', ipa: '/eː/',  oe: 'ē',  example: 'hēr (here)' },
  { certh: '39×2', key: 'll', ipa: '/iː/', oe: 'ī', example: 'wīn (wine)' },
  { certh: 51, key: 'n', ipa: '/oː/',  oe: 'ō',  example: 'gōd (good)' },
  { certh: '42×2', key: 'SS', ipa: '/uː/', oe: 'ū', example: 'hūs (house)' },
  { certh: '45×2', key: 'GG', ipa: '/yː/', oe: 'ȳ', example: 'fȳr (fire)' },

  { section: 'Digraph Vowels' },
  { certh: '48+46', key: 'cz', ipa: '/æ/', oe: 'æ', example: 'dæg (day)' },
  { certh: '49+47', key: 'vx', ipa: '/æː/', oe: 'ǣ', example: 'ǣnig (any)' },

  { section: 'Diphthongs' },
  { certh: '46+48', key: 'zc', ipa: '/ea/', oe: 'ea',  example: 'earm (arm)' },
  { certh: '47+48', key: 'xc', ipa: '/eːa/', oe: 'ēa', example: 'ēar (ear)' },
  { certh: '46+50', key: 'zb', ipa: '/eo/', oe: 'eo',  example: 'heorte (heart)' },
  { certh: '47+50', key: 'xb', ipa: '/eːo/', oe: 'ēo', example: 'frēond (friend)' },

  { section: 'Punctuation' },
  { certh: '—', key: '\\', ipa: '—', oe: '(word sep)', example: 'Single dot separator' },
  { certh: '—', key: 'P',  ipa: '—', oe: '? !',        example: 'Three-dot sentence end' },
  { certh: '—', key: 'I',  ipa: '—', oe: '; :',        example: 'Mid dot' },
];

// ============================================================
// Font family selection
// ============================================================
const FONT_MAP = {
  erebor:  { normal: 'Cirth Erebor',   caps: 'Cirth Erebor Caps' },
  erebor1: { normal: 'Cirth Erebor 1', caps: 'Cirth Erebor Caps 1' },
  erebor2: { normal: 'Cirth Erebor 2', caps: 'Cirth Erebor Caps 2' },
};

// ============================================================
// DOM
// ============================================================
const inputEl = document.getElementById('input-text');
const outputEl = document.getElementById('cirth-output');
const analysisEl = document.getElementById('analysis-table');
const referenceEl = document.getElementById('reference-body');
const fontSelect = document.getElementById('font-select');
const sizeRange = document.getElementById('size-range');
const sizeValue = document.getElementById('size-value');
const capsToggle = document.getElementById('caps-toggle');
const sepToggle = document.getElementById('sep-toggle');
const btnSvg = document.getElementById('btn-export-svg');
const btnPng = document.getElementById('btn-export-png');

function getCurrentFont() {
  const variant = fontSelect.value;
  const useCaps = capsToggle.checked;
  return FONT_MAP[variant][useCaps ? 'caps' : 'normal'];
}

// --- Render reference table (once) ---
function renderReferenceTable() {
  if (!referenceEl) return;
  const font = getCurrentFont();
  let html = '';

  for (const row of REFERENCE_TABLE) {
    if (row.section) {
      html += `<tr class="ref-section"><td colspan="6">${esc(row.section)}</td></tr>`;
      continue;
    }
    const cirthStr = typeof row.certh === 'number' ? `C${row.certh}` : row.certh;
    html += `<tr>
      <td class="ref-certh">${esc(cirthStr)}</td>
      <td class="ref-rune" style="font-family:'${font}',serif">${esc(row.key)}</td>
      <td class="ref-ipa">${esc(row.ipa)}</td>
      <td class="ref-oe">${esc(row.oe)}</td>
      <td class="ref-example">${esc(row.example)}</td>
    </tr>`;
  }
  referenceEl.innerHTML = html;
}

// --- Main render ---
function render() {
  const text = inputEl.value;
  const tokens = transcribeText(text);
  const font = getCurrentFont();
  const size = sizeRange.value;
  const useSep = sepToggle.checked;

  sizeValue.textContent = size + 'px';
  outputEl.style.fontFamily = `'${font}', serif`;
  outputEl.style.fontSize = size + 'px';

  // Cirth display
  const parts = buildDisplayString(tokens, useSep);
  outputEl.innerHTML = '';
  for (const part of parts) {
    const span = document.createElement('span');
    span.textContent = part.text;
    if (part.type === 'sep') span.className = 'cirth-sep';
    else if (part.type === 'punct') span.className = 'cirth-punct';
    outputEl.appendChild(span);
  }

  // Analysis breakdown
  analysisEl.innerHTML = '';
  for (const token of tokens) {
    if (token.type === 'space') continue;
    const group = document.createElement('div');
    group.className = 'word-group';

    if (token.type === 'punct') {
      group.innerHTML = `
        <span class="oe-word">${esc(token.oe)}</span>
        <span class="cirth-word" style="font-family:'${font}',serif">${esc(token.keys)}</span>
        <span class="phonetic">punct</span>`;
    } else {
      const descParts = token.segments.map(s => {
        const src = s.oe.length > 1 ? `<b>${esc(s.oe)}</b>` : esc(s.oe);
        return `<span class="seg-item" title="${esc(s.desc)}">${src}</span>`;
      });
      group.innerHTML = `
        <span class="oe-word">${esc(token.oe)}</span>
        <span class="cirth-word" style="font-family:'${font}',serif">${esc(token.keys)}</span>
        <span class="phonetic">${descParts.join('<span class="seg-dot">·</span>')}</span>`;
    }
    analysisEl.appendChild(group);
  }

  // Update reference table font
  renderReferenceTable();
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// ============================================================
// SVG Export
// ============================================================
async function exportSvg() {
  const text = inputEl.value;
  const tokens = transcribeText(text);
  const useSep = sepToggle.checked;
  const parts = buildDisplayString(tokens, useSep);
  const cirthText = parts.map(p => p.text).join('');
  const font = getCurrentFont();
  const fontSize = parseInt(sizeRange.value);

  const variant = fontSelect.value;
  const useCaps = capsToggle.checked;
  const fontFile = useCaps
    ? `Erebcap${variant === 'erebor' ? '' : variant.replace('erebor', '')}.ttf`
    : `Erebor${variant === 'erebor' ? '' : variant.replace('erebor', '')}.ttf`;

  let fontBase64 = '';
  try {
    const resp = await fetch(`./fonts/${fontFile}`);
    const buf = await resp.arrayBuffer();
    fontBase64 = arrayBufferToBase64(buf);
  } catch (e) { console.warn('Could not embed font:', e); }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px '${font}'`;

  const maxWidth = 800;
  const lines = wrapText(ctx, cirthText, maxWidth);
  const lineHeight = fontSize * 1.5;
  const pad = 30;
  const svgWidth = maxWidth + pad * 2;
  const svgHeight = lines.length * lineHeight + pad * 2 + 50;

  const fontFace = fontBase64
    ? `@font-face { font-family: '${font}'; src: url('data:font/truetype;base64,${fontBase64}') format('truetype'); }`
    : '';

  const textLines = lines.map((line, i) =>
    `<text x="${pad}" y="${pad + fontSize + i * lineHeight}" font-family="'${font}'" font-size="${fontSize}" fill="#e8dcc0" letter-spacing="0.04em">${escXml(line)}</text>`
  ).join('\n    ');

  const oeY = pad + fontSize + lines.length * lineHeight + 30;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <defs><style>${fontFace}</style></defs>
  <rect width="100%" height="100%" fill="#0d0f12"/>
  ${textLines}
  <text x="${pad}" y="${oeY}" font-family="Georgia,'Times New Roman',serif" font-size="13" fill="#5a5040" letter-spacing="0.02em">${escXml(text)}</text>
</svg>`;

  downloadFile(svg, 'cirth-transcription.svg', 'image/svg+xml');
}

// ============================================================
// PNG Export
// ============================================================
async function exportPng() {
  const text = inputEl.value;
  const tokens = transcribeText(text);
  const useSep = sepToggle.checked;
  const parts = buildDisplayString(tokens, useSep);
  const cirthText = parts.map(p => p.text).join('');
  const font = getCurrentFont();
  const fontSize = parseInt(sizeRange.value);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px '${font}'`;

  const maxWidth = 800;
  const lines = wrapText(ctx, cirthText, maxWidth);
  const lineHeight = fontSize * 1.5;
  const pad = 30;

  canvas.width = (maxWidth + pad * 2) * 2;
  canvas.height = (lines.length * lineHeight + pad * 2 + 50) * 2;
  ctx.scale(2, 2);

  ctx.fillStyle = '#0d0f12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px '${font}'`;
  ctx.fillStyle = '#e8dcc0';
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, pad + fontSize + i * lineHeight);
  });
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#5a5040';
  ctx.fillText(text, pad, pad + fontSize + lines.length * lineHeight + 30);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cirth-transcription.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// ============================================================
// Utilities
// ============================================================
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// Event Listeners
// ============================================================
inputEl.addEventListener('input', render);
fontSelect.addEventListener('change', render);
sizeRange.addEventListener('input', render);
capsToggle.addEventListener('change', render);
sepToggle.addEventListener('change', render);
btnSvg.addEventListener('click', exportSvg);
btnPng.addEventListener('click', exportPng);

render();
