import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types';
import { Mic, ArrowRight, Flame, Trophy, Sparkles } from 'lucide-react';

interface IntermissionScreenProps {
  p1Stats: PlayerStats;
  onStartPlayer2: () => void;
}

export const IntermissionScreen: React.FC<IntermissionScreenProps> = ({
  p1Stats,
  onStartPlayer2,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onStartPlayer2();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStartPlayer2]);

  const p1Accuracy = p1Stats.totalFramesEvaluated > 0
    ? Math.round((p1Stats.framesHit / p1Stats.totalFramesEvaluated) * 100)
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 text-center">
      {/* Turn Transition Card */}
      <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-700/50 rounded-full text-cyan-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROUND 1 COMPLETE</span>
        </div>

        <h2 className="font-arcade text-2xl sm:text-3xl text-on-surface mb-2">
          PASS THE MIC!
        </h2>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">
          Hand the microphone over to <span className="text-secondary font-bold">Player 2</span>.
        </p>

        {/* Player 1 Score Report */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/80 mb-6 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <span className="font-display font-bold text-sm text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Player 1 Performance
            </span>
            <span className="text-xs text-on-surface-variant">Target to beat</span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Final Score</span>
              <span className="font-arcade text-lg sm:text-xl text-on-surface tabular-nums">
                {p1Stats.score.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Streak</span>
              <span className="font-arcade text-lg sm:text-xl text-amber-400 tabular-nums flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-500 inline" />
                {p1Stats.maxCombo}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Hit Accuracy</span>
              <span className="font-arcade text-lg sm:text-xl text-emerald-400 tabular-nums">
                {p1Accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Player 2 Challenge Notice */}
        <div className="p-3 bg-pink-950/30 border border-pink-800/30 rounded-xl mb-6 text-xs text-pink-300">
          Player 2 will now sing with Player 1's <strong className="text-cyan-300">Ghost Contour</strong> visible on screen. Can you score higher?
        </div>

        {/* Ready Button or Countdown */}
        {countdown !== null ? (
          <div className="py-4">
            <div className="font-arcade text-4xl text-on-surface animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-xs text-on-surface-variant mt-2">Player 2 starting...</p>
          </div>
        ) : (
          <button
            onClick={() => setCountdown(3)}
            className="w-full sm:w-auto min-w-[260px] py-4 px-8 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-arcade text-sm tracking-wider shadow-lg shadow-pink-600/30 active:scale-98 transition font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>PLAYER 2 READY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
