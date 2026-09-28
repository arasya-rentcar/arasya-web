import type { Faq, Settings } from './content';
import type { Lang } from './i18n';

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

/** Adds the cancellation policy as the last FAQ item, written out in one answer. */
export function withPolicy(faq: Faq[], s: Settings, lang: Lang = 'id'): Faq[] {
  const cp = s.cancellationPolicy;
  if (!cp?.items?.length) return faq;
  const question = lang === 'en' ? 'What is your cancellation policy?' : 'Bagaimana kebijakan pembatalannya?';
  if (faq.some((f) => f.question === question)) return faq;
  const answer = cp.items.map((it) => `${it.when}: ${it.fee.charAt(0).toLowerCase()}${it.fee.slice(1)}.`).join(' ');
  return [...faq, { question, answer }];
}
