import { useState, useCallback, useRef } from 'react';
import { Receipt } from '../contexts/ReceiptContext';

interface HistoryEntry {
  timestamp: Date;
  receipt: Receipt;
  description: string;
}

interface UseReceiptHistoryOptions {
  maxHistorySize?: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export const useReceiptHistory = (
  initialReceipt: Receipt,
  options: UseReceiptHistoryOptions = {}
) => {
  const { maxHistorySize = 50, onHistoryChange } = options;
  
  const [currentReceipt, setCurrentReceipt] = useState<Receipt>(initialReceipt);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      timestamp: new Date(),
      receipt: initialReceipt,
      description: 'Initial state',
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Track if we're in the middle of an undo/redo operation
  const isUndoRedoOperation = useRef(false);

  // Update receipt with history tracking
  const updateReceipt = useCallback(
    (updates: Partial<Receipt>, description: string) => {
      if (isUndoRedoOperation.current) {
        return;
      }

      const newReceipt = {
        ...currentReceipt,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setCurrentReceipt(newReceipt);

      // Create new history entry
      const newEntry: HistoryEntry = {
        timestamp: new Date(),
        receipt: newReceipt,
        description,
      };

      // Remove any entries after current index (for branching history)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newEntry);

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Notify about history state
      if (onHistoryChange) {
        onHistoryChange(true, false);
      }
    },
    [currentReceipt, history, historyIndex, maxHistorySize, onHistoryChange]
  );

  // Undo last change
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoOperation.current = true;
      const newIndex = historyIndex - 1;
      const previousEntry = history[newIndex];
      
      setCurrentReceipt(previousEntry.receipt);
      setHistoryIndex(newIndex);

      // Notify about history state
      if (onHistoryChange) {
        onHistoryChange(newIndex > 0, true);
      }

      isUndoRedoOperation.current = false;
      return previousEntry;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  // Redo last undone change
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoOperation.current = true;
      const newIndex = historyIndex + 1;
      const nextEntry = history[newIndex];
      
      setCurrentReceipt(nextEntry.receipt);
      setHistoryIndex(newIndex);

      // Notify about history state
      if (onHistoryChange) {
        onHistoryChange(true, newIndex < history.length - 1);
      }

      isUndoRedoOperation.current = false;
      return nextEntry;
    }
    return null;
  }, [history, historyIndex, onHistoryChange]);

  // Get history information
  const getHistoryInfo = useCallback(() => {
    return {
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      currentIndex: historyIndex,
      totalEntries: history.length,
      entries: history.map((entry, index) => ({
        ...entry,
        isCurrent: index === historyIndex,
      })),
    };
  }, [history, historyIndex]);

  // Jump to specific history entry
  const jumpToHistory = useCallback(
    (index: number) => {
      if (index >= 0 && index < history.length) {
        isUndoRedoOperation.current = true;
        const entry = history[index];
        
        setCurrentReceipt(entry.receipt);
        setHistoryIndex(index);

        // Notify about history state
        if (onHistoryChange) {
          onHistoryChange(index > 0, index < history.length - 1);
        }

        isUndoRedoOperation.current = false;
        return entry;
      }
      return null;
    },
    [history, onHistoryChange]
  );

  // Clear history (keep only current state)
  const clearHistory = useCallback(() => {
    const currentEntry: HistoryEntry = {
      timestamp: new Date(),
      receipt: currentReceipt,
      description: 'History cleared',
    };
    
    setHistory([currentEntry]);
    setHistoryIndex(0);

    // Notify about history state
    if (onHistoryChange) {
      onHistoryChange(false, false);
    }
  }, [currentReceipt, onHistoryChange]);

  // Get a description of what changed between two receipts
  const getChangedFields = useCallback(
    (oldReceipt: Receipt, newReceipt: Receipt): string[] => {
      const changes: string[] = [];
      
      (Object.keys(oldReceipt) as Array<keyof Receipt>).forEach((key) => {
        if (oldReceipt[key] !== newReceipt[key]) {
          changes.push(key);
        }
      });
      
      return changes;
    },
    []
  );

  return {
    receipt: currentReceipt,
    updateReceipt,
    undo,
    redo,
    getHistoryInfo,
    jumpToHistory,
    clearHistory,
    getChangedFields,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};