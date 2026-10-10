[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Native%20DSP-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?logo=vercel)](https://pitch-battle-one.vercel.app/)

# PitchBattle

A turn-based 1v1 arcade karaoke battle that runs entirely in the browser. Players take turns singing a track into the mic; their vocal pitch is extracted in real time and scored against target note intervals on a scrolling canvas. Round 2 overlays a "ghost trail" of Player 1's performance so Player 2 can compete head-to-head.

Built for Hacklanta 2026

---

## Why Client-Side?

Most pitch-tracking karaoke apps attempt to stream raw mic audio over WebSockets to a Python backend running heavy models. On crowded hackathon Wi-Fi, this causes latency spikes, audio drift, and dropped packets. 

PitchBattle runs **100% client-side using the Web Audio API**:
- **Zero latency:** Audio processing happens locally at 60 FPS.
- **No external audio assets:** Accompaniment (drums, bass, chord stabs, and guide melody) is procedurally synthesized via Web Audio oscillators and noise buffers—no missing `.mp3` files or CORS issues.
- **Zero server costs:** Deployable as a static bundle on Vercel or GitHub Pages.

---

## Core Architecture

### 1. Pitch Detection (YIN Algorithm)
Implemented in `src/audio/pitchDetector.ts`. Uses the de Cheveigné & Kawahara YIN algorithm (difference function, cumulative mean normalized difference, and parabolic interpolation) directly on time-domain buffers (`Float32Array`).
- Optimized with stepped difference sampling to prevent main-thread UI freezing.
- Runs with low RMS thresholding so quiet built-in laptop microphones register naturally without external gain hardware.

### 2. Octave-Folded Scoring
Scoring human vocals strictly by exact frequency breaks the moment a baritone tries to sing a soprano line. PitchBattle normalizes sung pitches using pitch class modulo:
$$\text{dist} = \min(|(P_{\text{sung}} \pmod{12}) - (P_{\text{target}} \pmod{12})|,\, 12 - \text{diff})$$
Singers can perform in whatever register is comfortable without penalty. Hits within $\pm0.35$ semitones register as **PERFECT**, and within $\pm0.75$ register as **GOOD**.

### 3. Asynchronous 1v1 "Ghost Run"
Instead of fighting multiple input hardware streams on a single machine:
1. **Player 1** sings the track; their raw pitch contour and hits are recorded to an in-memory history buffer.
2. An intermission screen displays P1's stats and prompts to pass the mic.
3. **Player 2** sings the same track while Player 1's historical pitch line renders as a faint cyan ghost trail on the canvas in real time.
4. Final screen calculates streaks, hit percentages, and declares the winner.

---

## Getting Started

### Prerequisites
- Node.js (v18+) or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pitchbattle.git
cd pitchbattle

# Install dependencies
bun install
# or: npm install

# Start local dev server
bun run dev
# or: npm run dev
```

Open `http://localhost:5173` in Chrome or Edge (allow microphone permissions when prompted).

### Production Build

```bash
bun run build
# or: npm run build
```

The compiled static assets will output to `/dist`.

---

## Fallback Controls (Testing / Demo Mode)

If testing in a loud environment or presenting where microphones are unreliable:
- **Keyboard Pitch Simulator:** Press keys `A` through `K` on your keyboard to manually play MIDI notes 60–72 (C4 to C5).
- **Auto-Sing Mode:** Toggle "Auto-Sing" in the audio settings modal to simulate ideal human pitch input with natural micro-vibrato.
```
