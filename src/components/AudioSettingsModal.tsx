import React from 'react';
import { X, Volume2, Sliders, Mic, Bot } from 'lucide-react';
import { globalAudioEngine } from '../audio/audioEngine';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoSing: boolean;
  onToggleAutoSing: (enabled: boolean) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  autoSing,
  onToggleAutoSing,
}) => {
  const [masterVol, setMasterVol] = React.useState(globalAudioEngine.masterVolume);
  const [backingVol, setBackingVol] = React.useState(globalAudioEngine.backingVolume);
  const [guideVol, setGuideVol] = React.useState(globalAudioEngine.guideVolume);
  const [sfxVol, setSfxVol] = React.useState(globalAudioEngine.sfxVolume);
  const [rmsThreshold, setRmsThreshold] = React.useState(globalAudioEngine.rmsThreshold);

  if (!isOpen) return null;

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVol(val);
    globalAudioEngine.setMasterVolume(val);
  };

  const handleBackingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBackingVol(val);
    globalAudioEngine.setBackingVolume(val);
  };

  const handleGuideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setGuideVol(val);
    globalAudioEngine.setGuideVolume(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    globalAudioEngine.setSfxVolume(val);
  };

  const handleRmsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRmsThreshold(val);
    globalAudioEngine.setRmsThreshold(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <h2 className="font-display font-bold text-lg text-slate-100">
              Audio & Microphone Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Master Volume</span>
              <span className="font-mono text-cyan-400">{Math.round(masterVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={handleMasterChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Backing Track Volume */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Accompaniment & Drums Volume</span>
              <span className="font-mono text-cyan-400">{Math.round(backingVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={backingVol}
              onChange={handleBackingChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Guide Melody Volume */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Guide Melody Synth Volume</span>
              <span className="font-mono text-yellow-400">{Math.round(guideVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={guideVol}
              onChange={handleGuideChange}
              className="w-full accent-yellow-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Plays the target song melody notes to help singers find the pitch.
            </p>
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Sound Effects & Fanfare</span>
              <span className="font-mono text-pink-400">{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>

          {/* Mic RMS Sensitivity */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                Mic Noise Gate Sensitivity
              </span>
              <span className="font-mono text-emerald-400">{rmsThreshold.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.040"
              step="0.002"
              value={rmsThreshold}
              onChange={handleRmsChange}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Lower = more sensitive to quiet voice. Higher = cuts background noise.
            </p>
          </div>

          {/* Virtual Voice / Simulator Option */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Auto-Singer Demo Mode
                </span>
                <span className="text-[10px] text-slate-400">
                  Simulates a singer for hands-free audio testing
                </span>
              </div>
            </div>
            <button
              onClick={() => onToggleAutoSing(!autoSing)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                autoSing
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {autoSing ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-display rounded-xl transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
