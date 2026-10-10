import React from 'react';
import { PlayerStats } from '../types';
import { Flame, Trophy, Mic, User } from 'lucide-react';

interface ArcadeHeaderProps {
  stage: string;
  activeSinger: 'P1' | 'P2';
  p1Stats: PlayerStats;
  p2Stats: PlayerStats;
  songTime: number;
  totalDuration: number;
  isSoloMode: boolean;
  onOpenSettings: () => void;
}

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  stage,
  activeSinger,
  p1Stats,
  p2Stats,
  songTime,
  totalDuration,
  isSoloMode,
  onOpenSettings,
}) => {
  const currentStats = activeSinger === 'P1' ? p1Stats : p2Stats;
  const singerColor = activeSinger === 'P1' ? 'text-cyan-400' : 'text-pink-400';
  const singerBorder = activeSinger === 'P1' ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-pink-500/40 bg-pink-950/20';

  // Multiplier calculation based on current combo
  const combo = currentStats.currentCombo;
  const multiplier = combo >= 30 ? 3.0 : combo >= 15 ? 2.0 : combo >= 5 ? 1.5 : 1.0;

  const timeProgress = Math.min(100, (songTime / totalDuration) * 100);

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4 py-3">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-arcade text-sm md:text-base text-yellow-400 tracking-wider">
              PITCH<span className="text-pink-500">BATTLE</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">1v1 Karaoke Arcade</p>
          </div>
        </div>

        {/* Zone 2: Live Battle Status & Scoreboard */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Active Turn Banner */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${singerBorder}`}>
            <User className={`w-4 h-4 ${singerColor}`} />
            <span className="font-display font-bold text-xs uppercase tracking-wide text-slate-200">
              {activeSinger === 'P1' ? 'Player 1' : 'Player 2'}
            </span>
            <span className={`text-[11px] font-arcade ${singerColor}`}>SINGING</span>
          </div>

          {/* Big Retro Score Counter */}
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Current Score
            </span>
            <span className={`font-arcade text-xl md:text-2xl tabular-nums ${singerColor} tracking-wider`}>
              {currentStats.score.toLocaleString()}
            </span>
          </div>

          {/* Combo Meter */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Flame className={`w-4 h-4 ${combo > 5 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Streak</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-arcade text-xs text-amber-400 tabular-nums">
                  {combo}
                </span>
                <span className="font-display font-bold text-[10px] text-emerald-400">
                  x{multiplier.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Player 2 Turn: Show P1 Target to Beat */}
          {activeSinger === 'P2' && !isSoloMode && (
            <div className="hidden md:flex items-center gap-2 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[9px] text-cyan-300 font-semibold uppercase block">P1 To Beat</span>
                <span className="font-arcade text-xs text-cyan-300 tabular-nums">
                  {p1Stats.score.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Audio Settings & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            Audio / Mic
          </button>
        </div>
      </div>

      {/* Song Progress Track */}
      <div className="max-w-6xl mx-auto mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${
            activeSinger === 'P1' ? 'bg-cyan-500' : 'bg-pink-500'
          }`}
          style={{ width: `${timeProgress}%` }}
        />
      </div>
    </header>
  );
};
