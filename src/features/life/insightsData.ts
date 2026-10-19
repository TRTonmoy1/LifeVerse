import { earnedXp, offsetDate, todayKey, type LifeData } from './lifeData';

// Events are reconstructed only from records that actually store dates. Explore and
// skill progression do not currently have event timestamps and are excluded.
const dateOnly = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : value.slice(0, 10);
export type ActivityDay = {
  date: string;
  tasks: number;
  habits: number;
  workouts: number;
  goals: number;
  study: number;
  total: number;
};
export function activityDays(data: LifeData, length = 91, reference = new Date()): ActivityDay[] {
  return Array.from({ length }, (_, i) => {
    const date = offsetDate(i - length + 1, reference);
    const tasks = data.tasks.filter(
      (t) => t.completedAt && dateOnly(t.completedAt) === date,
    ).length;
    const habits = data.habits.reduce(
      (n, habit) => n + (habit.completedDates.includes(date) ? 1 : 0),
      0,
    );
    const workouts = data.workouts.filter((w) => dateOnly(w.date) === date).length;
    const goals = data.goals.filter(
      (g) => g.completedAt && g.progress >= g.target && dateOnly(g.completedAt) === date,
    ).length;
    const study = data.study.entries.filter((entry) => dateOnly(entry.createdAt) === date).length;
    return {
      date,
      tasks,
      habits,
      workouts,
      goals,
      study,
      total: tasks + habits + workouts + goals + study,
    };
  });
}
export function insightSummary(data: LifeData, reference = new Date()) {
  const days = activityDays(data, 91, reference);
  const last7 = days.slice(-7);
  const prior7 = days.slice(-14, -7);
  const sum = (xs: ActivityDay[]) => xs.reduce((n, d) => n + d.total, 0);
  const active = (xs: ActivityDay[]) => xs.filter((d) => d.total > 0).length;
  const current = sum(last7);
  const previous = sum(prior7);
  const xp = earnedXp(data);
  const byArea = [
    { label: 'Productivity', value: xp.tasks + xp.habits + xp.goals, color: '#a9a1ff' },
    { label: 'Fitness', value: xp.workouts + xp.skills, color: '#73ddd2' },
    { label: 'Explore', value: xp.explore, color: '#f8c587' },
    { label: 'Study', value: xp.study, color: '#8fd2ff' },
  ];
  const yesterday = offsetDate(-1, reference);
  const today = todayKey(reference);
  const activeDates = new Set(days.filter((d) => d.total > 0).map((d) => d.date));
  let streak = 0;
  let step = activeDates.has(today) ? 0 : -1;
  while (activeDates.has(offsetDate(step, reference)) && streak < 91) {
    streak++;
    step--;
  }
  const insights: string[] = [];
  if (current === 0)
    insights.push(
      'No dated activity this week yet. Completing a task, habit, goal or workout will start your timeline.',
    );
  else {
    insights.push(`${active(last7)} of the last 7 days had recorded activity.`);
    if (previous > 0)
      insights.push(
        current > previous
          ? `Recorded actions increased by ${current - previous} compared with the previous week.`
          : current < previous
            ? `You logged ${previous - current} fewer actions than the previous week. Consistency matters more than chasing a score.`
            : 'You logged the same number of actions as the previous week.',
      );
    else insights.push('This is your first active week in the 14-day comparison window.');
  }
  if (streak > 1)
    insights.push(
      `You have a ${streak}-day run of recorded activity${activeDates.has(today) ? '' : ' through yesterday'}.`,
    );
  if (!data.explore.discovered.length && !data.explore.quizSolved.length)
    insights.push('Explore is waiting for your first discovery or trivia answer.');
  if (!data.workouts.length)
    insights.push('No workouts logged yet. Fitness trends will appear as you log sessions.');
  if (!data.study.entries.length)
    insights.push('Study Hub is waiting for your first note, reflection or saved resource.');
  return {
    days,
    last7,
    prior7,
    current,
    previous,
    activeDays: active(last7),
    streak,
    xp,
    byArea,
    insights,
    yesterday,
  };
}
