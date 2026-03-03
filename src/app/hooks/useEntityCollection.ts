import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface EntityWithId {
  id: string;
}

type CollectionSetter<T> = Dispatch<SetStateAction<T[]>>;

export interface EntityCollectionState<T extends EntityWithId> {
  items: T[];
  setItems: CollectionSetter<T>;
  addItem: (item: T) => void;
  addItems: (items: T[]) => void;
  removeById: (id: string) => void;
  removeWhere: (predicate: (item: T) => boolean) => void;
  updateById: (id: string, updater: (item: T) => T) => void;
  clearItems: () => void;
}

export function useEntityCollection<T extends EntityWithId>(
  initialItems: T[] = []
): EntityCollectionState<T> {
  const [items, setItems] = useState<T[]>(initialItems);

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const addItems = useCallback((nextItems: T[]) => {
    if (nextItems.length === 0) return;
    setItems((prev) => [...prev, ...nextItems]);
  }, []);

  const removeById = useCallback((id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const removeWhere = useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => {
      let changed = false;
      const next = prev.filter((item) => {
        const shouldRemove = predicate(item);
        if (shouldRemove) changed = true;
        return !shouldRemove;
      });
      return changed ? next : prev;
    });
  }, []);

  const updateById = useCallback((id: string, updater: (item: T) => T) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      return prev.map((item) => (item.id === id ? updater(item) : item));
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    setItems,
    addItem,
    addItems,
    removeById,
    removeWhere,
    updateById,
    clearItems,
  };
}
