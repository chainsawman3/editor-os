import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Eye,
  Edit3,
  Columns,
  Palette,
  Film,
  Video,
  Volume2,
  Megaphone
} from 'lucide-react';

interface RichScriptEditorProps {
  projectName: string;
  scriptContent: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void> | void;
  onCopy: () => void;
  onExportWord: () => void;
  isSaving?: boolean;
  isCopied?: boolean;
}

export const RichScriptEditor: React.FC<RichScriptEditorProps> = ({
  projectName,
  scriptContent,
  onChange,
  onSave,
  onCopy,
  onExportWord,
  isSaving = false,
  isCopied = false
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Close focus mode with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const activeTextarea = isFocusMode ? focusTextareaRef.current : textareaRef.current;

  // Words & Estimated Video Duration calculation
  const wordCount = scriptContent.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 140) * 60); // 140 wpm
  const estMin = Math.floor(estimatedSeconds / 60);
  const estSec = estimatedSeconds % 60;
  const formattedDuration = `${estMin}:${String(estSec).padStart(2, '0')}`;

  // Formatting Insertion Helpers
  const wrapSelection = (prefix: string, suffix: string = prefix, placeholder: string = 'text') => {
    const el = activeTextarea;
    if (!el) {
      onChange(scriptContent ? `${scriptContent}\n${prefix}${placeholder}${suffix}` : `${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const insertBlock = (prefix: string, placeholder: string = '') => {
    const el = activeTextarea;
    if (!el) {
      onChange(scriptContent ? `${scriptContent}\n${prefix}${placeholder}` : `${prefix}${placeholder}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const needsNewline = start > 0 && text[start - 1] !== '\n';
    const insertion = (needsNewline ? '\n' : '') + prefix + placeholder;
    const newText = text.substring(0, start) + insertion + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      el.focus();
      const cursorTarget = start + insertion.length;
      el.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  const applyHighlight = (color: 'yellow' | 'cyan' | 'purple' | 'green' | 'pink') => {
    setShowColorPicker(false);
    switch (color) {
      case 'yellow':
        wrapSelection('==', '==', 'highlighted text');
        break;
      case 'cyan':
        wrapSelection('[CYAN: ', ']', 'highlighted text');
        break;
      case 'purple':
        wrapSelection('[PURPLE: ', ']', 'highlighted text');
        break;
      case 'green':
        wrapSelection('[GREEN: ', ']', 'highlighted text');
        break;
      case 'pink':
        wrapSelection('[PINK: ', ']', 'highlighted text');
        break;
    }
  };

  // Keyboard Shortcuts inside Editor (Ctrl+B for Bold, Ctrl+I for Italic, Ctrl+S for Save)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        wrapSelection('**', '**', 'bold text');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        wrapSelection('*', '*', 'italic text');
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    }
  };

  // Render formatted script preview with high-contrast colored elements
  const renderFormattedPreview = () => {
    if (!scriptContent.trim()) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16 px-4 text-center select-none font-sans">
          <FileText className="w-10 h-10 mb-3 text-zinc-600 opacity-60" />
          <p className="text-sm font-semibold text-zinc-400">No script content to preview</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Use the formatting tools above to write hooks, dialogue, visual notes, and headings.
          </p>
        </div>
      );
    }

    const lines = scriptContent.split('\n');

    return (
      <div className="space-y-3 font-sans text-sm leading-relaxed p-6 text-zinc-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-3" />;
          }

          // H1 Section Heading
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-4 pb-1 border-b border-zinc-800 flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 inline-block" />
                {renderInlineStyles(trimmed.substring(2))}
              </h1>
            );
          }

          // H2 Scene Heading
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base sm:text-lg font-bold text-zinc-100 pt-3 pb-0.5 flex items-center gap-2 text-blue-300">
                <span className="w-1.5 h-4 rounded-full bg-blue-400 inline-block" />
                {renderInlineStyles(trimmed.substring(3))}
              </h2>
            );
          }

          // H3 Sub-heading
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-semibold text-zinc-200 pt-2 text-cyan-300">
                {renderInlineStyles(trimmed.substring(4))}
              </h3>
            );
          }

          // Blockquote / Director Note
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="border-l-2 border-amber-400/80 bg-amber-500/10 px-4 py-2.5 rounded-r-xl text-amber-200/90 text-xs sm:text-sm italic my-2">
                {renderInlineStyles(trimmed.substring(2))}
              </div>
            );
          }

          // Horizontal Divider
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={idx} className="border-zinc-800 my-4" />;
          }

          // Checkbox List Item
          if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
            const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
            const content = trimmed.substring(6);
            return (
              <div key={idx} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm">
                <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${isChecked ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-zinc-600 bg-zinc-900'}`}>
                  {isChecked && <Check className="w-3 h-3" />}
                </span>
                <span className={isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                  {renderInlineStyles(content)}
                </span>
              </div>
            );
          }

          // Bullet List Item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 my-1 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span className="text-zinc-200">{renderInlineStyles(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered List Item
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 my-1 text-xs sm:text-sm">
                <span className="font-mono font-bold text-blue-400 shrink-0">{numMatch[1]}.</span>
                <span className="text-zinc-200">{renderInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          // Standard Paragraph with Voiceover / Visual badges
          return (
            <p key={idx} className="text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed">
              {renderInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse bold, italic, highlights, and tags inside lines
  const renderInlineStyles = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // 1. Yellow Highlight: ==text==
      const yellowMatch = remaining.match(/^(.*?)==(.*?)==(.*)$/s);
      // 2. Color Highlight: [COLOR: text]
      const colorMatch = remaining.match(/^(.*?)\[(CYAN|PURPLE|GREEN|PINK):\s*(.*?)\](.*)$/s);
      // 3. Bold: **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)$/s);
      // 4. Italic: *text*
      const italicMatch = remaining.match(/^(.*?)\*(.*?)\*(.*)$/s);
      // 5. Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/^(.*?)~~(.*?)~~(.*)$/s);
      // 6. Scene / Production Badges: [SCENE ...], [HOOK ...], [VOICEOVER ...], [CTA ...]
      const badgeMatch = remaining.match(/^(.*?)\[(HOOK|SCENE|CTA|VOICEOVER|VISUAL|AUDIO|SOUND|MUSIC|NOTE|OUTRO|INTRO)(.*?)\](.*)$/s);
      // 7. Parenthetical cues: (Visual: ...) or (Audio: ...)
      const cueMatch = remaining.match(/^(.*?)\(((?:Visual|Audio|Music|SFX|Camera|VFX):.*?)\)(.*)$/s);

      interface MatchCandidate {
        type: string;
        index: number;
        prefix: string;
        matchText: string;
        suffix: string;
        extra?: string;
      }

      const candidates: MatchCandidate[] = [];

      if (yellowMatch) {
        candidates.push({
          type: 'yellow',
          index: yellowMatch[1].length,
          prefix: yellowMatch[1],
          matchText: yellowMatch[2],
          suffix: yellowMatch[3]
        });
      }

      if (colorMatch) {
        candidates.push({
          type: 'color',
          index: colorMatch[1].length,
          prefix: colorMatch[1],
          matchText: colorMatch[3],
          suffix: colorMatch[4],
          extra: colorMatch[2]
        });
      }

      if (badgeMatch) {
        candidates.push({
          type: 'badge',
          index: badgeMatch[1].length,
          prefix: badgeMatch[1],
          matchText: `[${badgeMatch[2]}${badgeMatch[3]}]`,
          suffix: badgeMatch[4],
          extra: badgeMatch[2]
        });
      }

      if (cueMatch) {
        candidates.push({
          type: 'cue',
          index: cueMatch[1].length,
          prefix: cueMatch[1],
          matchText: cueMatch[2],
          suffix: cueMatch[3]
        });
      }

      if (boldMatch) {
        candidates.push({
          type: 'bold',
          index: boldMatch[1].length,
          prefix: boldMatch[1],
          matchText: boldMatch[2],
          suffix: boldMatch[3]
        });
      }

      if (italicMatch) {
        candidates.push({
          type: 'italic',
          index: italicMatch[1].length,
          prefix: italicMatch[1],
          matchText: italicMatch[2],
          suffix: italicMatch[3]
        });
      }

      if (strikeMatch) {
        candidates.push({
          type: 'strike',
          index: strikeMatch[1].length,
          prefix: strikeMatch[1],
          matchText: strikeMatch[2],
          suffix: strikeMatch[3]
        });
      }

      if (candidates.length === 0) {
        parts.push(remaining);
        break;
      }

      // Sort by earliest position
      candidates.sort((a, b) => a.index - b.index);
      const chosen = candidates[0];

      if (chosen.prefix) {
        parts.push(chosen.prefix);
      }

      const k = keyIdx++;

      if (chosen.type === 'yellow') {
        parts.push(
          <mark key={k} className="bg-amber-400/25 text-amber-200 px-1.5 py-0.5 rounded-md border border-amber-400/30 font-medium">
            {chosen.matchText}
          </mark>
        );
      } else if (chosen.type === 'color') {
        const color = chosen.extra;
        const colorStyles: Record<string, string> = {
          CYAN: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30',
          PURPLE: 'bg-purple-400/20 text-purple-200 border-purple-400/30',
          GREEN: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
          PINK: 'bg-pink-400/20 text-pink-200 border-pink-400/30'
        };
        const style = colorStyles[color || 'CYAN'] || colorStyles.CYAN;
        parts.push(
          <mark key={k} className={`${style} px-1.5 py-0.5 rounded-md border font-medium`}>
            {chosen.matchText}
          </mark>
        );
      } else if (chosen.type === 'badge') {
        const tag = chosen.extra;
        let badgeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
        if (tag === 'HOOK' || tag === 'INTRO') badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        else if (tag === 'CTA' || tag === 'OUTRO') badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        else if (tag === 'AUDIO' || tag === 'SOUND' || tag === 'MUSIC') badgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
        else if (tag === 'VISUAL') badgeColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';

        parts.push(
          <span key={k} className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-md border ${badgeColor} shadow-sm my-0.5 mr-1.5`}>
            {chosen.matchText}
          </span>
        );
      } else if (chosen.type === 'cue') {
        parts.push(
          <span key={k} className="text-zinc-400 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800 text-[11px] font-mono italic my-0.5 inline-block">
            ({chosen.matchText})
          </span>
        );
      } else if (chosen.type === 'bold') {
        parts.push(<strong key={k} className="font-bold text-white">{chosen.matchText}</strong>);
      } else if (chosen.type === 'italic') {
        parts.push(<em key={k} className="italic text-zinc-300">{chosen.matchText}</em>);
      } else if (chosen.type === 'strike') {
        parts.push(<s key={k} className="line-through text-zinc-500">{chosen.matchText}</s>);
      }

      remaining = chosen.suffix;
    }

    return parts;
  };

  // Reusable Word-Style Toolbar
  const renderToolbar = () => (
    <div className="flex items-center justify-between gap-2 p-2 bg-zinc-900/95 border border-zinc-800 rounded-xl overflow-x-auto select-none">
      {/* Left Formatting Tools */}
      <div className="flex items-center gap-1 flex-wrap shrink-0">
        {/* Headings */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => insertBlock('# ', 'Section Title')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 1 (# Section)"
          >
            <Heading1 className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('## ', 'Scene / Subtitle')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 2 (## Scene)"
          >
            <Heading2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('### ', 'Sub-point')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 3 (### Sub-point)"
          >
            <Heading3 className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Text Style: Bold, Italic, Strikethrough */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('~~', '~~', 'strikethrough text')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlighter Tool with Color Swatches */}
        <div className="relative flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => applyHighlight('yellow')}
            className="p-1.5 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 rounded-md transition-colors flex items-center gap-1"
            title="Highlight Text (==yellow==)"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-1 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors text-[10px]"
            title="Highlighter Colors"
          >
            <Palette className="w-3 h-3 text-zinc-400" />
          </button>

          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1.5 p-2 bg-zinc-900 border border-zinc-750 rounded-xl shadow-xl z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyHighlight('yellow')}
                className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 border border-amber-300 transition-transform shadow-sm"
                title="Yellow Highlight"
              />
              <button
                type="button"
                onClick={() => applyHighlight('cyan')}
                className="w-5 h-5 rounded-full bg-cyan-400 hover:scale-110 border border-cyan-300 transition-transform shadow-sm"
                title="Cyan Highlight"
              />
              <button
                type="button"
                onClick={() => applyHighlight('purple')}
                className="w-5 h-5 rounded-full bg-purple-400 hover:scale-110 border border-purple-300 transition-transform shadow-sm"
                title="Purple Highlight"
              />
              <button
                type="button"
                onClick={() => applyHighlight('green')}
                className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 border border-emerald-300 transition-transform shadow-sm"
                title="Green Highlight"
              />
              <button
                type="button"
                onClick={() => applyHighlight('pink')}
                className="w-5 h-5 rounded-full bg-pink-400 hover:scale-110 border border-pink-300 transition-transform shadow-sm"
                title="Pink Highlight"
              />
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Lists: Bullets, Numbers, Checkbox */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => insertBlock('- ', 'Bullet item')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Bullet List (- )"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('1. ', 'Numbered item')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Numbered List (1. )"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('- [ ] ', 'Task checkbox')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Checklist Item (- [ ] )"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Quotes & Dividers */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => insertBlock('> ', "Director's Note / Callout")}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Quote / Callout Box (> )"
          >
            <Quote className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('\n---\n\n')}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Horizontal Divider (---)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Video Production Quick Cues */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertBlock('[HOOK - 0:00 - 0:03]\n(Visual: Aggressive crash zoom)\nVOICEOVER: "', '"\n\n')}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Hook Block"
          >
            <Film className="w-3 h-3 text-amber-400" /> Hook
          </button>
          <button
            type="button"
            onClick={() => insertBlock('[SCENE - B-ROLL & EXPLANATION]\n(Visual: Screen capture overlay)\nVOICEOVER: "', '"\n\n')}
            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Scene Block"
          >
            <Video className="w-3 h-3 text-blue-400" /> Scene
          </button>
          <button
            type="button"
            onClick={() => insertBlock('(Audio: Heavy impact whoosh + glitch hit)\n')}
            className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Audio Cue"
          >
            <Volume2 className="w-3 h-3 text-purple-400" /> Audio
          </button>
          <button
            type="button"
            onClick={() => insertBlock('[CTA - OUTRO]\nVOICEOVER: "Follow for more daily editing breakdowns."\n\n')}
            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert CTA Block"
          >
            <Megaphone className="w-3 h-3 text-emerald-400" /> CTA
          </button>
        </div>
      </div>

      {/* Right Controls: View Toggle (Edit / Split / Preview) & Focus Mode */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center bg-zinc-950/90 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'edit'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Edit Mode"
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'split'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Split Mode (Side by Side)"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'preview'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Preview Mode"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Maximize / Focus Mode Button */}
        <button
          type="button"
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs font-semibold ${
            isFocusMode
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
              : 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
          }`}
          title={isFocusMode ? 'Exit Focus Mode (Esc)' : 'Expand to Focus Mode (85% Screen)'}
        >
          {isFocusMode ? <Minimize2 className="w-3.5 h-3.5 text-blue-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline text-[11px]">{isFocusMode ? 'Minimize' : 'Expand (85%)'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. NORMAL INLINE EDITOR CONTAINER */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Script & Production Breakdown
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Word-style rich tools, highlights, video cues, and 1-click Word (.docx) export
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onCopy}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy script to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isCopied ? 'Copied!' : 'Copy Script'}</span>
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isSaving ? 'Saving...' : 'Save Script'}</span>
            </button>

            <button
              onClick={onExportWord}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Word (.docx)</span>
            </button>
          </div>
        </div>

        {/* Reusable Toolbar */}
        {renderToolbar()}

        {/* Editor Body */}
        <div className="space-y-2">
          {viewMode === 'edit' && (
            <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-hidden focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <textarea
                ref={textareaRef}
                rows={18}
                value={scriptContent}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                onBlur={onSave}
                placeholder="[HOOK - 0:00 - 0:03]&#10;(Visual: Aggressive crash zoom onto speaker)&#10;VOICEOVER: Stop wasting 2 hours in the gym...&#10;&#10;[SCENE 1 - PROBLEM]&#10;VOICEOVER: Here is the exact breakdown...&#10;&#10;[CTA - OUTRO]&#10;VOICEOVER: Full episode on Spotify link."
                className="w-full bg-transparent p-5 text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed outline-none resize-y placeholder:text-zinc-600"
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="min-h-[420px] rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-y-auto max-h-[600px]">
              {renderFormattedPreview()}
            </div>
          )}

          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[440px]">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-hidden flex flex-col focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={scriptContent}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  onBlur={onSave}
                  placeholder="Type your script in Markdown / Plaintext..."
                  className="w-full h-full min-h-[420px] bg-transparent p-4 text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed outline-none resize-none placeholder:text-zinc-600"
                />
              </div>
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-y-auto max-h-[600px]">
                {renderFormattedPreview()}
              </div>
            </div>
          )}

          {/* Bottom Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 px-1 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Auto-saved locally • Word ready</span>
              </span>
              <span>•</span>
              <span>Estimated Speaking Time: <strong className="text-zinc-200">{formattedDuration} min</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <span><strong className="text-zinc-200">{wordCount}</strong> words</span>
              <span>•</span>
              <span><strong className="text-zinc-200">{scriptContent.length}</strong> characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED FOCUS MODE MODAL (~85% SCREEN WITH BLURRED BACKDROP) */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-7xl h-[88vh] bg-zinc-950 border border-zinc-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Focus Mode Top Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-100 truncate max-w-md">{projectName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Focus Mode (85%)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Word-style text editing & production breakdown</p>
                </div>
              </div>

              {/* Actions & Exit X Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Copy script"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>

                <button
                  onClick={onExportWord}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Word</span>
                </button>

                <button
                  onClick={() => setIsFocusMode(false)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 transition-colors ml-1"
                  title="Close Focus Mode (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Focus Toolbar */}
            <div className="px-6 py-2.5 bg-zinc-950 border-b border-zinc-850">
              {renderToolbar()}
            </div>

            {/* Focus Editor Full Height Content */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 sm:p-6 bg-zinc-950">
              {viewMode === 'edit' && (
                <div className="flex-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner overflow-hidden flex flex-col focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <textarea
                    ref={focusTextareaRef}
                    value={scriptContent}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Type your script here..."
                    className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-zinc-100 leading-relaxed outline-none resize-none placeholder:text-zinc-600"
                  />
                </div>
              )}

              {viewMode === 'preview' && (
                <div className="flex-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner overflow-y-auto">
                  {renderFormattedPreview()}
                </div>
              )}

              {viewMode === 'split' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner overflow-hidden flex flex-col focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <textarea
                      ref={focusTextareaRef}
                      value={scriptContent}
                      onChange={(e) => onChange(e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      placeholder="Type your script here..."
                      className="flex-1 w-full bg-transparent p-5 text-sm font-mono text-zinc-100 leading-relaxed outline-none resize-none placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner overflow-y-auto">
                    {renderFormattedPreview()}
                  </div>
                </div>
              )}
            </div>

            {/* Focus Footer Telemetry */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/70 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Real-time Live Sync</span>
                </span>
                <span>•</span>
                <span>Speaking Time: <strong className="text-zinc-200">{formattedDuration} min</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span><strong className="text-zinc-200">{wordCount}</strong> words</span>
                <span>•</span>
                <span><strong className="text-zinc-200">{scriptContent.length}</strong> chars</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
