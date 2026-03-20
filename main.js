// ============================================================
// Cirth Erebor Transcriber – Old English → Angerthas Runes
// Uses the Dan Smith "Cirth Erebor" font family (cirth_ds charset)
//
// Mode: Angerthas Daeron baseline with Erebor reversions
// (certh 12=n, 29=r, 34=s, 54=h per Appendix E)
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
  10: '0',  // th (voiceless, þ)
  11: '!',  // dh (voiced, ð)
  12: '@',  // n
  13: '#',  // ch (velar fricative, as in German "ach")
  14: '$',  // j / palatal g
  15: '%',  // sh / ʃ
  16: 'q',  // zh
  18: 'e',  // k
  19: 'r',  // g (velar)
  20: 't',  // kh
  22: 'u',  // ŋ (ng, weak/final)
  23: 'i',  // kw
  24: 'o',  // gw
  25: 'p',  // khw
  27: 'W',  // ngw
  29: 'R',  // r
  31: 'a',  // l
  33: 'd',  // nd
  34: 'f',  // s
  35: 'g',  // s (variant / z in some modes)
  36: 'h',  // ng (Erebor value)
  38: 'k',  // nd (variant)
  39: 'l',  // i (vowel)
  40: ';',  // y (consonantal)
  42: 'S',  // u (vowel)
  44: 'F',  // w
  45: 'G',  // ü / y (OE front rounded vowel)
  46: 'z',  // e (vowel)
  47: 'x',  // ē (long e)
  48: 'c',  // a (vowel)
  49: 'v',  // ā (long a)
  50: 'b',  // o (vowel)
  51: 'n',  // ō (long o)
  54: '.',  // h
};

// Punctuation / spacing keys
const PUNCT = {
  SPACE: ' ',
  WORD_SEP: '\\',    // single dot separator (certh punct)
  SENTENCE: 'P',     // three-dot punct
  MID_DOT: 'I',      // mid dot
};

function key(certh) {
  return CERTH_TO_KEY[certh];
}

// --- Old English grapheme → Cirth transcription rules ---
// Each entry: [pattern, certh_keys_fn, description_fn]
// Order matters: longer/more specific patterns first.
const OE_TO_CIRTH = [
  // Diphthongs (must come before single vowels)
  ['ēa',  () => key(47) + key(48),  () => 'ēa (diph: ē+a, C47+C48)'],
  ['ea',   () => key(46) + key(48),  () => 'ea (diph: e+a, C46+C48)'],
  ['ēo',  () => key(47) + key(50),  () => 'ēo (diph: ē+o, C47+C50)'],
  ['eo',   () => key(46) + key(50),  () => 'eo (diph: e+o, C46+C50)'],

  // Consonant digraphs (must come before single consonants)
  ['hw',   () => key(5),             () => 'hw → C5 (/hw/)'],
  ['cw',   () => key(23),            () => 'cw → C23 (/kw/)'],
  ['sc',   () => key(15),            () => 'sc → C15 (/ʃ/)'],
  ['ng',   () => key(36),            () => 'ng → C36 (/ŋ/)'],
  ['nd',   () => key(33),            () => 'nd → C33 (/nd/)'],
  ['mb',   () => key(7),             () => 'mb → C7 (/mb/)'],
  ['th',   () => key(10),            () => 'th → C10 (/θ/)'],
  ['dh',   () => key(11),            () => 'dh → C11 (/ð/)'],
  ['ch',   () => key(13),            () => 'ch → C13 (/x/)'],
  ['sh',   () => key(15),            () => 'sh → C15 (/ʃ/)'],

  // Vowels with macrons (long)
  ['ǣ',   () => key(49) + key(47),  () => 'ǣ → C49+C47 (long æ)'],
  ['æ',    () => key(48) + key(46),  () => 'æ → C48+C46 (a+e)'],
  ['ā',   () => key(49),             () => 'ā → C49'],
  ['ē',   () => key(47),             () => 'ē → C47'],
  ['ī',   () => key(39) + key(39),   () => 'ī → C39×2'],
  ['ō',   () => key(51),             () => 'ō → C51'],
  ['ū',   () => key(42) + key(42),   () => 'ū → C42×2'],
  ['ȳ',   () => key(45) + key(45),   () => 'ȳ → C45×2'],

  // Thorn and Eth (special OE characters)
  ['þ',    () => key(10),            () => 'þ → C10 (/θ/)'],
  ['ð',    () => key(11),            () => 'ð → C11 (/ð/)'],

  // Single consonants
  ['p',    () => key(1),             () => 'p → C1'],
  ['b',    () => key(2),             () => 'b → C2'],
  ['f',    () => key(3),             () => 'f → C3'],
  ['v',    () => key(4),             () => 'v → C4'],
  ['m',    () => key(6),             () => 'm → C6'],
  ['t',    () => key(8),             () => 't → C8'],
  ['d',    () => key(9),             () => 'd → C9'],
  ['n',    () => key(12),            () => 'n → C12'],
  ['k',    () => key(18),            () => 'k → C18'],
  ['c',    () => key(18),            () => 'c → C18 (/k/)'],
  ['g',    () => key(19),            () => 'g → C19 (/g/)'],
  ['r',    () => key(29),            () => 'r → C29'],
  ['l',    () => key(31),            () => 'l → C31'],
  ['s',    () => key(34),            () => 's → C34'],
  ['w',    () => key(44),            () => 'w → C44'],
  ['h',    () => key(54),            () => 'h → C54'],
  ['j',    () => key(14),            () => 'j → C14'],

  // Single vowels
  ['a',    () => key(48),            () => 'a → C48'],
  ['e',    () => key(46),            () => 'e → C46'],
  ['i',    () => key(39),            () => 'i → C39'],
  ['o',    () => key(50),            () => 'o → C50'],
  ['u',    () => key(42),            () => 'u → C42'],
  ['y',    () => key(45),            () => 'y → C45 (/y/)'],
];

// --- Transcription Engine ---

/**
 * Is 'g' at position pos palatalized in OE context?
 * Palatal before front vowels (e, i, æ) — but NOT in clusters like 'ng'
 */
function isGPalatal(text, pos) {
  const next = text[pos + 1];
  if (!next) return false;
  return 'eiæēīǣ'.includes(next.toLowerCase());
}

/**
 * Transcribe a single OE word into Erebor font keystrokes.
 * Returns { keys: string, segments: [{oe, cirth, desc}] }
 */
function transcribeWord(word) {
  const segments = [];
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    let matched = false;

    // Special: context-sensitive 'g' palatalization
    if (lower[i] === 'g' && isGPalatal(lower, i)) {
      segments.push({
        oe: word.substring(i, i + 1),
        cirth: key(14),
        desc: 'g → C14 (/j/ palatal)'
      });
      i++;
      matched = true;
    }

    if (!matched) {
      for (const [pattern, keysFn, descFn] of OE_TO_CIRTH) {
        if (lower.startsWith(pattern, i)) {
          segments.push({
            oe: word.substring(i, i + pattern.length),
            cirth: keysFn(),
            desc: descFn()
          });
          i += pattern.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      segments.push({
        oe: word[i],
        cirth: '',
        desc: '? (unmapped)'
      });
      i++;
    }
  }

  return {
    keys: segments.map(s => s.cirth).join(''),
    segments
  };
}

/**
 * Transcribe full OE text into token array.
 */
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

// --- Build the display string with proper Cirth separators ---
function buildDisplayString(tokens, useCirthSep) {
  const parts = [];
  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    if (token.type === 'word') {
      parts.push({ text: token.keys, type: 'rune' });
    } else if (token.type === 'punct') {
      parts.push({ text: ' ' + token.keys + ' ', type: 'punct' });
    } else if (token.type === 'space') {
      if (useCirthSep) {
        // Use cirth word separator dot between words
        parts.push({ text: ' ' + PUNCT.WORD_SEP + ' ', type: 'sep' });
      } else {
        parts.push({ text: '  ', type: 'space' });
      }
    }
  }
  return parts;
}

// --- Font family selection ---
const FONT_MAP = {
  erebor:  { normal: 'Cirth Erebor',   caps: 'Cirth Erebor Caps' },
  erebor1: { normal: 'Cirth Erebor 1', caps: 'Cirth Erebor Caps 1' },
  erebor2: { normal: 'Cirth Erebor 2', caps: 'Cirth Erebor Caps 2' },
};

// --- DOM ---
const inputEl = document.getElementById('input-text');
const outputEl = document.getElementById('cirth-output');
const analysisEl = document.getElementById('analysis-table');
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

function render() {
  const text = inputEl.value;
  const tokens = transcribeText(text);
  const font = getCurrentFont();
  const size = sizeRange.value;
  const useSep = sepToggle.checked;

  sizeValue.textContent = size + 'px';

  outputEl.style.fontFamily = `'${font}', serif`;
  outputEl.style.fontSize = size + 'px';

  // Build rich display with spans for spacing control
  const parts = buildDisplayString(tokens, useSep);
  outputEl.innerHTML = '';
  for (const part of parts) {
    const span = document.createElement('span');
    span.textContent = part.text;
    if (part.type === 'sep') {
      span.className = 'cirth-sep';
    } else if (part.type === 'punct') {
      span.className = 'cirth-punct';
    }
    outputEl.appendChild(span);
  }

  // Render analysis breakdown
  analysisEl.innerHTML = '';
  for (const token of tokens) {
    if (token.type === 'space') continue;

    const group = document.createElement('div');
    group.className = 'word-group';

    if (token.type === 'punct') {
      group.innerHTML = `
        <span class="oe-word">${esc(token.oe)}</span>
        <span class="cirth-word" style="font-family:'${font}',serif">${esc(token.keys)}</span>
        <span class="phonetic">punct</span>
      `;
    } else {
      const descParts = token.segments.map(s => {
        const src = s.oe.length > 1 ? `<b>${esc(s.oe)}</b>` : esc(s.oe);
        return `<span class="seg-item" title="${esc(s.desc)}">${src}</span>`;
      });

      group.innerHTML = `
        <span class="oe-word">${esc(token.oe)}</span>
        <span class="cirth-word" style="font-family:'${font}',serif">${esc(token.keys)}</span>
        <span class="phonetic">${descParts.join('<span class="seg-dot">·</span>')}</span>
      `;
    }

    analysisEl.appendChild(group);
  }
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// --- SVG Export ---
async function exportSvg() {
  const text = inputEl.value;
  const tokens = transcribeText(text);
  const useSep = sepToggle.checked;
  const parts = buildDisplayString(tokens, useSep);
  const cirthText = parts.map(p => p.text).join('');
  const font = getCurrentFont();
  const fontSize = parseInt(sizeRange.value);

  // Load font as base64
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
  } catch (e) {
    console.warn('Could not embed font:', e);
  }

  // Measure for wrapping
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
  <defs>
    <style>
      ${fontFace}
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#0d0f12"/>
  ${textLines}
  <text x="${pad}" y="${oeY}" font-family="Georgia, 'Times New Roman', serif" font-size="13" fill="#5a5040" letter-spacing="0.02em">${escXml(text)}</text>
</svg>`;

  downloadFile(svg, 'cirth-transcription.svg', 'image/svg+xml');
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
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
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
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

// --- PNG Export ---
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

// --- Event listeners ---
inputEl.addEventListener('input', render);
fontSelect.addEventListener('change', render);
sizeRange.addEventListener('input', render);
capsToggle.addEventListener('change', render);
sepToggle.addEventListener('change', render);
btnSvg.addEventListener('click', exportSvg);
btnPng.addEventListener('click', exportPng);

// Initial render
render();
