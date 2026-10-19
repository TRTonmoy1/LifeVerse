import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flag,
  Globe2,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { atlasCountries, type AtlasCountry, type AtlasRegion } from './atlasCountries';
import {
  countryFacts,
  questions,
  regionDetails,
  regions,
  type AtlasQuestion,
} from './atlasContent';
import { exploreRegionCount, exploreXp, type LifeData } from '../life/lifeData';
import './explore.css';

type View = 'atlas' | 'expeditions' | 'trivia';
type RegionFilter = AtlasRegion | 'All';
type QuestionResult = { total: number; correct: number; earned: number };
const countryByCode = new Map(atlasCountries.map((c) => [c.code, c]));
const featured = ['BGD', 'JPN', 'EGY', 'BRA', 'ISL', 'AUS'];
const iconLabel = (value: number, word: string) => `${value} ${word}${value === 1 ? '' : 's'}`;
const coordLabel = (x: number, y: number) => {
  const longitude = (x / 1080) * 360 - 180;
  const latitude = 84 - (y / 480) * 144;
  return `${Math.abs(latitude).toFixed(0)}°${latitude >= 0 ? 'N' : 'S'} · ${Math.abs(longitude).toFixed(0)}°${longitude >= 0 ? 'E' : 'W'}`;
};
function shuffled<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function ExploreHub({
  data,
  setData,
}: {
  data: LifeData;
  setData: Dispatch<SetStateAction<LifeData>>;
}) {
  const [view, setView] = useState<View>('atlas');
  const [selectedCode, setSelectedCode] = useState('BGD');
  const [region, setRegion] = useState<RegionFilter>('All');
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [triviaRegion, setTriviaRegion] = useState<RegionFilter>('All');
  const [trail, setTrail] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundEarned, setRoundEarned] = useState(0);
  const [roundResult, setRoundResult] = useState<QuestionResult | null>(null);
  const reducedMotion = useReducedMotion();
  const selected = countryByCode.get(selectedCode) ?? atlasCountries[0];
  const discovered = new Set(data.explore.discovered);
  const solved = new Set(data.explore.quizSolved);
  const xp = exploreXp(data.explore);
  const challengeCount = regions.filter((r) => exploreRegionCount(data.explore, r) >= 5).length;
  const matches = useMemo(
    () =>
      atlasCountries.filter(
        (c) =>
          (region === 'All' || c.region === region) &&
          `${c.name} ${c.capital ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [region, search],
  );
  const worldPercent = Math.round((discovered.size / atlasCountries.length) * 100);
  const mapWidth = 1080 / zoom;
  const mapHeight = 480 / zoom;
  const mapX = Math.min(1080 - mapWidth, Math.max(0, (zoom > 1 ? selected.x : 540) - mapWidth / 2));
  const mapY = Math.min(
    480 - mapHeight,
    Math.max(0, (zoom > 1 ? selected.y : 240) - mapHeight / 2),
  );
  const activeQuestion = trail.length ? questions.find((q) => q.id === trail[step]) : undefined;

  function chooseCountry(country: AtlasCountry) {
    setSelectedCode(country.code);
  }
  function jumpToCountry(code: string) {
    const country = countryByCode.get(code);
    if (!country) return;
    setSelectedCode(code);
    setRegion('All');
    setSearch('');
    setView('atlas');
  }
  function discoverCountry() {
    if (discovered.has(selected.code)) return;
    setData((old) => ({
      ...old,
      explore: {
        ...old.explore,
        discovered: old.explore.discovered.includes(selected.code)
          ? old.explore.discovered
          : [...old.explore.discovered, selected.code],
      },
    }));
  }
  function beginTrail() {
    const available = questions.filter((q) => triviaRegion === 'All' || q.region === triviaRegion);
    // New questions come first; once solved, they can be replayed for practice with zero extra XP.
    const fresh = shuffled(available.filter((q) => !solved.has(q.id)));
    const practiced = shuffled(available.filter((q) => solved.has(q.id)));
    setTrail([...fresh, ...practiced].slice(0, 10).map((q) => q.id));
    setStep(0);
    setChoice(null);
    setRoundResult(null);
    setRoundCorrect(0);
    setRoundEarned(0);
  }
  function answer(question: AtlasQuestion, answerIndex: number) {
    if (choice !== null) return;
    setChoice(answerIndex);
    if (answerIndex === question.correct) {
      setRoundCorrect((n) => n + 1);
      if (!solved.has(question.id)) {
        setRoundEarned((n) => n + 20);
        setData((old) => ({
          ...old,
          explore: {
            ...old.explore,
            quizSolved: old.explore.quizSolved.includes(question.id)
              ? old.explore.quizSolved
              : [...old.explore.quizSolved, question.id],
          },
        }));
      }
    }
  }
  function nextQuestion() {
    if (step + 1 < trail.length) {
      setStep((i) => i + 1);
      setChoice(null);
    } else {
      setRoundResult({ total: trail.length, correct: roundCorrect, earned: roundEarned });
      setTrail([]);
      setChoice(null);
    }
  }

  return (
    <div className="lv-hub-body lv-explore">
      <div className="lv-exp-hero">
        <div className="lv-exp-hero-copy">
          <span className="lv-exp-kicker">
            <Sparkles size={14} /> CHAPTER VI · YOUR PERSONAL ATLAS
          </span>
          <h2>
            A whole world <em>awaits.</em>
          </h2>
          <p>
            Uncover places, collect discoveries and follow your curiosity across the map. Every
            little journey adds a page to your story.
          </p>
          <div className="lv-exp-hero-actions">
            <button type="button" className="lv-exp-primary" onClick={() => setView('atlas')}>
              <Compass size={16} /> Open the atlas <ArrowRight size={15} />
            </button>
            <button type="button" className="lv-exp-hero-link" onClick={() => setView('trivia')}>
              <BookOpen size={17} /> Test your knowledge
            </button>
          </div>
        </div>
        <div className="lv-exp-hero-art" aria-hidden="true">
          <div className="lv-exp-orbit lv-exp-orbit-a" />
          <div className="lv-exp-orbit lv-exp-orbit-b" />
          <div className="lv-exp-globe">
            <Globe2 strokeWidth={0.9} />
          </div>
          <div className="lv-exp-float lv-exp-float-one">✦</div>
          <div className="lv-exp-float lv-exp-float-two">✧</div>
          <span className="lv-exp-art-caption">DISCOVER · LEARN · EXPLORE</span>
        </div>
      </div>

      <div className="lv-exp-stats">
        <div className="lv-exp-stat">
          <span>
            <MapPin size={19} />
          </span>
          <div>
            <strong>
              {discovered.size}
              <small> / {atlasCountries.length}</small>
            </strong>
            <p>Places discovered</p>
          </div>
        </div>
        <div className="lv-exp-stat">
          <span>
            <BookOpen size={19} />
          </span>
          <div>
            <strong>
              {solved.size}
              <small> / {questions.length}</small>
            </strong>
            <p>Trivia mastered</p>
          </div>
        </div>
        <div className="lv-exp-stat">
          <span>
            <Flag size={19} />
          </span>
          <div>
            <strong>
              {challengeCount}
              <small> / 6</small>
            </strong>
            <p>Region expeditions</p>
          </div>
        </div>
        <div className="lv-exp-stat">
          <span>
            <Zap size={19} />
          </span>
          <div>
            <strong>{xp.total.toLocaleString()}</strong>
            <p>Exploration XP</p>
          </div>
        </div>
      </div>
      <div className="lv-exp-navigation" role="tablist" aria-label="Explore Hub sections">
        {[
          { key: 'atlas' as const, icon: <Globe2 size={17} />, name: 'World atlas' },
          { key: 'expeditions' as const, icon: <Compass size={17} />, name: 'Expeditions' },
          { key: 'trivia' as const, icon: <BookOpen size={17} />, name: 'Trivia trail' },
        ].map((item) => (
          <button
            type="button"
            key={item.key}
            className={view === item.key ? 'active' : ''}
            role="tab"
            aria-selected={view === item.key}
            onClick={() => setView(item.key)}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === 'atlas' && (
          <motion.section
            key="atlas"
            className="lv-exp-view"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            aria-label="World atlas"
          >
            <div className="lv-exp-section-heading">
              <div>
                <span className="lv-exp-overline">THE EXPLORER'S DESK</span>
                <h3>
                  Find your next discovery <span>✦</span>
                </h3>
                <p>Search the world, select a place, and add it to your field journal.</p>
              </div>
              <div className="lv-exp-count-chip">
                <span className="lv-exp-led" />
                {worldPercent}% explored
              </div>
            </div>
            <div className="lv-exp-atlas-controls">
              <div className="lv-exp-search">
                <Search size={17} />
                <input
                  type="search"
                  aria-label="Search countries or capitals"
                  placeholder="Search a country or capital…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
                    ×
                  </button>
                )}
              </div>
              <div className="lv-exp-region-list" role="group" aria-label="Filter by region">
                {(['All', ...regions] as RegionFilter[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={region === r ? 'active' : ''}
                    aria-pressed={region === r}
                    onClick={() => {
                      setRegion(r);
                      if (r !== 'All' && selected.region !== r) {
                        const first = atlasCountries.find((c) => c.region === r);
                        if (first) setSelectedCode(first.code);
                      }
                    }}
                  >
                    {r === 'All' ? 'All regions' : r}
                  </button>
                ))}
              </div>
            </div>
            <div className="lv-exp-atlas-layout">
              <div className="lv-exp-map-column">
                <div className="lv-exp-map-card">
                  <div className="lv-exp-map-top">
                    <div>
                      <span className="lv-exp-overline">FIELD MAP · EARTH</span>
                      <strong>Interactive world map</strong>
                    </div>
                    <div className="lv-exp-map-zoom">
                      <button
                        type="button"
                        aria-label="Zoom out"
                        disabled={zoom <= 1}
                        onClick={() => setZoom((v) => Math.max(1, +(v / 1.5).toFixed(2)))}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{Math.round(zoom * 100)}%</span>
                      <button
                        type="button"
                        aria-label="Zoom in"
                        disabled={zoom >= 3}
                        onClick={() => setZoom((v) => Math.min(3, +(v * 1.5).toFixed(2)))}
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Reset map zoom"
                        title="Reset map zoom"
                        onClick={() => setZoom(1)}
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="lv-exp-map-canvas">
                    <svg
                      className="lv-exp-map-svg"
                      viewBox={`${mapX} ${mapY} ${mapWidth} ${mapHeight}`}
                      role="group"
                      aria-label="Map of the world, choose a country"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <pattern
                          id="lv-exp-map-dots"
                          width="24"
                          height="24"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="2" cy="2" r=".75" fill="#6e91a6" opacity=".18" />
                        </pattern>
                        <linearGradient id="lv-exp-ocean" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#121f39" />
                          <stop offset="1" stopColor="#101b33" />
                        </linearGradient>
                      </defs>
                      <rect width="1080" height="480" fill="url(#lv-exp-ocean)" />
                      <rect width="1080" height="480" fill="url(#lv-exp-map-dots)" />
                      {[-60, -30, 0, 30, 60].map((lat) => (
                        <line
                          key={lat}
                          x1={0}
                          x2={1080}
                          y1={((84 - lat) / 144) * 480}
                          y2={((84 - lat) / 144) * 480}
                          className="lv-exp-gridline"
                        />
                      ))}
                      {[-120, -60, 0, 60, 120].map((lon) => (
                        <line
                          key={lon}
                          x1={((lon + 180) / 360) * 1080}
                          x2={((lon + 180) / 360) * 1080}
                          y1={0}
                          y2={480}
                          className="lv-exp-gridline"
                        />
                      ))}
                      {atlasCountries.map((country) => (
                        <path
                          key={country.code}
                          d={country.path}
                          className={`lv-exp-land ${selected.code === country.code ? 'is-selected' : ''} ${discovered.has(country.code) ? 'is-discovered' : ''} ${region !== 'All' && country.region !== region ? 'is-muted' : ''} ${search && !matches.includes(country) ? 'is-muted' : ''}`}
                          onClick={() => chooseCountry(country)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${country.name}${discovered.has(country.code) ? ', discovered' : ''}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              chooseCountry(country);
                            }
                          }}
                        >
                          <title>{country.name}</title>
                        </path>
                      ))}
                      <circle
                        cx={selected.x}
                        cy={selected.y}
                        r={Math.max(6, 9 / zoom)}
                        fill="none"
                        stroke="#ffd59a"
                        strokeWidth={2 / zoom}
                        opacity=".9"
                        pointerEvents="none"
                      />
                      <circle
                        cx={selected.x}
                        cy={selected.y}
                        r={Math.max(2, 3 / zoom)}
                        fill="#ffdda9"
                        pointerEvents="none"
                      />
                    </svg>
                    <div className="lv-exp-map-compass" aria-hidden="true">
                      <Compass size={20} />
                      <span>N</span>
                    </div>
                  </div>
                  <div className="lv-exp-map-foot">
                    <div className="lv-exp-legend">
                      <span>
                        <i className="unseen" /> Not discovered
                      </span>
                      <span>
                        <i className="seen" /> Discovered
                      </span>
                      <span>
                        <i className="chosen" /> Selected
                      </span>
                    </div>
                    <span>Click a place to inspect · Zoom follows selection</span>
                  </div>
                </div>
                <div className="lv-exp-search-results">
                  <div className="lv-exp-result-heading">
                    <strong>{search.trim() ? 'Search results' : 'Places to explore'}</strong>
                    <small>{matches.length} places</small>
                  </div>
                  {matches.length ? (
                    <div className="lv-exp-country-list">
                      {(search.trim() ? matches : matches.slice(0, 8)).slice(0, 16).map((c) => (
                        <button
                          type="button"
                          key={c.code}
                          className={c.code === selected.code ? 'active' : ''}
                          onClick={() => chooseCountry(c)}
                        >
                          <span className="lv-exp-list-flag">{c.flag}</span>
                          <span>
                            {c.name}
                            <small>{c.region}</small>
                          </span>
                          {discovered.has(c.code) ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="lv-exp-no-results">
                      No places match that search. Try a different country or capital.
                    </div>
                  )}
                </div>
              </div>
              <aside className="lv-exp-passport" aria-label="Selected place information">
                <div className="lv-exp-passport-top">
                  <span className="lv-exp-overline">PLACE PASSPORT</span>
                  <span
                    className={`lv-exp-passport-state ${discovered.has(selected.code) ? 'seen' : ''}`}
                  >
                    {discovered.has(selected.code) ? (
                      <>
                        <Check size={13} /> Discovered
                      </>
                    ) : (
                      <>
                        <MapPin size={13} /> Not discovered
                      </>
                    )}
                  </span>
                </div>
                <div className="lv-exp-passport-flag" aria-hidden="true">
                  {selected.flag}
                </div>
                <h3>{selected.name}</h3>
                <p className="lv-exp-passport-region">
                  <MapPin size={14} />
                  {selected.region}
                </p>
                <div className="lv-exp-passport-rule" />
                <div className="lv-exp-passport-facts">
                  <div>
                    <span>CAPITAL / ADMIN. CENTRE</span>
                    <strong>{selected.capital ?? 'Not listed for this region'}</strong>
                  </div>
                  <div>
                    <span>APPROX. MAP POSITION</span>
                    <strong>{coordLabel(selected.x, selected.y)}</strong>
                  </div>
                </div>
                <div className="lv-exp-fieldnote">
                  <span>
                    <Sparkles size={15} /> FIELD NOTE
                  </span>
                  <p>
                    {countryFacts[selected.code] ??
                      `Find ${selected.name} on the map and explore its place within ${selected.region}. Every destination is a new page in your atlas.`}
                  </p>
                </div>
                <button
                  type="button"
                  className={`lv-exp-discover ${discovered.has(selected.code) ? 'saved' : ''}`}
                  onClick={discoverCountry}
                  disabled={discovered.has(selected.code)}
                >
                  {discovered.has(selected.code) ? (
                    <>
                      <CheckCircle2 size={19} /> Added to field journal
                    </>
                  ) : (
                    <>
                      <Flag size={18} /> Mark as discovered <b>+5 XP</b>
                    </>
                  )}
                </button>
                <p className="lv-exp-passport-hint">
                  Discoveries are self-reported places you've learned about, not proof of a physical
                  visit.
                </p>
                <div className="lv-exp-passport-page">
                  LIFEVERSE FIELD JOURNAL{' '}
                  <strong>✦ {String(discovered.size).padStart(3, '0')}</strong>
                </div>
              </aside>
            </div>
            <div className="lv-exp-featured">
              <div className="lv-exp-section-heading compact">
                <div>
                  <span className="lv-exp-overline">SUGGESTED STARTING POINTS</span>
                  <h3>Six doors to the world</h3>
                </div>
              </div>
              <div className="lv-exp-featured-grid">
                {featured.map((code) => {
                  const c = countryByCode.get(code)!;
                  return (
                    <button type="button" key={code} onClick={() => jumpToCountry(code)}>
                      <span className="lv-exp-feature-flag">{c.flag}</span>
                      <span>
                        <strong>{c.name}</strong>
                        <small>{regionDetails[c.region].tag.toLowerCase()}</small>
                      </span>
                      {discovered.has(code) ? <CheckCircle2 size={17} /> : <ArrowRight size={17} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {view === 'expeditions' && (
          <motion.section
            key="expeditions"
            className="lv-exp-view"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            aria-label="Discovery expeditions"
          >
            <div className="lv-exp-section-heading">
              <div>
                <span className="lv-exp-overline">EXPLORER'S FIELD MISSIONS</span>
                <h3>
                  Six paths around the planet <span>✦</span>
                </h3>
                <p>
                  Discover any five mapped places in a region to complete its expedition and
                  automatically earn 40 bonus XP.
                </p>
              </div>
              <div className="lv-exp-count-chip">
                <Trophy size={15} />
                {challengeCount} / 6 complete
              </div>
            </div>
            <div className="lv-exp-expeditions-intro">
              <div>
                <Compass size={29} />
                <div>
                  <span>YOUR EXPLORER'S LOG</span>
                  <h4>{discovered.size} discoveries and counting</h4>
                  <p>Find places that spark curiosity. No daily deadlines or pressure to rush.</p>
                </div>
              </div>
              <strong>
                {xp.total} XP <small>earned in Explore</small>
              </strong>
            </div>
            <div className="lv-exp-expedition-grid">
              {regions.map((r, i) => {
                const count = exploreRegionCount(data.explore, r);
                const complete = count >= 5;
                const details = regionDetails[r];
                return (
                  <article
                    key={r}
                    className="lv-exp-expedition-card"
                    style={{ '--lv-region-accent': details.accent } as React.CSSProperties}
                  >
                    <div className="lv-exp-expedition-top">
                      <span>EXPEDITION 0{i + 1}</span>
                      {complete ? (
                        <span className="done">
                          <CheckCircle2 size={15} /> Completed
                        </span>
                      ) : (
                        <span>
                          <LockKeyhole size={14} /> +40 XP
                        </span>
                      )}
                    </div>
                    <div className="lv-exp-expedition-emblem">
                      <Globe2 size={28} />
                    </div>
                    <span className="lv-exp-expedition-tag">{details.tag}</span>
                    <h4>{r}</h4>
                    <p>{details.subtitle}</p>
                    <div className="lv-exp-expedition-meter">
                      <div>
                        <span>Places discovered</span>
                        <strong>{Math.min(5, count)} / 5</strong>
                      </div>
                      <div className="lv-exp-expedition-track">
                        <span style={{ width: `${Math.min(100, (count / 5) * 100)}%` }} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegion(r);
                        setSearch('');
                        setView('atlas');
                        setZoom(1);
                        const first = atlasCountries.find((c) => c.region === r);
                        if (first) setSelectedCode(first.code);
                      }}
                    >
                      {complete ? 'Revisit region' : 'Explore region'} <ArrowRight size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="lv-exp-journal">
              <div className="lv-exp-journal-head">
                <div>
                  <BookOpen size={22} />
                  <div>
                    <h4>Your field journal</h4>
                    <p>Recent locations you've discovered</p>
                  </div>
                </div>
                <span>{iconLabel(discovered.size, 'entry')}</span>
              </div>
              {data.explore.discovered.length ? (
                <div className="lv-exp-journal-entries">
                  {[...data.explore.discovered]
                    .reverse()
                    .slice(0, 12)
                    .map((code) => {
                      const c = countryByCode.get(code);
                      return (
                        c && (
                          <button type="button" key={code} onClick={() => jumpToCountry(code)}>
                            <span>{c.flag}</span>
                            <div>
                              <strong>{c.name}</strong>
                              <small>{c.region}</small>
                            </div>
                            <ArrowRight size={15} />
                          </button>
                        )
                      );
                    })}
                </div>
              ) : (
                <div className="lv-exp-journal-empty">
                  <MapPin size={25} />
                  <p>
                    Your journal is waiting for its first entry. Choose any place from the atlas to
                    begin.
                  </p>
                  <button type="button" className="lv-exp-primary" onClick={() => setView('atlas')}>
                    Explore the map <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {view === 'trivia' && (
          <motion.section
            key="trivia"
            className="lv-exp-view"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            aria-label="Geography trivia"
          >
            <div className="lv-exp-section-heading">
              <div>
                <span className="lv-exp-overline">THE KNOWLEDGE TRAIL</span>
                <h3>
                  How far can curiosity take you? <span>✦</span>
                </h3>
                <p>
                  Explore geography through short quizzes. Every uniquely solved question earns 20
                  XP once.
                </p>
              </div>
              <div className="lv-exp-count-chip">
                <BookOpen size={16} />
                {solved.size} / {questions.length} mastered
              </div>
            </div>
            {!activeQuestion && !roundResult && (
              <div className="lv-exp-trivia-start">
                <div className="lv-exp-trivia-art" aria-hidden="true">
                  <span>?</span>
                  <div>✧</div>
                </div>
                <span className="lv-exp-overline">A NEW CHALLENGE AWAITS</span>
                <h4>Pack your curiosity.</h4>
                <p>
                  Pick a part of the world or explore them all. Each trail includes up to ten
                  questions, with new questions first and completed ones available for practice.
                </p>
                <label htmlFor="lv-trivia-region">CHOOSE YOUR TRAIL</label>
                <select
                  id="lv-trivia-region"
                  value={triviaRegion}
                  onChange={(e) => setTriviaRegion(e.target.value as RegionFilter)}
                >
                  <option value="All">🌍 Around the world</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button type="button" className="lv-exp-primary" onClick={beginTrail}>
                  Begin trivia trail <ArrowRight size={16} />
                </button>
                <small>
                  <Zap size={13} /> 20 XP for each newly mastered question · No repeat rewards
                </small>
              </div>
            )}
            {activeQuestion && (
              <div className="lv-exp-trivia-play">
                <div className="lv-exp-trivia-progress">
                  <span>
                    QUESTION {step + 1} OF {trail.length}
                  </span>
                  <span>{roundCorrect} correct so far</span>
                </div>
                <div className="lv-exp-trivia-track">
                  <span style={{ width: `${((step + 1) / trail.length) * 100}%` }} />
                </div>
                <div className="lv-exp-trivia-country">
                  <span>{countryByCode.get(activeQuestion.country)?.flag ?? '🌍'}</span>
                  <span>{activeQuestion.region} · Geography challenge</span>
                </div>
                <h4>{activeQuestion.prompt}</h4>
                <div className="lv-exp-answers">
                  {activeQuestion.answers.map((option, index) => {
                    const isRight = index === activeQuestion.correct;
                    const chosen = index === choice;
                    return (
                      <button
                        type="button"
                        key={index}
                        disabled={choice !== null}
                        className={
                          choice !== null
                            ? isRight
                              ? 'correct'
                              : chosen
                                ? 'incorrect'
                                : 'muted'
                            : ''
                        }
                        onClick={() => answer(activeQuestion, index)}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        {option}
                        {choice !== null && isRight && <CheckCircle2 size={18} />}
                      </button>
                    );
                  })}
                </div>
                {choice !== null && (
                  <div
                    className={`lv-exp-trivia-feedback ${choice === activeQuestion.correct ? 'success' : ''}`}
                    role="status"
                  >
                    <strong>
                      {choice === activeQuestion.correct
                        ? 'Well explored!'
                        : 'A new thing learned.'}
                    </strong>
                    <p>{activeQuestion.explanation}</p>
                    {choice === activeQuestion.correct && (
                      <small>
                        {solved.has(activeQuestion.id)
                          ? 'Mastered · XP is only earned once per question'
                          : 'Correct answer'}
                      </small>
                    )}
                  </div>
                )}
                <div className="lv-exp-trivia-footer">
                  <span>{roundEarned} fresh XP this trail</span>
                  <button
                    type="button"
                    className="lv-exp-primary"
                    disabled={choice === null}
                    onClick={nextQuestion}
                  >
                    {step + 1 === trail.length ? 'Finish trail' : 'Next question'}{' '}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
            {roundResult && (
              <div className="lv-exp-trivia-end">
                <div className="lv-exp-finish-icon">
                  <Trophy size={44} />
                </div>
                <span className="lv-exp-overline">TRAIL COMPLETED</span>
                <h4>Another chapter of your atlas.</h4>
                <p>Every answer is part of learning. Return anytime to discover more.</p>
                <div>
                  <span>
                    <strong>
                      {roundResult.correct} / {roundResult.total}
                    </strong>
                    <small>Correct answers</small>
                  </span>
                  <span>
                    <strong>+{roundResult.earned}</strong>
                    <small>New XP earned</small>
                  </span>
                </div>
                <button type="button" className="lv-exp-primary" onClick={beginTrail}>
                  Try another trail <RotateCcw size={17} />
                </button>
                <button
                  type="button"
                  className="lv-exp-hero-link"
                  onClick={() => {
                    setRoundResult(null);
                    setTrail([]);
                  }}
                >
                  Change region
                </button>
              </div>
            )}
            <div className="lv-exp-trivia-bottom">
              <div>
                <Sparkles size={18} />
                <span>Your quiz collection</span>
              </div>
              <strong>{Math.round((solved.size / questions.length) * 100)}% completed</strong>
              <div className="lv-exp-expedition-track">
                <span style={{ width: `${(solved.size / questions.length) * 100}%` }} />
              </div>
              <p>
                Progress is saved automatically. Replaying learned questions helps you practice, but
                won't award additional XP.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <div className="lv-exp-footer">
        <span>
          <Sparkles size={13} /> An adventure at your own pace.
        </span>
        <span>
          Map outlines: Natural Earth (simplified) · Boundaries are illustrative, not legal
          determinations.
        </span>
      </div>
    </div>
  );
}
