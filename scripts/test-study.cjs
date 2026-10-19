/* Dependency-free regression checks for Chapter X study data and cross-hub integration. */
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
const { parseLifeData, earnedXp, studyXp } = load('src/features/life/lifeData.ts');
const { milestones } = load('src/features/life/milestones.ts');
const { rewardUnlocked, rewards } = load('src/features/life/rewards.ts');
const { activityDays, insightSummary } = load('src/features/life/insightsData.ts');

const legacyBase = {
  version: 1,
  tasks: [],
  habits: [],
  goals: [],
  workouts: [],
  skills: { pushup: 0, pullup: 0, lsit: 0, handstand: 0, muscleup: 0, frontlever: 0 },
  explore: { discovered: [], quizSolved: [] },
  rewards: { title: 'traveler', aura: 'moonlight' },
};
const migrated = parseLifeData(legacyBase);
assert.ok(migrated, 'legacy saves should load');
assert.deepEqual(
  migrated.study,
  { subjects: [], entries: [] },
  'legacy saves should receive an empty study structure',
);
assert.equal(earnedXp(migrated).study, 0);

const seeded = parseLifeData({
  ...legacyBase,
  study: {
    subjects: [
      {
        id: 'os',
        name: 'CSE321',
        code: 'OS',
        color: '#88aaff',
        createdAt: '2026-10-18T10:00:00.000Z',
      },
    ],
    entries: [
      {
        id: 'n1',
        subjectId: 'os',
        kind: 'note',
        title: 'Demand paging',
        body: 'Working set notes',
        createdAt: '2026-10-18T10:05:00.000Z',
        updatedAt: '2026-10-18T10:05:00.000Z',
        pinned: false,
        tags: ['note'],
      },
      {
        id: 'r1',
        subjectId: 'os',
        kind: 'reflection',
        title: 'What clicked',
        body: 'TLB idea feels clearer now',
        createdAt: '2026-10-18T10:15:00.000Z',
        updatedAt: '2026-10-18T10:15:00.000Z',
        pinned: true,
        tags: ['reflection'],
      },
      {
        id: 'x1',
        subjectId: 'missing',
        kind: 'resource',
        title: 'Bad ref',
        body: 'should be dropped',
        createdAt: '2026-10-18T10:20:00.000Z',
        updatedAt: '2026-10-18T10:20:00.000Z',
        pinned: false,
        tags: ['resource'],
      },
    ],
  },
});
assert.equal(seeded.study.subjects.length, 1);
assert.equal(
  seeded.study.entries.length,
  2,
  'entries linked to missing subjects should be filtered out',
);
assert.deepEqual(studyXp(seeded.study), {
  subjects: 35,
  notes: 10,
  reflections: 14,
  resources: 0,
  total: 59,
});
assert.equal(earnedXp(seeded).study, 59);
assert.ok(milestones(seeded).find((item) => item.id === 'first-subject').achieved);
assert.ok(!milestones(seeded).find((item) => item.id === 'note-keeper').achieved);

const rich = parseLifeData({
  ...legacyBase,
  study: {
    subjects: [
      {
        id: 'os',
        name: 'CSE321',
        code: 'OS',
        color: '#88aaff',
        createdAt: '2026-10-10T10:00:00.000Z',
      },
    ],
    entries: [
      {
        id: '1',
        subjectId: 'os',
        kind: 'note',
        title: 'A',
        body: 'a',
        createdAt: '2026-10-12T10:00:00.000Z',
        updatedAt: '2026-10-12T10:00:00.000Z',
        pinned: false,
        tags: ['note'],
      },
      {
        id: '2',
        subjectId: 'os',
        kind: 'note',
        title: 'B',
        body: 'b',
        createdAt: '2026-10-13T10:00:00.000Z',
        updatedAt: '2026-10-13T10:00:00.000Z',
        pinned: false,
        tags: ['note'],
      },
      {
        id: '3',
        subjectId: 'os',
        kind: 'resource',
        title: 'C',
        body: 'c',
        createdAt: '2026-10-14T10:00:00.000Z',
        updatedAt: '2026-10-14T10:00:00.000Z',
        pinned: false,
        tags: ['resource'],
      },
      {
        id: '4',
        subjectId: 'os',
        kind: 'reflection',
        title: 'D',
        body: 'd',
        createdAt: '2026-10-15T10:00:00.000Z',
        updatedAt: '2026-10-15T10:00:00.000Z',
        pinned: true,
        tags: ['reflection'],
      },
      {
        id: '5',
        subjectId: 'os',
        kind: 'reflection',
        title: 'E',
        body: 'e',
        createdAt: '2026-10-16T10:00:00.000Z',
        updatedAt: '2026-10-16T10:00:00.000Z',
        pinned: true,
        tags: ['reflection'],
      },
      {
        id: '6',
        subjectId: 'os',
        kind: 'reflection',
        title: 'F',
        body: 'f',
        createdAt: '2026-10-17T10:00:00.000Z',
        updatedAt: '2026-10-17T10:00:00.000Z',
        pinned: true,
        tags: ['reflection'],
      },
      {
        id: '7',
        subjectId: 'os',
        kind: 'resource',
        title: 'G',
        body: 'g',
        createdAt: '2026-10-18T10:00:00.000Z',
        updatedAt: '2026-10-18T10:00:00.000Z',
        pinned: true,
        tags: ['resource'],
      },
      {
        id: '8',
        subjectId: 'os',
        kind: 'resource',
        title: 'H',
        body: 'h',
        createdAt: '2026-10-18T12:00:00.000Z',
        updatedAt: '2026-10-18T12:00:00.000Z',
        pinned: true,
        tags: ['resource'],
      },
    ],
  },
});
assert.ok(milestones(rich).find((item) => item.id === 'note-keeper').achieved);
assert.ok(milestones(rich).find((item) => item.id === 'reflective-learner').achieved);
assert.ok(
  rewardUnlocked(
    rewards.find((item) => item.id === 'scholar'),
    rich,
  ),
);
assert.ok(
  rewardUnlocked(
    rewards.find((item) => item.id === 'aurora-notes'),
    rich,
  ),
);

const days = activityDays(rich, 7, new Date('2026-10-18T14:00:00.000Z'));
assert.equal(days.at(-1).study, 2, 'two study entries should count on 2026-10-18');
assert.equal(
  days.reduce((sum, day) => sum + day.study, 0),
  8,
);
const summary = insightSummary(rich, new Date('2026-10-18T14:00:00.000Z'));
assert.ok(
  summary.byArea.some((area) => area.label === 'Study' && area.value === earnedXp(rich).study),
);
console.log('Chapter X study migration, XP, milestones, rewards, and insights checks: PASS');
