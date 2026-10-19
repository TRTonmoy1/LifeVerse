import { useState } from 'react';
import { Check, Crown, LockKeyhole, Sparkles } from 'lucide-react';
import { type LifeData } from './lifeData';
import { rewards, rewardUnlocked, validRewardSelection, type Reward } from './rewards';

export default function RewardWardrobe({
  data,
  setData,
}: {
  data: LifeData;
  setData: (update: (previous: LifeData) => LifeData) => void;
}) {
  const [tab, setTab] = useState<Reward['kind']>('title');
  const equipped = validRewardSelection(data);
  const items = rewards.filter((reward) => reward.kind === tab);
  const count = rewards.filter((reward) => rewardUnlocked(reward, data)).length;
  function equip(reward: Reward) {
    if (!rewardUnlocked(reward, data)) return;
    setData((previous) =>
      rewardUnlocked(reward, previous)
        ? { ...previous, rewards: { ...validRewardSelection(previous), [reward.kind]: reward.id } }
        : previous,
    );
  }
  return (
    <section className="lv-wardrobe" aria-label="Reward wardrobe">
      <div className="lv-wardrobe-heading">
        <div>
          <span className="lv-wardrobe-eyebrow">
            <Sparkles size={14} /> CHAPTER VII · REWARD WARDROBE
          </span>
          <h3>Wear your progress.</h3>
          <p>
            Unlock collectible titles and portrait auras by living your story. No coins, no
            grinding, no purchases.
          </p>
        </div>
        <span className="lv-wardrobe-count">
          <Crown size={16} />
          {count} / {rewards.length} unlocked
        </span>
      </div>
      <div className="lv-wardrobe-tabs" role="group" aria-label="Reward category">
        <button
          type="button"
          className={tab === 'title' ? 'active' : ''}
          onClick={() => setTab('title')}
        >
          Adventurer titles
        </button>
        <button
          type="button"
          className={tab === 'aura' ? 'active' : ''}
          onClick={() => setTab('aura')}
        >
          Portrait auras
        </button>
      </div>
      <div className="lv-reward-grid">
        {items.map((reward) => {
          const unlocked = rewardUnlocked(reward, data);
          const selected = equipped[tab] === reward.id;
          return (
            <article
              key={reward.id}
              className={`lv-reward-card ${unlocked ? '' : 'is-locked'} ${selected ? 'is-equipped' : ''}`}
            >
              <div
                className={`lv-reward-symbol ${reward.kind === 'aura' ? 'lv-reward-' + reward.id : ''}`}
              >
                {unlocked ? <Sparkles size={22} /> : <LockKeyhole size={21} />}
              </div>
              <div className="lv-reward-detail">
                <h4>{unlocked ? reward.name : '??? · ' + reward.name}</h4>
                <p>{reward.description}</p>
                <small>{unlocked ? 'Unlocked' : reward.requirement}</small>
              </div>
              <button
                type="button"
                disabled={!unlocked || selected}
                onClick={() => equip(reward)}
                aria-label={`${selected ? 'Equipped' : unlocked ? 'Equip' : 'Locked'} ${reward.name}`}
              >
                {selected ? (
                  <>
                    <Check size={13} /> Equipped
                  </>
                ) : unlocked ? (
                  'Equip'
                ) : (
                  'Locked'
                )}
              </button>
            </article>
          );
        })}
      </div>
      <p className="lv-wardrobe-footnote">
        Cosmetic rewards never change XP rates. Equipped selections are included in LifeVerse
        backups; locked rewards cannot be equipped.
      </p>
    </section>
  );
}
