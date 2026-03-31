import React from 'react';
import { X } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { DEFAULT_EQ_PRESETS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const bands = [60, 200, 500, 1000, 4000, 10000];
  const labels = ['60Hz', '200Hz', '500Hz', '1kHz', '4kHz', '10kHz'];

  const handleSliderChange = (index: number, val: number) => {
    audioEngine.setEQBand(index, val);
  };

  const applyPreset = (presetName: keyof typeof DEFAULT_EQ_PRESETS) => {
    const values = DEFAULT_EQ_PRESETS[presetName];
    values.forEach((val, idx) => {
       // Update engine
       audioEngine.setEQBand(idx, val);
       // We would ideally update local state here too to reflect on sliders
       // For this demo, we assume effect is heard
       const slider = document.getElementById(`eq-slider-${idx}`) as HTMLInputElement;
       if(slider) slider.value = val.toString();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] p-6 rounded-xl w-[90%] max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Equalizer</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
           {Object.keys(DEFAULT_EQ_PRESETS).map((key) => (
             <button
               key={key}
               onClick={() => applyPreset(key as any)}
               className="px-3 py-1 bg-gray-800 hover:bg-green-500 hover:text-black rounded-full text-xs font-medium transition-colors uppercase"
             >
               {key}
             </button>
           ))}
        </div>

        {/* Sliders */}
        <div className="flex justify-between items-end h-48 space-x-2">
          {bands.map((band, idx) => (
            <div key={band} className="flex flex-col items-center h-full w-full">
              <input
                id={`eq-slider-${idx}`}
                type="range"
                min="-12"
                max="12"
                defaultValue="0"
                onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                className="h-full w-2 bg-gray-600 rounded-lg appearance-none cursor-pointer vertical-slider"
                style={{ WebkitAppearance: 'slider-vertical' } as any}
              />
              <span className="text-xs text-gray-400 mt-3">{labels[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
