/**
 * Universal BSC Address Sanitizer
 * Extracts a 0x hex address from raw CA, Four.Meme URLs, or DexScreener links.
 */
export function sanitizeAddress(query: string): string {
  if (!query) return '';
  
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const match = query.match(addressRegex);
  
  if (match) {
    return match[0].toLowerCase();
  }
  
  // Fallback for cases where regex might miss but query is already a cleaned CA
  const trimmed = query.trim().toLowerCase();
  if (trimmed.startsWith('0x') && trimmed.length === 42) {
    return trimmed;
  }
  
  return trimmed;
}
