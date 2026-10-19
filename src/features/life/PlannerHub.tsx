import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { CalendarDays, Check, Circle, Heart, Link2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { displayDate, id, todayKey, type LifeData, type Priority, type Dream } from './lifeData';
import './planner.css';
type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
const dateIn = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayKey(d);
};
export default function PlannerHub({ data, setData }: Props) {
  const [tab, setTab] = useState<'planner' | 'dreams'>('planner');
  const [range, setRange] = useState<'today' | 'week'>('today');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(todayKey());
  const [priority, setPriority] = useState<Priority>('medium');
  const [dreamTitle, setDreamTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Dream['category']>('personal');
  const [linkedGoal, setLinkedGoal] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const upcoming = useMemo(
    () =>
      data.tasks
        .filter((t) => !t.completedAt && t.dueDate && t.dueDate <= dateIn(7))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [data.tasks],
  );
  const shown = data.tasks
    .filter((t) =>
      range === 'today'
        ? t.dueDate === '' || t.dueDate <= todayKey()
        : !t.dueDate || t.dueDate <= dateIn(7),
    )
    .sort(
      (a, b) =>
        (a.completedAt ? 1 : 0) - (b.completedAt ? 1 : 0) || a.dueDate.localeCompare(b.dueDate),
    );
  function addTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setData((d) => ({
      ...d,
      tasks: [
        ...d.tasks,
        {
          id: id(),
          title: title.trim().slice(0, 100),
          dueDate: due,
          priority,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ],
    }));
    setTitle('');
  }
  function toggleTask(taskId: string) {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completedAt: t.completedAt ? null : new Date().toISOString() }
          : t,
      ),
    }));
  }
  function addDream(e: FormEvent) {
    e.preventDefault();
    if (!dreamTitle.trim()) return;
    const now = new Date().toISOString();
    setData((d) => ({
      ...d,
      dreams: [
        {
          id: id(),
          title: dreamTitle.trim().slice(0, 100),
          description: description.trim().slice(0, 500),
          category,
          goalId: linkedGoal || null,
          createdAt: now,
          updatedAt: now,
          achievedAt: null,
        },
        ...d.dreams,
      ],
    }));
    setDreamTitle('');
    setDescription('');
    setLinkedGoal('');
  }
  function changeDream(dreamId: string, patch: Partial<Dream>) {
    setData((d) => ({
      ...d,
      dreams: d.dreams.map((item) =>
        item.id === dreamId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  }
  return (
    <div className="lv-planner lv-hub-body">
      <div className="lv-plan-intro">
        <span className="lv-plan-eyebrow">
          <Sparkles size={15} /> YOUR NEXT CHAPTER
        </span>
        <h2>Make room for what matters.</h2>
        <p>A place for today's priorities and tomorrow's possibilities.</p>
      </div>
      <div className="lv-plan-tabs" role="tablist" aria-label="Planner sections">
        <button
          role="tab"
          aria-selected={tab === 'planner'}
          className={tab === 'planner' ? 'selected' : ''}
          onClick={() => setTab('planner')}
        >
          <CalendarDays size={18} /> My Planner
        </button>
        <button
          role="tab"
          aria-selected={tab === 'dreams'}
          className={tab === 'dreams' ? 'selected' : ''}
          onClick={() => setTab('dreams')}
        >
          <Heart size={18} /> My Dreams
        </button>
      </div>
      {tab === 'planner' ? (
        <div className="lv-plan-columns">
          <section className="lv-plan-panel">
            <div className="lv-plan-panel-head">
              <div>
                <h3>Your plan</h3>
                <p>Shared with Productivity · changes appear in both hubs</p>
              </div>
              <div className="lv-plan-segment">
                <button
                  className={range === 'today' ? 'selected' : ''}
                  onClick={() => setRange('today')}
                >
                  Today
                </button>
                <button
                  className={range === 'week' ? 'selected' : ''}
                  onClick={() => setRange('week')}
                >
                  7 days
                </button>
              </div>
            </div>
            <form onSubmit={addTask} className="lv-plan-add">
              <label className="lv-plan-grow">
                New task
                <input
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What would you like to get done?"
                />
              </label>
              <label>
                Due date
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </label>
              <label>
                Priority
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <button className="lv-plan-primary" type="submit">
                <Plus size={17} /> Add
              </button>
            </form>
            <div className="lv-plan-task-list">
              {shown.length ? (
                shown.map((task) => (
                  <div key={task.id} className={`lv-plan-task ${task.completedAt ? 'done' : ''}`}>
                    <button
                      onClick={() => toggleTask(task.id)}
                      aria-label={`${task.completedAt ? 'Reopen' : 'Complete'} ${task.title}`}
                      title="Toggle task"
                    >
                      {task.completedAt ? <Check size={18} /> : <Circle size={19} />}
                    </button>
                    <div>
                      <strong>{task.title}</strong>
                      <span>
                        {task.dueDate ? displayDate(task.dueDate) : 'Anytime'} ·{' '}
                        <em className={`lv-plan-priority ${task.priority}`}>{task.priority}</em>
                      </span>
                    </div>
                    {task.completedAt && <span className="lv-plan-done">Done</span>}
                  </div>
                ))
              ) : (
                <p className="lv-plan-empty">
                  Nothing scheduled here yet. Add a task above, or enjoy some breathing room.
                </p>
              )}
            </div>
          </section>
          <aside className="lv-plan-side">
            <div className="lv-plan-panel">
              <h3>Coming up</h3>
              <p className="lv-plan-subtitle">Open deadlines in the next 7 days</p>
              {upcoming.length ? (
                upcoming.slice(0, 5).map((t) => (
                  <div className="lv-plan-deadline" key={t.id}>
                    <span className={t.dueDate < todayKey() ? 'overdue' : ''}>
                      {displayDate(t.dueDate)}
                    </span>
                    <strong>{t.title}</strong>
                  </div>
                ))
              ) : (
                <p className="lv-plan-empty">No upcoming deadlines.</p>
              )}
            </div>
            <div className="lv-plan-panel lv-plan-insight">
              <span>✦ A LITTLE PERSPECTIVE</span>
              <h3>One useful step is enough to begin.</h3>
              <p>Keep your day achievable. You can always return to your larger goals.</p>
            </div>
          </aside>
        </div>
      ) : (
        <>
          <div className="lv-dream-summary">
            <div>
              <h3>Build your vision board</h3>
              <p>Capture destinations, experiences, and aspirations. No deadlines or pressure.</p>
            </div>
            <span>{data.dreams.filter((d) => !d.achievedAt).length} dreams growing</span>
          </div>
          <div className="lv-plan-columns">
            <section className="lv-plan-panel">
              <h3>Add a dream</h3>
              <form className="lv-dream-form" onSubmit={addDream}>
                <label>
                  What's your dream?
                  <input
                    required
                    value={dreamTitle}
                    onChange={(e) => setDreamTitle(e.target.value)}
                    maxLength={100}
                    placeholder="e.g. Watch the northern lights"
                  />
                </label>
                <label>
                  A few details (optional)
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Why does this matter to you?"
                  />
                </label>
                <div className="lv-dream-form-row">
                  <label>
                    Category
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Dream['category'])}
                    >
                      <option value="personal">Personal</option>
                      <option value="travel">Travel</option>
                      <option value="learning">Learning</option>
                      <option value="career">Career</option>
                      <option value="wellness">Wellness</option>
                    </select>
                  </label>
                  <label>
                    Connect an existing goal
                    <select value={linkedGoal} onChange={(e) => setLinkedGoal(e.target.value)}>
                      <option value="">No goal linked</option>
                      {data.goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="submit" className="lv-plan-primary">
                  <Plus size={17} /> Pin to board
                </button>
              </form>
            </section>
            <aside className="lv-plan-panel lv-plan-inspiration">
              <span>✧ DREAM BOARD</span>
              <h3>Collect possibilities.</h3>
              <p>
                You don't have to turn every dream into a task. Some are worth keeping simply
                because they inspire you.
              </p>
            </aside>
          </div>
          <section className="lv-dream-board" aria-label="Your dream board">
            {data.dreams.length ? (
              data.dreams.map((dream, index) => {
                const goal = data.goals.find((g) => g.id === dream.goalId);
                return (
                  <article
                    className={`lv-dream-card ${dream.achievedAt ? 'achieved' : ''}`}
                    key={dream.id}
                    style={{ '--card-index': index % 4 } as React.CSSProperties}
                  >
                    <span className="lv-dream-pin" aria-hidden="true" />
                    <div className="lv-dream-category">{dream.category}</div>
                    {editing === dream.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setEditing(null);
                        }}
                      >
                        <input
                          aria-label="Dream title"
                          value={dream.title}
                          maxLength={100}
                          onChange={(e) => changeDream(dream.id, { title: e.target.value })}
                        />
                        <textarea
                          aria-label="Dream description"
                          value={dream.description}
                          maxLength={500}
                          rows={3}
                          onChange={(e) => changeDream(dream.id, { description: e.target.value })}
                        />
                        <button className="lv-plan-primary" type="submit">
                          Done editing
                        </button>
                      </form>
                    ) : (
                      <>
                        <h3>{dream.title}</h3>
                        {dream.description && <p>{dream.description}</p>}
                      </>
                    )}
                    {goal && (
                      <span className="lv-dream-linked">
                        <Link2 size={13} /> {goal.title} ·{' '}
                        {Math.round((goal.progress / Math.max(1, goal.target)) * 100)}%
                      </span>
                    )}
                    <div className="lv-dream-actions">
                      <button
                        onClick={() =>
                          changeDream(dream.id, {
                            achievedAt: dream.achievedAt ? null : new Date().toISOString(),
                          })
                        }
                      >
                        {dream.achievedAt ? '↶ Reopen' : '✓ Achieved'}
                      </button>
                      <button onClick={() => setEditing(editing === dream.id ? null : dream.id)}>
                        {editing === dream.id ? 'Close' : 'Edit'}
                      </button>
                      <button
                        aria-label={`Delete ${dream.title}`}
                        title="Delete dream"
                        onClick={() => {
                          if (window.confirm('Remove this dream from your board?'))
                            setData((d) => ({
                              ...d,
                              dreams: d.dreams.filter((x) => x.id !== dream.id),
                            }));
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="lv-plan-empty">
                Your board is waiting for its first dream. Pin one above.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
