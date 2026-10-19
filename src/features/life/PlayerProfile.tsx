import { useState } from 'react';
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Globe2,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { AvatarPreview } from '../../components/room/AvatarPreview';
import type { AvatarSettings } from '../../components/room/avatarState';
import { earnedXp, levelForXp, skillKeys, todayKey, type LifeData } from './lifeData';

import { milestones, type Milestone } from './milestones';
import RewardWardrobe from './RewardWardrobe';
import { auraById, titleById, validRewardSelection } from './rewards';
import './rewards.css';
const iconFor = (icon: Milestone['icon']) =>
  icon === 'fitness' ? (
    <Dumbbell size={20} />
  ) : icon === 'task' ? (
    <CheckCircle2 size={20} />
  ) : icon === 'skill' ? (
    <Target size={20} />
  ) : icon === 'explore' ? (
    <Globe2 size={20} />
  ) : icon === 'study' ? (
    <BookOpenCheck size={20} />
  ) : (
    <Star size={20} />
  );
export default function PlayerProfile({
  data,
  avatar,
  setData,
}: {
  data: LifeData;
  avatar: AvatarSettings;
  setData: (update: (previous: LifeData) => LifeData) => void;
}) {
  const [medalFilter, setMedalFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const earned = earnedXp(data);
  const lvl = levelForXp(earned.total);
  const medals = milestones(data);
  const unlocked = medals.filter((m) => m.achieved).length;
  const complete = data.tasks.filter((t) => t.completedAt).length;
  const trained = new Set(data.workouts.map((w) => w.date)).size;
  const stageCount = skillKeys.reduce((n, k) => n + data.skills[k], 0);
  const todayHabits = data.habits.filter((h) => h.completedDates.includes(todayKey())).length;
  const studyEntries = data.study.entries.length;
  const equipped = validRewardSelection(data);
  const aura = auraById(equipped.aura);
  const title = titleById(equipped.title);
  return (
    <div className="lv-profile">
      <div className="lv-profile-hero">
        <div className={`lv-profile-portrait lv-aura-${aura.id}`}>
          <div className="lv-portrait-halo" aria-hidden="true" />
          <AvatarPreview settings={avatar} />
          <span className="lv-portrait-caption">
            <Sparkles size={12} /> YOUR CHARACTER
          </span>
        </div>
        <div className="lv-profile-intro">
          <span className="lv-profile-kicker">
            <Sparkles size={14} /> YOUR ADVENTURER PROFILE
          </span>
          <h2>The story is yours to write.</h2>
          <div className="lv-equipped-title">✦ {title.name}</div>
          <p>
            Your real-world progress shapes your LifeVerse journey. No pressure, just steady growth.
          </p>
          <div className="lv-profile-level">
            <div>
              <b>Level {lvl.level}</b>
              <span>{earned.total.toLocaleString()} total XP</span>
            </div>
            <strong>
              {lvl.current} / {lvl.toNext} XP
            </strong>
          </div>
          <div className="lv-profile-track">
            <span style={{ width: `${(lvl.current / lvl.toNext) * 100}%` }} />
          </div>
          <small className="lv-xp-explainer">
            {lvl.current} XP earned toward Level {lvl.level + 1} · {lvl.toNext - lvl.current} XP
            remaining. Lifetime total: {earned.total.toLocaleString()} XP.
          </small>
        </div>
      </div>
      <div className="lv-profile-metrics">
        <div>
          <CheckCircle2 />
          <b>{complete}</b>
          <span>Tasks completed</span>
        </div>
        <div>
          <Flame />
          <b>{todayHabits}</b>
          <span>Habits today</span>
        </div>
        <div>
          <Dumbbell />
          <b>{trained}</b>
          <span>Training days</span>
        </div>
        <div>
          <Target />
          <b>{stageCount}</b>
          <span>Skill stages</span>
        </div>
        <div>
          <Globe2 />
          <b>{data.explore.discovered.length}</b>
          <span>Places discovered</span>
        </div>
        <div>
          <BookOpenCheck />
          <b>{studyEntries}</b>
          <span>Study entries saved</span>
        </div>
      </div>
      <RewardWardrobe data={data} setData={setData} />
      <div className="lv-profile-section-title">
        <div>
          <Trophy />
          <h3>Milestone collection</h3>
        </div>
        <span>
          {unlocked} of {medals.length} earned
        </span>
      </div>
      <p className="lv-medal-subtitle">
        Your accomplishments, collected along the way. Earned medals shine while future milestones
        stay waiting.
      </p>
      <div className="lv-achievement-filters" role="group" aria-label="Achievement filter">
        {(['all', 'earned', 'locked'] as const).map((filter) => (
          <button
            type="button"
            key={filter}
            className={medalFilter === filter ? 'active' : ''}
            aria-pressed={medalFilter === filter}
            onClick={() => setMedalFilter(filter)}
          >
            {filter === 'all' ? 'All medals' : filter === 'earned' ? 'Earned' : 'Locked'}
          </button>
        ))}
      </div>
      <div className="lv-medal-grid">
        {medals
          .filter(
            (m) => medalFilter === 'all' || (medalFilter === 'earned' ? m.achieved : !m.achieved),
          )
          .map((m) => (
            <article key={m.id} className={`lv-medal ${m.achieved ? 'unlocked' : 'locked'}`}>
              <div className="lv-medal-emblem">
                <span className="lv-medal-emblem-ring" aria-hidden="true" />
                {m.achieved ? iconFor(m.icon) : <LockKeyhole size={20} />}
              </div>
              <div>
                <h4>{m.name}</h4>
                <p>{m.description}</p>
              </div>
              <span className="lv-medal-state">
                {m.achieved ? (
                  <>
                    <Award size={13} /> Earned
                  </>
                ) : (
                  <>
                    <Circle size={12} /> Locked
                  </>
                )}
              </span>
            </article>
          ))}
      </div>
      <div className="lv-profile-xp">
        <div>
          <Zap size={20} />
          <h3>Where your XP comes from</h3>
        </div>
        <div className="lv-profile-xp-grid">
          {[
            ['Tasks', earned.tasks],
            ['Habits', earned.habits],
            ['Goals', earned.goals],
            ['Workouts', earned.workouts],
            ['Skills', earned.skills],
            ['Explore', earned.explore],
            ['Study', earned.study],
          ].map(([label, value]) => (
            <span key={label}>
              <b>{value}</b>
              <small>{label}</small>
            </span>
          ))}
        </div>
      </div>
      <p className="lv-profile-note">
        <Sparkles size={14} /> All rewards are cosmetic. Avatar clothing shapes still use the
        existing illustration; additional outfit artwork is planned for a later update.
      </p>
    </div>
  );
}
