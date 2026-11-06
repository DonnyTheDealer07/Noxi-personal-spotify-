const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadThemes() {
  const code = fs.readFileSync('src/features/preferences/themes.ts', 'utf8');
  const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const scope = { exports: {} };
  vm.runInNewContext(js, scope);
  return scope.exports;
}

const expected = [
  'marshmallow-galaxy', 'royal-ember', 'abyssal-bloom',
  'punk-inferno', 'cotton-candy-skies', 'wildwood', 'sakura-noir',
];

test('registry defines seven selectable palettes and a safe original default', () => {
  const { THEMES, DEFAULT_THEME, isThemeId } = loadThemes();
  assert.deepEqual(Array.from(THEMES, t => t.id), expected);
  assert.equal(DEFAULT_THEME, 'marshmallow-galaxy');
  assert.equal(new Set(THEMES.map(t => t.id)).size, 7);
  for (const theme of THEMES) {
    assert.equal(theme.colors.length, 3);
    assert.ok(theme.colors.every(color => /^#[a-f0-9]{6}$/i.test(color)));
    assert.equal(isThemeId(theme.id), true);
  }
  assert.equal(isThemeId('made-up-theme'), false);
});

test('every non-default theme provides a full UI palette and three recolored GSAP scenes', () => {
  const css = fs.readFileSync('src/styles/themes.css', 'utf8');
  for (const theme of expected.slice(1)) {
    assert.ok(css.includes(`html[data-noxi-theme='${theme}'] {`), `${theme} has CSS tokens`);
  }
  for (const scene of ['aurora', 'drift', 'stardust']) {
    assert.ok(css.includes(`.noxi-scene--${scene}`), `${scene} is theme-aware`);
  }
  for (const part of ['.noxi-ambient-bars i', '.noxi-energy-glow--violet', '.noxi-speck', '.np-queue-panel', '.player-bar', '.sidebar']) {
    assert.ok(css.includes(part), `${part} changes with theme`);
  }
});

test('Settings switcher, persistence, and first-paint theme initialization are wired', () => {
  const settings = fs.readFileSync('src/pages/SettingsPage.tsx', 'utf8');
  const prefs = fs.readFileSync('src/features/preferences/PreferencesProvider.tsx', 'utf8');
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(settings, /THEMES\.map\(theme/);
  assert.match(settings, /update\('theme', theme\.id\)/);
  assert.match(prefs, /noxi\.preferences\.v1/);
  assert.match(prefs, /isThemeId\(stored\.theme\)/);
  assert.match(prefs, /root\.dataset\.noxiTheme = preferences\.theme/);
  assert.match(html, /document\.documentElement\.dataset\.noxiTheme = saved\.theme/);
});
