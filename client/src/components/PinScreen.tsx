import React, { useState, useRef, useEffect } from 'react';
import { Lock, User, Sparkles, Check, KeyRound } from 'lucide-react';
import { FlowLogo } from './common/FlowLogo';

interface PinScreenProps {
  onSuccess: (userId: string) => void;
}

export interface UserProfile {
  id: string;
  name: string;
  pin: string;
  avatarLetter: string;
  gradient: string;
  accentColor: string;
  tag: string;
}

const USERS: UserProfile[] = [
  {
    id: 'gigi',
    name: 'გიგი',
    pin: '1379',
    avatarLetter: 'G',
    gradient: 'from-purple-600 to-indigo-600',
    accentColor: 'border-purple-500/80 text-purple-400 bg-purple-950/40',
    tag: 'Core Workspace'
  },
  {
    id: 'ani',
    name: 'ანი',
    pin: '2004',
    avatarLetter: 'A',
    gradient: 'from-rose-500 to-pink-600',
    accentColor: 'border-rose-500/80 text-rose-400 bg-rose-950/40',
    tag: 'Personal Workspace'
  }
];

export const PinScreen: React.FC<PinScreenProps> = ({ onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(() => {
    const lastUser = localStorage.getItem('flow_os_active_user');
    return USERS.find((u) => u.id === lastUser) || USERS[0];
  });

  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, [selectedUser]);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setPin(['', '', '', '']);
    setError(false);
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 50);
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newPin.every((digit) => digit !== '')) {
      const enteredCode = newPin.join('');

      // 1. Direct match with selected user
      if (enteredCode === selectedUser.pin) {
        onSuccess(selectedUser.id);
        return;
      }

      // 2. Smart auto-detect: if user typed the other profile's PIN, automatically log into that profile
      const matchedOther = USERS.find((u) => u.pin === enteredCode);
      if (matchedOther) {
        setSelectedUser(matchedOther);
        onSuccess(matchedOther.id);
        return;
      }

      // 3. Incorrect PIN
      setError(true);
      setTimeout(() => {
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 font-sans p-4 select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Lock Header */}
        <div className="flex flex-col items-center space-y-3">
          <FlowLogo size="xl" />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>MyOS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold tracking-wider uppercase">
                Security
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              აირჩიეთ პროფილი და შეიყვანეთ პირადი PIN-კოდი
            </p>
          </div>
        </div>

        {/* Profile Selector Cards */}
        <div className="w-full grid grid-cols-2 gap-3 pt-1">
          {USERS.map((user) => {
            const isSelected = selectedUser.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-2 select-none ${
                  isSelected
                    ? `${user.accentColor} ring-2 ring-white/20 shadow-lg shadow-black/40`
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${user.gradient} flex items-center justify-center font-black text-lg text-white shadow-md`}
                >
                  {user.avatarLetter}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    {user.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Profile Info Banner */}
        <div className="w-full text-center">
          <span className="text-xs text-zinc-400">
            შეიყვანეთ <strong className="text-white font-bold">{selectedUser.name}</strong>-ს PIN კოდი:
          </span>
        </div>

        {/* 4-Digit Input Boxes */}
        <div className="flex items-center gap-3 sm:gap-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 sm:w-14 sm:h-16 bg-zinc-900 border ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-zinc-750 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
              } rounded-2xl text-center text-2xl font-bold font-mono text-white outline-none transition-all shadow-inner`}
            />
          ))}
        </div>

        {/* Status / Error feedback */}
        <div className="h-5">
          {error && (
            <p className="text-rose-400 text-xs font-semibold animate-pulse">
              არასწორი PIN-კოდი. სცადეთ თავიდან
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
