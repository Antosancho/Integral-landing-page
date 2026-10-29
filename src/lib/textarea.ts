/** Alto mínimo y máximo del textarea del formulario, en px. */
export const TEXTAREA_LIMITS = { minHeight: 144, maxHeight: 320 } as const;

export interface TextareaMeasure {
  scrollHeight: number;
  borderY: number; // borde superior + inferior
  minHeight: number;
  maxHeight: number;
}

/** Alto a aplicar y si hace falta scroll (el contenido supera el máximo). */
export function textareaHeight(m: TextareaMeasure): { height: number; scrollable: boolean } {
  if (
    !Number.isFinite(m.scrollHeight) ||
    !Number.isFinite(m.borderY) ||
    m.scrollHeight < 0 ||
    m.borderY < 0
  ) {
    return { height: m.minHeight, scrollable: false };
  }
  const content = m.scrollHeight + m.borderY;
  return {
    height: Math.min(Math.max(content, m.minHeight), m.maxHeight),
    scrollable: content > m.maxHeight,
  };
}
