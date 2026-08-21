import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
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
  Quote,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Palette,
  Film,
  Video,
  Volume2,
  Megaphone,
  RemoveFormatting
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

// Convert plain text / markdown into initial rich HTML
function convertToInitialHtml(content: string): string {
  if (!content) return '';
  // If it already contains HTML tags, return as is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  // Convert plaintext/markdown newlines and marks to rich HTML
  const lines = content.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<p><br/></p>';
      if (trimmed.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (trimmed.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (trimmed.startsWith('> ')) return `<blockquote>${line.substring(2)}</blockquote>`;
      if (trimmed === '---') return '<hr/>';
      return `<p>${line
        .replace(/==(.*?)==/g, '<mark style="background-color: rgba(251, 191, 36, 0.28); color: #fef08a; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.4); font-weight: 500;">$1</mark>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
      }</p>`;
    })
    .join('');
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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0, speakingTime: '0:00' });

  const editorRef = useRef<HTMLDivElement>(null);
  const focusEditorRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const getActiveEditor = useCallback(() => {
    return isFocusMode ? focusEditorRef.current : editorRef.current;
  }, [isFocusMode]);

  // Update statistics (word count, speaking time) from editor text
  const updateStatsFromElement = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const text = el.innerText || '';
    const words = text.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const estimatedSeconds = Math.round((words / 140) * 60); // 140 wpm
    const estMin = Math.floor(estimatedSeconds / 60);
    const estSec = estimatedSeconds % 60;
    const speakingTime = `${estMin}:${String(estSec).padStart(2, '0')}`;
    setStats({ words, characters, speakingTime });
  }, []);

  // Initialize editor HTML content
  useEffect(() => {
    const el = editorRef.current;
    if (el && !isInitializedRef.current) {
      el.innerHTML = convertToInitialHtml(scriptContent);
      updateStatsFromElement(el);
      isInitializedRef.current = true;
    }
  }, [scriptContent, updateStatsFromElement]);

  // Sync focus mode editor content when opened
  useEffect(() => {
    if (isFocusMode && focusEditorRef.current && editorRef.current) {
      focusEditorRef.current.innerHTML = editorRef.current.innerHTML;
      updateStatsFromElement(focusEditorRef.current);
      focusEditorRef.current.focus();
    }
  }, [isFocusMode, updateStatsFromElement]);

  // Close focus mode on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const handleInput = () => {
    const el = getActiveEditor();
    if (!el) return;
    const html = el.innerHTML;
    onChange(html);
    updateStatsFromElement(el);

    // Sync between inline and focus editors
    if (isFocusMode && editorRef.current) {
      editorRef.current.innerHTML = html;
    } else if (!isFocusMode && focusEditorRef.current) {
      focusEditorRef.current.innerHTML = html;
    }
  };

  // Visual WYSIWYG Command Execution
  const execCmd = (command: string, value: string = '') => {
    const el = getActiveEditor();
    if (el) el.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Insert visual HTML snippet directly into editor at cursor
  const insertVisualHtml = (htmlString: string) => {
    const el = getActiveEditor();
    if (el) el.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      if (el) {
        el.innerHTML += htmlString;
        handleInput();
      }
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const frag = document.createDocumentFragment();
    let node;
    let lastNode;
    while ((node = tempDiv.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleInput();
  };

  // Apply visual Highlighter color to selected text (or insert sample highlighted badge)
  const applyHighlighter = (colorKey: 'yellow' | 'cyan' | 'purple' | 'green' | 'pink') => {
    setShowColorPicker(false);
    const el = getActiveEditor();
    if (el) el.focus();

    const colorMap = {
      yellow: { bg: 'rgba(251, 191, 36, 0.28)', text: '#fef08a', border: 'rgba(251, 191, 36, 0.4)' },
      cyan: { bg: 'rgba(56, 189, 248, 0.25)', text: '#bae6fd', border: 'rgba(56, 189, 248, 0.35)' },
      purple: { bg: 'rgba(192, 132, 252, 0.25)', text: '#f3e8ff', border: 'rgba(192, 132, 252, 0.35)' },
      green: { bg: 'rgba(52, 211, 153, 0.25)', text: '#a7f3d0', border: 'rgba(52, 211, 153, 0.35)' },
      pink: { bg: 'rgba(244, 114, 182, 0.25)', text: '#fbcfe8', border: 'rgba(244, 114, 182, 0.35)' }
    };

    const c = colorMap[colorKey];
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      insertVisualHtml(
        `<mark style="background-color: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border}; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Highlighted Text</mark>&nbsp;`
      );
      return;
    }

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.style.backgroundColor = c.bg;
    mark.style.color = c.text;
    mark.style.border = `1px solid ${c.border}`;
    mark.style.padding = '2px 6px';
    mark.style.borderRadius = '4px';
    mark.style.fontWeight = '500';
    mark.appendChild(range.extractContents());
    range.insertNode(mark);

    handleInput();
  };

  // Reusable Word-Style WYSIWYG Toolbar
  const renderToolbar = () => (
    <div className="flex items-center justify-between gap-2 p-2 bg-zinc-900/95 border border-zinc-800 rounded-xl overflow-x-auto select-none">
      {/* Left Tools */}
      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
        {/* Headings */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h1>'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 1 (Main Section Title)"
          >
            <Heading1 className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h2>'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 2 (Scene / Subtitle)"
          >
            <Heading2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h3>'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Heading 3 (Sub-point)"
          >
            <Heading3 className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Text Styles: Bold, Italic, Underline, Strike */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('strikeThrough'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Highlighter with Color Picker */}
        <div className="relative flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyHighlighter('yellow'); }}
            className="p-1.5 hover:bg-amber-400/20 text-amber-400 hover:text-amber-300 rounded-md transition-colors flex items-center gap-1"
            title="Highlight Selection (Yellow)"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
            className="px-1 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors text-[10px]"
            title="Pick Highlighter Color"
          >
            <Palette className="w-3 h-3 text-zinc-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1.5 p-2 bg-zinc-900 border border-zinc-750 rounded-xl shadow-xl z-30 flex items-center gap-2">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyHighlighter('yellow'); }}
                className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 border border-amber-300 transition-transform shadow-sm"
                title="Yellow Highlighter"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyHighlighter('cyan'); }}
                className="w-5 h-5 rounded-full bg-cyan-400 hover:scale-110 border border-cyan-300 transition-transform shadow-sm"
                title="Cyan Highlighter"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyHighlighter('purple'); }}
                className="w-5 h-5 rounded-full bg-purple-400 hover:scale-110 border border-purple-300 transition-transform shadow-sm"
                title="Purple Highlighter"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyHighlighter('green'); }}
                className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 border border-emerald-300 transition-transform shadow-sm"
                title="Green Highlighter"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyHighlighter('pink'); }}
                className="w-5 h-5 rounded-full bg-pink-400 hover:scale-110 border border-pink-300 transition-transform shadow-sm"
                title="Pink Highlighter"
              />
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Lists */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Quotes & Dividers */}
        <div className="flex items-center bg-zinc-950/80 rounded-lg p-0.5 border border-zinc-800/80">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVisualHtml(
                '<blockquote style="border-left: 3px solid #f59e0b; background: rgba(245, 158, 11, 0.08); padding: 8px 14px; border-radius: 0 8px 8px 0; color: #fde68a; font-style: italic; margin: 8px 0;">Director\'s Note / Visual Guideline</blockquote><p><br/></p>'
              );
            }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Director Note / Callout Block"
          >
            <Quote className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('insertHorizontalRule'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Visual Video Production Badges */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVisualHtml(
                '<div style="margin: 10px 0; padding: 8px 12px; background: rgba(245, 158, 11, 0.12); border-left: 3px solid #f59e0b; border-radius: 0 8px 8px 0;"><strong style="color: #fbbf24; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">🎬 HOOK (0:00 - 0:03)</strong><div style="color: #e2e8f0; font-size: 13px;">(Visual: Aggressive crash zoom onto speaker)</div><div style="color: #cbd5e1; font-size: 13px; margin-top: 2px;">VOICEOVER: "Stop wasting 2 hours in the gym..."</div></div><p><br/></p>'
              );
            }}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Visual Hook Block"
          >
            <Film className="w-3 h-3 text-amber-400" /> Hook
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVisualHtml(
                '<div style="margin: 10px 0; padding: 8px 12px; background: rgba(59, 130, 246, 0.12); border-left: 3px solid #3b82f6; border-radius: 0 8px 8px 0;"><strong style="color: #60a5fa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">🎥 SCENE / B-ROLL</strong><div style="color: #e2e8f0; font-size: 13px;">(Visual: Screen capture overlay with motion graphics)</div><div style="color: #cbd5e1; font-size: 13px; margin-top: 2px;">VOICEOVER: "Here is the exact solution..."</div></div><p><br/></p>'
              );
            }}
            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Visual Scene Block"
          >
            <Video className="w-3 h-3 text-blue-400" /> Scene
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVisualHtml(
                '<div style="margin: 8px 0; padding: 6px 12px; background: rgba(168, 85, 247, 0.12); border-left: 3px solid #a855f7; border-radius: 0 8px 8px 0;"><strong style="color: #c084fc; font-size: 11px; text-transform: uppercase; margin-right: 6px;">🔊 AUDIO:</strong><span style="color: #e2e8f0; font-size: 13px; font-style: italic;">Heavy impact whoosh + glitch hit</span></div><p><br/></p>'
              );
            }}
            className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert Audio Cue"
          >
            <Volume2 className="w-3 h-3 text-purple-400" /> Audio
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertVisualHtml(
                '<div style="margin: 10px 0; padding: 8px 12px; background: rgba(16, 185, 129, 0.12); border-left: 3px solid #10b981; border-radius: 0 8px 8px 0;"><strong style="color: #34d399; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">🎯 CALL TO ACTION</strong><div style="color: #cbd5e1; font-size: 13px;">VOICEOVER: "Follow for more daily editing breakdowns."</div></div><p><br/></p>'
              );
            }}
            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-md text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
            title="Insert CTA Block"
          >
            <Megaphone className="w-3 h-3 text-emerald-400" /> CTA
          </button>
        </div>
      </div>

      {/* Right Controls: Focus Mode */}
      <div className="flex items-center gap-1.5 shrink-0">
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
      <style>{`
        .wysiwyg-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding-bottom: 0.25rem;
        }
        .wysiwyg-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #93c5fd;
          margin-top: 1rem;
          margin-bottom: 0.35rem;
        }
        .wysiwyg-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #7dd3fc;
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .wysiwyg-content p {
          margin: 0.35rem 0;
          line-height: 1.6;
        }
        .wysiwyg-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .wysiwyg-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .wysiwyg-content li {
          margin: 0.2rem 0;
        }
        .wysiwyg-content blockquote {
          border-left: 3px solid #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          padding: 8px 14px;
          border-radius: 0 8px 8px 0;
          color: #fde68a;
          font-style: italic;
          margin: 8px 0;
        }
        .wysiwyg-content hr {
          border: 0;
          border-top: 1px solid #3f3f46;
          margin: 16px 0;
        }
        .wysiwyg-content:empty:before {
          content: attr(data-placeholder);
          color: #52525b;
          pointer-events: none;
          display: block;
        }
      `}</style>

      {/* 1. NORMAL INLINE VISUAL EDITOR */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Script & Production Breakdown
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Live visual text formatting, color highlighters, video cues, and 1-click Word (.docx) export
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onCopy}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy script"
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

        {/* Word-Style Toolbar */}
        {renderToolbar()}

        {/* Visual ContentEditable Editor Container */}
        <div className="space-y-2">
          <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-hidden focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleInput}
              onBlur={onSave}
              data-placeholder="Write your visual hook, voiceover script, director notes, and headings here..."
              className="wysiwyg-content w-full min-h-[380px] p-6 text-sm font-sans text-zinc-100 leading-relaxed outline-none overflow-y-auto max-h-[650px]"
            />
          </div>

          {/* Bottom Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 px-1 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Visual WYSIWYG • Word Ready</span>
              </span>
              <span>•</span>
              <span>Speaking Time: <strong className="text-zinc-200">{stats.speakingTime} min</strong></span>
            </div>

            <div className="flex items-center gap-3">
              <span><strong className="text-zinc-200">{stats.words}</strong> words</span>
              <span>•</span>
              <span><strong className="text-zinc-200">{stats.characters}</strong> characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED FULLSCREEN FOCUS MODE MODAL (~85% SCREEN WITH BLURRED BACKDROP) */}
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
                  <p className="text-xs text-zinc-400">Visual rich text editing & production breakdown</p>
                </div>
              </div>

              {/* Actions & Exit Button */}
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

            {/* Focus Editor Full Height Visual Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 sm:p-6 bg-zinc-950">
              <div className="flex-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner overflow-hidden flex flex-col focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div
                  ref={focusEditorRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handleInput}
                  onBlur={onSave}
                  data-placeholder="Write your visual hook, voiceover script, director notes, and headings here..."
                  className="wysiwyg-content flex-1 w-full p-6 text-sm sm:text-base font-sans text-zinc-100 leading-relaxed outline-none overflow-y-auto"
                />
              </div>
            </div>

            {/* Focus Footer Telemetry */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/70 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Real-time Visual Sync</span>
                </span>
                <span>•</span>
                <span>Speaking Time: <strong className="text-zinc-200">{stats.speakingTime} min</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span><strong className="text-zinc-200">{stats.words}</strong> words</span>
                <span>•</span>
                <span><strong className="text-zinc-200">{stats.characters}</strong> chars</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
