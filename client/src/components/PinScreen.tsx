import React, { useState, useRef } from 'react';
import { Lock } from 'lucide-react';

interface PinScreenProps {
  onSuccess: () => void;
}

// NOTE: You can change the PIN here
const CORRECT_PIN = '1379';

export const PinScreen: React.FC<PinScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    
    if (newPin.every(digit => digit !== '')) {
      if (newPin.join('') === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center space-y-6">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
          <Lock className="w-6 h-6 text-emerald-400" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-zinc-100">Enter PIN</h1>
          <p className="text-sm text-zinc-400">Please enter your PIN to access Editor OS</p>
        </div>

        <div className="flex items-center gap-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 bg-zinc-900 border ${error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/30'} rounded-xl text-center text-2xl font-bold text-zinc-100 outline-none focus:ring-2 transition-all`}
            />
          ))}
        </div>
        
        <div className="h-6">
          {error && <p className="text-rose-400 text-sm font-medium animate-pulse">Incorrect PIN</p>}
        </div>
      </div>
    </div>
  );
};
