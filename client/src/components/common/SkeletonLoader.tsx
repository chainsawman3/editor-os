import React from 'react';

export const ContentStudioSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-pulse fade-in">
      {/* Top Header Skeleton */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-zinc-850 rounded" />
            <div className="w-64 h-3 bg-zinc-900 rounded" />
          </div>
        </div>
        <div className="w-24 h-7 bg-zinc-900 rounded-lg" />
      </div>

      {/* Top 5 Tasks Skeleton */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="w-56 h-4 bg-zinc-850 rounded" />
          <div className="w-40 h-3 bg-zinc-900 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-850 rounded-xl p-3.5 space-y-3">
              <div className="w-3/4 h-3 bg-zinc-800 rounded" />
              <div className="w-1/2 h-2.5 bg-zinc-850 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Columns Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 space-y-3 min-h-[300px]">
            <div className="w-28 h-4 bg-zinc-850 rounded" />
            <div className="h-28 bg-zinc-900/60 border border-zinc-850 rounded-xl" />
            <div className="h-28 bg-zinc-900/60 border border-zinc-850 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-pulse fade-in">
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800" />
          <div className="space-y-2">
            <div className="w-56 h-4 bg-zinc-850 rounded" />
            <div className="w-64 h-3 bg-zinc-900 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 min-h-[500px] grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="min-h-[110px] bg-zinc-900/40 border border-zinc-850/60 rounded-lg p-2" />
          ))}
        </div>
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 min-h-[300px] space-y-3">
          <div className="w-32 h-4 bg-zinc-850 rounded" />
          <div className="h-16 bg-zinc-900/50 rounded-lg" />
          <div className="h-16 bg-zinc-900/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const GoalsHubSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-pulse fade-in">
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-48 h-5 bg-zinc-850 rounded" />
          <div className="w-28 h-8 bg-zinc-900 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-zinc-900/60 rounded-lg border border-zinc-850" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4" />
        ))}
      </div>
    </div>
  );
};

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-pulse fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 h-80" />
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 h-80" />
      </div>
    </div>
  );
};

export const ProjectDetailSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans animate-pulse fade-in">
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-6 h-28" />
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-6 min-h-[400px]" />
    </div>
  );
};
