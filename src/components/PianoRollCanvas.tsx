import React, { useRef, useEffect } from 'react';
import { SongNote, PitchRecord, Particle, FloatingText, Song } from '../types';
import { SUNSHINE_NOTES } from '../songs/sunshine';
import { getOctaveFoldedDistance, alignMidiToTargetOctave, midiToNoteName } from '../audio/pitchDetector';

interface PianoRollCanvasProps {
  currentTime: number;
  currentMidi: number | null;
  isVoiced: boolean;
  activeSinger: 'P1' | 'P2';
  ghostPitchHistory?: PitchRecord[];
  onScoreFrame?: (isHit: boolean, note: SongNote | null, distance: number) => void;
  isCountIn: boolean;
  countInSec: number;
  song?: Song;
}

export const PianoRollCanvas: React.FC<PianoRollCanvasProps> = ({
  currentTime,
  currentMidi,
  isVoiced,
  activeSinger,
  ghostPitchHistory,
  onScoreFrame,
  isCountIn,
  countInSec,
  song,
}) => {
  const activeSongNotes = song?.notes || SUNSHINE_NOTES;
  const hintText = song?.firstNoteHint || 'First Note: "You" (C4) at the hit line';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatersRef = useRef<FloatingText[]>([]);
  const lastScoreEvaluationRef = useRef<number>(0);
  const noteHitsMapRef = useRef<Map<number, number>>(new Map()); // noteId -> hits count
  const liveTrailRef = useRef<{ time: number; midi: number; isVoiced: boolean; isHit: boolean }[]>([]);
  const playerOctaveShiftRef = useRef<number>(0);

  // Canvas configuration
  const HIT_LINE_X = 150;
  const PX_PER_SEC = 140;

  // Center vertical range on active song notes (2-octave responsive window)
  const songMidiValues = activeSongNotes.map((n) => n.midi);
  const songCenterMidi = songMidiValues.length > 0
    ? songMidiValues.reduce((a, b) => a + b, 0) / songMidiValues.length
    : 62;
  const MIN_MIDI = Math.max(36, Math.floor(songCenterMidi - 12));
  const MAX_MIDI = Math.min(88, Math.ceil(songCenterMidi + 12));
  const MIDI_SPAN = MAX_MIDI - MIN_MIDI;

  // Converts MIDI note to Y coordinate on canvas
  const midiToY = (midi: number, height: number): number => {
    const clamped = Math.max(MIN_MIDI - 0.5, Math.min(MAX_MIDI + 0.5, midi));
    const ratio = (clamped - MIN_MIDI) / MIDI_SPAN;
    const padding = 35;
    const availableHeight = height - padding * 2;
    // Invert: higher pitch = top of canvas (lower Y)
    return height - padding - ratio * availableHeight;
  };

  // Helper to spawn hit particles
  const spawnHitParticles = (x: number, y: number, color: string) => {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 20 + Math.random() * 15,
      });
    }
  };

  // Helper to spawn floating score text
  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    floatersRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      scale: 1.0,
      vy: -1.2,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Responsive sizing with device pixel ratio
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Arcade Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Horizontal pitch guideline bars within [MIN_MIDI, MAX_MIDI]
      const keyMidis = [36, 40, 43, 45, 48, 50, 52, 55, 57, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 84].filter(
        (m) => m >= MIN_MIDI && m <= MAX_MIDI
      );
      keyMidis.forEach((midi) => {
        const y = midiToY(midi, height);
        const isC = midi % 12 === 0;

        ctx.beginPath();
        ctx.strokeStyle = isC ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isC ? 1.5 : 1;
        ctx.setLineDash(isC ? [] : [4, 6]);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pitch labels on left margin
        const noteName = midiToNoteName(midi).fullName;
        ctx.font = '600 10px "Chakra Petch", sans-serif';
        ctx.fillStyle = isC ? 'rgba(96, 165, 250, 0.8)' : 'rgba(148, 163, 184, 0.4)';
        ctx.fillText(noteName, 12, y + 3);
      });

      // 2. Identify Current Target Note at Hit Line
      const activeTargetNote = activeSongNotes.find(
        (n) => currentTime >= n.start - 0.05 && currentTime <= n.end + 0.05
      ) || null;

      let isHitNow = false;
      let alignedPlayerMidi: number | null = null;
      let scoreDistance = 999;

      if (isVoiced && currentMidi !== null) {
        // Reference note for octave folding: active note if singing a note, or song center
        const targetRef = activeTargetNote ? activeTargetNote.midi : songCenterMidi;

        // Hysteresis octave tracking: keep octave stable unless player moves > 7 semitones outside
        const currentShift = playerOctaveShiftRef.current;
        const currentDiff = targetRef - (currentMidi + currentShift);
        if (Math.abs(currentDiff) > 7) {
          playerOctaveShiftRef.current = Math.round((targetRef - currentMidi) / 12) * 12;
        }

        alignedPlayerMidi = currentMidi + playerOctaveShiftRef.current;

        if (activeTargetNote) {
          scoreDistance = Math.abs(alignedPlayerMidi - activeTargetNote.midi);
          // Strict physical contact: indicator pointer must physically touch target note block (±0.85 semitones)
          isHitNow = scoreDistance <= 0.85;
        }

        // Add to live singing ribbon trail
        liveTrailRef.current.push({
          time: currentTime,
          midi: alignedPlayerMidi,
          isVoiced: true,
          isHit: isHitNow,
        });
      }

      // Prune trail points older than 2.8 seconds
      liveTrailRef.current = liveTrailRef.current.filter(
        (pt) => currentTime - pt.time <= 2.8 && pt.time <= currentTime + 0.05
      );

      // Trigger score callback at ~30Hz rate
      const nowMs = performance.now();
      if (nowMs - lastScoreEvaluationRef.current > 30) {
        lastScoreEvaluationRef.current = nowMs;
        if (onScoreFrame) {
          onScoreFrame(isHitNow, activeTargetNote, scoreDistance);
        }

        if (isHitNow && activeTargetNote) {
          const currentCount = (noteHitsMapRef.current.get(activeTargetNote.id) || 0) + 1;
          noteHitsMapRef.current.set(activeTargetNote.id, currentCount);

          // Spawn occasional floating text on sustained hit
          if (currentCount % 12 === 1) {
            const isPerfect = scoreDistance <= 0.4;
            spawnFloatingText(
              HIT_LINE_X + 20,
              midiToY(activeTargetNote.midi, height) - 18,
              isPerfect ? 'PERFECT! +100' : 'GOOD! +50',
              isPerfect ? '#34d399' : '#38bdf8'
            );
          }
        }
      }

      // 4. Draw Ghost Contour (Player 1 performance during Player 2's turn)
      if (ghostPitchHistory && ghostPitchHistory.length > 0 && activeSinger === 'P2') {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
        ctx.shadowBlur = 6;

        let startedGhostPath = false;
        ctx.beginPath();

        ghostPitchHistory.forEach((pt) => {
          const x = HIT_LINE_X + (pt.time - currentTime) * PX_PER_SEC;
          if (x >= -50 && x <= width + 50) {
            const raw = pt.rawMidi || pt.midi;
            const alignedMidi = alignMidiToTargetOctave(raw, songCenterMidi);
            const y = midiToY(alignedMidi, height);

            if (!startedGhostPath) {
              ctx.moveTo(x, y);
              startedGhostPath = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        if (startedGhostPath) {
          ctx.stroke();
        }
        ctx.restore();

        // Ghost marker right at hit line
        const currentGhostSample = ghostPitchHistory.find(
          (p) => Math.abs(p.time - currentTime) < 0.08
        );
        if (currentGhostSample) {
          const raw = currentGhostSample.rawMidi || currentGhostSample.midi;
          const ghostY = midiToY(alignMidiToTargetOctave(raw, songCenterMidi), height);
          ctx.save();
          ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(HIT_LINE_X, ghostY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Small ghost label
          ctx.font = '700 9px "Chakra Petch", sans-serif';
          ctx.fillStyle = '#67e8f9';
          ctx.fillText('P1 GHOST', HIT_LINE_X - 54, ghostY + 3);
          ctx.restore();
        }
      }

      // 4.5. Draw Player Live Singing Ribbon Trail
      if (liveTrailRef.current.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < liveTrailRef.current.length; i++) {
          const p1 = liveTrailRef.current[i - 1];
          const p2 = liveTrailRef.current[i];

          // Skip if there was a pause or silence
          if (p2.time - p1.time > 0.12) continue;

          const x1 = HIT_LINE_X + (p1.time - currentTime) * PX_PER_SEC;
          const y1 = midiToY(p1.midi, height);
          const x2 = HIT_LINE_X + (p2.time - currentTime) * PX_PER_SEC;
          const y2 = midiToY(p2.midi, height);

          if (x2 < -30 || x1 > width + 30) continue;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const trailColor = p2.isHit ? '#34d399' : (activeSinger === 'P1' ? '#38bdf8' : '#f472b6');
          ctx.strokeStyle = trailColor;
          ctx.lineWidth = p2.isHit ? 4 : 2.5;
          ctx.shadowColor = trailColor;
          ctx.shadowBlur = p2.isHit ? 8 : 4;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Draw Target Note Blocks
      activeSongNotes.forEach((note) => {
        const noteX = HIT_LINE_X + (note.start - currentTime) * PX_PER_SEC;
        const noteWidth = (note.end - note.start) * PX_PER_SEC;
        const noteY = midiToY(note.midi, height);
        const noteHeight = 10;

        // Skip notes off-screen
        if (noteX + noteWidth < -50 || noteX > width + 50) return;

        const isNoteActive = currentTime >= note.start && currentTime <= note.end;
        const isNoteHit = isNoteActive && isHitNow;

        ctx.save();

        // Note Block Body
        const radius = 6;
        ctx.beginPath();
        ctx.roundRect(noteX, noteY - noteHeight / 2, noteWidth, noteHeight, radius);

        if (isNoteHit) {
          // Flashing intense green hit state
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
        } else if (isNoteActive) {
          // Currently under hit line but not hitting
          ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
        } else if (currentTime > note.end) {
          // Past note
          ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
          ctx.lineWidth = 1;
        } else {
          // Upcoming note
          const gradient = ctx.createLinearGradient(noteX, noteY, noteX + noteWidth, noteY);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#8b5cf6');
          ctx.fillStyle = gradient;
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = '#c4b5fd';
          ctx.lineWidth = 1.5;
        }

        ctx.fill();
        ctx.stroke();

        // Inner glowing progress bar for active note
        if (isNoteActive) {
          const elapsed = (currentTime - note.start) / (note.end - note.start);
          const progressW = Math.max(0, Math.min(noteWidth, elapsed * noteWidth));
          ctx.fillStyle = isNoteHit ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(noteX, noteY - noteHeight / 2, progressW, noteHeight, radius);
          ctx.fill();
        }

        // Note Lyric Label
        ctx.shadowBlur = 0;
        ctx.font = '700 12px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.lyric, noteX + noteWidth / 2, noteY);

        ctx.restore();
      });

      // 6. Draw Hit Line (x = 150)
      ctx.save();
      const hitGlowColor = isHitNow ? '#34d399' : activeSinger === 'P1' ? '#38bdf8' : '#f472b6';
      ctx.strokeStyle = hitGlowColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = hitGlowColor;
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(HIT_LINE_X, 10);
      ctx.lineTo(HIT_LINE_X, height - 10);
      ctx.stroke();

      // Top and bottom hit line markers
      ctx.fillStyle = hitGlowColor;
      ctx.beginPath();
      ctx.arc(HIT_LINE_X, 10, 4, 0, Math.PI * 2);
      ctx.arc(HIT_LINE_X, height - 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 7. Draw Live Pitch Indicator Dot & Trail
      if (isVoiced && alignedPlayerMidi !== null) {
        const userY = midiToY(alignedPlayerMidi, height);
        const singerColor = activeSinger === 'P1' ? '#38bdf8' : '#f472b6';
        const hitColor = '#34d399';
        const activeColor = isHitNow ? hitColor : singerColor;

        // Particle emitter on hit
        if (isHitNow) {
          spawnHitParticles(HIT_LINE_X, userY, activeColor);
        }

        ctx.save();
        // Outer glowing pulse ring
        ctx.beginPath();
        ctx.arc(HIT_LINE_X, userY, isHitNow ? 18 : 13, 0, Math.PI * 2);
        ctx.fillStyle = isHitNow ? 'rgba(52, 211, 153, 0.25)' : 'rgba(56, 189, 248, 0.2)';
        ctx.fill();

        // Inner solid glowing orb
        ctx.beginPath();
        ctx.arc(HIT_LINE_X, userY, isHitNow ? 10 : 8, 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = isHitNow ? 24 : 14;
        ctx.fill();

        // Bright white center highlight
        ctx.beginPath();
        ctx.arc(HIT_LINE_X, userY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Octave register tag (e.g. "8vb" or "✓")
        if (currentMidi !== null) {
          const octaveOffset = Math.round((currentMidi - (activeTargetNote ? activeTargetNote.midi : songCenterMidi)) / 12);
          const tag = octaveOffset === 0 ? '✓' : octaveOffset < 0 ? `${Math.abs(octaveOffset)} 8vb` : `+${octaveOffset} 8va`;
          ctx.font = '700 9px "Chakra Petch", sans-serif';
          ctx.fillStyle = isHitNow ? '#34d399' : '#94a3b8';
          ctx.fillText(tag, HIT_LINE_X + 16, userY + 3);
        }

        ctx.restore();
      }

      // 8. Update & Draw Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // Filter dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      // 9. Update & Draw Floating Text
      floatersRef.current.forEach((f) => {
        f.y += f.vy;
        f.alpha -= 0.025;

        ctx.save();
        ctx.globalAlpha = Math.max(0, f.alpha);
        ctx.font = '800 12px "Press Start 2P", monospace';
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 8;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });
      floatersRef.current = floatersRef.current.filter((f) => f.alpha > 0);

      // 10. Count-in Overlay if active
      if (isCountIn && countInSec > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(3, 7, 18, 0.6)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 36px "Press Start 2P", monospace';
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 20;

        const countLabel = countInSec <= 1 ? 'READY! 1' : countInSec <= 2 ? 'GET SET... 2' : '3';
        ctx.fillText(countLabel, width / 2, height / 2 - 10);

        ctx.font = '600 16px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.shadowBlur = 0;
        ctx.fillText(hintText, width / 2, height / 2 + 35);
        ctx.restore();
      }

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentTime, currentMidi, isVoiced, activeSinger, ghostPitchHistory, isCountIn, countInSec, onScoreFrame, song, activeSongNotes, hintText]);

  return (
    <div className="relative w-full h-[360px] md:h-[400px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {/* Subtle retro scanline texture */}
      <div className="absolute inset-0 arcade-scanlines pointer-events-none opacity-40" />
      <div className="absolute inset-0 arcade-vignette pointer-events-none opacity-60" />

      {/* Hit Line Legend Badge */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono">HIT LINE x=150</span>
        <span className="text-slate-600">·</span>
        <span className="text-emerald-400">Smart Octave Tracking · ±0.85 Physical Hit Window</span>
      </div>
    </div>
  );
};
