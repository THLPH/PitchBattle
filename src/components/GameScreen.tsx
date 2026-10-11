import React from 'react';
import { TunerState, PlayerStats, Song, SongNote } from '../types';
import { TunerDisplay } from './TunerDisplay';
import { PianoRollCanvas } from './PianoRollCanvas';
import { SUNSHINE_NOTES } from '../songs/sunshine';

interface GameScreenProps {
  tunerState: TunerState;
  p1Stats: PlayerStats;
  p2Stats: PlayerStats;
  currentTime: number;
  activeSinger: 'P1' | 'P2';
  isCountIn: boolean;
  countInSec: number;
  handleScoreFrame: (isHit: boolean, targetNote: SongNote | null, distance: number) => void;
  onQuit: () => void;
  song?: Song;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  tunerState,
  p1Stats,
  p2Stats,
  currentTime,
  activeSinger,
  isCountIn,
  countInSec,
  handleScoreFrame,
  onQuit,
  song,
}) => {
  const activeSongNotes = song?.notes || SUNSHINE_NOTES;
  const activeTargetNote = activeSongNotes.find(
    (n) => currentTime >= n.start - 0.1 && currentTime <= n.end + 0.1
  );

  return (
    <div className="w-full flex flex-col gap-4 max-w-6xl mx-auto px-4 lg:px-8 py-4">
      <section className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-badge-score text-badge-score text-primary uppercase tracking-widest bg-primary-fixed px-2.5 py-0.5 rounded-full">Duello dal Vivo • Salotto Lirico</span>
            <span className="inline-flex items-center gap-1.5 font-meter-readout text-badge-score text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
              SYNC PITCH 12ms
            </span>
          </div>
          <h1 className="font-display-hero text-headline-battle text-on-surface mt-1">
            {song?.title || "You Are My Sunshine"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end bg-surface-container-low px-4 py-2 rounded-xl shadow-sm">
            <span className="font-body-subtle text-body-subtle text-secondary uppercase tracking-wider">Round Corrente</span>
            <div className="flex items-baseline gap-1">
              <span className="font-meter-readout text-headline-battle text-on-surface font-bold leading-none">{activeSinger === 'P1' ? '01' : '02'}</span>
              <span className="font-meter-readout text-body-subtle text-secondary">/ 02</span>
            </div>
          </div>
          <div className="flex flex-col items-end bg-primary/10 px-4 py-2 rounded-xl shadow-sm">
            <span className="font-body-subtle text-body-subtle text-primary uppercase tracking-wider">Premio Sfida</span>
            <span className="font-meter-readout text-body-lyric-lg text-primary font-bold leading-none">+350 ELO</span>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest rounded-xl shadow-md p-4 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="font-meter-readout text-badge-score text-secondary uppercase font-semibold">Target Pitch:</span>
              <span className="font-meter-readout text-body-default text-tertiary font-bold">{activeTargetNote ? activeTargetNote.lyric + " (" + activeTargetNote.midi + ")" : "--"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-badge-score text-badge-score font-bold">
              Combo: {activeSinger === 'P1' ? p1Stats.currentCombo : p2Stats.currentCombo}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-score text-badge-score font-bold">
              Score: {activeSinger === 'P1' ? p1Stats.score : p2Stats.score}
            </span>
          </div>
        </div>

        <div className="relative w-full rounded-xl overflow-hidden shadow-inner">
           <PianoRollCanvas
              currentTime={currentTime}
              currentMidi={tunerState.midi}
              isVoiced={tunerState.isVoiced}
              activeSinger={activeSinger}
              ghostPitchHistory={activeSinger === 'P2' ? p1Stats.pitchHistory : undefined}
              onScoreFrame={handleScoreFrame}
              isCountIn={isCountIn}
              countInSec={countInSec}
              song={song}
            />
        </div>

        <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {activeSongNotes.map((note) => {
              const isCurrent = currentTime >= note.start && currentTime <= note.end;
              const isPassed = currentTime > note.end;
              return (
                <span
                  key={note.id}
                  className={`text-xs px-2 py-0.5 rounded transition font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'bg-primary text-on-primary font-bold scale-105'
                      : isPassed
                      ? 'text-secondary'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {note.lyric}
                </span>
              );
            })}
          </div>
          <button
            onClick={onQuit}
            className="text-xs text-on-surface-variant hover:text-primary px-3 py-1 rounded bg-surface-container-high border border-outline-variant/50 whitespace-nowrap shrink-0 transition"
          >
            Quit Song
          </button>
        </div>
      </section>
    </div>
  );
};
