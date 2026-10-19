import { earnedXp, skillKeys, type LifeData } from './lifeData';
export type Milestone = {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  icon: 'star' | 'fitness' | 'task' | 'skill' | 'explore' | 'study';
};
export function milestones(data: LifeData): Milestone[] {
  const finished = data.tasks.filter((t) => t.completedAt).length;
  const workouts = new Set(data.workouts.map((w) => w.date)).size;
  const habits = data.habits.reduce((n, h) => n + h.completedDates.length, 0);
  const stages = skillKeys.reduce((n, key) => n + data.skills[key], 0);
  const xp = earnedXp(data).total;
  const mapped = data.explore.discovered.length;
  const answers = data.explore.quizSolved.length;
  const studyEntries = data.study.entries.length;
  const reflections = data.study.entries.filter((entry) => entry.kind === 'reflection').length;
  const resources = data.study.entries.filter((entry) => entry.kind === 'resource').length;
  return [
    {
      id: 'first-task',
      name: 'First victory',
      description: 'Complete your first task',
      achieved: finished >= 1,
      icon: 'task',
    },
    {
      id: 'first-workout',
      name: 'Training begins',
      description: 'Log your first workout day',
      achieved: workouts >= 1,
      icon: 'fitness',
    },
    {
      id: 'ritual',
      name: 'Creature of habit',
      description: 'Complete 7 habit check-ins',
      achieved: habits >= 7,
      icon: 'task',
    },
    {
      id: 'apprentice',
      name: 'Skill apprentice',
      description: 'Record 3 calisthenics stages',
      achieved: stages >= 3,
      icon: 'skill',
    },
    {
      id: 'consistent',
      name: 'Showing up',
      description: 'Train on 5 different days',
      achieved: workouts >= 5,
      icon: 'fitness',
    },
    {
      id: 'level5',
      name: 'Rising hero',
      description: 'Reach LifeVerse level 5',
      achieved: xp >= 1000,
      icon: 'star',
    },
    {
      id: 'first-discovery',
      name: 'First footsteps',
      description: 'Discover your first place on the atlas',
      achieved: mapped >= 1,
      icon: 'explore',
    },
    {
      id: 'atlas-scout',
      name: 'Atlas scout',
      description: 'Discover 15 mapped places',
      achieved: mapped >= 15,
      icon: 'explore',
    },
    {
      id: 'trivia-trail',
      name: 'Curious mind',
      description: 'Solve 10 unique geography questions',
      achieved: answers >= 10,
      icon: 'explore',
    },
    {
      id: 'world-wanderer',
      name: 'World wanderer',
      description: 'Discover 40 mapped places',
      achieved: mapped >= 40,
      icon: 'explore',
    },
    {
      id: 'first-subject',
      name: 'Learning begins',
      description: 'Create your first subject in Study Hub',
      achieved: data.study.subjects.length >= 1,
      icon: 'study',
    },
    {
      id: 'note-keeper',
      name: 'Note keeper',
      description: 'Save 5 study entries',
      achieved: studyEntries >= 5,
      icon: 'study',
    },
    {
      id: 'reflective-learner',
      name: 'Reflective learner',
      description: 'Write 3 study reflections',
      achieved: reflections >= 3,
      icon: 'study',
    },
    {
      id: 'resourceful-mind',
      name: 'Resourceful mind',
      description: 'Save 4 study resources',
      achieved: resources >= 4,
      icon: 'study',
    },
    {
      id: 'goal-setter',
      name: 'Goal getter',
      description: 'Finish 3 personal goals',
      achieved: data.goals.filter((g) => g.completedAt && g.progress >= g.target).length >= 3,
      icon: 'task',
    },
    {
      id: 'training-journey',
      name: 'Committed challenger',
      description: 'Train on 12 different days',
      achieved: workouts >= 12,
      icon: 'fitness',
    },
    {
      id: 'master-learner',
      name: 'Curiosity champion',
      description: 'Answer 25 unique geography questions',
      achieved: answers >= 25,
      icon: 'explore',
    },
    {
      id: 'skill-builder',
      name: 'Skill architect',
      description: 'Complete 10 skill stages',
      achieved: stages >= 10,
      icon: 'skill',
    },
  ];
}
