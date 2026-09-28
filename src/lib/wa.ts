/**
 * WhatsApp links with a ref code so the admin can tell which page and button
 * a chat came from. Naming: HOME-*, ARM-*, {CITYCODE}-*, WED-*, KOR-*, TRV-*.
 * Campaign params (utm/gclid) are appended in the browser by public scripts,
 * because they only exist at visit time.
 */
export function waHref(phone: string, message: string, ref?: string): string {
  const text = message + (ref ? ` [Ref: ${ref}]` : '');
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export const refSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
