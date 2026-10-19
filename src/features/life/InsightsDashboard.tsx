import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Compass,
  Dumbbell,
  Flame,
  Info,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { displayDate, type LifeData } from './lifeData';
import { insightSummary } from './insightsData';
import './insights.css';

export default function InsightsDashboard({ data }: { data: LifeData }) {
  const [range, setRange] = useState<7 | 30 | 91>(30);
  const report = useMemo(() => insightSummary(data), [data]);
  const shown = report.days.slice(-range);
  const max = Math.max(1, ...report.last7.map((day) => day.total));
  const diff = report.current - report.previous;
  const completedTasks = data.tasks.filter((t) => t.completedAt).length;
  const workoutDays = new Set(data.workouts.map((w) => w.date)).size;
  const completedGoals = data.goals.filter((g) => g.completedAt && g.progress >= g.target).length;
  const studyEntries = data.study.entries.length;
  return (
    <div className="lv-insights">
      <div className="lv-insights-hero">
        <div>
          <span className="lv-insights-eyebrow">
            <Sparkles size={15} /> CHAPTER IX · YOUR PERSONAL CONSTELLATION
          </span>
          <h2>See how far you've come.</h2>
          <p>One place to reflect on the things you've actually done, at your own pace.</p>
        </div>
        <div className="lv-insights-hero-orbit" aria-hidden="true">
          <span>✦</span>
          <span>✧</span>
          <span>✦</span>
        </div>
      </div>
      <div className="lv-insights-kpis">
        <article>
          <span>
            <Activity size={16} /> Actions this week
          </span>
          <strong>{report.current}</strong>
          <small>
            {report.previous === 0 ? (
              'No activity in prior week'
            ) : (
              <>
                {diff >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{' '}
                {Math.abs(diff)} compared with last week
              </>
            )}
          </small>
        </article>
        <article>
          <span>
            <CalendarDays size={16} /> Active days this week
          </span>
          <strong>
            {report.activeDays}
            <em> / 7</em>
          </strong>
          <small>Days with at least one logged action</small>
        </article>
        <article>
          <span>
            <Flame size={16} /> Activity streak
          </span>
          <strong>
            {report.streak}
            <em> days</em>
          </strong>
          <small>Recorded activity through today or yesterday</small>
        </article>
        <article>
          <span>
            <Sparkles size={16} /> Lifetime XP
          </span>
          <strong>{report.xp.total.toLocaleString()}</strong>
          <small>Across your LifeVerse hubs</small>
        </article>
      </div>
      <div className="lv-insights-two-col">
        <section className="lv-insights-panel">
          <header>
            <div>
              <TrendingUp size={18} />
              <h3>Weekly rhythm</h3>
            </div>
            <span>Last 7 days</span>
          </header>
          <p className="lv-insights-muted">
            Completed tasks, checked habits, workouts, goals and study entries grouped by date.
          </p>
          <div
            className="lv-insights-bars"
            role="img"
            aria-label="Actions by day for the last seven days"
          >
            {report.last7.map((d) => (
              <div
                key={d.date}
                className="lv-insights-bar-day"
                title={`${d.date}: ${d.total} actions`}
              >
                <b>{d.total || ''}</b>
                <div className="lv-insights-bar-track">
                  <span style={{ height: `${(d.total / max) * 100}%` }} />
                </div>
                <small>
                  {new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: 'short',
                  })}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="lv-insights-panel">
          <header>
            <div>
              <Compass size={18} />
              <h3>Growth across your world</h3>
            </div>
            <span>Lifetime XP</span>
          </header>
          <p className="lv-insights-muted">
            Where your earned XP comes from—not a measure of personal worth.
          </p>
          <div className="lv-insights-areas">
            {report.byArea.map((area) => (
              <div key={area.label}>
                <div className="lv-insights-area-label">
                  <b>{area.label}</b>
                  <strong>{area.value.toLocaleString()} XP</strong>
                </div>
                <div className="lv-insights-area-track">
                  <span
                    style={{
                      width: `${report.xp.total ? (area.value / report.xp.total) * 100 : 0}%`,
                      background: area.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="lv-insights-note">
            <Info size={15} /> Explore discoveries and skill milestones count toward total XP, but
            don't appear as dated events because older records lack timestamps. Study notes are
            counted on the day they were created.
          </div>
        </section>
      </div>
      <section className="lv-insights-panel lv-insights-calendar">
        <header>
          <div>
            <CalendarDays size={18} />
            <h3>Activity constellation</h3>
          </div>
          <div className="lv-insights-range">
            {([7, 30, 91] as const).map((n) => (
              <button
                key={n}
                className={range === n ? 'selected' : ''}
                aria-pressed={range === n}
                onClick={() => setRange(n)}
              >
                {n}d
              </button>
            ))}
          </div>
        </header>
        <p className="lv-insights-muted">
          Each square represents one day. Darker squares mean more recorded actions. Hover or focus
          for details.
        </p>
        <div className="lv-insights-heatmap" role="list" aria-label="Daily activity calendar">
          {shown.map((d) => (
            <div
              role="listitem"
              key={d.date}
              tabIndex={0}
              className={`lv-insights-day intensity-${d.total === 0 ? 0 : d.total === 1 ? 1 : d.total <= 3 ? 2 : d.total <= 6 ? 3 : 4}`}
              title={`${d.date} • ${d.total} actions: ${d.tasks} tasks, ${d.habits} habits, ${d.workouts} workouts, ${d.goals} goals, ${d.study} study entries`}
              aria-label={`${d.date}: ${d.total} recorded actions`}
            />
          ))}
        </div>
        <div className="lv-insights-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <i key={n} className={`intensity-${n}`} />
          ))}
          <span>More</span>
        </div>
      </section>
      <div className="lv-insights-two-col">
        <section className="lv-insights-panel">
          <header>
            <div>
              <Target size={18} />
              <h3>Your journey in numbers</h3>
            </div>
          </header>
          <div className="lv-insights-totals">
            <div>
              <CheckCircle2 />
              <strong>{completedTasks}</strong>
              <span>Completed tasks</span>
            </div>
            <div>
              <Dumbbell />
              <strong>{workoutDays}</strong>
              <span>Training days</span>
            </div>
            <div>
              <Target />
              <strong>{completedGoals}</strong>
              <span>Goals reached</span>
            </div>
            <div>
              <Compass />
              <strong>{data.explore.discovered.length}</strong>
              <span>Places explored</span>
            </div>
            <div>
              <BookOpenCheck />
              <strong>{studyEntries}</strong>
              <span>Study entries</span>
            </div>
          </div>
        </section>
        <section className="lv-insights-panel">
          <header>
            <div>
              <Sparkles size={18} />
              <h3>Your weekly reflection</h3>
            </div>
            <span>
              {displayDate(report.last7[0].date)} – {displayDate(report.last7[6].date)}
            </span>
          </header>
          <div className="lv-insights-reflections">
            {report.insights.map((text, i) => (
              <p key={i}>
                <span>✦</span>
                {text}
              </p>
            ))}
          </div>
        </section>
      </div>
      <p className="lv-insights-disclaimer">
        <Info size={15} /> Insights use locally saved records. They don't track time spent, and
        events without stored dates can't be reconstructed retroactively. Your data stays in your
        browser and existing LifeVerse backups.
      </p>
    </div>
  );
}
