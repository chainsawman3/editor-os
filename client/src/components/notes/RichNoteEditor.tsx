import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
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
  Palette,
  Film,
  Video,
  Volume2,
  Megaphone,
  RemoveFormatting,
  X
} from 'lucide-react';

interface RichNoteEditorProps {
  content: string;
  onChange: (value: string) => void;
  isSaving?: boolean;
}

export const RichNoteEditor: React.FC<RichNoteEditorProps> = ({
  content,
  onChange,
  isSaving = false
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0, speakingTime: '0:00 min' });

  const editorRef = useRef<HTMLDivElement>(null);
  const focusEditorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const getActiveEditor = useCallback(() => {
    return isFocusMode ? focusEditorRef.current : editorRef.current;
  }, [isFocusMode]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Update live word & character stats
  const updateStats = useCallback((text: string) => {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const characters = cleanText.length;
    // Estimated speaking/reading time at ~140 words per minute
    const totalSeconds = Math.round((words / 140) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const speakingTime = `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
    setStats({ words, characters, speakingTime });
  }, []);

  // Initialize editor content
  useEffect(() => {
    const active = getActiveEditor();
    if (active && (!isInitializedRef.current || active.innerHTML !== content)) {
      active.innerHTML = content || '<p><br/></p>';
      updateStats(active.innerText || '');
      isInitializedRef.current = true;
    }
  }, [content, isFocusMode, getActiveEditor, updateStats]);

  // Handle Input Changes
  const handleInput = () => {
    const active = getActiveEditor();
    if (!active) return;
    const html = active.innerHTML;
    updateStats(active.innerText || '');
    onChange(html);
  };

  // Checkbox Click Event Delegation
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      const parent = checkbox.closest('.note-task-item') as HTMLElement;
      if (parent) {
        if (checkbox.checked) {
          checkbox.setAttribute('checked', 'true');
          parent.classList.add('completed-task');
        } else {
          checkbox.removeAttribute('checked');
          parent.classList.remove('completed-task');
        }
        handleInput();
      }
    }
  };

  // Execute standard formatting commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    const active = getActiveEditor();
    if (!active) return;
    active.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Insert Custom Heading
  const formatHeading = (level: string) => {
    execCmd('formatBlock', `<${level}>`);
  };

  // Insert Interactive Checkbox / Checklist Item
  const insertCheckboxItem = () => {
    const active = getActiveEditor();
    if (!active) return;
    active.focus();

    const selection = window.getSelection();
    const selectedText = selection && selection.toString().trim() ? selection.toString() : 'New Action Item';

    const checkboxHtml = `<div class="note-task-item" style="display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; padding: 2px 0;"><input type="checkbox" style="margin-top: 4px; cursor: pointer; accent-color: #f59e0b; width: 15px; height: 15px;" /> <span style="flex: 1; outline: none;">${selectedText}</span></div><p><br/></p>`;
    execCmd('insertHTML', checkboxHtml);
  };

  // Insert Creative Component Pills
  const insertPill = (type: 'hook' | 'scene' | 'audio' | 'cta' | 'action', label: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      hook: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', icon: '🪝' },
      scene: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#60a5fa', icon: '🎬' },
      audio: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#c084fc', icon: '🔊' },
      cta: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', icon: '📢' },
      action: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)', text: '#fb7185', icon: '⚡' }
    };

    const s = styles[type];
    const html = `<span class="pill-${type}" style="display: inline-flex; align-items: center; gap: 4px; background: ${s.bg}; border: 1px solid ${s.border}; color: ${s.text}; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; margin: 0 4px; font-family: monospace; letter-spacing: 0.5px;">${s.icon} ${label}</span>&nbsp;`;
    execCmd('insertHTML', html);
  };

  // Apply Highlight / Color
  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const selectedText = selection.toString();
    if (!selectedText) return;

    const html = `<mark style="background-color: ${color}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${selectedText}</mark>`;
    execCmd('insertHTML', html);
    setShowColorPicker(false);
  };

  const highlightColors = [
    { name: 'Amber Glow', value: 'rgba(245, 158, 11, 0.4)' },
    { name: 'Emerald', value: 'rgba(16, 185, 129, 0.35)' },
    { name: 'Purple', value: 'rgba(168, 85, 247, 0.35)' },
    { name: 'Blue', value: 'rgba(59, 130, 246, 0.35)' },
    { name: 'Rose', value: 'rgba(244, 63, 94, 0.35)' }
  ];

  // Render Toolbar
  const renderToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-lg shrink-0">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Headings */}
        <div className="flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => formatHeading('h1')}
            title="Heading 1"
            className="px-2 py-1 rounded-lg text-xs font-bold text-sky-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => formatHeading('h2')}
            title="Heading 2"
            className="px-2 py-1 rounded-lg text-xs font-bold text-teal-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => formatHeading('h3')}
            title="Heading 3"
            className="px-2 py-1 rounded-lg text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            H3
          </button>
        </div>

        {/* Basic Styling */}
        <div className="flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => execCmd('bold')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            title="Strikethrough"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlighter & Palette */}
        <div className="relative flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => applyHighlight('rgba(245, 158, 11, 0.4)')}
            title="Amber Highlight"
            className="p-1.5 rounded-lg text-amber-400 hover:bg-zinc-800 transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color Palette"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="absolute top-10 left-0 z-50 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl flex gap-1.5 animate-in fade-in zoom-in-95"
            >
              {highlightColors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => applyHighlight(c.value)}
                  className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Lists & Interactive Checkbox */}
        <div className="flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            title="Bullet List"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertCheckboxItem}
            title="Insert Checkbox Task List Item"
            className="px-2 py-1 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center gap-1 transition-colors border border-amber-500/20"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono">Task [ ]</span>
          </button>
        </div>

        {/* Quotes, Divider, Clear */}
        <div className="flex items-center gap-0.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            title="Quote Block"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            title="Horizontal Divider"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            title="Clear Formatting"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Creative Quick Pills */}
        <div className="hidden xl:flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertPill('hook', 'Hook')}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
          >
            <Film className="w-3 h-3" />
            <span>Hook</span>
          </button>
          <button
            type="button"
            onClick={() => insertPill('scene', 'Scene')}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
          >
            <Video className="w-3 h-3" />
            <span>Scene</span>
          </button>
          <button
            type="button"
            onClick={() => insertPill('audio', 'Audio')}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors flex items-center gap-1"
          >
            <Volume2 className="w-3 h-3" />
            <span>Audio</span>
          </button>
          <button
            type="button"
            onClick={() => insertPill('cta', 'CTA')}
            className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
          >
            <Megaphone className="w-3 h-3" />
            <span>CTA</span>
          </button>
        </div>
      </div>

      {/* Focus Mode Trigger */}
      <button
        type="button"
        onClick={() => setIsFocusMode(!isFocusMode)}
        className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="text-[11px]">Expand (85%)</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 1. Main Toolbar */}
      {renderToolbar()}

      {/* 2. Content Editable Note Canvas */}
      <div className="flex-1 bg-zinc-950/70 border border-zinc-850 rounded-2xl p-5 overflow-y-auto focus-within:border-amber-500/40 transition-all shadow-inner relative min-h-[380px]">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onClick={handleEditorClick}
          className="rich-note-editor outline-none text-zinc-200 text-sm leading-relaxed font-sans min-h-full space-y-2.5 selection:bg-amber-500/30"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
      </div>

      {/* 3. Footer Stats Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 px-2 py-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Visual WYSIWYG
          </span>
          <span>•</span>
          <span className="text-zinc-400">
            {isSaving ? 'Saving...' : 'Auto-saved'}
          </span>
          <span>•</span>
          <span>
            Speaking Time: <strong className="text-zinc-300">{stats.speakingTime}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            <strong className="text-zinc-300">{stats.words}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong className="text-zinc-300">{stats.characters}</strong> characters
          </span>
        </div>
      </div>

      {/* 4. Fullscreen / Focus Mode Modal */}
      {isFocusMode && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Distraction-Free Note Canvas</h3>
                  <span className="text-[10px] font-mono text-zinc-400">85% Viewport Deep Work Mode</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderToolbar()}

            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 overflow-y-auto focus-within:border-amber-500/50 shadow-2xl">
              <div
                ref={focusEditorRef}
                contentEditable
                onInput={handleInput}
                onClick={handleEditorClick}
                className="rich-note-editor outline-none text-zinc-100 text-base leading-relaxed font-sans min-h-full space-y-3.5 selection:bg-amber-500/30 max-w-3xl mx-auto"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold">• Live WYSIWYG Canvas</span>
                <span>Reading Time: {stats.speakingTime}</span>
              </div>
              <div>
                {stats.words} words • {stats.characters} characters
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
