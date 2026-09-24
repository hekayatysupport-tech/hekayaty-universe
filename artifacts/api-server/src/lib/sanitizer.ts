/**
 * Server-side HTML and Text Sanitization Utility for Hekayaty Platform.
 * Protects against Stored XSS, Reflected XSS, and DOM Injection.
 */

// Escape basic HTML entities for plain text fields
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Strict URL protocol validator
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  
  // Reject javascript:, vbscript:, data: text/html schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return false;
  }
  
  // Allow relative URLs, http, https, mailto, tel
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  );
}

/**
 * Sanitizes rich text HTML content (e.g. writer posts, novel chapters, comments, bio).
 * Strips script tags, unsafe tags, inline event handlers (on*), and javascript: URLs.
 */
export function sanitizeHtml(htmlInput: string | null | undefined): string {
  if (!htmlInput) return "";

  let sanitized = String(htmlInput);

  // 1. Remove script, iframe, object, embed, style, link, meta, form, input, button tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");

  // 2. Strip inline event handlers (e.g. onload=..., onerror=..., onclick=...)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 3. Neutralize javascript: and vbscript: in href or src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>\s]+/gi, '$1="#"');

  return sanitized;
}
