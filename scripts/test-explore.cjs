/* Dependency-free regression checks for Chapter VI's pure data logic.
 * Uses installed TypeScript to transpile local modules (no native Vite binary needed). */
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
const { atlasCountries } = load('src/features/explore/atlasCountries.ts');
const { questions, regions } = load('src/features/explore/atlasContent.ts');
const { parseLifeData, earnedXp, exploreXp, exploreRegionCount } = load(
  'src/features/life/lifeData.ts',
);
const { milestones } = load('src/features/life/milestones.ts');
const { rewards, rewardUnlocked, validRewardSelection } = load('src/features/life/rewards.ts');
const base = {
  version: 1,
  tasks: [
    {
      id: 't',
      title: 'Legacy task',
      priority: 'high',
      dueDate: '',
      createdAt: '2026-10-01',
      completedAt: '2026-10-10',
    },
  ],
  habits: [],
  goals: [],
  workouts: [],
  skills: { pushup: 0, pullup: 0, lsit: 0, handstand: 0, muscleup: 0, frontlever: 0 },
};
const legacy = parseLifeData(base);
assert.ok(legacy, 'old v1 backups should load');
assert.deepEqual(
  legacy.explore,
  { discovered: [], quizSolved: [] },
  'legacy saves should migrate without losing data',
);
assert.equal(earnedXp(legacy).total, 25, 'existing task XP must remain unchanged');
assert.equal(legacy.tasks[0].title, 'Legacy task');
const migrated = parseLifeData({
  ...base,
  explore: { discovered: ['BGD', 'BGD', 'XYZ'], quizSolved: ['as01', 'as01', 'fake'] },
});
assert.deepEqual(
  migrated.explore,
  { discovered: ['BGD'], quizSolved: ['as01'] },
  'restore must dedupe and validate IDs',
);
assert.equal(earnedXp(migrated).explore, 25, '5 XP discovery + 20 XP unique question');
assert.equal(earnedXp(migrated).total, 50);
assert.ok(milestones(migrated).find((m) => m.id === 'first-discovery').achieved);
const asia = atlasCountries
  .filter((c) => c.region === 'Asia')
  .slice(0, 5)
  .map((c) => c.code);
const expedition = { discovered: [...asia, asia[0]], quizSolved: [] };
assert.equal(
  exploreRegionCount(expedition, 'Asia'),
  6,
  'region function counts entries; parser is responsible for deduping',
);
const normalized = parseLifeData({ ...base, explore: expedition }).explore;
assert.equal(exploreRegionCount(normalized, 'Asia'), 5);
assert.equal(
  exploreXp(normalized).total,
  5 * 5 + 40,
  'one regional expedition bonus after five unique countries',
);
assert.equal(regions.length, 6);
assert.equal(atlasCountries.length, 175);
assert.equal(new Set(atlasCountries.map((c) => c.code)).size, 175);
assert.equal(questions.length, 30);
assert.equal(new Set(questions.map((q) => q.id)).size, 30);
for (const question of questions) {
  assert.ok(
    atlasCountries.some((country) => country.code === question.country),
    `missing mapped country for ${question.id}`,
  );
  assert.ok(
    question.correct >= 0 && question.correct < 4,
    `invalid correct answer for ${question.id}`,
  );
  assert.equal(question.answers.length, 4);
}
console.log('Chapter VI data, quiz, migration, XP and milestone checks: PASS');

assert.deepEqual(
  legacy.rewards,
  { title: 'traveler', aura: 'moonlight' },
  'old backups receive default cosmetics',
);
assert.equal(rewards.length, 14);
assert.ok(rewards.every((reward) => !!reward.requirement));
assert.ok(
  !rewardUnlocked(
    rewards.find((reward) => reward.id === 'golden'),
    legacy,
  ),
);
assert.deepEqual(
  validRewardSelection({ ...legacy, rewards: { title: 'ascendant', aura: 'golden' } }),
  { title: 'traveler', aura: 'moonlight' },
  'cannot equip locked rewards',
);
const firstTask = rewards.find((reward) => reward.id === 'doer');
assert.ok(rewardUnlocked(firstTask, legacy), 'existing achievements retroactively unlock rewards');
assert.equal(
  validRewardSelection({ ...legacy, rewards: { title: 'doer', aura: 'moonlight' } }).title,
  'doer',
);
console.log('Chapter VII migration, rewards, and no-locked-equips checks: PASS');
