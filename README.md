# LifeVerse ✦

**Your life, inside one interactive world.**

LifeVerse is an anime-inspired personal dashboard built around an illustrated nighttime bedroom. Instead of navigating a conventional dashboard, you interact with objects in the room to access tools for studying, productivity, fitness, exploration, personal reflection, and entertainment.

The project combines an atmospheric visual experience with practical tools and a shared progression system.

## Features

- **Interactive bedroom:** Illustrated room, clickable hotspots, camera movement, transitions, and custom room artwork.
- **Avatar Studio:** Customize avatar colors and appearance with layered artwork, presets, and saved looks.
- **Productivity Hub:** Manage tasks, habits, personal goals, and activity progress.
- **Fitness Hub:** Record workouts, track exercise sets, review workout history, and progress through calisthenics skills.
- **Explore Hub:** Discover mapped places, complete regional expeditions, and answer geography trivia.
- **Study Hub:** Organize courses, study notes, learning resources, reflections, and academic journals.
- **My Journal:** Create, search, edit, and delete dated journal entries with optional moods.
- **Focus and Arcade:** Dedicated experiences for focused work and interactive games.
- **Life Planner and Dream Board:** Organize personal plans and aspirations.
- **Achievements and progression:** Earn XP, level up, unlock milestones, and personalize profile rewards.
- **Insights:** Review dated activity, weekly reflections, and progress across hubs.
- **Local backups:** Export and restore personal progress using JSON backups.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- CSS
- Tailwind CSS 4
- Motion
- Lucide React
- Browser localStorage

LifeVerse currently runs without a required backend, account system, or paid API. Personal data is stored locally in the browser.

## Getting Started

### Requirements

- Node.js compatible with the installed Vite version
- npm

### Installation

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd lifeverse
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

To create and preview a production build:

```bash
npm run build
npm run preview
```

### Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Run TypeScript checks and build the application |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
| `npm run test:explore` | Run Explore regression tests |
| `npm run test:study` | Run Study regression tests |
| `npm run test:journal` | Run Journal regression tests |

## Data and Privacy

- Application progress and preferences are stored in browser localStorage.
- Avatar customization uses separate local storage data.
- JSON backup and restore help preserve progress when moving between environments.
- Browser data is not automatically synchronized between devices.
- Local storage is not encrypted. Avoid entering passwords or other sensitive information into journal entries or notes.
- Clearing browser data or changing the browser origin can make existing progress unavailable unless it has been backed up.

## Project Structure

```text
src/
  App.tsx
  App.css
  index.css
  components/
    dashboard/
    room/
  features/
    arcade/
    explore/
    fitness/
    focus/
    guide/
    life/
    productivity/
    study/
public/
  audio/
  characters/
  images/
scripts/
```

The application entry point and room navigation live in `src/App.tsx`. Reusable room and dashboard components are separated from individual feature modules. Static artwork, character assets, and audio files are kept in `public/`.

## Current Status

LifeVerse is an actively developed personal portfolio project. Features and interface details may continue to evolve.

The production build has been verified locally. Additional work may include performance optimization, improved mobile usability, accessibility refinements, broader automated UI testing, and optional backend synchronization.

---

Built as a personal project exploring interactive UI design, React, TypeScript, and gamified productivity.
