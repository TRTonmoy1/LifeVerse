const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(filename) {
  const absolute = path.resolve(__dirname, '..', filename);
  if (cache.has(absolute)) return cache.get(absolute);
  const source = fs.readFileSync(absolute, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  cache.set(absolute, module.exports);
  const localRequire = (key) =>
    key.startsWith('.')
      ? load(path.join(path.dirname(filename), key + '.ts'))
      : key === 'react'
        ? { useEffect() {}, useState() {} }
        : require(key);
  new Function('require', 'module', 'exports', javascript)(localRequire, module, module.exports);
  cache.set(absolute, module.exports);
  return module.exports;
}
const { parseLifeData, earnedXp } = load('src/features/life/lifeData.ts');
const original = {
  version: 1,
  tasks: [],
  habits: [],
  goals: [],
  workouts: [],
  skills: { pushup: 0, pullup: 0, lsit: 0, handstand: 0, muscleup: 0, frontlever: 0 },
  explore: { discovered: [], quizSolved: [] },
  study: { subjects: [], entries: [] },
  rewards: { title: 'traveler', aura: 'moonlight' },
};
const legacy = parseLifeData(original);
assert.deepEqual(legacy.journal, [], 'Chapter X.3 restores with an empty journal');
const entries = [
  {
    id: 'a',
    title: 'A day',
    body: 'My thoughts',
    mood: 'okay',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'b',
    title: 'Another',
    body: 'More thoughts',
    mood: null,
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-10-18T11:00:00Z',
  },
];
const restored = parseLifeData({
  ...original,
  journal: [
    ...entries,
    { id: 'x', title: 42, body: 'bad', mood: 'great', createdAt: '', updatedAt: '' },
  ],
});
assert.equal(
  restored.journal.length,
  2,
  'valid entries restore and malformed entries are rejected',
);
assert.equal(
  earnedXp(restored).total,
  earnedXp(legacy).total,
  'personal journal entries do not earn XP',
);
assert.equal(restored.journal[0].mood, 'okay');
assert.equal(restored.journal[1].mood, null);
console.log('Chapter X.4 journal migration, data validation, and XP safeguards: PASS');
