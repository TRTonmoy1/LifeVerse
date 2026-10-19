import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  Flag,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  TrendingUp,
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
  streak,
  todayKey,
  type Habit,
  type LifeData,
  type Priority,
} from '../life/lifeData';
import type { Dispatch, SetStateAction, FormEvent } from 'react';

type Tab = 'overview' | 'tasks' | 'habits' | 'goals';
type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
export default function ProductivityHub({ data, setData }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'open' | 'done'>('all');
  const [habitTitle, setHabitTitle] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('10');
  const [goalUnit, setGoalUnit] = useState('sessions');

  const today = todayKey();
  const completedToday = data.tasks.filter((t) => t.completedAt?.slice(0, 10) === today).length;
  const tasksDone = data.tasks.filter((t) => t.completedAt).length;
  const habitsToday = data.habits.filter((h) => h.completedDates.includes(today)).length;
  const activeGoals = data.goals.filter((g) => g.progress < g.target).length;
  const bestStreak = Math.max(0, ...data.habits.map((h) => streak(h.completedDates)));
  const taskValues = Object.fromEntries(
    recentDays().map((day) => [
      day,
      data.tasks.filter((t) => t.completedAt?.slice(0, 10) === day).length,
    ]),
  );
  const { tasks: taskXp, habits: habitXp, goals: goalXp } = earnedXp(data);
  function addTask(e: FormEvent) {
    e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    setData((p) => ({
      ...p,
      tasks: [
        {
          id: id(),
          title,
          priority,
          dueDate,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        ...p.tasks,
      ],
    }));
    setTaskTitle('');
  }
  function toggleTask(taskId: string) {
    setData((p) => ({
      ...p,
      tasks: p.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completedAt: t.completedAt ? null : new Date().toISOString() }
          : t,
      ),
    }));
  }
  function removeTask(taskId: string) {
    setData((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }));
  }
  function addHabit(e: FormEvent) {
    e.preventDefault();
    const title = habitTitle.trim();
    if (!title) return;
    setData((p) => ({
      ...p,
      habits: [
        ...p.habits,
        {
          id: id(),
          title,
          color: ['#c6aaff', '#86e1d8', '#ffba91', '#f49dc2'][p.habits.length % 4],
          completedDates: [],
          createdAt: today,
        },
      ],
    }));
    setHabitTitle('');
  }
  function toggleHabit(habitId: string, day = today) {
    if (day > today) return;
    setData((p) => ({
      ...p,
      habits: p.habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedDates: h.completedDates.includes(day)
                ? h.completedDates.filter((d) => d !== day)
                : [...h.completedDates, day],
            }
          : h,
      ),
    }));
  }
  function addGoal(e: FormEvent) {
    e.preventDefault();
    const title = goalTitle.trim();
    const target = Number(goalTarget);
    if (!title || !Number.isFinite(target) || target < 1 || target > 1000000) return;
    setData((p) => ({
      ...p,
      goals: [
        {
          id: id(),
          title,
          target: Math.floor(target),
          progress: 0,
          unit: goalUnit.trim().slice(0, 30) || 'steps',
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
        ...p.goals,
      ],
    }));
    setGoalTitle('');
  }
  function updateGoal(goalId: string, delta: number) {
    setData((p) => ({
      ...p,
      goals: p.goals.map((g) => {
        if (g.id !== goalId) return g;
        const progress = Math.max(0, Math.min(g.target, g.progress + delta));
        return {
          ...g,
          progress,
          completedAt: progress >= g.target ? (g.completedAt ?? new Date().toISOString()) : null,
        };
      }),
    }));
  }
  const tabs: { key: Tab; text: string }[] = [
    { key: 'overview', text: 'Overview' },
    { key: 'tasks', text: 'Tasks' },
    { key: 'habits', text: 'Habits' },
    { key: 'goals', text: 'Goals' },
  ];
  return (
    <div className="lv-hub-body">
      <div className="lv-tabs" role="tablist" aria-label="Productivity pages">
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
                eyebrow="YOUR COMMAND CENTER"
                title="Make today count."
                text="Small wins add up. Build momentum one action at a time."
                action={
                  <span className="lv-date-chip">
                    <CalendarDays size={15} />
                    {displayDate(today)}
                  </span>
                }
              />
              <QuestBriefing
                title={
                  completedToday > 0 && habitsToday === data.habits.length
                    ? 'A chapter well spent.'
                    : 'The daily quest awaits.'
                }
                subtitle="Every completed mission shapes the hero you become. Build momentum with real actions."
                completed={
                  Number(completedToday > 0) +
                  Number(habitsToday > 0) +
                  Number(data.goals.some((g) => g.progress > 0))
                }
                total={3}
                xp={taskXp + habitXp + goalXp}
                quests={[
                  { text: 'Finish a mission', done: completedToday > 0, reward: '+25 XP' },
                  { text: 'Complete a daily ritual', done: habitsToday > 0, reward: '+15 XP' },
                  {
                    text: 'Make progress on a goal',
                    done: data.goals.some((g) => g.progress > 0),
                    reward: 'Goal progress',
                  },
                ]}
                action="Open mission board"
                onAction={() => setTab('tasks')}
              />
              <div className="lv-stat-grid">
                <Stat
                  icon={<CheckCircle2 />}
                  label="Tasks completed"
                  value={completedToday}
                  detail="Today"
                  tone="violet"
                />
                <Stat
                  icon={<Flame />}
                  label="Best habit streak"
                  value={`${bestStreak}d`}
                  detail="Current streak"
                  tone="orange"
                />
                <Stat
                  icon={<Target />}
                  label="Active goals"
                  value={activeGoals}
                  detail="Keep your focus"
                  tone="mint"
                />
                <Stat
                  icon={<Zap />}
                  label="Productivity XP"
                  value={taskXp + habitXp + goalXp}
                  detail="Earned so far"
                  tone="pink"
                />
              </div>
              <div className="lv-content-grid">
                <div className="lv-stack">
                  <div className="lv-panel">
                    <div className="lv-panel-top">
                      <h3>Today's missions</h3>
                      <button className="lv-text-action" onClick={() => setTab('tasks')}>
                        View tasks →
                      </button>
                    </div>
                    {data.tasks.filter((t) => !t.completedAt).slice(0, 4).length ? (
                      data.tasks
                        .filter((t) => !t.completedAt)
                        .slice(0, 4)
                        .map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            className="lv-mission"
                            onClick={() => toggleTask(t.id)}
                          >
                            <Circle size={19} />
                            <span>{t.title}</span>
                            <em>+25 XP</em>
                          </button>
                        ))
                    ) : (
                      <p className="lv-soft">No open tasks yet. Add a mission to begin.</p>
                    )}
                    <button
                      type="button"
                      className="lv-btn lv-btn-secondary lv-wide"
                      onClick={() => setTab('tasks')}
                    >
                      <Plus size={16} />
                      Manage tasks
                    </button>
                  </div>
                  <div className="lv-panel">
                    <div className="lv-panel-top">
                      <h3>Daily rituals</h3>
                      <span className="lv-muted-small">
                        {habitsToday}/{data.habits.length} today
                      </span>
                    </div>
                    {data.habits.slice(0, 4).map((h) => (
                      <button
                        type="button"
                        key={h.id}
                        className="lv-mission"
                        onClick={() => toggleHabit(h.id)}
                      >
                        {h.completedDates.includes(today) ? (
                          <CheckCircle2 size={19} color="#89e8d3" />
                        ) : (
                          <Circle size={19} />
                        )}
                        <span>{h.title}</span>
                        <em>{streak(h.completedDates)}d streak</em>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="lv-btn lv-btn-secondary lv-wide"
                      onClick={() => setTab('habits')}
                    >
                      Habit tracker →
                    </button>
                  </div>
                </div>
                <div className="lv-stack">
                  <WeekChart values={taskValues} label="Task completion" />
                  <div className="lv-panel lv-quote">
                    <span className="lv-eyebrow">DAILY REMINDER</span>
                    <h3>Progress, not perfection.</h3>
                    <p>
                      Your next small action is more valuable than a perfect plan you never start.
                    </p>
                    <span className="lv-quote-spark">✦</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === 'tasks' && (
            <>
              <SectionHead
                eyebrow="MISSION BOARD"
                title="Tasks & to-dos"
                text="Complete a task to earn 25 XP. You can undo completion anytime."
              />
              <form className="lv-add-form" onSubmit={addTask}>
                <div className="lv-field lv-flex2">
                  <label htmlFor="task-name">New task</label>
                  <input
                    id="task-name"
                    value={taskTitle}
                    maxLength={100}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Finish my assignment"
                    required
                  />
                </div>
                <div className="lv-field">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="lv-field">
                  <label htmlFor="task-date">Due date</label>
                  <input
                    id="task-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="lv-btn lv-btn-primary">
                  <Plus size={16} />
                  Add task
                </button>
              </form>
              <div className="lv-panel">
                <div className="lv-panel-top">
                  <h3>
                    My missions{' '}
                    <span className="lv-count">
                      {tasksDone}/{data.tasks.length}
                    </span>
                  </h3>
                  <div className="lv-chip-row">
                    {(['all', 'open', 'done'] as const).map((f) => (
                      <button
                        type="button"
                        key={f}
                        className={`lv-chip ${taskFilter === f ? 'active' : ''}`}
                        onClick={() => setTaskFilter(f)}
                      >
                        {f === 'all' ? 'All' : f === 'open' ? 'Active' : 'Done'}
                      </button>
                    ))}
                  </div>
                </div>
                {data.tasks.filter(
                  (t) =>
                    taskFilter === 'all' ||
                    (taskFilter === 'done' ? !!t.completedAt : !t.completedAt),
                ).length ? (
                  data.tasks
                    .filter(
                      (t) =>
                        taskFilter === 'all' ||
                        (taskFilter === 'done' ? !!t.completedAt : !t.completedAt),
                    )
                    .map((t) => (
                      <div className={`lv-task ${t.completedAt ? 'lv-task-done' : ''}`} key={t.id}>
                        <button
                          type="button"
                          className="lv-task-toggle"
                          title={t.completedAt ? 'Mark incomplete' : 'Mark complete'}
                          aria-label={`Toggle ${t.title}`}
                          onClick={() => toggleTask(t.id)}
                        >
                          {t.completedAt ? <CheckCircle2 size={23} /> : <Circle size={23} />}
                        </button>
                        <div className="lv-task-main">
                          <strong>{t.title}</strong>
                          <div className="lv-task-meta">
                            <span className={`lv-priority ${t.priority}`}>{t.priority}</span>
                            {t.dueDate && (
                              <span
                                className={t.dueDate < today && !t.completedAt ? 'lv-overdue' : ''}
                              >
                                <CalendarDays size={13} />
                                {displayDate(t.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="lv-xp-tag">+25 XP</span>
                        <button
                          type="button"
                          title="Delete task"
                          aria-label={`Delete ${t.title}`}
                          className="lv-icon-btn"
                          onClick={() => removeTask(t.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))
                ) : (
                  <Empty
                    title="Nothing here yet"
                    text={
                      taskFilter === 'all'
                        ? 'Add your first task above.'
                        : 'No tasks match this filter.'
                    }
                  />
                )}
              </div>
            </>
          )}
          {tab === 'habits' && (
            <>
              <SectionHead
                eyebrow="CONSISTENCY ENGINE"
                title="Daily habits"
                text="Track your routines. Each day you check off a habit awards 15 XP."
              />
              <form className="lv-add-form" onSubmit={addHabit}>
                <div className="lv-field lv-flex2">
                  <label htmlFor="habit-name">Create a daily ritual</label>
                  <input
                    id="habit-name"
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. Practice coding for 30 minutes"
                    required
                  />
                </div>
                <button type="submit" className="lv-btn lv-btn-primary">
                  <Plus size={16} />
                  Add habit
                </button>
              </form>
              <div className="lv-panel">
                <div className="lv-panel-top">
                  <h3>Your habit garden</h3>
                  <span className="lv-muted-small">Tap a day to mark it complete</span>
                </div>
                <div className="lv-habit-scroll">
                  <div className="lv-habit-header">
                    <span>Habit</span>
                    {recentDays().map((day) => (
                      <span key={day}>
                        {day === today ? 'Today' : displayDate(day).split(' ')[1]}
                      </span>
                    ))}
                    <span>Streak</span>
                    <span></span>
                  </div>
                  {data.habits.map((h: Habit) => (
                    <div className="lv-habit-row" key={h.id}>
                      <div className="lv-habit-name">
                        <span className="lv-habit-dot" style={{ background: h.color }} />
                        {h.title}
                      </div>
                      {recentDays().map((day) => (
                        <button
                          type="button"
                          disabled={day < h.createdAt.slice(0, 10)}
                          title={`${h.title} — ${displayDate(day)}`}
                          aria-label={`${h.title}, ${displayDate(day)}`}
                          aria-pressed={h.completedDates.includes(day)}
                          className={`lv-habit-check ${h.completedDates.includes(day) ? 'checked' : ''}`}
                          style={{ '--habit-color': h.color } as React.CSSProperties}
                          key={day}
                          onClick={() => toggleHabit(h.id, day)}
                        >
                          {h.completedDates.includes(day) && <Check size={16} />}
                        </button>
                      ))}
                      <span className="lv-habit-streak">
                        <Flame size={14} />
                        {streak(h.completedDates)}d
                      </span>
                      <button
                        type="button"
                        className="lv-icon-btn"
                        title="Delete habit"
                        aria-label={`Delete ${h.title}`}
                        onClick={() =>
                          setData((p) => ({
                            ...p,
                            habits: p.habits.filter((item) => item.id !== h.id),
                          }))
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {!data.habits.length && (
                  <Empty title="Your garden is empty" text="Create your first daily habit above." />
                )}
              </div>
              <p className="lv-info-note">
                Missed yesterday? You can tick any day shown above. Streaks count consecutive
                completed days through today or yesterday.
              </p>
            </>
          )}
          {tab === 'goals' && (
            <>
              <SectionHead
                eyebrow="THE LONG GAME"
                title="Personal goals"
                text="Set a measurable target, log progress, and claim 80 XP when you finish."
              />
              <form className="lv-add-form" onSubmit={addGoal}>
                <div className="lv-field lv-flex2">
                  <label htmlFor="goal-title">Your goal</label>
                  <input
                    id="goal-title"
                    maxLength={100}
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Finish 12 coding sessions"
                    required
                  />
                </div>
                <div className="lv-field lv-small-field">
                  <label htmlFor="goal-target">Target</label>
                  <input
                    id="goal-target"
                    type="number"
                    min="1"
                    max="1000000"
                    step="1"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                  />
                </div>
                <div className="lv-field lv-small-field">
                  <label htmlFor="goal-unit">Unit</label>
                  <input
                    id="goal-unit"
                    maxLength={30}
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    placeholder="sessions"
                  />
                </div>
                <button type="submit" className="lv-btn lv-btn-primary">
                  <Plus size={16} />
                  Create
                </button>
              </form>
              <div className="lv-goals-grid">
                {data.goals.map((g) => (
                  <div className="lv-panel lv-goal" key={g.id}>
                    <div className="lv-panel-top">
                      <span className="lv-goal-icon">
                        <Flag size={20} />
                      </span>
                      <button
                        className="lv-icon-btn"
                        title="Delete goal"
                        aria-label={`Delete ${g.title}`}
                        onClick={() =>
                          setData((p) => ({
                            ...p,
                            goals: p.goals.filter((item) => item.id !== g.id),
                          }))
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <h3>{g.title}</h3>
                    <div className="lv-goal-numbers">
                      <strong>
                        {g.progress}
                        <span>
                          {' '}
                          / {g.target} {g.unit}
                        </span>
                      </strong>
                      <em>{Math.round((g.progress / g.target) * 100)}%</em>
                    </div>
                    <ProgressBar value={(g.progress / g.target) * 100} />
                    <div className="lv-goal-actions">
                      <span>
                        {g.progress >= g.target ? (
                          <>
                            <CheckCircle2 size={15} /> Completed · 80 XP
                          </>
                        ) : (
                          <>
                            <Clock3 size={15} /> Keep going
                          </>
                        )}
                      </span>
                      <div>
                        <button
                          type="button"
                          disabled={g.progress === 0}
                          title="Subtract one"
                          onClick={() => updateGoal(g.id, -1)}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={g.progress >= g.target}
                          title="Add one"
                          onClick={() => updateGoal(g.id, 1)}
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!data.goals.length && (
                  <div className="lv-grid-all">
                    <Empty
                      title="Dream it, then do it"
                      text="Create a measurable personal goal to start tracking your progress."
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="lv-hub-footnote">
        <TrendingUp size={14} /> Progress is stored in this browser. See the update guide for backup
        information. <span>✦</span>
      </div>
    </div>
  );
}
