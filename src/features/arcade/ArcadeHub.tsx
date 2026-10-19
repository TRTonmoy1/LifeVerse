import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Brain, Gamepad2, Pause, Play, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import { type LifeData } from '../life/lifeData';
import './arcade.css';

type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
type View = 'home' | 'memory' | 'snake';

type AchievementDef = { key: keyof LifeData['arcade']['unlocked']; title: string; detail: string };
const achievementDefs: AchievementDef[] = [
  {
    key: 'firstPlay',
    title: 'Inserted first coin',
    detail: 'Open a mini-game for the first time.',
  },
  { key: 'memoryClear', title: 'Mind palace', detail: 'Finish a full Memory Match board.' },
  { key: 'memorySharp', title: 'Sharp memory', detail: 'Clear Memory Match in 20 moves or fewer.' },
  { key: 'snake10', title: 'Snake streak', detail: 'Score 10 or more in Snake.' },
  { key: 'snake20', title: 'Arcade legend', detail: 'Score 20 or more in Snake.' },
];

const memorySymbols = ['🎮', '🌙', '⭐', '🪴', '🎧', '📚', '🕹️', '🧸'];

const arcadeAssets = {
  banner: '/images/arcade/arcade-banner.png',
  memory: '/images/arcade/memory-cover.png',
  snake: '/images/arcade/snake-cover.png',
};

type MemoryCard = { id: number; symbol: string; matched: boolean; revealed: boolean };

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createMemoryDeck(): MemoryCard[] {
  return shuffle(
    memorySymbols.flatMap((symbol, index) => [
      { id: index * 2, symbol, matched: false, revealed: false },
      { id: index * 2 + 1, symbol, matched: false, revealed: false },
    ]),
  );
}

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updateArcadeStats(
  setData: Dispatch<SetStateAction<LifeData>>,
  update: Partial<LifeData['arcade']>,
  achievements: string[] = [],
) {
  setData((current) => ({
    ...current,
    arcade: {
      ...current.arcade,
      ...update,
      totalPlays: update.totalPlays ?? current.arcade.totalPlays,
      lastPlayedAt: update.lastPlayedAt ?? current.arcade.lastPlayedAt,
      snakeBest: update.snakeBest ?? current.arcade.snakeBest,
      memoryBestMoves: update.memoryBestMoves ?? current.arcade.memoryBestMoves,
      unlocked: {
        ...current.arcade.unlocked,
        ...Object.fromEntries(achievements.map((key) => [key, true])),
      },
    },
  }));
}

function HomeOverview({ data, openView }: { data: LifeData; openView: (view: View) => void }) {
  const unlockedCount = achievementDefs.filter((item) => data.arcade.unlocked[item.key]).length;
  const lastPlayed = data.arcade.lastPlayedAt
    ? new Date(data.arcade.lastPlayedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No run yet';

  return (
    <div className="lv-arcade-home">
      <section
        className="lv-arcade-launcher-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8, 10, 20, 0.92) 0%, rgba(8, 10, 20, 0.78) 36%, rgba(8, 10, 20, 0.34) 72%, rgba(8, 10, 20, 0.18) 100%), url(${arcadeAssets.banner})`,
        }}
      >
        <div className="lv-arcade-launcher-copy">
          <div className="lv-arcade-kicker">
            <Sparkles size={14} /> ARCADE NIGHTS
          </div>
          <h3>Pick a vibe. Launch a game. Enjoy the break.</h3>
          <p>
            The Mini Arcade now feels like its own little launcher — cozy, visual, and made for
            quick fun inside LifeVerse.
          </p>
          <div className="lv-arcade-quick-actions">
            <button
              type="button"
              className="lv-arcade-action primary"
              onClick={() => openView('memory')}
            >
              <Brain size={16} /> Start with Memory Match
            </button>
            <button type="button" className="lv-arcade-action" onClick={() => openView('snake')}>
              <Gamepad2 size={16} /> Jump into Snake
            </button>
          </div>
        </div>
        <div className="lv-arcade-launcher-side">
          <div className="lv-arcade-launcher-meta">
            <article>
              <span>Sessions</span>
              <strong>{data.arcade.totalPlays}</strong>
            </article>
            <article>
              <span>Badges</span>
              <strong>
                {unlockedCount}/{achievementDefs.length}
              </strong>
            </article>
            <article>
              <span>Last played</span>
              <strong>{lastPlayed}</strong>
            </article>
          </div>
          <div className="lv-arcade-hero-note">
            <strong>Tonight’s lineup</strong>
            <p>Two polished mini-games with their own artwork, records, and achievement trail.</p>
          </div>
        </div>
      </section>

      <section className="lv-arcade-section-block">
        <div className="lv-arcade-section-head">
          <div>
            <span>Featured games</span>
            <h4>Choose from the arcade shelf.</h4>
          </div>
          <p>
            Each game now has its own visual cover so the page feels more like a launcher than a
            dashboard.
          </p>
        </div>
        <div className="lv-arcade-library-grid" aria-label="Game library">
          <button
            type="button"
            className="lv-arcade-showcase-card memory"
            onClick={() => openView('memory')}
          >
            <div
              className="lv-arcade-showcase-art"
              style={{ backgroundImage: `url(${arcadeAssets.memory})` }}
            >
              <div className="lv-arcade-cover-pill">Brain break</div>
              <div className="lv-arcade-showcase-overlay">
                <div className="lv-arcade-showcase-stat">
                  <span>Best run</span>
                  <strong>
                    {data.arcade.memoryBestMoves === null
                      ? '—'
                      : `${data.arcade.memoryBestMoves} moves`}
                  </strong>
                </div>
              </div>
            </div>
            <div className="lv-arcade-showcase-body">
              <div className="lv-arcade-showcase-copy">
                <h5>Memory Match</h5>
                <p>
                  Flip glowing cards, find the full set, and aim for a cleaner finish every time.
                </p>
              </div>
              <div className="lv-arcade-showcase-foot">
                <div className="lv-arcade-tag-row">
                  <span>Cozy</span>
                  <span>Relaxed</span>
                  <span>Puzzle</span>
                </div>
                <div className="lv-arcade-playline">
                  <span>Launch game</span>
                  <b>→</b>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            className="lv-arcade-showcase-card snake"
            onClick={() => openView('snake')}
          >
            <div
              className="lv-arcade-showcase-art"
              style={{ backgroundImage: `url(${arcadeAssets.snake})` }}
            >
              <div className="lv-arcade-cover-pill">Classic run</div>
              <div className="lv-arcade-showcase-overlay">
                <div className="lv-arcade-showcase-stat">
                  <span>Best score</span>
                  <strong>{data.arcade.snakeBest}</strong>
                </div>
              </div>
            </div>
            <div className="lv-arcade-showcase-body">
              <div className="lv-arcade-showcase-copy">
                <h5>Snake</h5>
                <p>
                  Guide the neon snake, grab the glowing food, and push for a longer, sharper run.
                </p>
              </div>
              <div className="lv-arcade-showcase-foot">
                <div className="lv-arcade-tag-row">
                  <span>Arcade</span>
                  <span>Fast</span>
                  <span>Replayable</span>
                </div>
                <div className="lv-arcade-playline">
                  <span>Launch game</span>
                  <b>→</b>
                </div>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section className="lv-arcade-shelf-grid">
        <div className="lv-arcade-panel lv-arcade-record-panel">
          <header>
            <Trophy size={18} />
            <h3>Arcade records</h3>
          </header>
          <div className="lv-arcade-record-row">
            <article>
              <span>Memory Match</span>
              <strong>
                {data.arcade.memoryBestMoves === null
                  ? 'No score yet'
                  : `${data.arcade.memoryBestMoves} moves`}
              </strong>
            </article>
            <article>
              <span>Snake</span>
              <strong>{data.arcade.snakeBest}</strong>
            </article>
            <article>
              <span>Collection progress</span>
              <strong>
                {unlockedCount}/{achievementDefs.length} badges
              </strong>
            </article>
          </div>
        </div>
        <div className="lv-arcade-panel lv-arcade-badge-panel">
          <header>
            <Star size={18} />
            <h3>Badge wall</h3>
          </header>
          <div className="lv-arcade-badge-strip">
            {achievementDefs.map((item) => (
              <article key={item.key} className={data.arcade.unlocked[item.key] ? 'unlocked' : ''}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MemoryMatch({ data, setData }: Props) {
  const [deck, setDeck] = useState<MemoryCard[]>(() => createMemoryDeck());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  const matchedCount = deck.filter((card) => card.matched).length;
  const finished = matchedCount === deck.length;

  useEffect(() => {
    if (!startedAt || finished) return undefined;
    const update = () => setElapsed(Date.now() - startedAt);
    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, [startedAt, finished]);

  useEffect(() => {
    if (!finished || deck.length === 0) return;
    const achievements = ['memoryClear'];
    if (moves <= 20) achievements.push('memorySharp');
    updateArcadeStats(
      setData,
      {
        memoryBestMoves:
          data.arcade.memoryBestMoves === null
            ? moves
            : Math.min(data.arcade.memoryBestMoves, moves),
        totalPlays: data.arcade.totalPlays + 1,
        lastPlayedAt: new Date().toISOString(),
      },
      achievements,
    );
    setNotice(moves <= 20 ? 'Board cleared — great memory!' : 'Board cleared — nicely done.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const restart = useCallback(() => {
    setDeck(createMemoryDeck());
    setMoves(0);
    setBusy(false);
    setNotice('');
    setStartedAt(null);
    setElapsed(0);
  }, []);

  const reveal = (id: number) => {
    if (busy || finished) return;
    const card = deck.find((item) => item.id === id);
    if (!card || card.matched || card.revealed) return;
    if (!startedAt) {
      setStartedAt(Date.now());
      updateArcadeStats(setData, { lastPlayedAt: new Date().toISOString() }, ['firstPlay']);
    }
    const nextDeck = deck.map((item) => (item.id === id ? { ...item, revealed: true } : item));
    setDeck(nextDeck);

    const nextRevealed = nextDeck.filter((item) => item.revealed && !item.matched);
    if (nextRevealed.length !== 2) return;
    setMoves((value) => value + 1);
    setBusy(true);
    const [first, second] = nextRevealed;
    if (first.symbol === second.symbol) {
      window.setTimeout(() => {
        setDeck((current) =>
          current.map((item) =>
            item.symbol === first.symbol && item.revealed ? { ...item, matched: true } : item,
          ),
        );
        setBusy(false);
      }, 300);
      return;
    }
    window.setTimeout(() => {
      setDeck((current) =>
        current.map((item) =>
          item.revealed && !item.matched ? { ...item, revealed: false } : item,
        ),
      );
      setBusy(false);
    }, 760);
  };

  return (
    <div className="lv-arcade-game">
      <div className="lv-arcade-game-head">
        <div>
          <h3>Memory Match</h3>
          <p>Find all 8 matching pairs with as few moves as you can.</p>
        </div>
        <div className="lv-arcade-inline-stats">
          <span>
            <strong>{moves}</strong> moves
          </span>
          <span>
            <strong>{formatDuration(elapsed)}</strong> time
          </span>
          <button type="button" onClick={restart}>
            <RotateCcw size={15} /> Restart
          </button>
        </div>
      </div>
      <div className="lv-memory-board" aria-label="Memory match board">
        {deck.map((card) => (
          <button
            type="button"
            key={card.id}
            className={`lv-memory-card ${card.revealed || card.matched ? 'revealed' : ''} ${card.matched ? 'matched' : ''}`}
            onClick={() => reveal(card.id)}
          >
            <span className="lv-memory-face lv-memory-back">✦</span>
            <span className="lv-memory-face lv-memory-front">{card.symbol}</span>
          </button>
        ))}
      </div>
      <div className="lv-arcade-footer-note">
        <span>
          Best:{' '}
          {data.arcade.memoryBestMoves === null
            ? 'No score yet'
            : `${data.arcade.memoryBestMoves} moves`}
        </span>
        {notice && <span>{notice}</span>}
      </div>
    </div>
  );
}

function SnakeGame({ data, setData }: Props) {
  const size = 12;
  const makeFood = useCallback((snake: number[]) => {
    const free: number[] = [];
    for (let i = 0; i < size * size; i += 1) if (!snake.includes(i)) free.push(i);
    return free[Math.floor(Math.random() * free.length)] ?? 0;
  }, []);

  const [snake, setSnake] = useState<number[]>([66, 65, 64]);
  const [direction, setDirection] = useState(1);
  const [pendingDirection, setPendingDirection] = useState(1);
  const [food, setFood] = useState(71);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Use arrow keys or WASD to move.');

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)
      )
        event.preventDefault();
      if (key === ' ') {
        setRunning((value) => !value);
        return;
      }
      const next =
        key === 'arrowup' || key === 'w'
          ? -size
          : key === 'arrowdown' || key === 's'
            ? size
            : key === 'arrowleft' || key === 'a'
              ? -1
              : key === 'arrowright' || key === 'd'
                ? 1
                : null;
      if (next === null) return;
      const disallowed = direction * -1 === next;
      if (!disallowed) setPendingDirection(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [direction]);

  useEffect(() => {
    if (!running) return undefined;
    updateArcadeStats(setData, { lastPlayedAt: new Date().toISOString() }, ['firstPlay']);
    const interval = window.setInterval(() => {
      setSnake((current) => {
        const nextDirection = pendingDirection;
        setDirection(nextDirection);
        const head = current[0];
        const row = Math.floor(head / size);
        const col = head % size;
        const nextHead = head + nextDirection;
        const nextRow = Math.floor(nextHead / size);
        const nextCol = nextHead % size;
        const hitWall =
          nextHead < 0 ||
          nextHead >= size * size ||
          Math.abs(nextCol - col) > 1 ||
          Math.abs(nextRow - row) > 1;
        const body = current.slice(0, food === nextHead ? current.length : current.length - 1);
        if (hitWall || body.includes(nextHead)) {
          setRunning(false);
          setMessage('Game over — press reset and try again.');
          updateArcadeStats(
            setData,
            {
              snakeBest: Math.max(data.arcade.snakeBest, score),
              totalPlays: data.arcade.totalPlays + 1,
              lastPlayedAt: new Date().toISOString(),
            },
            [score >= 20 ? 'snake20' : '', score >= 10 ? 'snake10' : ''].filter(Boolean),
          );
          return current;
        }
        const nextSnake = [nextHead, ...current];
        if (nextHead === food) {
          setScore((value) => value + 1);
          setFood(makeFood(nextSnake));
          setMessage('Nice! Keep going.');
          return nextSnake;
        }
        nextSnake.pop();
        return nextSnake;
      });
    }, 190);
    return () => window.clearInterval(interval);
  }, [
    running,
    pendingDirection,
    direction,
    food,
    makeFood,
    setData,
    data.arcade.snakeBest,
    data.arcade.totalPlays,
    score,
  ]);

  const reset = useCallback(() => {
    setSnake([66, 65, 64]);
    setDirection(1);
    setPendingDirection(1);
    setFood(71);
    setRunning(false);
    setScore(0);
    setMessage('Fresh run ready.');
  }, []);

  const cells = useMemo(
    () =>
      Array.from({ length: size * size }, (_, index) => {
        const isHead = snake[0] === index;
        return { index, isHead, snake: snake.includes(index), food: food === index };
      }),
    [snake, food],
  );

  return (
    <div className="lv-arcade-game">
      <div className="lv-arcade-game-head">
        <div>
          <h3>Snake</h3>
          <p>A compact classic. Controls: arrow keys / WASD.</p>
        </div>
        <div className="lv-arcade-inline-stats">
          <span>
            <strong>{score}</strong> score
          </span>
          <span>
            <strong>{data.arcade.snakeBest}</strong> best
          </span>
          <button type="button" onClick={() => setRunning((value) => !value)}>
            {running ? <Pause size={15} /> : <Play size={15} />} {running ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={reset}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
      <div className="lv-snake-layout">
        <div className="lv-snake-board" role="grid" aria-label="Snake board">
          {cells.map((cell) => (
            <div
              key={cell.index}
              className={`lv-snake-cell ${cell.snake ? 'snake' : ''} ${cell.isHead ? 'head' : ''} ${cell.food ? 'food' : ''}`}
            />
          ))}
        </div>
        <aside className="lv-snake-side">
          <div className="lv-snake-card">
            <strong>Status</strong>
            <p>{message}</p>
          </div>
          <div className="lv-snake-card">
            <strong>Tips</strong>
            <ul>
              <li>Don’t reverse directly into yourself.</li>
              <li>Short runs are perfect for quick breaks.</li>
              <li>Score 10+ and 20+ to unlock arcade badges.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ArcadeHub({ data, setData }: Props) {
  const [view, setView] = useState<View>('home');
  return (
    <div className="lv-arcade lv-hub-body">
      <div className="lv-arcade-topbar">
        <div>
          <div className="lv-arcade-eyebrow">
            <Sparkles size={14} /> CHAPTER XIII — MINI ARCADE
          </div>
          <h2>Mini Arcade</h2>
          <p>A cozy corner for quick games, better runs, and a little fun between chapters.</p>
        </div>
        <div className="lv-arcade-tabs" role="tablist" aria-label="Arcade sections">
          <button
            type="button"
            className={view === 'home' ? 'selected' : ''}
            onClick={() => setView('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={view === 'memory' ? 'selected' : ''}
            onClick={() => setView('memory')}
          >
            Memory Match
          </button>
          <button
            type="button"
            className={view === 'snake' ? 'selected' : ''}
            onClick={() => setView('snake')}
          >
            Snake
          </button>
        </div>
      </div>
      {view === 'home' && <HomeOverview data={data} openView={setView} />}
      {view === 'memory' && <MemoryMatch data={data} setData={setData} />}
      {view === 'snake' && <SnakeGame data={data} setData={setData} />}
    </div>
  );
}
