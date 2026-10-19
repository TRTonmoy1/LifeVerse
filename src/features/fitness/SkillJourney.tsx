import {
  Check,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LockKeyhole,
  Sparkles,
  Target,
} from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { skillsCatalog, type LifeData, type SkillKey } from '../life/lifeData';

type Props = { data: LifeData; setData: Dispatch<SetStateAction<LifeData>> };
export default function SkillJourney({ data, setData }: Props) {
  const [focus, setFocus] = useState<SkillKey>('pushup');
  const [confirmStage, setConfirmStage] = useState<number | null>(null);
  const [inspectStage, setInspectStage] = useState<number | null>(null);
  const chosen = skillsCatalog.find((s) => s.key === focus)!;
  const current = data.skills[focus];
  function select(key: SkillKey) {
    setFocus(key);
    setConfirmStage(null);
    setInspectStage(null);
  }
  function change(target: number) {
    setData((previous) => ({ ...previous, skills: { ...previous.skills, [focus]: target } }));
    setConfirmStage(null);
  }
  return (
    <section className="lv-tree">
      <div className="lv-tree-heading">
        <div>
          <span className="lv-profile-kicker">
            <Sparkles size={14} /> THE TRAINING ATLAS
          </span>
          <h2>Choose your path.</h2>
          <p>Six disciplines. Five milestones each. You decide when you're ready.</p>
        </div>
        <span className="lv-tree-count">
          {Object.values(data.skills).reduce((n, v) => n + v, 0)} / 30 stages recorded
        </span>
      </div>
      <div className="lv-tree-selector" role="group" aria-label="Choose calisthenics discipline">
        {skillsCatalog.map((item) => (
          <button
            key={item.key}
            type="button"
            className={focus === item.key ? 'selected' : ''}
            style={{ '--path-color': item.color } as React.CSSProperties}
            aria-pressed={focus === item.key}
            onClick={() => select(item.key)}
          >
            <Target size={17} />
            <span>{item.name}</span>
            <small>{data.skills[item.key]}/5</small>
          </button>
        ))}
      </div>
      <div className="lv-tree-path" style={{ '--path-color': chosen.color } as React.CSSProperties}>
        <div className="lv-tree-path-heading">
          <div className="lv-tree-glyph">
            <Target size={28} />
          </div>
          <div>
            <span>SELECTED DISCIPLINE</span>
            <h3>{chosen.name}</h3>
            <p>{chosen.tagline}</p>
          </div>
          <b>{current === 5 ? 'MASTERED' : `STAGE ${current} / 5`}</b>
        </div>
        <div className="lv-tree-track" aria-label="Skill progression">
          {chosen.levels.slice(1).map((stage, index) => {
            const number = index + 1;
            const achieved = number <= current;
            const available = number === current + 1;
            return (
              <button
                type="button"
                key={stage}
                className={`lv-tree-node ${achieved ? 'earned' : available ? 'next' : 'locked'} ${inspectStage === number ? 'inspected' : ''}`}
                onClick={() => setInspectStage(number)}
                aria-label={`${stage}: ${achieved ? 'recorded' : available ? 'next stage' : 'not recorded'}`}
                aria-pressed={inspectStage === number}
              >
                <span className="lv-tree-node-orb">
                  {achieved ? (
                    <Check size={24} />
                  ) : available ? (
                    <Sparkles size={22} />
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                </span>
                <span className="lv-tree-step">STAGE {number}</span>
                <strong>{stage}</strong>
                <small>{achieved ? 'Recorded' : available ? 'Up next' : 'Future milestone'}</small>
              </button>
            );
          })}
        </div>
        <div className="lv-stage-inspector" aria-live="polite">
          <div className="lv-stage-inspector-icon">
            <Target size={22} />
          </div>
          <div>
            <span>STAGE GUIDE · {inspectStage ?? Math.min(current + 1, 5)} OF 5</span>
            <h4>{chosen.levels[inspectStage ?? Math.min(current + 1, 5)]}</h4>
            <p>
              {(inspectStage ?? Math.min(current + 1, 5)) <= current
                ? 'You have recorded this milestone. Select another stage to review your path.'
                : 'Practice at a pace that suits your ability. Record this stage only after you can perform it with control and appropriate preparation.'}
            </p>
          </div>
          <span className="lv-stage-inspector-state">
            {(inspectStage ?? Math.min(current + 1, 5)) <= current
              ? 'Recorded'
              : (inspectStage ?? Math.min(current + 1, 5)) === current + 1
                ? 'Up next'
                : 'Future goal'}
          </span>
        </div>
        <div className="lv-tree-detail">
          <div>
            <span>YOUR CURRENT MILESTONE</span>
            <h4>{current === 0 ? 'Your journey starts here' : chosen.levels[current]}</h4>
            <p>
              {current === 5
                ? 'You have recorded every milestone in this discipline.'
                : `Next: ${chosen.levels[Math.min(5, current + 1)]}. Move forward only when you can perform the exercise safely and with control.`}
            </p>
          </div>
          <div className="lv-tree-control">
            <button type="button" disabled={!current} onClick={() => change(current - 1)}>
              <ChevronLeft size={17} /> Previous stage
            </button>
            <button
              type="button"
              disabled={current === 5}
              onClick={() => setConfirmStage(current + 1)}
            >
              Record next stage <ChevronRight size={17} />
            </button>
          </div>
        </div>
        {confirmStage !== null && (
          <div className="lv-tree-confirm" role="status">
            <div>
              <b>
                {confirmStage <= current
                  ? 'Review recorded milestone'
                  : 'Ready to record this stage?'}
              </b>
              <p>
                {chosen.levels[confirmStage]} · Your progress is self-reported, not automatically
                verified.
              </p>
            </div>
            <div>
              <button type="button" onClick={() => setConfirmStage(null)}>
                Cancel
              </button>
              <button type="button" className="lv-tree-accept" onClick={() => change(confirmStage)}>
                Set stage {confirmStage}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="lv-info-note">
        <HeartPulse size={15} /> For safety, skill stages are self-reported. Some exercises require
        appropriate equipment, preparation, or coaching. XP reflects recorded progress, not medical
        or fitness certification.
      </p>
    </section>
  );
}
