import React from 'react';
import {
  Clapperboard,
  Target,
  Calendar,
  StickyNote,
  Menu
} from 'lucide-react';

interface MobileNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu
}) => {
  const isStudioActive = currentTab === 'content' || currentTab === 'dashboard';
  const isGoalsActive = currentTab === 'goals';
  const isNotesActive = currentTab === 'notes';
  const isCalendarActive = currentTab === 'calendar';

  const navItems = [
    {
      id: 'content',
      label: 'Studio',
      icon: Clapperboard,
      isActive: isStudioActive,
      onClick: () => onSelectTab('content')
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      isActive: isGoalsActive,
      onClick: () => onSelectTab('goals')
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      isActive: isNotesActive,
      onClick: () => onSelectTab('notes')
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      isActive: isCalendarActive,
      onClick: () => onSelectTab('calendar')
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all select-none active:scale-95 ${
                item.isActive
                  ? 'text-white font-bold bg-zinc-900/80 shadow-sm border border-zinc-800/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all select-none"
        >
          <Menu className="w-5 h-5 mb-0.5 text-zinc-400" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
