import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats } from '../types';
import { Trophy, Flame, RotateCcw, Award, CheckCircle } from 'lucide-react';

interface WinnerScreenProps {
  p1Stats: PlayerStats;
  p2Stats: PlayerStats;
  isSoloMode: boolean;
  onPlayAgain: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  p1Stats,
  p2Stats,
  isSoloMode,
  onPlayAgain,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#facc15', '#10b981'],
      });
    } catch {
      // ignore in environments without canvas
    }
  }, []);

  const p1Score = p1Stats.score;
  const p2Score = p2Stats.score;

  const p1Accuracy = p1Stats.totalFramesEvaluated > 0
    ? Math.round((p1Stats.framesHit / p1Stats.totalFramesEvaluated) * 100)
    : 0;

  const p2Accuracy = p2Stats.totalFramesEvaluated > 0
    ? Math.round((p2Stats.framesHit / p2Stats.totalFramesEvaluated) * 100)
    : 0;

  let winnerText = '';
  let winnerColor = '';
  let winnerSubtext = '';

  if (isSoloMode) {
    const grade = p1Accuracy >= 85 ? 'S' : p1Accuracy >= 70 ? 'A' : p1Accuracy >= 50 ? 'B' : 'C';
    winnerText = `RANK ${grade} VOCALIST!`;
    winnerColor = grade === 'S' ? 'text-yellow-400' : 'text-cyan-400';
    winnerSubtext = `Solo performance complete with ${p1Accuracy}% pitch accuracy.`;
  } else {
    if (p1Score > p2Score) {
      winnerText = 'PLAYER 1 WINS!';
      winnerColor = 'text-cyan-400';
      winnerSubtext = `Player 1 took the crown by ${(p1Score - p2Score).toLocaleString()} points!`;
    } else if (p2Score > p1Score) {
      winnerText = 'PLAYER 2 WINS!';
      winnerColor = 'text-pink-400';
      winnerSubtext = `Player 2 bested the ghost contour by ${(p2Score - p1Score).toLocaleString()} points!`;
    } else {
      winnerText = 'EPIC DRAW!';
      winnerColor = 'text-yellow-400';
      winnerSubtext = 'Both singers achieved identical scores!';
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full h-80 bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-950/60 border border-yellow-700/50 rounded-full text-yellow-400 text-xs font-semibold mb-4">
          <Award className="w-3.5 h-3.5" />
          <span>MATCH RESULTS</span>
        </div>

        <h1 className={`font-arcade text-3xl sm:text-4xl ${winnerColor} tracking-wider mb-2`}>
          {winnerText}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium">
          {winnerSubtext}
        </p>

        {/* Head-to-Head Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Player 1 Card */}
          <div className={`p-5 rounded-2xl border text-left ${
            !isSoloMode && p1Score >= p2Score
              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-display font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> {isSoloMode ? 'Your Performance' : 'Player 1'}
              </span>
              {!isSoloMode && p1Score >= p2Score && (
                <span className="text-[10px] font-arcade text-yellow-400 px-2 py-0.5 bg-yellow-950/80 rounded border border-yellow-700/50">
                  WINNER
                </span>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Final Score:</span>
                <span className="font-arcade text-lg text-yellow-400 tabular-nums">
                  {p1Score.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Max Streak:</span>
                <span className="font-mono text-sm text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> {p1Stats.maxCombo}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Pitch Accuracy:</span>
                <span className="font-mono text-sm text-emerald-400 font-bold">
                  {p1Accuracy}%
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Evaluated Samples:</span>
                <span className="font-mono text-xs text-slate-400">
                  {p1Stats.framesHit} / {p1Stats.totalFramesEvaluated}
                </span>
              </div>
            </div>
          </div>

          {/* Player 2 Card (or Solo Summary) */}
          {!isSoloMode ? (
            <div className={`p-5 rounded-2xl border text-left ${
              p2Score >= p1Score
                ? 'bg-pink-950/40 border-pink-500/80 shadow-lg shadow-pink-950/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-display font-bold text-sm text-pink-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Player 2
                </span>
                {p2Score >= p1Score && (
                  <span className="text-[10px] font-arcade text-yellow-400 px-2 py-0.5 bg-yellow-950/80 rounded border border-yellow-700/50">
                    WINNER
                  </span>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Final Score:</span>
                  <span className="font-arcade text-lg text-yellow-400 tabular-nums">
                    {p2Score.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Max Streak:</span>
                  <span className="font-mono text-sm text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> {p2Stats.maxCombo}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Pitch Accuracy:</span>
                  <span className="font-mono text-sm text-emerald-400 font-bold">
                    {p2Accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Evaluated Samples:</span>
                  <span className="font-mono text-xs text-slate-400">
                    {p2Stats.framesHit} / {p2Stats.totalFramesEvaluated}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left flex flex-col justify-between">
              <div>
                <span className="font-display font-bold text-sm text-yellow-400 block mb-2">
                  Vocalist Breakdown
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your pitch contour was continuously tracked via Web Audio autocorrelation. Excellent work matching note durations and transitions!
                </p>
              </div>
              <div className="mt-4 p-3 bg-slate-900 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Ready to challenge a rival in 1v1 Battle?</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto min-w-[240px] py-3.5 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-arcade text-xs tracking-wider transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN / REMATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
