'use client';

import { useEffect, useCallback, useRef } from 'react';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description?: string;
}

/**
 * FIX LOW-002: Hook to handle keyboard shortcuts
 * Usage:
 * useKeyboardShortcuts([
 *   { key: 's', ctrl: true, handler: handleSave, description: 'Save' },
 *   { key: 'Escape', handler: handleCancel, description: 'Cancel' },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  
  // Update ref in useEffect to avoid render-time mutation
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.isContentEditable;
    
    for (const shortcut of shortcutsRef.current) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      
      // For Escape, always allow even in input fields
      const isEscapeKey = shortcut.key.toLowerCase() === 'escape';
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        // Skip if in input field (except for Escape or Ctrl+key combinations)
        if (isInputField && !isEscapeKey && !shortcut.ctrl) {
          continue;
        }
        
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Common shortcuts for forms
 */
export function useFormShortcuts(options: {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const shortcuts: ShortcutConfig[] = [];
  
  if (options.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      handler: options.onSave,
      description: 'Save (Ctrl+S)',
    });
  }
  
  if (options.onCancel) {
    shortcuts.push({
      key: 'Escape',
      handler: options.onCancel,
      description: 'Cancel (Esc)',
    });
  }
  
  if (options.onDelete) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      shift: true,
      handler: options.onDelete,
      description: 'Delete (Ctrl+Shift+D)',
    });
  }
  
  useKeyboardShortcuts(shortcuts);
}

/**
 * Common shortcuts for tables/lists
 */
export function useTableShortcuts(options: {
  onSearch?: () => void;
  onRefresh?: () => void;
  onNew?: () => void;
  onSelectAll?: () => void;
}) {
  const shortcuts: ShortcutConfig[] = [];
  
  if (options.onSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      handler: options.onSearch,
      description: 'Search (Ctrl+F)',
    });
  }
  
  if (options.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      handler: options.onRefresh,
      description: 'Refresh (Ctrl+R)',
    });
  }
  
  if (options.onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      handler: options.onNew,
      description: 'New (Ctrl+N)',
    });
  }
  
  if (options.onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      handler: options.onSelectAll,
      description: 'Select All (Ctrl+A)',
    });
  }
  
  useKeyboardShortcuts(shortcuts);
}
