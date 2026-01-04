'use client';

import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  enabled, 
  onChange, 
  disabled = false,
  color = 'bg-cyan-500'
}) => (
  <button
    onClick={() => !disabled && onChange()}
    disabled={disabled}
    className={`relative w-10 h-5 rounded-full transition-colors ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${enabled ? color : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
      enabled ? 'left-5' : 'left-0.5'
    }`} />
  </button>
);
