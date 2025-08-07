# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Werewolf (Mafia) game management application built with Next.js 15.4.3 and TypeScript. It provides a digital assistant for moderators running physical Werewolf games, tracking game state, player roles, voting, and game phases.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking (no dedicated script, use directly)
npx tsc --noEmit
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.3 with App Router
- **UI**: React 19.1.0 with Tailwind CSS v4
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React
- **Language**: TypeScript with strict mode enabled

### Core Game Concepts

The application models a Werewolf game with these key entities:

1. **Roles** (`RoleType`): Character identities like werewolf, villager, seer, witch, hunter, etc.
2. **Sheriff System**: An elected position (not a role) that grants 1.5x voting power
3. **Game Phases**: Day (voting/discussion) and Night (role actions)
4. **Death Tracking**: Multiple death reasons (vote, werewolf_kill, witch_poison, etc.)

### State Management Architecture

The entire game state is managed through Zustand store (`src/store/gameStore.ts`) with these key responsibilities:

- **Game Management**: Create, load, save, delete games
- **Player Management**: Role assignment, death tracking, notes
- **Phase Control**: Day/night transitions, voting, night actions
- **Sheriff System**: Election, vote weighting, badge transfer/destruction
- **Action Resolution**: Night action processing, vote counting
- **Logging**: Public and private action logs based on user role (god/player)

### Component Structure

Components are located in `src/components/` and include:
- `PlayerCard`: Individual player display with role, status, notes
- `RoleSelector`: Role assignment interface with quantity limits
- `VotingPanel`: Day voting management with sheriff weight support
- `SheriffElectionPanel`: Sheriff election process with abstain support
- `NightActionPanel`: Night phase role actions
- `NightResultsPanel`: Night death announcements
- `GameControlPanel`: Game flow control
- `GameLogPanel`: Action history display

### Key Implementation Details

1. **Sheriff Voting Weight**: Sheriff has 1.5x vote power, properly displayed in UI (e.g., "3.5 votes")
2. **Role Limits**: Configurable maximum quantities per role type
3. **Death Announcements**: Manual control over when night deaths are revealed
4. **Werewolf Explosion**: Special action allowing werewolves to self-eliminate
5. **Badge Transfer**: When sheriff dies, choose successor or destroy badge
6. **Abstain Voting**: Players can abstain from voting in elections

### Path Aliases

TypeScript configured with `@/` alias pointing to `./src/` directory.

## Debugging Support

VS Code launch configurations available for:
- Server-side debugging
- Client-side Chrome debugging  
- Full stack debugging

## Game Flow Implementation

1. **Setup Phase**: Configure player count, assign roles
2. **Sheriff Election** (optional): Candidates, voting, election
3. **Night Phase**: Role actions (werewolf kill, seer check, witch actions, guard protect)
4. **Night Resolution**: Process actions, determine deaths
5. **Day Phase**: Announce deaths, discussion, voting
6. **Day Resolution**: Eliminate voted player
7. **Win Condition Check**: After each elimination
8. **Phase Transition**: Alternate between day/night until game ends

## Chinese Language Support

The application includes Chinese text in comments and game descriptions. Role names and many UI elements support both English identifiers and Chinese display names.