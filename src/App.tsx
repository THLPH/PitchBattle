import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStage, PlayerStats, TunerState, SongNote, PitchRecord } from './types';
import { SONG_DURATION, COUNT_IN_DURATION, SUNSHINE_NOTES } from './songs/sunshine';
import { globalAudioEngine } from './audio/audioEngine';
import { ArcadeHeader } from './components/ArcadeHeader';
import { PianoRollCanvas } from './components/PianoRollCanvas';
import { TunerDisplay } from './components/TunerDisplay';
import { StartScreen } from './components/StartScreen';
import { IntermissionScreen } from './components/IntermissionScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { AudioSettingsModal } from './components/AudioSettingsModal';

const INITIAL_PLAYER_STATS: PlayerStats = {
  score: 0,
  maxCombo: 0,
  currentCombo: 0,
  perfectHits: 0,
  goodHits: 0,
  misses: 0,
  totalFramesEvaluated: 0,
  framesHit: 0,
  pitchHistory: [],
};

export default function App() {
  const [stage, setStage] = useState<GameStage>('START');
  const [isSoloMode, setIsSoloMode] = useState<boolean>(false);
  const [micConnected, setMicConnected] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [autoSing, setAutoSing] = useState<boolean>(false);

  // Player stats
  const [p1Stats, setP1Stats] = useState<PlayerStats>({ ...INITIAL_PLAYER_STATS });
  const [p2Stats, setP2Stats] = useState<PlayerStats>({ ...INITIAL_PLAYER_STATS });

  // Song & Audio Real-Time State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [tunerState, setTunerState] = useState<TunerState>({
    hz: null,
    midi: null,
    noteName: '--',
    cents: 0,
    rms: 0,
    clarity: 0,
    isVoiced: false,
  });

  const lastSongTimeRef = useRef<number>(0);
  const stageRef = useRef<GameStage>(stage);
  stageRef.current = stage;

  // Active singer helper
  const activeSinger = stage === 'P2_SINGING' || stage === 'P2_COUNTDOWN' ? 'P2' : 'P1';

  // Connect microphone
  const handleConnectMic = useCallback(async (): Promise<boolean> => {
    const success = await globalAudioEngine.setupMicrophone();
    setMicConnected(success);
    return success;
  }, []);

  // Keyboard pitch simulator mapping for testing without mic
  useEffect(() => {
    const keyToMidiMap: Record<string, number> = {
      a: 60, // C4
      w: 61, // C#4
      s: 62, // D4
      e: 63, // D#4
      d: 64, // E4
      f: 65, // F4
      t: 66, // F#4
      g: 67, // G4
      y: 68, // G#4
      h: 69, // A4
      u: 70, // A#4
      j: 71, // B4
      k: 72, // C5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyToMidiMap[key]) {
        globalAudioEngine.setVirtualMidi(keyToMidiMap[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToMidiMap[key]) {
        globalAudioEngine.setVirtualMidi(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main real-time audio polling loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const currentStage = stageRef.current;
      const isSingingStage = currentStage === 'P1_SINGING' || currentStage === 'P2_SINGING';

      const songTime = isSingingStage ? globalAudioEngine.getSongTime() : 0;
      setCurrentTime(songTime);
      lastSongTimeRef.current = songTime;

      // Sample pitch from microphone / YIN engine
      const pitchResult = globalAudioEngine.getPitch(songTime);
      setTunerState({
        hz: pitchResult.hz,
        midi: pitchResult.midi,
        noteName: pitchResult.noteName,
        cents: pitchResult.cents,
        rms: pitchResult.rms,
        clarity: pitchResult.clarity,
        isVoiced: pitchResult.isVoiced,
      });

      // Song completion check
      if (isSingingStage && songTime >= SONG_DURATION) {
        globalAudioEngine.stopSong();
        if (currentStage === 'P1_SINGING') {
          if (isSoloMode) {
            globalAudioEngine.playVictoryFanfare();
            setStage('WINNER');
          } else {
            setStage('INTERMISSION');
          }
        } else if (currentStage === 'P2_SINGING') {
          globalAudioEngine.playVictoryFanfare();
          setStage('WINNER');
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isSoloMode]);

  // Scoring Frame Handler from PianoRollCanvas
  const handleScoreFrame = useCallback(
    (isHit: boolean, targetNote: SongNote | null, distance: number) => {
      const currentStage = stageRef.current;
      if (currentStage !== 'P1_SINGING' && currentStage !== 'P2_SINGING') return;

      const isP1 = currentStage === 'P1_SINGING';
      const setter = isP1 ? setP1Stats : setP2Stats;

      setter((prev) => {
        let newCombo = prev.currentCombo;
        let newScore = prev.score;
        let newPerfect = prev.perfectHits;
        let newGood = prev.goodHits;
        let newMisses = prev.misses;

        if (targetNote) {
          if (isHit) {
            newCombo += 1;
            const multiplier = newCombo >= 30 ? 3.0 : newCombo >= 15 ? 2.0 : newCombo >= 5 ? 1.5 : 1.0;
            const isPerfect = distance <= 0.35;
            const basePoints = isPerfect ? 100 : 50;
            newScore += Math.round(basePoints * multiplier);

            if (isPerfect) newPerfect += 1;
            else newGood += 1;

            // Trigger hit ding sound on combo milestones
            if (newCombo % 10 === 0) {
              globalAudioEngine.playHitSound(true);
            }
          } else {
            newCombo = 0;
            newMisses += 1;
          }
        }

        const maxCombo = Math.max(prev.maxCombo, newCombo);
        const totalFrames = targetNote ? prev.totalFramesEvaluated + 1 : prev.totalFramesEvaluated;
        const framesHit = isHit && targetNote ? prev.framesHit + 1 : prev.framesHit;

        // Record pitch contour history point
        const newPitchPoint: PitchRecord | null =
          tunerState.midi !== null
            ? {
                time: lastSongTimeRef.current,
                midi: tunerState.midi,
                rawMidi: tunerState.midi,
                hit: isHit,
                targetMidi: targetNote ? targetNote.midi : null,
              }
            : null;

        return {
          ...prev,
          score: newScore,
          currentCombo: newCombo,
          maxCombo,
          perfectHits: newPerfect,
          goodHits: newGood,
          misses: newMisses,
          totalFramesEvaluated: totalFrames,
          framesHit,
          pitchHistory: newPitchPoint ? [...prev.pitchHistory, newPitchPoint] : prev.pitchHistory,
        };
      });
    },
    [tunerState.midi]
  );

  // Start Player 1 turn
  const handleStartGame = async () => {
    // If mic not yet connected, attempt once (or proceed anyway with simulator)
    if (!micConnected) {
      await handleConnectMic();
    }
    setP1Stats({ ...INITIAL_PLAYER_STATS });
    setP2Stats({ ...INITIAL_PLAYER_STATS });
    setStage('P1_SINGING');
    await globalAudioEngine.startSong();
  };

  // Start Player 2 turn
  const handleStartPlayer2 = async () => {
    setStage('P2_SINGING');
    await globalAudioEngine.startSong();
  };

  // Play Again / Reset
  const handlePlayAgain = () => {
    globalAudioEngine.stopSong();
    setP1Stats({ ...INITIAL_PLAYER_STATS });
    setP2Stats({ ...INITIAL_PLAYER_STATS });
    setCurrentTime(0);
    setStage('START');
  };

  const handleToggleAutoSing = (enabled: boolean) => {
    setAutoSing(enabled);
    globalAudioEngine.setAutoSing(enabled);
  };

  // Identify current target lyric and MIDI for tuner display
  const activeTargetNote = SUNSHINE_NOTES.find(
    (n) => currentTime >= n.start - 0.1 && currentTime <= n.end + 0.1
  );

  // Count-in state
  const isCountIn = currentTime < COUNT_IN_DURATION;
  const countInRemaining = Math.max(0, Math.ceil(COUNT_IN_DURATION - currentTime));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Arcade Navigation & HUD */}
      <ArcadeHeader
        stage={stage}
        activeSinger={activeSinger}
        p1Stats={p1Stats}
        p2Stats={p2Stats}
        songTime={currentTime}
        totalDuration={SONG_DURATION}
        isSoloMode={isSoloMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Game Stage Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 w-full max-w-6xl mx-auto">
        {stage === 'START' && (
          <StartScreen
            isSoloMode={isSoloMode}
            onSetSoloMode={setIsSoloMode}
            onStartGame={handleStartGame}
            micConnected={micConnected}
            onConnectMic={handleConnectMic}
            tunerState={tunerState}
            autoSing={autoSing}
            onToggleAutoSing={handleToggleAutoSing}
          />
        )}

        {(stage === 'P1_SINGING' || stage === 'P2_SINGING') && (
          <div className="w-full space-y-4">
            {/* Live Tuner & Pitch Gauge */}
            <TunerDisplay
              tuner={tunerState}
              targetMidi={activeTargetNote ? activeTargetNote.midi : null}
              targetLyric={activeTargetNote ? activeTargetNote.lyric : null}
            />

            {/* 2D Scrolling Piano Roll Canvas */}
            <PianoRollCanvas
              currentTime={currentTime}
              currentMidi={tunerState.midi}
              isVoiced={tunerState.isVoiced}
              activeSinger={activeSinger}
              ghostPitchHistory={stage === 'P2_SINGING' ? p1Stats.pitchHistory : undefined}
              onScoreFrame={handleScoreFrame}
              isCountIn={isCountIn}
              countInSec={countInRemaining}
            />

            {/* Song Lyrics Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {SUNSHINE_NOTES.map((note) => {
                  const isCurrent = currentTime >= note.start && currentTime <= note.end;
                  const isPassed = currentTime > note.end;
                  return (
                    <span
                      key={note.id}
                      className={`text-xs px-2 py-0.5 rounded transition font-medium whitespace-nowrap ${
                        isCurrent
                          ? 'bg-yellow-500 text-slate-950 font-bold scale-105'
                          : isPassed
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {note.lyric}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  globalAudioEngine.stopSong();
                  setStage('START');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded bg-slate-800 border border-slate-700 whitespace-nowrap shrink-0 transition"
              >
                Quit Song
              </button>
            </div>
          </div>
        )}

        {stage === 'INTERMISSION' && (
          <IntermissionScreen
            p1Stats={p1Stats}
            onStartPlayer2={handleStartPlayer2}
          />
        )}

        {stage === 'WINNER' && (
          <WinnerScreen
            p1Stats={p1Stats}
            p2Stats={p2Stats}
            isSoloMode={isSoloMode}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Footer / Control Bar */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 px-4 py-3 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-arcade text-[10px] text-yellow-500">PITCHBATTLE</span>
          <span>·</span>
          <span>Web Audio Autocorrelation & YIN Algorithm</span>
          <span>·</span>
          <span>Octave-Folded Scoring</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Mic: {micConnected ? 'Active' : 'Standby'}</span>
          <span>·</span>
          <span>Keys [A-K] Pitch Simulation</span>
        </div>
      </footer>

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoSing={autoSing}
        onToggleAutoSing={handleToggleAutoSing}
      />
    </div>
  );
}
