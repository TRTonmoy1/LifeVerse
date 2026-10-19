import { useMemo, useState } from 'react';
import {
  BookHeart,
  CalendarDays,
  ChevronLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { id, type JournalEntry, type JournalMood, type LifeData } from '../life/lifeData';
import './journal.css';

type Props = { data: LifeData; setData: React.Dispatch<React.SetStateAction<LifeData>> };
const moods: { id: Exclude<JournalMood, null>; face: string; label: string }[] = [
  { id: 'great', face: '😄', label: 'Great' },
  { id: 'good', face: '🙂', label: 'Good' },
  { id: 'okay', face: '😐', label: 'Okay' },
  { id: 'low', face: '😔', label: 'Low' },
  { id: 'tough', face: '😣', label: 'Tough' },
];
function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
export default function JournalHub({ data, setData }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<JournalMood>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const journal = data.journal;
  const shown = useMemo(
    () =>
      [...journal]
        .filter((entry) =>
          `${entry.title} ${entry.body}`.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [journal, query],
  );
  function newEntry() {
    setEditing(null);
    setSelected(null);
    setTitle('');
    setBody('');
    setMood(null);
    setWriting(true);
  }
  function openEdit(entry: JournalEntry) {
    setEditing(entry.id);
    setSelected(null);
    setTitle(entry.title);
    setBody(entry.body);
    setMood(entry.mood);
    setWriting(true);
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    const now = new Date().toISOString();
    setData((previous) => {
      const existing = previous.journal.find((entry) => entry.id === editing);
      const record: JournalEntry = {
        id: existing?.id ?? id(),
        title: title.trim() || 'Untitled entry',
        body: body.trim(),
        mood,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return {
        ...previous,
        journal: existing
          ? previous.journal.map((entry) => (entry.id === existing.id ? record : entry))
          : [record, ...previous.journal],
      };
    });
    setWriting(false);
    setEditing(null);
  }
  function remove(entry: JournalEntry) {
    if (!window.confirm('Permanently delete this journal entry?')) return;
    setData((previous) => ({
      ...previous,
      journal: previous.journal.filter((item) => item.id !== entry.id),
    }));
    if (selected?.id === entry.id) setSelected(null);
    if (editing === entry.id) {
      setWriting(false);
      setEditing(null);
    }
  }
  return (
    <section className="lv-journal">
      <header className="lv-journal-head">
        <div>
          <span className="lv-study-simple-overline">YOUR PERSONAL CORNER</span>
          <h2>My Journal</h2>
          <p>A quiet place for your thoughts, whenever you feel like writing.</p>
        </div>
        {!writing && (
          <button type="button" className="lv-study-primary" onClick={newEntry}>
            <Plus size={17} /> New entry
          </button>
        )}
      </header>
      {writing ? (
        <section className="lv-journal-editor">
          <div className="lv-journal-editor-head">
            <h3>{editing ? 'Edit journal entry' : 'A page for today'}</h3>
            <button
              type="button"
              aria-label="Close journal editor"
              onClick={() => setWriting(false)}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={save}>
            <span className="lv-journal-date">
              <CalendarDays size={15} />{' '}
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <fieldset>
              <legend>
                How are you feeling? <small>(optional)</small>
              </legend>
              <div className="lv-journal-moods">
                {moods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={mood === item.id}
                    className={mood === item.id ? 'selected' : ''}
                    onClick={() => setMood(mood === item.id ? null : item.id)}
                  >
                    <span>{item.face}</span>
                    <small>{item.label}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Title <small>(optional)</small>
              <input
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A day worth remembering…"
              />
            </label>
            <label>
              What's on your mind?
              <textarea
                required
                maxLength={50000}
                rows={11}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write about your day, a thought, something you learned, or anything you want to remember…"
              />
            </label>
            <div className="lv-journal-form-actions">
              <button
                type="button"
                className="lv-study-secondary"
                onClick={() => setWriting(false)}
              >
                Cancel
              </button>
              <button type="submit" className="lv-study-primary">
                Save entry
              </button>
            </div>
          </form>
        </section>
      ) : selected ? (
        <section className="lv-journal-read">
          <button type="button" className="lv-study-back" onClick={() => setSelected(null)}>
            <ChevronLeft size={16} /> All entries
          </button>
          <div className="lv-journal-read-top">
            <span>{formatTimestamp(selected.createdAt)}</span>
            {selected.mood && (
              <span>
                {moods.find((item) => item.id === selected.mood)?.face}{' '}
                {moods.find((item) => item.id === selected.mood)?.label}
              </span>
            )}
          </div>
          <h3>{selected.title}</h3>
          <p>{selected.body}</p>
          <div className="lv-journal-card-actions">
            <button type="button" onClick={() => openEdit(selected)}>
              <Pencil size={15} /> Edit
            </button>
            <button type="button" onClick={() => remove(selected)}>
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="lv-journal-library-bar">
            <div>
              <h3>Past entries</h3>
              <p>
                {journal.length
                  ? `${journal.length} saved ${journal.length === 1 ? 'entry' : 'entries'}`
                  : 'Your writing will appear here.'}
              </p>
            </div>
            {journal.length > 0 && (
              <label className="lv-study-search-simple">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search journals…"
                />
              </label>
            )}
          </div>
          {shown.length ? (
            <div className="lv-journal-grid">
              {shown.map((entry) => (
                <article key={entry.id} className="lv-journal-card">
                  <div className="lv-journal-card-top">
                    <span>{formatTimestamp(entry.createdAt)}</span>
                    {entry.mood && (
                      <span
                        className="lv-journal-mood"
                        title={moods.find((item) => item.id === entry.mood)?.label}
                      >
                        {moods.find((item) => item.id === entry.mood)?.face}
                      </span>
                    )}
                  </div>
                  <h4>{entry.title}</h4>
                  <p>{entry.body}</p>
                  <div className="lv-journal-card-actions">
                    <button type="button" onClick={() => setSelected(entry)}>
                      Read entry
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${entry.title}`}
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${entry.title}`}
                      onClick={() => remove(entry)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="lv-journal-empty">
              <BookHeart size={30} />
              <h3>{query ? 'No matching entries' : 'Your story starts whenever you’re ready.'}</h3>
              <p>
                {query
                  ? 'Try a different search.'
                  : 'There’s no schedule to keep. Write every day or only when something feels worth remembering.'}
              </p>
              {!query && (
                <button type="button" className="lv-study-primary" onClick={newEntry}>
                  <Plus size={16} /> Write your first entry
                </button>
              )}
            </div>
          )}
        </>
      )}
      <p className="lv-journal-privacy">
        Your journal is stored in this browser and included in LifeVerse JSON backups. It is not
        encrypted or account-protected. Avoid writing secrets on a shared computer.
      </p>
    </section>
  );
}
