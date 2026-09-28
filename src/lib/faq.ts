import type { Faq } from './content';

/**
 * Put a page's short factual answer at the top of its FAQ (unless the same
 * question is already there). The answer also opens a section as plain copy;
 * the FAQ copy is what FAQPage JSON-LD points at.
 */
export function withAnswer(faq: Faq[] | undefined, question: string | undefined, answer: string | undefined): Faq[] {
  const list = faq || [];
  if (!question || !answer) return list;
  return [{ question, answer }, ...list.filter((f) => f.question !== question)];
}
