import { useEffect, useState } from 'react';
import { atlasCountries } from '../explore/atlasCountries';
import { questions, regions } from '../explore/atlasContent';

export type Priority = 'low' | 'medium' | 'high';
export type Task = {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
};
export type Habit = {
  id: string;
  title: string;
  color: string;
  completedDates: string[];
  createdAt: string;
};
export type Goal = {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  createdAt: string;
  completedAt: string | null;
};
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  seconds: number;
  kind: 'reps' | 'time';
};
export type Workout = {
  id: string;
  date: string;
  createdAt: string;
  note: string;
  exercises: Exercise[];
};
export type SkillKey = 'pushup' | 'pullup' | 'lsit' | 'handstand' | 'muscleup' | 'frontlever';
export type SkillLevels = Record<SkillKey, number>;
export type ExploreData = { discovered: string[]; quizSolved: string[] };
export type StudySubject = {
  id: string;
  name: string;
  code: string;
  color: string;
  createdAt: string;
};
export type StudyEntryKind = 'note' | 'reflection' | 'resource';
export type StudyEntry = {
  id: string;
  subjectId: string;
  kind: StudyEntryKind;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  tags: string[];
};
export type StudyData = { subjects: StudySubject[]; entries: StudyEntry[] };
export type JournalMood = 'great' | 'good' | 'okay' | 'low' | 'tough' | null;
export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  mood: JournalMood;
  createdAt: string;
  updatedAt: string;
};
export type FocusSession = {
  id: string;
  courseId: string | null;
  minutes: number;
  completedAt: string;
  xp: number;
};
export type FocusData = { sessions: FocusSession[] };
export type Dream = {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'travel' | 'learning' | 'career' | 'wellness';
  goalId: string | null;
  createdAt: string;
  updatedAt: string;
  achievedAt: string | null;
};
export type ArcadeAchievements = {
  firstPlay: boolean;
  memoryClear: boolean;
  memorySharp: boolean;
  snake10: boolean;
  snake20: boolean;
};
export type ArcadeData = {
  snakeBest: number;
  memoryBestMoves: number | null;
  totalPlays: number;
  lastPlayedAt: string | null;
  unlocked: ArcadeAchievements;
};
export type RewardsData = { title: string; aura: string };
export type LifeData = {
  version: 1;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  workouts: Workout[];
  skills: SkillLevels;
  explore: ExploreData;
  study: StudyData;
  journal: JournalEntry[];
  focus: FocusData;
  dreams: Dream[];
  arcade: ArcadeData;
  rewards: RewardsData;
};
const knownCountries = new Set(atlasCountries.map((country) => country.code));
const knownQuestions = new Set(questions.map((question) => question.id));
const regionCodes = Object.fromEntries(
  regions.map((region) => [
    region,
    new Set(atlasCountries.filter((c) => c.region === region).map((c) => c.code)),
  ]),
) as Record<(typeof regions)[number], Set<string>>;
export const exploreRegionCount = (explore: ExploreData, region: (typeof regions)[number]) =>
  explore.discovered.filter((code) => regionCodes[region].has(code)).length;
export function exploreXp(explore: ExploreData) {
  const discoveries =
    new Set(explore.discovered.filter((code) => knownCountries.has(code))).size * 5;
  const trivia = new Set(explore.quizSolved.filter((key) => knownQuestions.has(key))).size * 20;
  const expeditions =
    regions.filter((region) => exploreRegionCount(explore, region) >= 5).length * 40;
  return { discoveries, trivia, expeditions, total: discoveries + trivia + expeditions };
}
export function studyXp(study: StudyData) {
  const subjects = study.subjects.length * 35;
  const notes = study.entries.filter((entry) => entry.kind === 'note').length * 10;
  const reflections = study.entries.filter((entry) => entry.kind === 'reflection').length * 14;
  const resources = study.entries.filter((entry) => entry.kind === 'resource').length * 8;
  return {
    subjects,
    notes,
    reflections,
    resources,
    total: subjects + notes + reflections + resources,
  };
}

const KEY = 'lifeverse-life-v1';
export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function offsetDate(delta: number, date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
  return todayKey(d);
}
export const id = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const safeNumber = (value: unknown, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min));
export const skillKeys: SkillKey[] = [
  'pushup',
  'pullup',
  'lsit',
  'handstand',
  'muscleup',
  'frontlever',
];
export const skillsCatalog: {
  key: SkillKey;
  name: string;
  tagline: string;
  levels: string[];
  color: string;
}[] = [
  {
    key: 'pushup',
    name: 'Push-up mastery',
    tagline: 'Build your pushing strength',
    levels: [
      'Not started',
      'Incline push-ups',
      'Knee push-ups',
      'Full push-ups',
      'Diamond push-ups',
      'Archer push-ups',
    ],
    color: '#aaa4ff',
  },
  {
    key: 'pullup',
    name: 'Pull-up mastery',
    tagline: 'Strength from the ground up',
    levels: [
      'Not started',
      'Dead hang',
      'Scapular pulls',
      'Assisted pull-ups',
      'Strict pull-ups',
      'Chest-to-bar',
    ],
    color: '#7bded4',
  },
  {
    key: 'lsit',
    name: 'L-sit',
    tagline: 'Unlock powerful core control',
    levels: [
      'Not started',
      'Support hold',
      'Tuck hold',
      'One-leg extension',
      'Full L-sit',
      'V-sit progression',
    ],
    color: '#ffcb90',
  },
  {
    key: 'handstand',
    name: 'Handstand',
    tagline: 'Find your balance',
    levels: [
      'Not started',
      'Wall plank',
      'Wall walk',
      'Wall handstand',
      'Freestanding hold',
      'Handstand push-up',
    ],
    color: '#ff9bbd',
  },
  {
    key: 'muscleup',
    name: 'Muscle-up',
    tagline: 'Master the transition',
    levels: [
      'Not started',
      'Strict pull-ups',
      'Explosive pull-ups',
      'Transition drills',
      'Assisted muscle-up',
      'Clean muscle-up',
    ],
    color: '#e2aeff',
  },
  {
    key: 'frontlever',
    name: 'Front lever',
    tagline: 'Own your bodyline',
    levels: [
      'Not started',
      'Scapular hold',
      'Tuck lever',
      'Advanced tuck',
      'One-leg lever',
      'Full front lever',
    ],
    color: '#9dbaff',
  },
];

export const starterData: LifeData = {
  version: 1,
  tasks: [],
  habits: [
    {
      id: 'starter-water',
      title: 'Drink enough water',
      color: '#80d8f8',
      completedDates: [],
      createdAt: todayKey(),
    },
    {
      id: 'starter-reading',
      title: 'Read for 20 minutes',
      color: '#c0acff',
      completedDates: [],
      createdAt: todayKey(),
    },
    {
      id: 'starter-move',
      title: 'Move your body',
      color: '#9bedd1',
      completedDates: [],
      createdAt: todayKey(),
    },
  ],
  goals: [],
  workouts: [],
  skills: { pushup: 0, pullup: 0, lsit: 0, handstand: 0, muscleup: 0, frontlever: 0 },
  explore: { discovered: [], quizSolved: [] },
  study: { subjects: [], entries: [] },
  journal: [],
  focus: { sessions: [] },
  dreams: [],
  arcade: {
    snakeBest: 0,
    memoryBestMoves: null,
    totalPlays: 0,
    lastPlayedAt: null,
    unlocked: {
      firstPlay: false,
      memoryClear: false,
      memorySharp: false,
      snake10: false,
      snake20: false,
    },
  },
  rewards: { title: 'traveler', aura: 'moonlight' },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
const isString = (value: unknown) => typeof value === 'string';
export function parseLifeData(raw: unknown): LifeData | null {
  try {
    if (
      !isRecord(raw) ||
      raw.version !== 1 ||
      !Array.isArray(raw.tasks) ||
      !Array.isArray(raw.habits) ||
      !Array.isArray(raw.goals) ||
      !Array.isArray(raw.workouts)
    )
      return null;
    const tasks = Array.isArray(raw.tasks)
      ? raw.tasks.filter(
          (t): t is Task =>
            isRecord(t) &&
            isString(t.id) &&
            isString(t.title) &&
            ['low', 'medium', 'high'].includes(String(t.priority)) &&
            isString(t.dueDate) &&
            isString(t.createdAt) &&
            (t.completedAt === null || isString(t.completedAt)),
        )
      : [];
    const habits = Array.isArray(raw.habits)
      ? raw.habits
          .filter(
            (h): h is Habit =>
              isRecord(h) &&
              isString(h.id) &&
              isString(h.title) &&
              isString(h.color) &&
              Array.isArray(h.completedDates) &&
              isString(h.createdAt),
          )
          .map((h) => ({ ...h, completedDates: h.completedDates.filter(isString) as string[] }))
      : [];
    const goals = Array.isArray(raw.goals)
      ? raw.goals.filter(
          (g): g is Goal =>
            isRecord(g) &&
            isString(g.id) &&
            isString(g.title) &&
            typeof g.target === 'number' &&
            typeof g.progress === 'number' &&
            isString(g.unit) &&
            isString(g.createdAt) &&
            (g.completedAt === null || isString(g.completedAt)),
        )
      : [];
    const workouts = Array.isArray(raw.workouts)
      ? raw.workouts
          .filter(
            (w): w is Workout =>
              isRecord(w) &&
              isString(w.id) &&
              isString(w.date) &&
              isString(w.createdAt) &&
              isString(w.note) &&
              Array.isArray(w.exercises),
          )
          .map((w) => ({
            ...w,
            exercises: w.exercises.filter(
              (e): e is Exercise =>
                isRecord(e) &&
                isString(e.id) &&
                isString(e.name) &&
                typeof e.sets === 'number' &&
                typeof e.reps === 'number' &&
                typeof e.weight === 'number' &&
                typeof e.seconds === 'number' &&
                ['reps', 'time'].includes(String(e.kind)),
            ),
          }))
      : [];
    const levels = isRecord(raw.skills) ? raw.skills : {};
    const skills = { ...starterData.skills };
    for (const key of skillKeys) skills[key] = safeNumber(levels[key] ?? 0, 0, 5);
    // v1 backups from before Chapter VI contain no `explore`; migrate them in-place.
    const savedExplore = isRecord(raw.explore) ? raw.explore : {};
    const discovered = Array.isArray(savedExplore.discovered)
      ? [
          ...new Set(
            savedExplore.discovered.filter(
              (code): code is string => typeof code === 'string' && knownCountries.has(code),
            ),
          ),
        ]
      : [];
    const quizSolved = Array.isArray(savedExplore.quizSolved)
      ? [
          ...new Set(
            savedExplore.quizSolved.filter(
              (key): key is string => typeof key === 'string' && knownQuestions.has(key),
            ),
          ),
        ]
      : [];
    const savedStudy = isRecord(raw.study) ? raw.study : {};
    const subjects = Array.isArray(savedStudy.subjects)
      ? savedStudy.subjects.filter(
          (subject): subject is StudySubject =>
            isRecord(subject) &&
            isString(subject.id) &&
            isString(subject.name) &&
            isString(subject.code) &&
            isString(subject.color) &&
            isString(subject.createdAt),
        )
      : [];
    const subjectIds = new Set(subjects.map((subject) => subject.id));
    const entries = Array.isArray(savedStudy.entries)
      ? savedStudy.entries
          .filter(
            (entry): entry is StudyEntry =>
              isRecord(entry) &&
              isString(entry.id) &&
              isString(entry.subjectId) &&
              subjectIds.has(String(entry.subjectId)) &&
              ['note', 'reflection', 'resource'].includes(String(entry.kind)) &&
              isString(entry.title) &&
              isString(entry.body) &&
              isString(entry.createdAt) &&
              isString(entry.updatedAt) &&
              typeof entry.pinned === 'boolean' &&
              Array.isArray(entry.tags),
          )
          .map((entry) => ({ ...entry, tags: entry.tags.filter(isString) as string[] }))
      : [];
    // Older LifeVerse backups do not contain journal entries; retain them as an empty collection.
    const journal: JournalEntry[] = Array.isArray(raw.journal)
      ? raw.journal.filter(
          (entry): entry is JournalEntry =>
            isRecord(entry) &&
            isString(entry.id) &&
            isString(entry.title) &&
            isString(entry.body) &&
            isString(entry.createdAt) &&
            isString(entry.updatedAt) &&
            (entry.mood === null ||
              ['great', 'good', 'okay', 'low', 'tough'].includes(String(entry.mood))),
        )
      : [];
    const savedFocus = isRecord(raw.focus) ? raw.focus : {};
    const focusSessions: FocusSession[] = Array.isArray(savedFocus.sessions)
      ? savedFocus.sessions
          .filter(
            (session): session is FocusSession =>
              isRecord(session) &&
              isString(session.id) &&
              (session.courseId === null || isString(session.courseId)) &&
              typeof session.minutes === 'number' &&
              Number.isInteger(session.minutes) &&
              session.minutes >= 1 &&
              session.minutes <= 180 &&
              isString(session.completedAt) &&
              Number.isFinite(Date.parse(String(session.completedAt))) &&
              typeof session.xp === 'number' &&
              Number.isInteger(session.xp) &&
              session.xp >= 0 &&
              session.xp <= 15,
          )
          .slice(0, 3000)
      : [];
    const dreams: Dream[] = Array.isArray(raw.dreams)
      ? raw.dreams
          .filter(
            (d): d is Dream =>
              isRecord(d) &&
              isString(d.id) &&
              isString(d.title) &&
              isString(d.description) &&
              ['personal', 'travel', 'learning', 'career', 'wellness'].includes(
                String(d.category),
              ) &&
              (d.goalId === null || isString(d.goalId)) &&
              isString(d.createdAt) &&
              isString(d.updatedAt) &&
              (d.achievedAt === null || isString(d.achievedAt)),
          )
          .slice(0, 1000)
      : [];
    const savedArcade = isRecord(raw.arcade) ? raw.arcade : {};
    const savedUnlocked = isRecord(savedArcade.unlocked) ? savedArcade.unlocked : {};
    const arcade = {
      snakeBest:
        typeof savedArcade.snakeBest === 'number' &&
        Number.isInteger(savedArcade.snakeBest) &&
        savedArcade.snakeBest >= 0
          ? Math.min(savedArcade.snakeBest, 999)
          : 0,
      memoryBestMoves:
        savedArcade.memoryBestMoves === null
          ? null
          : typeof savedArcade.memoryBestMoves === 'number' &&
              Number.isInteger(savedArcade.memoryBestMoves) &&
              savedArcade.memoryBestMoves >= 1
            ? Math.min(savedArcade.memoryBestMoves, 999)
            : null,
      totalPlays:
        typeof savedArcade.totalPlays === 'number' &&
        Number.isInteger(savedArcade.totalPlays) &&
        savedArcade.totalPlays >= 0
          ? Math.min(savedArcade.totalPlays, 9999)
          : 0,
      lastPlayedAt: typeof savedArcade.lastPlayedAt === 'string' ? savedArcade.lastPlayedAt : null,
      unlocked: {
        firstPlay: Boolean(savedUnlocked.firstPlay),
        memoryClear: Boolean(savedUnlocked.memoryClear),
        memorySharp: Boolean(savedUnlocked.memorySharp),
        snake10: Boolean(savedUnlocked.snake10),
        snake20: Boolean(savedUnlocked.snake20),
      },
    };
    const savedRewards = isRecord(raw.rewards) ? raw.rewards : {};
    const rewards: RewardsData = {
      title: typeof savedRewards.title === 'string' ? savedRewards.title : 'traveler',
      aura: typeof savedRewards.aura === 'string' ? savedRewards.aura : 'moonlight',
    };
    return {
      version: 1,
      tasks,
      habits,
      goals,
      workouts,
      skills,
      explore: { discovered, quizSolved },
      study: { subjects, entries },
      journal,
      focus: { sessions: focusSessions },
      dreams,
      arcade,
      rewards,
    };
  } catch {
    return null;
  }
}
function load(): LifeData {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? (parseLifeData(JSON.parse(saved)) ?? starterData) : starterData;
  } catch {
    return starterData;
  }
}

export function useLifeData() {
  const [data, setData] = useState<LifeData>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage blocked or full */
    }
  }, [data]);
  return [data, setData] as const;
}

export function streak(dates: string[]): number {
  const set = new Set(dates);
  let start = set.has(todayKey()) ? 0 : -1;
  let count = 0;
  while (set.has(offsetDate(start))) {
    count++;
    start--;
  }
  return count;
}
export function earnedXp(data: LifeData) {
  const tasks = data.tasks.filter((t) => t.completedAt).length * 25;
  const habits = data.habits.reduce((n, h) => n + new Set(h.completedDates).size, 0) * 15;
  const goals = data.goals.filter((g) => g.completedAt && g.progress >= g.target).length * 80;
  // Workout XP is awarded once per training day, so multiple saved sessions cannot farm XP.
  const workouts = new Set(data.workouts.map((w) => w.date)).size * 40;
  const skills = skillKeys.reduce((n, key) => n + data.skills[key], 0) * 20;
  const explore = exploreXp(data.explore).total;
  const study = studyXp(data.study).total;
  // At most 30 focus XP per calendar day; imported session claims are capped too.
  const focusDaily = new Map<string, number>();
  for (const session of data.focus.sessions) {
    const day = session.completedAt.slice(0, 10);
    focusDaily.set(day, Math.min(30, (focusDaily.get(day) ?? 0) + session.xp));
  }
  const focus = [...focusDaily.values()].reduce((sum, value) => sum + value, 0);
  return {
    tasks,
    habits,
    goals,
    workouts,
    skills,
    explore,
    study,
    focus,
    total: tasks + habits + goals + workouts + skills + explore + study + focus,
  };
}
export function levelForXp(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  return { level, current: xp % 250, toNext: 250 };
}
export function recentDays(length = 7) {
  return Array.from({ length }, (_, i) => offsetDate(i - length + 1));
}
export function displayDate(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
export function dateDay(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' });
}
