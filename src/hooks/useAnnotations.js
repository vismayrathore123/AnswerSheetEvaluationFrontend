import { useState, useCallback } from 'react';

/**
 * Keeps pen / tick / comment drawings for every copy, with undo & redo.
 * Shape: store[copyId] = { past: [], present: [], future: [] }
 */
export default function useAnnotations() {
  const [store, setStore] = useState({});

  const get = useCallback((id) => store[id]?.present ?? [], [store]);

  const commit = useCallback((id, list) => {
    setStore((s) => {
      const h = s[id] ?? { past: [], present: [], future: [] };
      return { ...s, [id]: { past: [...h.past, h.present], present: list, future: [] } };
    });
  }, []);

  const undo = useCallback((id) => {
    setStore((s) => {
      const h = s[id];
      if (!h || !h.past.length) return s;
      return {
        ...s,
        [id]: { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] },
      };
    });
  }, []);

  const redo = useCallback((id) => {
    setStore((s) => {
      const h = s[id];
      if (!h || !h.future.length) return s;
      return {
        ...s,
        [id]: { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) },
      };
    });
  }, []);

  const canUndo = (id) => (store[id]?.past.length ?? 0) > 0;
  const canRedo = (id) => (store[id]?.future.length ?? 0) > 0;

  return { get, commit, undo, redo, canUndo, canRedo };
}
