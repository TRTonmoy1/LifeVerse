import { milestones } from './milestones';
import { earnedXp, levelForXp, type LifeData, type RewardsData } from './lifeData';

export type Reward = {
  id: string;
  name: string;
  description: string;
  requirement: string;
  kind: 'title' | 'aura';
  milestone?: string;
  level?: number;
};
export const rewards: Reward[] = [
  {
    id: 'traveler',
    name: 'The Beginning',
    description: 'A story still unfolding.',
    requirement: 'Available from the start',
    kind: 'title',
  },
  {
    id: 'doer',
    name: 'Quest Starter',
    description: 'For taking that first step.',
    requirement: 'First victory achievement',
    kind: 'title',
    milestone: 'first-task',
  },
  {
    id: 'disciple',
    name: 'Steady Spirit',
    description: 'Built by showing up again.',
    requirement: 'Creature of habit achievement',
    kind: 'title',
    milestone: 'ritual',
  },
  {
    id: 'atlas',
    name: 'Atlas Scout',
    description: 'Curiosity has no borders.',
    requirement: 'Atlas scout achievement',
    kind: 'title',
    milestone: 'atlas-scout',
  },
  {
    id: 'strong',
    name: 'Trailblazer',
    description: 'Your training journey continues.',
    requirement: 'Showing up achievement',
    kind: 'title',
    milestone: 'consistent',
  },
  {
    id: 'wanderer',
    name: 'World Wanderer',
    description: 'A horizon-chasing explorer.',
    requirement: 'World wanderer achievement',
    kind: 'title',
    milestone: 'world-wanderer',
  },
  {
    id: 'ascendant',
    name: 'Rising Hero',
    description: 'Earned through steady progress.',
    requirement: 'Reach level 5',
    kind: 'title',
    level: 5,
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    description: 'The classic LifeVerse atmosphere.',
    requirement: 'Available from the start',
    kind: 'aura',
  },
  {
    id: 'verdant',
    name: 'Verdant Dawn',
    description: 'An emerald glow around your portrait.',
    requirement: 'Training begins achievement',
    kind: 'aura',
    milestone: 'first-workout',
  },
  {
    id: 'ember',
    name: 'Emberlight',
    description: 'A warm amber portrait glow.',
    requirement: 'Complete 7 habit check-ins',
    kind: 'aura',
    milestone: 'ritual',
  },
  {
    id: 'starlit',
    name: 'Starlit Voyager',
    description: 'A cosmic blue-violet atmosphere.',
    requirement: 'First footsteps achievement',
    kind: 'aura',
    milestone: 'first-discovery',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'A golden reward for growing.',
    requirement: 'Reach level 5',
    kind: 'aura',
    level: 5,
  },
  {
    id: 'scholar',
    name: 'Scholar in Motion',
    description: 'For turning effort into understanding.',
    requirement: 'Learning begins achievement',
    kind: 'title',
    milestone: 'first-subject',
  },
  {
    id: 'aurora-notes',
    name: 'Aurora Notes',
    description: 'A calm teal-violet study aura.',
    requirement: 'Reflective learner achievement',
    kind: 'aura',
    milestone: 'reflective-learner',
  },
];
export function rewardUnlocked(reward: Reward, data: LifeData): boolean {
  if (reward.level && levelForXp(earnedXp(data).total).level < reward.level) return false;
  if (
    reward.milestone &&
    !milestones(data).some((item) => item.id === reward.milestone && item.achieved)
  )
    return false;
  return true;
}
export function validRewardSelection(data: LifeData): RewardsData {
  const selected = data.rewards ?? { title: 'traveler', aura: 'moonlight' };
  const title = rewards.find((item) => item.kind === 'title' && item.id === selected.title);
  const aura = rewards.find((item) => item.kind === 'aura' && item.id === selected.aura);
  return {
    title: title && rewardUnlocked(title, data) ? title.id : 'traveler',
    aura: aura && rewardUnlocked(aura, data) ? aura.id : 'moonlight',
  };
}
export function titleById(id: string) {
  return rewards.find((item) => item.id === id && item.kind === 'title') ?? rewards[0];
}
export function auraById(id: string) {
  return rewards.find((item) => item.id === id && item.kind === 'aura') ?? rewards[7];
}
