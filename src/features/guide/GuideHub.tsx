import { useState } from 'react';
import {
  BookOpen,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Database,
  Download,
  Dumbbell,
  Gamepad2,
  Globe2,
  Headphones,
  Keyboard,
  ListChecks,
  MousePointerClick,
  Palette,
  Rocket,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserRound,
  Volume2,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './guide.css';

type TabId = 'start' | 'map' | 'xp' | 'data';
type ObjectId =
  'study' | 'desk' | 'trophies' | 'globe' | 'fitness' | 'planner' | 'focus' | 'arcade';

type GuideObject = {
  id: ObjectId;
  name: string;
  object: string;
  Icon: LucideIcon;
  color: string;
  // Pin position as a percentage of the room illustration (centre of each hotspot).
  x: number;
  y: number;
  image?: string;
  summary: string;
  actions: string[];
  xp: string;
};

const guideObjects: GuideObject[] = [
  {
    id: 'study',
    name: 'Study',
    object: 'Bookshelf on the left',
    Icon: BookOpen,
    color: '#7cc4ff',
    x: 9,
    y: 24,
    image: '/images/hubs/study-hero.png',
    summary: 'Keep your courses, notes and daily journal in one calm place.',
    actions: [
      'Create a course, then add notes, reflections and useful resources to it',
      'Write a journal entry and pick how your day felt',
      'Edit or delete anything you saved earlier',
    ],
    xp: 'New course +35 · note +10 · reflection +14 · resource +8',
  },
  {
    id: 'desk',
    name: 'Productivity',
    object: 'Desk and monitors',
    Icon: ListChecks,
    color: '#b79bff',
    x: 26,
    y: 44,
    image: '/images/hubs/productivity-hero.png',
    summary: 'Your daily command centre for tasks, habits and bigger goals.',
    actions: [
      "Add today's missions and tick them off when done",
      'Check in your daily rituals to grow your habit garden',
      'Set a goal with a target and update its progress',
    ],
    xp: 'Task +25 · habit check-in +15 · finished goal +80',
  },
  {
    id: 'trophies',
    name: 'Achievements',
    object: 'Trophy shelf, top right',
    Icon: Trophy,
    color: '#ffd166',
    x: 81,
    y: 21,
    image: '/images/hubs/achievements-hero.png',
    summary: 'See your level, milestones and the rewards you have unlocked.',
    actions: [
      'Review which milestones you have earned and which are next',
      'Pick a title and aura once you unlock them',
      'Check the skill tree to see how far you have come',
    ],
    xp: 'Nothing to earn here. It shows the XP you earned elsewhere.',
  },
  {
    id: 'globe',
    name: 'Explore',
    object: 'Globe on the right',
    Icon: Globe2,
    color: '#5eead4',
    x: 78,
    y: 40,
    image: '/images/hubs/explore-hero.png',
    summary: 'A zoomable world atlas with country passports, trivia and a field journal.',
    actions: [
      'Click a country on the map and mark it as discovered',
      'Filter by continent or search by country and capital',
      'Answer trivia questions to earn bonus XP',
    ],
    xp: 'Country +5 · trivia answer +20 · region expedition (5 places) +40',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    object: 'Training corner, bottom right',
    Icon: Dumbbell,
    color: '#ff9f5a',
    x: 85,
    y: 73,
    image: '/images/hubs/fitness-hero.png',
    summary: 'Log workouts and follow a calisthenics skill journey.',
    actions: [
      'Add exercises and save a workout for the day',
      'Record the calisthenics stages you have reached',
      'Look back at your latest workout',
    ],
    xp: 'Workout day +40 (once per day) · skill stage +20',
  },
  {
    id: 'planner',
    name: 'Life Planner',
    object: 'Inspiration board by the monitors',
    Icon: ClipboardList,
    color: '#ff8fc8',
    x: 35.8,
    y: 30.2,
    image: '/images/hubs/planner-hero.png',
    summary: 'Plan your days and keep a dream board for the bigger picture.',
    actions: [
      'Build your plan for today and see what is coming up',
      'Add dreams to your vision board',
      'Collect ideas and possibilities for later',
    ],
    xp: 'No XP. This hub is for planning and inspiration.',
  },
  {
    id: 'focus',
    name: 'Focus',
    object: 'Headphones next to the left monitor',
    Icon: Headphones,
    color: '#8c9bff',
    x: 18.1,
    y: 37.5,
    image: '/images/hubs/focus-hero.png',
    summary: 'A distraction-free timer with ambient sounds and music.',
    actions: [
      'Pick a focus and break length, then start the timer',
      'Choose background sounds that help you concentrate',
      'Check your progress after each session',
    ],
    xp: 'Session of 10+ min +10 · 25+ min +15 · at most 30 XP per day',
  },
  {
    id: 'arcade',
    name: 'Mini Arcade',
    object: 'Handheld console on the sofa',
    Icon: Gamepad2,
    color: '#4de1ff',
    x: 18,
    y: 67.8,
    image: '/images/arcade/arcade-banner.png',
    summary: 'Short games for a quick break: Snake and Memory Match.',
    actions: [
      'Play Snake or Memory Match',
      'Beat your own records',
      'Collect arcade badges on the badge wall',
    ],
    xp: 'No XP. Arcade has its own records and badges.',
  },
];

const tabs: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'start', label: 'Start here', Icon: Rocket },
  { id: 'map', label: 'Room tour', Icon: Compass },
  { id: 'xp', label: 'Earn XP', Icon: Zap },
  { id: 'data', label: 'Save your data', Icon: Database },
];

const steps: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: MousePointerClick,
    title: 'Click a glowing icon',
    text: 'Each icon in the bedroom opens a different tool.',
  },
  {
    Icon: ListChecks,
    title: 'Do something real',
    text: 'Add a task, log a workout, write a note.',
  },
  {
    Icon: Sparkles,
    title: 'Earn XP and level up',
    text: 'Real actions give XP and unlock rewards.',
  },
];

const topBarItems: { Icon: LucideIcon; name: string; text: string }[] = [
  { Icon: Zap, name: 'Level', text: 'Your level and XP' },
  { Icon: ChartNoAxesCombined, name: 'Insights', text: 'Your activity over time' },
  { Icon: UserRound, name: 'Player profile', text: 'Milestones and rewards' },
  { Icon: Palette, name: 'Avatar Studio', text: 'Change your character' },
];

const tips: { Icon: LucideIcon; name: string; text: string }[] = [
  { Icon: MousePointerClick, name: 'Labels button', text: 'Shows every clickable object at once.' },
  { Icon: Volume2, name: 'Speaker button', text: 'Turns the soft sounds on or off.' },
  { Icon: Keyboard, name: 'Esc key', text: 'Closes a hub and returns to the room.' },
];

const xpGroups: {
  name: string;
  Icon: LucideIcon;
  color: string;
  rows: [string, string][];
  note?: string;
}[] = [
  {
    name: 'Productivity',
    Icon: ListChecks,
    color: '#b79bff',
    rows: [
      ['Complete a task', '+25'],
      ['Habit check-in', '+15'],
      ['Finish a goal', '+80'],
    ],
    note: 'One check-in per habit per day',
  },
  {
    name: 'Fitness',
    Icon: Dumbbell,
    color: '#ff9f5a',
    rows: [
      ['Workout day', '+40'],
      ['Calisthenics stage', '+20'],
    ],
    note: 'Workout XP counts once per day',
  },
  {
    name: 'Study',
    Icon: BookOpen,
    color: '#7cc4ff',
    rows: [
      ['New course', '+35'],
      ['Note', '+10'],
      ['Reflection', '+14'],
      ['Resource', '+8'],
    ],
  },
  {
    name: 'Focus',
    Icon: Headphones,
    color: '#8c9bff',
    rows: [
      ['Session of 10+ min', '+10'],
      ['Session of 25+ min', '+15'],
    ],
    note: 'At most 30 XP per day',
  },
  {
    name: 'Explore',
    Icon: Globe2,
    color: '#5eead4',
    rows: [
      ['Discover a country', '+5'],
      ['Answer trivia', '+20'],
      ['Region expedition', '+40'],
    ],
    note: 'Expedition = 5 places in one region',
  },
  {
    name: 'No XP here',
    Icon: Gamepad2,
    color: '#4de1ff',
    rows: [
      ['Life Planner', 'Plan'],
      ['Mini Arcade', 'Fun'],
      ['Achievements', 'Progress'],
    ],
    note: 'These are for planning, breaks and tracking',
  },
];

const dataCards: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Database,
    title: 'Saved automatically',
    text: 'Everything is stored in this browser on this device. No account needed.',
  },
  {
    Icon: Download,
    title: 'Make a backup',
    text: 'Open any hub and use Backup at the bottom. Use Restore to load it again on another device.',
  },
  {
    Icon: ShieldAlert,
    title: 'Careful with clearing data',
    text: "Clearing this site's browser data erases your progress. Back up first.",
  },
];

export default function GuideHub({ initialTab = 'start' }: { initialTab?: TabId }) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [index, setIndex] = useState(0);
  const current = guideObjects[index];
  const CurrentIcon = current.Icon;
  const go = (delta: number) =>
    setIndex((i) => (i + delta + guideObjects.length) % guideObjects.length);

  return (
    <div className="lv-guide">
      <div className="lv-guide-tabs" role="tablist" aria-label="Guide sections">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`guide-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`guide-panel-${id}`}
            className={tab === id ? 'is-active' : ''}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'start' && (
        <div role="tabpanel" id="guide-panel-start" aria-labelledby="guide-tab-start">
          <div className="lv-guide-intro">
            <h3>Welcome to LifeVerse</h3>
            <p>
              Your bedroom is a dashboard. Each object opens a real tool, and everything you do
              earns XP.
            </p>
          </div>
          <div className="lv-guide-steps">
            {steps.map(({ Icon, title, text }, i) => (
              <article key={title}>
                <span className="lv-guide-step-icon">
                  <Icon size={22} />
                  <em>{i + 1}</em>
                </span>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="lv-guide-cta">
            <button type="button" onClick={() => setTab('map')}>
              <Compass size={18} />
              Take the room tour
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="lv-guide-columns">
            <section>
              <h4 className="lv-guide-heading">Top bar</h4>
              <div className="lv-guide-mini">
                {topBarItems.map(({ Icon, name, text }) => (
                  <div key={name}>
                    <Icon size={17} />
                    <p>
                      <b>{name}</b>
                      <span>{text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4 className="lv-guide-heading">Good to know</h4>
              <div className="lv-guide-mini">
                {tips.map(({ Icon, name, text }) => (
                  <div key={name}>
                    <Icon size={17} />
                    <p>
                      <b>{name}</b>
                      <span>{text}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'map' && (
        <div
          role="tabpanel"
          id="guide-panel-map"
          aria-labelledby="guide-tab-map"
          className="lv-guide-tour"
        >
          <div className="lv-guide-tour-map">
            <div className="lv-guide-map">
              <img
                src="/images/lifeverse-room-expanded.png"
                alt="The LifeVerse bedroom with numbered pins on each clickable object"
                draggable={false}
              />
              {guideObjects.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  className={`lv-guide-pin ${index === i ? 'is-selected' : ''}`}
                  style={{
                    left: `${o.x}%`,
                    top: `${o.y}%`,
                    ['--pin-color' as never]: o.color,
                  }}
                  aria-label={`${o.name}: ${o.object}`}
                  aria-pressed={index === i}
                  onClick={() => setIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="lv-guide-caption">
              Tap a numbered pin, or use Next, to explore each object.
            </p>
          </div>
          <article className="lv-guide-detail" style={{ ['--pin-color' as never]: current.color }}>
            {current.image && <img src={current.image} alt="" loading="lazy" />}
            <div className="lv-guide-detail-body">
              <span className="lv-guide-detail-title">
                <CurrentIcon size={20} />
                <h4>
                  {index + 1}. {current.name}
                </h4>
              </span>
              <small>Find it: {current.object}</small>
              <p>{current.summary}</p>
              <ul>
                {current.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="lv-guide-xp">
                <Zap size={14} /> {current.xp}
              </p>
            </div>
            <div className="lv-guide-nav">
              <button type="button" onClick={() => go(-1)} aria-label="Previous object">
                <ChevronLeft size={18} />
                Back
              </button>
              <span>
                {index + 1} of {guideObjects.length}
              </span>
              <button type="button" onClick={() => go(1)} aria-label="Next object">
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </article>
        </div>
      )}

      {tab === 'xp' && (
        <div role="tabpanel" id="guide-panel-xp" aria-labelledby="guide-tab-xp">
          <div className="lv-guide-levelbar">
            <Zap size={20} />
            <p>
              <b>Every 250 XP = 1 level.</b> Level 1 starts at 0 XP, level 2 at 250 XP, level 3 at
              500 XP, and so on.
            </p>
          </div>
          <div className="lv-guide-xpgrid">
            {xpGroups.map(({ name, Icon, color, rows, note }) => (
              <section key={name} style={{ ['--pin-color' as never]: color }}>
                <h4>
                  <Icon size={17} />
                  {name}
                </h4>
                <div>
                  {rows.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </p>
                  ))}
                </div>
                {note && <small>{note}</small>}
              </section>
            ))}
          </div>
        </div>
      )}

      {tab === 'data' && (
        <div role="tabpanel" id="guide-panel-data" aria-labelledby="guide-tab-data">
          <div className="lv-guide-datagrid">
            {dataCards.map(({ Icon, title, text }) => (
              <article key={title}>
                <span className="lv-guide-step-icon">
                  <Icon size={22} />
                </span>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
