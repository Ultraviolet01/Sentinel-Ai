/**
 * Universal BSC Address Sanitizer
 * Extracts a 0x hex address from raw CA, Four.Meme URLs, or DexScreener links.
 */
export function sanitizeAddress(query: string): string {
  if (!query) return '';
  
  const trimmed = query.trim().toLowerCase();
  
  // 1. Regular Expression (Most Robust)
  // Looks for 0x followed by exactly 40 hex characters
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const match = trimmed.match(addressRegex);
  
  if (match) {
    const result = match[0].toLowerCase();
    console.log(`[Sentinel_Sanitizer] Extraction Successful: ${result}`);
    return result;
  }
  
  // 2. Direct Hex Check (Fallback)
  if (trimmed.startsWith('0x') && trimmed.length === 42) {
    return trimmed;
  }
  
  console.warn(`[Sentinel_Sanitizer] Extraction Failed for input: ${query}`);
  return trimmed; // Return raw as last resort (API will catch invalid format)
}
