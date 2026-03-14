import type { TimelineCard } from '../game/types';

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

const getOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeCards = (raw: unknown[]): TimelineCard[] => {
  const ids = new Set<string>();
  const normalized: TimelineCard[] = [];

  for (const entry of raw) {
    const record = asRecord(entry);
    if (!record) {
      continue;
    }

    const id = getOptionalString(record.id);
    const title = getOptionalString(record.title);
    const year = record.year;

    if (!id || !title || typeof year !== 'number' || !Number.isInteger(year)) {
      continue;
    }

    if (ids.has(id)) {
      continue;
    }

    ids.add(id);
    normalized.push({
      id,
      title,
      year,
      description: getOptionalString(record.description) ?? getOptionalString(record.details),
      imageUrl: getOptionalString(record.imageUrl) ?? getOptionalString(record.image),
      category: getOptionalString(record.category),
    });
  }

  return normalized;
};
