import React from 'react';
import { TunerState } from '../types';
import { Volume2, Activity } from 'lucide-react';

interface TunerDisplayProps {
  tuner: TunerState;
  targetMidi: number | null;
  targetLyric: string | null;
}

export const TunerDisplay: React.FC<TunerDisplayProps> = ({
  tuner,
  targetMidi,
  targetLyric,
}) => {
  const { noteName, hz, cents, rms, isVoiced } = tuner;

  // Clamped cents (-50 to +50)
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const needlePercent = ((clampedCents + 50) / 100) * 100;

  // RMS level meter (0 to 1 scale)
  const volumePercent = Math.min(100, Math.round(rms * 400));

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4">
      {/* Current Lyric Prompt */}
      <div className="flex items-center gap-3 min-w-[160px]">
        <div className="w-2 h-8 bg-amber-500 rounded-full" />
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Singing Lyric
          </span>
          <span className="font-display font-bold text-lg md:text-xl text-yellow-300">
            {targetLyric ? `"${targetLyric}"` : '—'}
          </span>
        </div>
      </div>

      {/* Tuner Pitch Indicator */}
      <div className="flex items-center gap-4 flex-1 justify-center max-w-md">
        {/* Note Box */}
        <div className="text-center min-w-[70px]">
          <div className="text-[9px] uppercase font-bold text-slate-400">Pitch</div>
          <div className={`font-arcade text-lg md:text-xl font-bold ${isVoiced ? 'text-emerald-400' : 'text-slate-600'}`}>
            {isVoiced ? noteName : '--'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono tabular-nums">
            {isVoiced && hz ? `${Math.round(hz)} Hz` : 'Quiet'}
          </div>
        </div>

        {/* Cents Needle Gauge */}
        <div className="flex-1 max-w-[200px]">
          <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
            <span>FLAT -50</span>
            <span className="font-bold text-emerald-400">IN TUNE</span>
            <span>+50 SHARP</span>
          </div>

          <div className="relative h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            {/* Center target line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-500 z-10 -translate-x-1/2" />

            {/* In-tune sweet spot zone */}
            <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-950/40" />

            {/* Needle indicator */}
            {isVoiced && (
              <div
                className="absolute top-0 bottom-0 w-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 transition-all duration-75 -translate-x-1/2"
                style={{ left: `${needlePercent}%` }}
              />
            )}
          </div>

          <div className="text-center text-[10px] font-mono text-slate-400 mt-1 tabular-nums">
            {isVoiced ? `${cents > 0 ? '+' : ''}${cents} cents` : 'Sing into microphone'}
          </div>
        </div>
      </div>

      {/* Mic Volume VU Meter */}
      <div className="flex items-center gap-2 min-w-[130px] justify-end">
        <Volume2 className="w-4 h-4 text-slate-400" />
        <div className="flex flex-col gap-1 w-24">
          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>MIC LEVEL</span>
            <span className="font-mono tabular-nums">{volumePercent}%</span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-75 ${
                volumePercent > 70 ? 'bg-rose-500' : volumePercent > 25 ? 'bg-emerald-400' : 'bg-cyan-500'
              }`}
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
