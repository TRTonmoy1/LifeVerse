import type { ReactNode } from 'react';
import { ArrowUpRight, Plus, Sparkles, Swords, Zap, CheckCircle2 } from 'lucide-react';
import { dateDay, displayDate, recentDays } from '../../features/life/lifeData';

export function SectionHead({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="lv-section-heading">
      <div>
        {eyebrow && <span className="lv-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}
export function Stat({
  icon,
  label,
  value,
  detail,
  tone = 'violet',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: string;
}) {
  return (
    <div className={`lv-stat lv-tone-${tone}`}>
      <span className="lv-stat-icon">{icon}</span>
      <span className="lv-stat-label">{label}</span>
      <strong>{value}</strong>
      {detail && <span className="lv-stat-detail">{detail}</span>}
    </div>
  );
}
export function Empty({
  title,
  text,
  onAction,
  action = 'Get started',
}: {
  title: string;
  text: string;
  onAction?: () => void;
  action?: string;
}) {
  return (
    <div className="lv-empty">
      <div className="lv-empty-orb">
        <Sparkles size={26} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {onAction && (
        <button type="button" className="lv-btn lv-btn-primary" onClick={onAction}>
          <Plus size={15} />
          {action}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}
export function WeekChart({ values, label }: { values: Record<string, number>; label: string }) {
  const days = recentDays();
  const max = Math.max(1, ...days.map((d) => values[d] ?? 0));
  return (
    <div className="lv-chart-card">
      <div className="lv-chart-head">
        <h3>{label}</h3>
        <span>Last 7 days</span>
      </div>
      <div
        className="lv-chart"
        role="img"
        aria-label={days.map((d) => `${displayDate(d)}: ${values[d] ?? 0}`).join(', ')}
      >
        {days.map((day) => (
          <div className="lv-chart-day" key={day}>
            <div className="lv-chart-track">
              <div
                className="lv-chart-fill"
                title={`${displayDate(day)}: ${values[day] ?? 0}`}
                style={{
                  height: `${Math.max(4, ((values[day] ?? 0) / max) * 100)}%`,
                  opacity: values[day] ? 1 : 0.25,
                }}
              />
            </div>
            <span>{dateDay(day).slice(0, 2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="lv-progress-track">
      <div
        className="lv-progress-bar"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

/** A live mission briefing. All rewards are calculated by the existing LifeData model. */
export function QuestBriefing({
  title,
  subtitle,
  completed,
  total,
  xp,
  color = 'violet',
  quests,
  action,
  onAction,
}: {
  title: string;
  subtitle: string;
  completed: number;
  total: number;
  xp: number;
  color?: 'violet' | 'mint';
  quests: { text: string; done: boolean; reward: string }[];
  action: string;
  onAction: () => void;
}) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section
      className={`lv-quest-briefing lv-quest-${color}`}
      aria-label={`${title}: ${completed} of ${total} completed`}
    >
      <div className="lv-quest-emblem">
        <Swords size={27} />
        <span>✦</span>
      </div>
      <div className="lv-quest-main">
        <span className="lv-quest-kicker">ADVENTURE LOG · TODAY'S CHAPTER</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <div className="lv-quest-meter">
          <div className="lv-quest-meter-line">
            <span>Quest progress</span>
            <strong>
              {completed} / {total} complete
            </strong>
          </div>
          <div className="lv-quest-track">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="lv-quest-objectives">
          {quests.map((quest, i) => (
            <div key={i} className={quest.done ? 'done' : ''}>
              {quest.done ? <CheckCircle2 size={15} /> : <span className="lv-quest-hollow" />}
              <span>{quest.text}</span>
              <em>{quest.reward}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="lv-quest-reward">
        <span className="lv-quest-reward-icon">
          <Zap size={21} />
        </span>
        <small>XP EARNED</small>
        <strong>{xp.toLocaleString()}</strong>
        <button type="button" onClick={onAction}>
          {action} <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}
