import type { RoomZone } from './Room2D';
export const cameraTargets: Record<RoomZone, { x: number; y: number; scale: number }> = {
  desk: { x: 26, y: 45, scale: 2.5 },
  fitness: { x: 85, y: 72, scale: 2.4 },
  globe: { x: 78, y: 39, scale: 2.45 },
  trophies: { x: 81, y: 21, scale: 2.45 },
  study: { x: 10, y: 27, scale: 2.45 },
  focus: { x: 18, y: 38, scale: 2.45 },
  planner: { x: 35.8, y: 30.5, scale: 2.55 },
  arcade: { x: 18.0, y: 67.8, scale: 2.92 },
};
