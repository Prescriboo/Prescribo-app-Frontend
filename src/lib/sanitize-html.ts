import DOMPurify from 'dompurify'

/**
 * Sanitize HTML string for safe rendering via dangerouslySetInnerHTML.
 * Removes scripts, event handlers, and other dangerous content.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  if (typeof window === 'undefined') {
    // SSR fallback: strip all tags to be safe
    return dirty.replace(/<[^>]*>?/gm, '')
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'strike',
      'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'sup', 'sub', 'small', 'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'style', 'class', 'align',
      'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
  })
}
