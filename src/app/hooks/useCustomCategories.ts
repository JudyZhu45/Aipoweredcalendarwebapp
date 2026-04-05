import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPreferences,
  createPreference,
  updatePreference,
  deletePreference,
  type UserPreferenceRecord,
} from '../../lib/api';

export interface CustomCategory {
  id: string;    // also used as eventType value
  name: string;
  emoji: string;
  color: string; // hex color
}

const CATEGORY_KEY_PREFIX = 'customEventTypes_';

function categoryKey(userId: string) {
  return `${CATEGORY_KEY_PREFIX}${userId}`;
}

export function useCustomCategories(userId: string | null) {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  // Hold the full DynamoDB record so we have id + _version for updates/deletes
  const recordRef = useRef<UserPreferenceRecord | null>(null);

  // ── Load on mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    (async () => {
      const all = await fetchPreferences();
      const key = categoryKey(userId);
      const record = all.find((p) => p.category === key) ?? null;
      recordRef.current = record;
      if (record) {
        try {
          setCategories(JSON.parse(record.content));
        } catch {
          setCategories([]);
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  // ── Add ───────────────────────────────────────────────────────────────────────
  const addCategory = useCallback(
    async (cat: Omit<CustomCategory, 'id'> & { id?: string }): Promise<CustomCategory | null> => {
      if (!userId) return null;

      const newCat: CustomCategory = {
        id: cat.id ?? cat.name.toLowerCase().replace(/\s+/g, '_'),
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
      };

      // Optimistic update
      const next = [...categories, newCat];
      setCategories(next);

      const contentStr = JSON.stringify(next);
      const key = categoryKey(userId);

      if (recordRef.current) {
        // Update existing record
        const updated = await updatePreference({
          id: recordRef.current.id,
          content: contentStr,
          _version: recordRef.current._version,
        });
        if (updated) recordRef.current = updated;
      } else {
        // Create new record
        const created = await createPreference({
          id: crypto.randomUUID(),
          category: key,
          content: contentStr,
          source: 'user',
          confirmedCount: 0,
          isTemporary: false,
        });
        if (created) recordRef.current = created;
      }

      return newCat;
    },
    [userId, categories]
  );

  // ── Remove ────────────────────────────────────────────────────────────────────
  const removeCategory = useCallback(
    async (id: string) => {
      if (!userId || !recordRef.current) return;

      const next = categories.filter((c) => c.id !== id);
      setCategories(next);

      if (next.length === 0) {
        await deletePreference(recordRef.current.id, recordRef.current._version ?? 1);
        recordRef.current = null;
      } else {
        const updated = await updatePreference({
          id: recordRef.current.id,
          content: JSON.stringify(next),
          _version: recordRef.current._version,
        });
        if (updated) recordRef.current = updated;
      }
    },
    [userId, categories]
  );

  return { categories, loading, addCategory, removeCategory };
}
