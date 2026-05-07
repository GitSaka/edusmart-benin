export const TYPES_NOTE = ["INT1","INT2","INT3","INT4","DEV1","DEV2"] as const;

export type TypeNote = typeof TYPES_NOTE[number];

export function isTypeNote(value: string): value is TypeNote {
  return TYPES_NOTE.includes(value as TypeNote);
}