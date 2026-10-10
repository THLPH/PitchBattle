import React, { useState } from 'react';
import { Mic, Users, User, Music, Sparkles, CheckCircle2, AlertCircle, Bot } from 'lucide-react';
import { TunerState } from '../types';

interface StartScreenProps {
  isSoloMode: boolean;
  onSetSoloMode: (solo: boolean) => void;
  onStartGame: () => void;
  micConnected: boolean;
  onConnectMic: () => Promise<boolean>;
  tunerState: TunerState;
  autoSing: boolean;
  onToggleAutoSing: (enabled: boolean) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  isSoloMode,
  onSetSoloMode,
  onStartGame,
  micConnected,
  onConnectMic,
  tunerState,
  autoSing,
  onToggleAutoSing,
}) => {
  const [micTesting, setMicTesting] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const handleTestMic = async () => {
    setMicTesting(true);
    setMicError(null);
    const success = await onConnectMic();
    if (!success) {
      setMicError('Could not access microphone. You can still play with Auto-Singer or simulated pitch!');
    }
    setMicTesting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hero Arcade Title */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-950/40 border border-yellow-700/50 rounded-full text-yellow-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Web Audio Pitch Detection & Octave Folding</span>
        </div>

        <h1 className="font-arcade text-3xl sm:text-5xl text-yellow-400 tracking-wider mb-2">
          PITCH<span className="text-pink-500">BATTLE</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto font-medium">
          The retro 1v1 karaoke duel. Hit the notes, build multiplier streaks, and battle against your rival's ghost contour!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Game Mode Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Select Battle Mode
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Play against a friend in turn-based battle or hone your pitch solo.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSetSoloMode(false)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  !isSoloMode
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 text-cyan-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-arcade text-xs text-yellow-400">1v1 BATTLE</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Player 1 sings, then Player 2 sings facing Player 1's live Ghost Contour.
                </p>
              </button>

              <button
                onClick={() => onSetSoloMode(true)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSoloMode
                    ? 'bg-pink-950/40 border-pink-500 shadow-lg shadow-pink-950/50 text-pink-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-arcade text-xs text-yellow-400">SOLO</span>
                  <User className="w-4 h-4 text-pink-400" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Single player pitch workout. Score as high as possible on the song!
                </p>
              </button>
            </div>
          </div>

          {/* Song Card */}
          <div className="mt-5 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Featured Track</span>
                <span className="font-display font-bold text-sm text-slate-200">You Are My Sunshine</span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-cyan-950/60 rounded border border-cyan-800/40">
              ~30 SECONDS
            </span>
          </div>
        </div>

        {/* Microphone Setup & Check */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                Microphone Test
              </h2>
              {micConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mic Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Sing or hum into your microphone to verify pitch detection before starting.
            </p>

            {/* Live Mic Test Display */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">Detected Pitch:</span>
                <span className={`font-arcade text-sm ${tunerState.isVoiced ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {tunerState.isVoiced ? `${tunerState.noteName} (${Math.round(tunerState.hz || 0)} Hz)` : '--'}
                </span>
              </div>

              {/* Volume Level VU Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>INPUT LEVEL</span>
                  <span>{Math.round(tunerState.rms * 400)}%</span>
                </div>
                <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-rose-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, tunerState.rms * 400)}%` }}
                  />
                </div>
              </div>

              {micError && (
                <div className="mt-3 p-2 bg-rose-950/40 border border-rose-800/50 rounded text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleTestMic}
              disabled={micTesting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-display border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              {micTesting ? 'Checking...' : micConnected ? 'Mic Connected ✓' : 'Enable & Test Mic'}
            </button>

            {/* Auto-sing fallback button */}
            <button
              onClick={() => onToggleAutoSing(!autoSing)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-display transition flex items-center justify-center gap-1.5 ${
                autoSing
                  ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Hands-free demo simulator without mic"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Auto-Singer: {autoSing ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules & Game Mechanics Overview */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 mb-8">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
          How to Play & Score
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="font-bold text-yellow-400 block mb-1">1. Hit the Notes</span>
            Target note blocks scroll left to the Hit Line (x=150). Sing in pitch to turn them green and spark particles.
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="font-bold text-emerald-400 block mb-1">2. Octave Folding</span>
            Sing in whatever register is comfortable (baritone, tenor, soprano). Pitch is folded across octaves so anyone can win!
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="font-bold text-pink-400 block mb-1">3. Battle the Ghost</span>
            Player 2 sees Player 1's glowing ghost curve trailing through the song. Beat their score to claim victory!
          </div>
        </div>
      </div>

      {/* Big Start Button */}
      <div className="text-center">
        <button
          onClick={onStartGame}
          className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-950 font-arcade text-base tracking-wider shadow-xl shadow-yellow-500/20 active:scale-98 transition transform cursor-pointer font-bold"
        >
          {isSoloMode ? 'START SOLO SUNG' : 'START 1v1 BATTLE'}
        </button>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          Tip: You can also use keyboard keys [A, S, D, F, G, H, J] to simulate notes C4 through B4.
        </p>
      </div>
    </div>
  );
};
