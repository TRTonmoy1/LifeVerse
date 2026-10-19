import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  BookText,
  CalendarClock,
  Check,
  ChevronRight,
  FileText,
  Link2,
  MoreHorizontal,
  NotebookPen,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import JournalHub from './JournalHub';
import {
  displayDate,
  id,
  type LifeData,
  type StudyEntry,
  type StudyEntryKind,
  type StudySubject,
} from '../life/lifeData';
import './study.css';

type Props = { data: LifeData; setData: React.Dispatch<React.SetStateAction<LifeData>> };
const colors = ['#9886ff', '#72d9ce', '#f6b57a', '#ed9ec8', '#8dbaff'];
const kindLabels: Record<StudyEntryKind, string> = {
  note: 'Note',
  reflection: 'Reflection',
  resource: 'Resource',
};
function dateNow() {
  return new Date().toISOString();
}

export default function StudyHub({ data, setData }: Props) {
  const { subjects, entries } = data.study;
  const [section, setSection] = useState<'courses' | 'journal'>('courses');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [editor, setEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kind, setKind] = useState<StudyEntryKind>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');
  const [showMore, setShowMore] = useState(false);
  const selected = subjects.find((subject) => subject.id === courseId);
  const activeId = selected?.id ?? null;
  const current = useMemo(
    () =>
      entries
        .filter((entry) => (activeId ? entry.subjectId === activeId : true))
        .filter((entry) => filter === 'all' || entry.pinned)
        .filter((entry) =>
          `${entry.title} ${entry.body}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort(
          (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt),
        ),
    [entries, activeId, filter, query],
  );
  const latest = useMemo(
    () => [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3),
    [entries],
  );
  const notesCount = entries.filter((entry) => entry.kind === 'note').length;
  const lastActivity = latest[0] ? displayDate(latest[0].updatedAt.slice(0, 10)) : 'Not yet';
  function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = courseName.trim();
    if (!name) return;
    const course: StudySubject = {
      id: id(),
      name,
      code: '',
      color: colors[subjects.length % colors.length],
      createdAt: dateNow(),
    };
    setData((previous) => ({
      ...previous,
      study: { ...previous.study, subjects: [...previous.study.subjects, course] },
    }));
    setCourseId(course.id);
    setCourseName('');
    setAddingCourse(false);
  }
  function openNew() {
    setEditingId(null);
    setKind('note');
    setTitle('');
    setBody('');
    setPinned(false);
    setEditor(true);
  }
  function openEdit(entry: StudyEntry) {
    setEditingId(entry.id);
    setKind(entry.kind);
    setTitle(entry.title);
    setBody(entry.body);
    setPinned(entry.pinned);
    setEditor(true);
  }
  function closeEditor() {
    setEditor(false);
    setEditingId(null);
  }
  function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeId || !title.trim() || !body.trim()) return;
    const now = dateNow();
    setData((previous) => {
      const existing = previous.study.entries.find((entry) => entry.id === editingId);
      const next: StudyEntry = {
        id: existing?.id ?? id(),
        subjectId: activeId,
        kind,
        title: title.trim(),
        body: body.trim(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        pinned,
        tags: existing?.tags ?? [],
      };
      return {
        ...previous,
        study: {
          ...previous.study,
          entries: existing
            ? previous.study.entries.map((entry) => (entry.id === existing.id ? next : entry))
            : [next, ...previous.study.entries],
        },
      };
    });
    closeEditor();
  }
  function togglePin(entryId: string) {
    setData((previous) => ({
      ...previous,
      study: {
        ...previous.study,
        entries: previous.study.entries.map((entry) =>
          entry.id === entryId ? { ...entry, pinned: !entry.pinned, updatedAt: dateNow() } : entry,
        ),
      },
    }));
  }
  function deleteEntry(entryId: string) {
    if (!window.confirm('Delete this entry?')) return;
    setData((previous) => ({
      ...previous,
      study: {
        ...previous.study,
        entries: previous.study.entries.filter((entry) => entry.id !== entryId),
      },
    }));
    if (editingId === entryId) closeEditor();
  }
  return (
    <div className="lv-study-simple lv-hub-body">
      <nav className="lv-study-top-tabs" aria-label="Knowledge and Journal sections">
        <button
          type="button"
          className={section === 'courses' ? 'active' : ''}
          aria-current={section === 'courses' ? 'page' : undefined}
          onClick={() => setSection('courses')}
        >
          <BookOpen size={17} /> My Courses
        </button>
        <button
          type="button"
          className={section === 'journal' ? 'active' : ''}
          aria-current={section === 'journal' ? 'page' : undefined}
          onClick={() => setSection('journal')}
        >
          <NotebookPen size={17} /> My Journal
        </button>
      </nav>
      {section === 'journal' ? (
        <JournalHub data={data} setData={setData} />
      ) : (
        <>
          <header className="lv-study-simple-head">
            <div>
              <span className="lv-study-simple-overline">YOUR PERSONAL STUDY SPACE</span>
              <h2>{selected ? selected.name : 'My courses'}</h2>
              <p>
                {selected
                  ? 'Your notes and materials, all in one place.'
                  : 'Pick a course to start taking notes.'}
              </p>
            </div>
            {selected ? (
              <button className="lv-study-primary" type="button" onClick={openNew}>
                <Plus size={17} /> New note
              </button>
            ) : subjects.length > 0 ? (
              <button
                className="lv-study-primary"
                type="button"
                onClick={() => setAddingCourse(true)}
              >
                <Plus size={17} /> New course
              </button>
            ) : null}
          </header>
          {selected ? (
            <>
              <button
                className="lv-study-back"
                type="button"
                onClick={() => {
                  setCourseId(null);
                  setEditor(false);
                  setQuery('');
                  setFilter('all');
                }}
              >
                <ArrowLeft size={16} /> All courses
              </button>
              {editor ? (
                <section className="lv-study-editor">
                  <div className="lv-study-editor-head">
                    <h3>{editingId ? 'Edit entry' : 'New note'}</h3>
                    <button type="button" onClick={closeEditor} aria-label="Close editor">
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={saveEntry}>
                    <label>
                      Title
                      <input
                        required
                        maxLength={180}
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Lecture 3 — Memory Management"
                      />
                    </label>
                    <label>
                      Your notes
                      <textarea
                        required
                        rows={9}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write anything important from today's class…"
                      />
                    </label>
                    <div className="lv-study-editor-options">
                      <label>
                        Save as{' '}
                        <select
                          value={kind}
                          onChange={(e) => setKind(e.target.value as StudyEntryKind)}
                        >
                          <option value="note">Note</option>
                          <option value="reflection">Study reflection</option>
                          <option value="resource">Resource / link</option>
                        </select>
                      </label>
                      <label className="lv-study-pincheck">
                        <input
                          type="checkbox"
                          checked={pinned}
                          onChange={(e) => setPinned(e.target.checked)}
                        />{' '}
                        Pin for later
                      </label>
                    </div>
                    <div className="lv-study-editor-actions">
                      <button type="button" className="lv-study-secondary" onClick={closeEditor}>
                        Cancel
                      </button>
                      <button type="submit" className="lv-study-primary">
                        <Check size={16} /> Save
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <>
                  <div className="lv-study-tools">
                    <label className="lv-study-search-simple">
                      <Search size={16} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search this course…"
                      />
                    </label>
                    <button
                      className={`lv-study-secondary ${filter === 'pinned' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => setFilter(filter === 'all' ? 'pinned' : 'all')}
                    >
                      <Pin size={14} /> {filter === 'pinned' ? 'Pinned only' : 'Pinned'}
                    </button>
                  </div>
                  <div className="lv-study-notes">
                    <div className="lv-study-list-heading">
                      <h3>Saved entries</h3>
                      <span>{current.length}</span>
                    </div>
                    {current.length ? (
                      current.map((entry) => (
                        <article className="lv-study-note" key={entry.id}>
                          <div className="lv-study-note-mark">
                            {entry.kind === 'note' ? (
                              <FileText size={18} />
                            ) : entry.kind === 'reflection' ? (
                              <NotebookPen size={18} />
                            ) : (
                              <Link2 size={18} />
                            )}
                          </div>
                          <div className="lv-study-note-content">
                            <div className="lv-study-note-title">
                              <h4>{entry.title}</h4>
                              {entry.pinned && <Pin size={13} />}
                            </div>
                            <span>
                              {kindLabels[entry.kind]} · {displayDate(entry.updatedAt.slice(0, 10))}
                            </span>
                            <p>{entry.body}</p>
                          </div>
                          <div className="lv-study-note-actions">
                            <button type="button" onClick={() => openEdit(entry)}>
                              Open
                            </button>
                            <button
                              type="button"
                              aria-label={entry.pinned ? 'Unpin' : 'Pin'}
                              title={entry.pinned ? 'Unpin' : 'Pin'}
                              onClick={() => togglePin(entry.id)}
                            >
                              <Pin size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete note"
                              title="Delete entry"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="lv-study-empty-simple">
                        <BookText size={30} />
                        <h3>
                          {query || filter === 'pinned' ? 'No matching entries' : 'No notes yet'}
                        </h3>
                        <p>
                          {query || filter === 'pinned'
                            ? 'Try clearing the search or pinned filter.'
                            : 'Start with a lecture note, a short summary, or something you want to remember.'}
                        </p>
                        {!query && filter === 'all' && (
                          <button type="button" className="lv-study-primary" onClick={openNew}>
                            <Plus size={16} /> Write your first note
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {subjects.length === 0 && !addingCourse ? (
                <div className="lv-study-welcome">
                  <div className="lv-study-welcome-icon">
                    <BookOpen size={32} />
                  </div>
                  <h3>Let's create your first course</h3>
                  <p>
                    Keep your notes organized by class. For example: CSE321, Psychology, or your
                    thesis.
                  </p>
                  <button
                    type="button"
                    className="lv-study-primary"
                    onClick={() => setAddingCourse(true)}
                  >
                    <Plus size={17} /> Add a course
                  </button>
                </div>
              ) : null}
              {addingCourse ? (
                <form className="lv-study-new-course" onSubmit={createCourse}>
                  <h3>New course</h3>
                  <p>What's the name of your class or subject?</p>
                  <input
                    required
                    autoFocus
                    maxLength={100}
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. CSE321 — Operating Systems"
                  />
                  <div>
                    <button
                      className="lv-study-secondary"
                      type="button"
                      onClick={() => setAddingCourse(false)}
                    >
                      Cancel
                    </button>
                    <button className="lv-study-primary" type="submit">
                      <Check size={16} /> Create course
                    </button>
                  </div>
                </form>
              ) : null}
              {subjects.length > 0 ? (
                <>
                  <div className="lv-study-overview" aria-label="Your study overview">
                    <span>
                      <BookOpen size={16} />
                      <strong>{subjects.length}</strong>{' '}
                      {subjects.length === 1 ? 'Course' : 'Courses'}
                    </span>
                    <span>
                      <FileText size={16} />
                      <strong>{notesCount}</strong> {notesCount === 1 ? 'Note' : 'Notes'}
                    </span>
                    <span>
                      <CalendarClock size={16} />
                      Last activity <strong>{lastActivity}</strong>
                    </span>
                  </div>
                  <div className="lv-study-section-title">
                    <div>
                      <h3>My courses</h3>
                      <p>Select a course to read or write notes.</p>
                    </div>
                  </div>
                  <div className="lv-study-course-grid">
                    {subjects.map((subject) => {
                      const courseEntries = entries.filter(
                        (entry) => entry.subjectId === subject.id,
                      );
                      const recent = [...courseEntries].sort((a, b) =>
                        b.updatedAt.localeCompare(a.updatedAt),
                      )[0];
                      const noteTotal = courseEntries.filter(
                        (entry) => entry.kind === 'note',
                      ).length;
                      return (
                        <button
                          className="lv-study-course"
                          key={subject.id}
                          type="button"
                          onClick={() => {
                            setCourseId(subject.id);
                            setEditor(false);
                            setQuery('');
                            setFilter('all');
                          }}
                        >
                          <span
                            className="lv-study-course-icon"
                            style={{ background: subject.color + '22', color: subject.color }}
                          >
                            <BookOpen size={22} />
                          </span>
                          <strong>{subject.name}</strong>
                          <small>
                            {noteTotal} {noteTotal === 1 ? 'note' : 'notes'} ·{' '}
                            {courseEntries.length} total entries
                          </small>
                          <span className="lv-study-course-last">
                            {recent ? `Latest: ${recent.title}` : 'Ready for your first note'}
                          </span>
                          <ChevronRight size={18} className="lv-study-course-chevron" />
                        </button>
                      );
                    })}
                  </div>
                  <section className="lv-study-recent lv-study-recent-card">
                    <div className="lv-study-recent-heading">
                      <div>
                        <h3>Recent notes & activity</h3>
                        <p>Pick up where you left off.</p>
                      </div>
                      <span>
                        <Sparkles size={15} /> YOUR LIBRARY
                      </span>
                    </div>
                    {latest.length > 0 ? (
                      latest.map((entry) => {
                        const subject = subjects.find((s) => s.id === entry.subjectId);
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => {
                              setCourseId(entry.subjectId);
                              openEdit(entry);
                            }}
                          >
                            <FileText size={16} />
                            <span>
                              <strong>{entry.title}</strong>
                              <small>
                                {subject?.name || 'Course'} ·{' '}
                                {displayDate(entry.updatedAt.slice(0, 10))}
                              </small>
                            </span>
                            <ChevronRight size={16} />
                          </button>
                        );
                      })
                    ) : (
                      <div className="lv-study-gentle-empty">
                        <BookText size={23} />
                        <div>
                          <strong>Your notes will appear here.</strong>
                          <p>Open a course and add your first note to see it in this space.</p>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              ) : null}
              {subjects.length > 0 && (
                <button
                  type="button"
                  className="lv-study-more"
                  onClick={() => setShowMore(!showMore)}
                >
                  <MoreHorizontal size={17} /> {showMore ? 'Hide tips' : 'How to use Study Hub'}
                </button>
              )}
              {showMore && (
                <p className="lv-study-help">
                  Choose a course, click <b>New note</b>, and write. You can also save a reflection
                  or a useful resource using the option inside the note editor. Everything is saved
                  locally and included in LifeVerse backups.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
