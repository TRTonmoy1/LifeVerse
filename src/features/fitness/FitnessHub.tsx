import SkillJourney from './SkillJourney';
import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowUpRight,
  Award,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Flame,
  History,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  Empty,
  ProgressBar,
  QuestBriefing,
  SectionHead,
  Stat,
  WeekChart,
} from '../../components/dashboard/DashboardBits';
import {
  displayDate,
  earnedXp,
  id,
  recentDays,
  skillsCatalog,
  todayKey,
  type Exercise,
  type LifeData,
  type Workout,
} from '../life/lifeData';

type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
type Tab = 'overview' | 'log' | 'skills' | 'history';
const exerciseOptions = [
  'Push-ups',
  'Pull-ups',
  'Chin-ups',
  'Dips',
  'Squats',
  'Lunges',
  'Plank',
  'L-sit',
  'Handstand hold',
  'Hollow body hold',
  'Burpees',
  'Rows',
  'Pike push-ups',
  'Muscle-up',
  'Front lever hold',
  'Running',
  'Other',
];
const timedOptions = [
  'Plank',
  'L-sit',
  'Handstand hold',
  'Hollow body hold',
  'Front lever hold',
  'Running',
];
function getRecords(workouts: Workout[]) {
  const results = new Map<string, { name: string; value: number; unit: string; date: string }>();
  workouts.forEach((w) =>
    w.exercises.forEach((ex) => {
      const unit = ex.kind === 'time' ? 'sec' : ex.weight > 0 ? 'kg' : 'reps';
      const value = ex.kind === 'time' ? ex.seconds : ex.weight > 0 ? ex.weight : ex.reps;
      const key = `${ex.name}|${unit}`;
      if (value > (results.get(key)?.value ?? -1))
        results.set(key, { name: ex.name, value, unit, date: w.date });
    }),
  );
  return [...results.values()].sort((a, b) => b.date.localeCompare(a.date));
}
export default function FitnessHub({ data, setData }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState('');
  const [name, setName] = useState('Push-ups');
  const [customExercise, setCustomExercise] = useState('');
  const [kind, setKind] = useState<'reps' | 'time'>('reps');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [seconds, setSeconds] = useState('30');
  const [draft, setDraft] = useState<Exercise[]>([]);
  const [notice, setNotice] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const today = todayKey();
  const lastSeven = recentDays();
  const weekSessions = data.workouts.filter((w) => lastSeven.includes(w.date));
  const daysTrained = new Set(data.workouts.map((w) => w.date)).size;
  const weekDays = new Set(weekSessions.map((w) => w.date)).size;
  const totalSets = data.workouts.reduce(
    (count, w) => count + w.exercises.reduce((n, ex) => n + ex.sets, 0),
    0,
  );
  const reachedLevels = Object.values(data.skills).reduce((sum, n) => sum + n, 0);
  const records = getRecords(data.workouts);
  const workoutValues = Object.fromEntries(
    lastSeven.map((day) => [day, data.workouts.filter((w) => w.date === day).length]),
  );
  const workoutXp = earnedXp(data).workouts + earnedXp(data).skills;
  const tabs: { key: Tab; text: string }[] = [
    { key: 'overview', text: 'Overview' },
    { key: 'log', text: 'Log workout' },
    { key: 'skills', text: 'Skill tree' },
    { key: 'history', text: 'History & PRs' },
  ];
  function chooseExercise(next: string) {
    setName(next);
    setKind(timedOptions.includes(next) ? 'time' : 'reps');
  }
  function addExercise(e: FormEvent) {
    e.preventDefault();
    const exName = (name === 'Other' ? customExercise : name).trim();
    if (!exName || Number(sets) < 1 || Number(sets) > 100) return;
    const ex: Exercise = {
      id: id(),
      name: exName.slice(0, 80),
      kind,
      sets: Math.floor(Number(sets)),
      reps: kind === 'reps' ? Math.max(1, Math.floor(Number(reps))) : 0,
      weight: kind === 'reps' ? Math.max(0, Number(weight)) : 0,
      seconds: kind === 'time' ? Math.max(1, Math.floor(Number(seconds))) : 0,
    };
    if (
      kind === 'reps' &&
      (!Number.isFinite(ex.reps) ||
        ex.reps > 10000 ||
        !Number.isFinite(ex.weight) ||
        ex.weight > 1000)
    )
      return;
    if (kind === 'time' && (!Number.isFinite(ex.seconds) || ex.seconds > 86400)) return;
    setDraft((p) => [...p, ex]);
    setNotice('');
  }
  function saveWorkout() {
    if (!draft.length || !date || date > today) return;
    setData((p) => ({
      ...p,
      workouts: [
        {
          id: id(),
          date,
          createdAt: new Date().toISOString(),
          note: note.trim().slice(0, 300),
          exercises: draft,
        },
        ...p.workouts,
      ],
    }));
    setDraft([]);
    setNote('');
    setDate(today);
    setNotice('Workout saved! Your progress is now in History.');
    setTab('history');
  }
  function removeWorkout(workoutId: string) {
    setData((p) => ({ ...p, workouts: p.workouts.filter((w) => w.id !== workoutId) }));
  }
  return (
    <div className="lv-hub-body fitness-hub">
      <div className="lv-tabs" role="tablist" aria-label="Fitness pages">
        {tabs.map((t) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'active' : ''}
            key={t.key}
            onClick={() => setTab(t.key)}
          >
            {t.text}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && (
            <>
              <SectionHead
                eyebrow="YOUR TRAINING HQ"
                title="Stronger every session."
                text="Track your effort, unlock new skills, and see how far you've come."
                action={
                  <button
                    type="button"
                    className="lv-btn lv-btn-primary"
                    onClick={() => setTab('log')}
                  >
                    <Plus size={16} />
                    Log workout
                  </button>
                }
              />
              <QuestBriefing
                color="mint"
                title={weekDays ? 'The training arc has begun.' : 'Begin your training arc.'}
                subtitle="Your strength story is written one session at a time. Consistency beats speed."
                completed={
                  Number(weekDays > 0) + Number(reachedLevels > 0) + Number(records.length > 0)
                }
                total={3}
                xp={workoutXp}
                quests={[
                  {
                    text: 'Train at least once this week',
                    done: weekDays > 0,
                    reward: '+40 XP / day',
                  },
                  {
                    text: 'Advance a skill progression',
                    done: reachedLevels > 0,
                    reward: '+20 XP / stage',
                  },
                  {
                    text: 'Set a personal record',
                    done: records.length > 0,
                    reward: 'New milestone',
                  },
                ]}
                action="Enter training ground"
                onAction={() => setTab('log')}
              />
              <div className="lv-stat-grid">
                <Stat
                  icon={<Dumbbell />}
                  label="Workout sessions"
                  value={data.workouts.length}
                  detail={`${daysTrained} training days`}
                  tone="mint"
                />
                <Stat
                  icon={<Flame />}
                  label="This week"
                  value={weekDays}
                  detail="Training days"
                  tone="orange"
                />
                <Stat
                  icon={<Activity />}
                  label="Total sets"
                  value={totalSets}
                  detail="All-time work"
                  tone="violet"
                />
                <Stat
                  icon={<Zap />}
                  label="Fitness XP"
                  value={workoutXp}
                  detail="Workout + skill XP"
                  tone="pink"
                />
              </div>
              <div className="lv-content-grid">
                <div className="lv-stack">
                  <div className="lv-panel">
                    <div className="lv-panel-top">
                      <h3>Your latest workout</h3>
                      <button className="lv-text-action" onClick={() => setTab('history')}>
                        View all →
                      </button>
                    </div>
                    {data.workouts.length ? (
                      <div className="lv-last-workout">
                        <div className="lv-last-workout-icon">
                          <Dumbbell size={23} />
                        </div>
                        <div>
                          <h4>
                            {data.workouts[0].exercises
                              .map((ex) => ex.name)
                              .slice(0, 2)
                              .join(' · ')}
                          </h4>
                          <p>
                            {displayDate(data.workouts[0].date)} ·{' '}
                            {data.workouts[0].exercises.reduce((n, ex) => n + ex.sets, 0)} sets
                          </p>
                        </div>
                        <ShieldCheck color="#98e8d5" size={22} />
                      </div>
                    ) : (
                      <Empty
                        title="Your first rep awaits"
                        text="Log a training session to see your progress and start earning XP."
                        onAction={() => setTab('log')}
                        action="Log workout"
                      />
                    )}
                  </div>
                  <div className="lv-panel">
                    <div className="lv-panel-top">
                      <h3>Calisthenics journey</h3>
                      <button className="lv-text-action" onClick={() => setTab('skills')}>
                        Skill tree →
                      </button>
                    </div>
                    {skillsCatalog.slice(0, 3).map((s) => (
                      <div className="lv-overview-skill" key={s.key}>
                        <div>
                          <strong>{s.name}</strong>
                          <span>{s.levels[data.skills[s.key]]}</span>
                        </div>
                        <ProgressBar value={(data.skills[s.key] / 5) * 100} color={s.color} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lv-stack">
                  <WeekChart values={workoutValues} label="Training activity" />
                  <div className="lv-panel lv-quote fitness-quote">
                    <span className="lv-eyebrow">LEVEL UP</span>
                    <h3>Build strength. Earn freedom.</h3>
                    <p>
                      The best training plan is the one you can repeat. Log your work and notice the
                      progress.
                    </p>
                    <span className="lv-quote-spark">✦</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === 'log' && (
            <>
              <SectionHead
                eyebrow="TRAINING JOURNAL"
                title="Log a workout"
                text="Add exercises to a session, then save it. Your history and PRs update automatically."
              />
              <div className="lv-log-grid">
                <div className="lv-panel">
                  <h3>Add exercise</h3>
                  <form onSubmit={addExercise} className="lv-workout-form">
                    <div className="lv-field">
                      <label htmlFor="exercise-name">Exercise</label>
                      <select
                        id="exercise-name"
                        value={name}
                        onChange={(e) => chooseExercise(e.target.value)}
                      >
                        {exerciseOptions.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </div>
                    {name === 'Other' && (
                      <div className="lv-field">
                        <label htmlFor="exercise-custom">Exercise name</label>
                        <input
                          id="exercise-custom"
                          value={customExercise}
                          onChange={(e) => setCustomExercise(e.target.value)}
                          maxLength={80}
                          required
                          placeholder="Your exercise"
                        />
                      </div>
                    )}
                    <div className="lv-radio-switch" role="group" aria-label="Exercise measurement">
                      <button
                        type="button"
                        className={kind === 'reps' ? 'active' : ''}
                        onClick={() => setKind('reps')}
                      >
                        Reps
                      </button>
                      <button
                        type="button"
                        className={kind === 'time' ? 'active' : ''}
                        onClick={() => setKind('time')}
                      >
                        Timed hold
                      </button>
                    </div>
                    <div className="lv-input-row">
                      <div className="lv-field">
                        <label htmlFor="exercise-sets">Sets</label>
                        <input
                          id="exercise-sets"
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                          required
                        />
                      </div>
                      {kind === 'reps' ? (
                        <>
                          <div className="lv-field">
                            <label htmlFor="exercise-reps">Reps / set</label>
                            <input
                              id="exercise-reps"
                              type="number"
                              min="1"
                              max="10000"
                              step="1"
                              value={reps}
                              onChange={(e) => setReps(e.target.value)}
                              required
                            />
                          </div>
                          <div className="lv-field">
                            <label htmlFor="exercise-weight">Added kg</label>
                            <input
                              id="exercise-weight"
                              type="number"
                              min="0"
                              max="1000"
                              step="0.5"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              required
                            />
                          </div>
                        </>
                      ) : (
                        <div className="lv-field">
                          <label htmlFor="exercise-seconds">Seconds / set</label>
                          <input
                            id="exercise-seconds"
                            type="number"
                            min="1"
                            max="86400"
                            step="1"
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </div>
                    <button type="submit" className="lv-btn lv-btn-secondary lv-wide">
                      <Plus size={16} />
                      Add to workout
                    </button>
                  </form>
                </div>
                <div className="lv-panel lv-session-panel">
                  <div className="lv-panel-top">
                    <h3>
                      Current session <span className="lv-count">{draft.length} exercises</span>
                    </h3>
                    <Dumbbell size={20} color="#7ce5d2" />
                  </div>
                  <div className="lv-field">
                    <label htmlFor="workout-date">Training date</label>
                    <input
                      id="workout-date"
                      type="date"
                      max={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  {draft.length ? (
                    <div className="lv-draft-list">
                      {draft.map((ex, i) => (
                        <div className="lv-draft-item" key={ex.id}>
                          <span className="lv-draft-number">{String(i + 1).padStart(2, '0')}</span>
                          <div>
                            <strong>{ex.name}</strong>
                            <p>
                              {ex.sets} sets ×{' '}
                              {ex.kind === 'time'
                                ? `${ex.seconds}s`
                                : `${ex.reps} reps${ex.weight ? ` · +${ex.weight} kg` : ''}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="lv-icon-btn"
                            title="Remove exercise"
                            aria-label={`Remove ${ex.name}`}
                            onClick={() => setDraft((p) => p.filter((item) => item.id !== ex.id))}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="lv-draft-empty">
                      <Dumbbell size={30} />
                      <p>No exercises added yet. Build your workout on the left.</p>
                    </div>
                  )}
                  <div className="lv-field">
                    <label htmlFor="workout-note">Session notes (optional)</label>
                    <textarea
                      id="workout-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={300}
                      placeholder="How did it feel today?"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!draft.length || !date || date > today}
                    className="lv-btn lv-btn-primary lv-wide"
                    onClick={saveWorkout}
                  >
                    <Save size={17} />
                    Save workout
                  </button>
                  <p className="lv-info-note">
                    40 XP per unique workout day. Multiple sessions on one day count as one XP
                    reward.
                  </p>
                </div>
              </div>
              {notice && (
                <p role="status" className="lv-success">
                  <Check size={16} />
                  {notice}
                </p>
              )}
            </>
          )}
          {tab === 'skills' && <SkillJourney data={data} setData={setData} />}
          {tab === 'history' && (
            <>
              <SectionHead
                eyebrow="PROOF OF WORK"
                title="History & records"
                text="Your sessions and personal bests, saved right on this device."
                action={
                  <button
                    type="button"
                    className="lv-btn lv-btn-primary"
                    onClick={() => setTab('log')}
                  >
                    <Plus size={16} />
                    New session
                  </button>
                }
              />
              <div className="lv-content-grid">
                <div className="lv-panel">
                  <div className="lv-panel-top">
                    <h3>
                      <History size={18} /> Workout history
                    </h3>
                    <span className="lv-count">{data.workouts.length}</span>
                  </div>
                  {data.workouts.length ? (
                    [...data.workouts]
                      .sort(
                        (a, b) =>
                          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
                      )
                      .map((w) => (
                        <div className="lv-history-item" key={w.id}>
                          <div className="lv-history-top">
                            <button
                              type="button"
                              aria-expanded={expandedWorkout === w.id}
                              className="lv-history-expand"
                              onClick={() => setExpandedWorkout((p) => (p === w.id ? null : w.id))}
                            >
                              <span className="lv-history-icon">
                                <CalendarDays size={17} />
                              </span>
                              <span>
                                <strong>{displayDate(w.date)}</strong>
                                <small>
                                  {w.exercises.length} exercises ·{' '}
                                  {w.exercises.reduce((n, e) => n + e.sets, 0)} sets
                                </small>
                              </span>
                              {expandedWorkout === w.id ? (
                                <ChevronUp size={17} />
                              ) : (
                                <ChevronDown size={17} />
                              )}
                            </button>
                            <button
                              type="button"
                              className="lv-icon-btn"
                              title="Delete session"
                              aria-label={`Delete workout from ${displayDate(w.date)}`}
                              onClick={() => removeWorkout(w.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {expandedWorkout === w.id && (
                            <div className="lv-history-details">
                              {w.exercises.map((e) => (
                                <div key={e.id}>
                                  <strong>{e.name}</strong>
                                  <span>
                                    {e.sets} ×{' '}
                                    {e.kind === 'time'
                                      ? `${e.seconds}s`
                                      : `${e.reps} reps${e.weight ? ` · +${e.weight} kg` : ''}`}
                                  </span>
                                </div>
                              ))}
                              {w.note && <p>“{w.note}”</p>}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <Empty
                      title="No sessions recorded"
                      text="Save your first workout to build your training timeline."
                      onAction={() => setTab('log')}
                      action="Log workout"
                    />
                  )}
                </div>
                <div className="lv-stack">
                  <div className="lv-panel">
                    <div className="lv-panel-top">
                      <h3>
                        <Trophy size={18} /> Personal records
                      </h3>
                      <Award size={20} color="#ffca8a" />
                    </div>
                    {records.length ? (
                      records.slice(0, 12).map((r) => (
                        <div className="lv-record" key={`${r.name}|${r.unit}`}>
                          <div>
                            <strong>{r.name}</strong>
                            <span>
                              {displayDate(r.date)} ·{' '}
                              {r.unit === 'kg'
                                ? 'Max added weight'
                                : r.unit === 'sec'
                                  ? 'Longest hold'
                                  : 'Most reps / set'}
                            </span>
                          </div>
                          <b>
                            {r.value} <small>{r.unit}</small>
                          </b>
                        </div>
                      ))
                    ) : (
                      <p className="lv-soft">
                        Personal records appear automatically once you save a workout.
                      </p>
                    )}
                  </div>
                  <div className="lv-panel lv-quote fitness-quote">
                    <span className="lv-eyebrow">TRAINING INSIGHT</span>
                    <h3>{reachedLevels} skill stages unlocked</h3>
                    <p>Set goals you can measure and build a routine you can sustain.</p>
                    <button
                      type="button"
                      className="lv-text-action"
                      onClick={() => setTab('skills')}
                    >
                      View skill tree <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="lv-hub-footnote">
        <ShieldCheck size={14} /> Logs and skill stages are self-reported, stored locally on this
        browser. <span>✦</span>
      </div>
    </div>
  );
}
