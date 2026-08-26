import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NoteItem } from '../types';
import { api } from '../api';
import { RichNoteEditor } from '../components/notes/RichNoteEditor';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Trash2,
  Copy,
  Check,
  Download,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  X
} from 'lucide-react';

// Helper: Sort notes with strict pinned priority (first pinned on top, unpinned sorted newest first)
const sortNotes = (list: NoteItem[]): NoteItem[] => {
  return [...list].sort((a, b) => {
    const aPinned = Boolean(a.is_pinned);
    const bPinned = Boolean(b.is_pinned);

    // 1. Pinned notes always come before unpinned notes
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // 2. If both are pinned: sort by pinned_at ASC (first note pinned stays #1, subsequent pinned follows)
    if (aPinned && bPinned) {
      const aTime = a.pinned_at || a.created_at || '';
      const bTime = b.pinned_at || b.created_at || '';
      return aTime.localeCompare(bTime);
    }

    // 3. Unpinned notes: newest first (created_at DESC)
    const aCreated = a.created_at || '';
    const bCreated = b.created_at || '';
    return bCreated.localeCompare(aCreated);
  });
};

interface NotesPageProps {
  initialNoteId?: string | null;
}

export const NotesPage: React.FC<NotesPageProps> = ({ initialNoteId }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Multi-Select Mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Custom Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteIds: string[];
    titleText: string;
  }>({
    isOpen: false,
    noteIds: [],
    titleText: ''
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Notes on Mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotes();
      const sorted = sortNotes(data || []);
      setNotes(sorted);
      if (initialNoteId && sorted.some((n) => n.id === initialNoteId)) {
        setSelectedNoteId(initialNoteId);
      } else if (sorted.length > 0) {
        setSelectedNoteId(sorted[0].id);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Currently Selected Note
  const currentNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Filtered Notes by Search
  const filteredNotes = useMemo(() => {
    const sorted = sortNotes(notes);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter((n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  // Create New Note
  const handleCreateNote = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newNote = await api.createNote({
        title: 'Untitled Note',
        content: '<h1>Untitled Note</h1><p>Start writing your thoughts, daily plans, or action checklist here...</p><div class="note-task-item"><input type="checkbox" /> <span>First key action item</span></div>',
        tags: ['Daily'],
        color: 'amber',
        date: todayStr,
        is_pinned: false
      });

      setNotes((prev) => sortNotes([newNote, ...prev]));
      setSelectedNoteId(newNote.id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // Trigger Delete for Single Note
  const promptDeleteSingleNote = (note: NoteItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      noteIds: [note.id],
      titleText: `"${note.title || 'Untitled Note'}"`
    });
  };

  // Trigger Delete for Multi-Selected Notes
  const promptDeleteBulkNotes = () => {
    if (selectedNoteIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      noteIds: selectedNoteIds,
      titleText: `${selectedNoteIds.length} selected notes`
    });
  };

  // Confirm and Execute Delete (Single or Bulk)
  const handleConfirmDelete = async () => {
    const idsToDelete = deleteModal.noteIds;
    if (idsToDelete.length === 0) return;

    try {
      await Promise.all(idsToDelete.map((id) => api.deleteNote(id)));
      const remaining = notes.filter((n) => !idsToDelete.includes(n.id));
      const sorted = sortNotes(remaining);
      setNotes(sorted);

      if (selectedNoteId && idsToDelete.includes(selectedNoteId)) {
        setSelectedNoteId(sorted.length > 0 ? sorted[0].id : null);
      }

      // Reset selection
      setSelectedNoteIds([]);
      setIsSelectMode(false);
      setDeleteModal({ isOpen: false, noteIds: [], titleText: '' });
    } catch (err) {
      console.error('Failed to delete notes:', err);
    }
  };

  // Toggle selection for a note
  const toggleSelectNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All
  const handleToggleSelectAll = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map((n) => n.id));
    }
  };

  // Toggle Pin Note with FIFO pinned_at timestamp
  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    const newPinned = !target.is_pinned;
    const now = new Date().toISOString();
    const pinnedAt = newPinned ? (target.pinned_at || now) : undefined;

    try {
      const updated = await api.updateNote(id, { is_pinned: newPinned, pinned_at: pinnedAt });
      setNotes((prev) =>
        sortNotes(
          prev.map((n) => (n.id === id ? { ...n, ...updated, is_pinned: newPinned, pinned_at: pinnedAt } : n))
        )
      );
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Debounced Update Note Content
  const handleContentChange = (newHtml: string) => {
    if (!currentNote) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === currentNote.id ? { ...n, content: newHtml, updated_at: new Date().toISOString() } : n))
    );

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateNote(currentNote.id, { content: newHtml });
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  // Update Title
  const handleTitleChange = async (newTitle: string) => {
    if (!currentNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === currentNote.id ? { ...n, title: newTitle, updated_at: new Date().toISOString() } : n))
    );

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateNote(currentNote.id, { title: newTitle });
      } catch (err) {
        console.error('Title save error:', err);
      }
    }, 500);
  };

  // Update Date (for Calendar synchronization)
  const handleDateChange = async (newDate: string) => {
    if (!currentNote) return;
    const updated = await api.updateNote(currentNote.id, { date: newDate });
    setNotes((prev) => prev.map((n) => (n.id === currentNote.id ? { ...n, ...updated, date: newDate } : n)));
  };

  // Copy Note as Plain Text
  const handleCopyNote = () => {
    if (!currentNote) return;
    const cleanText = `${currentNote.title}\n\n${currentNote.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()}`;
    navigator.clipboard.writeText(cleanText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export Note as .md File
  const handleExportMarkdown = () => {
    if (!currentNote) return;
    const cleanText = `# ${currentNote.title}\n\n${currentNote.content.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' ').trim()}`;
    const blob = new Blob([cleanText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-black text-zinc-100 font-sans">
      {/* 1. LEFT SIDEBAR: NOTE EXPLORER */}
      <div className="w-80 sm:w-88 border-r border-zinc-850 flex flex-col bg-zinc-950/90 shrink-0 select-none">
        {/* Header with Title, Multi-Select & Search */}
        <div className="p-4 border-b border-zinc-850 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-950/30">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span>Notes</span>
                </h2>
                <span className="text-[10px] font-mono text-zinc-400">Creative Scratchpad</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle Select Mode */}
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedNoteIds([]);
                }}
                className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelectMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
                title={isSelectMode ? 'Cancel Selection' : 'Multi-Select Notes'}
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>

              {/* + New Note */}
              <button
                onClick={handleCreateNote}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Multi-Select Action Bar (when active) */}
          {isSelectMode && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs animate-in fade-in">
              <button
                onClick={handleToggleSelectAll}
                className="text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5"
              >
                {selectedNoteIds.length === filteredNotes.length && filteredNotes.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span>Select All ({selectedNoteIds.length}/{filteredNotes.length})</span>
              </button>

              {selectedNoteIds.length > 0 && (
                <button
                  onClick={promptDeleteBulkNotes}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete ({selectedNoteIds.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Note Cards List (Title only) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <StickyNote className="w-5 h-5" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">No notes found</p>
              <button
                onClick={handleCreateNote}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                + Create Note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              const isChecked = selectedNoteIds.includes(note.id);

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelectNote(note.id);
                    } else {
                      setSelectedNoteId(note.id);
                    }
                  }}
                  className={`group px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected && !isSelectMode
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-950/20'
                      : isChecked
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-850 hover:border-zinc-750'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox for Select Mode */}
                    {isSelectMode ? (
                      <button
                        type="button"
                        onClick={(e) => toggleSelectNote(note.id, e)}
                        className="text-zinc-500 hover:text-amber-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                    ) : (
                      <StickyNote
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isSelected ? 'text-amber-400' : 'text-zinc-500 group-hover:text-amber-400/80'
                        }`}
                      />
                    )}

                    <span
                      className={`text-xs truncate ${
                        isSelected && !isSelectMode
                          ? 'text-amber-200 font-bold'
                          : 'text-zinc-200 group-hover:text-white font-medium'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Calendar scheduled indicator */}
                    {(note.date || note.created_at) && (
                      <span title={`Calendar: ${note.date || (note.created_at ? note.created_at.split('T')[0] : '')}`} className="text-zinc-500 mr-0.5">
                        <CalendarIcon className="w-3 h-3 text-amber-400/80" />
                      </span>
                    )}

                    {note.is_pinned && (
                      <span title="Pinned">
                        <Pin className="w-3 h-3 text-amber-400 fill-amber-400/40" />
                      </span>
                    )}
                    {!isSelectMode && (
                      <>
                        <button
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-amber-400 transition-opacity"
                          title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => promptDeleteSingleNote(note, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT MAIN WORKSPACE: ACTIVE NOTE EDITOR */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        {currentNote ? (
          <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-3 overflow-hidden max-w-5xl w-full mx-auto">
            {/* Note Top Bar: Title & Clean Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-850">
              <div className="flex-1 min-w-[200px] flex items-center gap-2">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Note Title..."
                  className="text-lg sm:text-xl font-bold text-white bg-transparent outline-none focus:ring-1 focus:ring-amber-500/50 rounded-lg px-2 py-1 w-full"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                {/* Note Date Assignment (for Calendar synchronization) */}
                <div
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl hover:border-zinc-700 transition-colors"
                  title="Assign date to display on Calendar"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input
                    type="date"
                    value={currentNote.date || (currentNote.created_at ? currentNote.created_at.split('T')[0] : '')}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer font-medium p-0 border-none focus:ring-0"
                  />
                  {currentNote.date && (
                    <button
                      onClick={() => handleDateChange('')}
                      className="text-zinc-500 hover:text-zinc-300 text-xs px-1 hover:bg-zinc-800 rounded"
                      title="Clear date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Pin Toggle */}
                <button
                  onClick={() => handleTogglePin(currentNote.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    currentNote.is_pinned
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                  }`}
                  title={currentNote.is_pinned ? 'Pinned to top' : 'Pin note'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopyNote}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Copy as plain text"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Export Markdown */}
                <button
                  onClick={handleExportMarkdown}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
                  title="Download as .md file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => promptDeleteSingleNote(currentNote, e)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-800/40 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rich Note Editor */}
            <div className="flex-1 overflow-hidden">
              <RichNoteEditor
                content={currentNote.content}
                onChange={handleContentChange}
                isSaving={isSaving}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/20">
              <StickyNote className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-zinc-100">Select or Create a Note</h3>
              <p className="text-xs text-zinc-400">
                Draft daily action items, briefs, and thoughts with clean distraction-free workspace.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Note</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl modal-transition">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-zinc-200">{deleteModal.titleText}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, noteIds: [], titleText: '' })}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {deleteModal.noteIds.length > 1 ? `(${deleteModal.noteIds.length})` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
