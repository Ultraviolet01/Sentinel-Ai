/**
 * Sentinel AI: Platform-Aware Extraction Engine
 * High-fidelity, domain-specific token identification.
 */

interface ExtractionResult {
  sourcePlatform: "fourmeme" | "dexscreener" | "twitter" | "telegram" | "generic";
  pageUrl: string;
  pageTitle: string;
  contractAddress?: string;
  fourMemeUrl?: string;
  dexscreenerUrl?: string;
  tokenName?: string;
  tokenTicker?: string;
  extractedText: string[];
  confidence: number;
  detectionReason: string;
}

/**
 * Base Parser Logic
 */
abstract class BaseParser {
  protected url: string = window.location.href;
  protected doc: Document = document;

  abstract extract(): Partial<ExtractionResult>;

  protected findCA(text: string): string | undefined {
    const regex = /0x[a-fA-F0-9]{40}/;
    const match = text.match(regex);
    return match ? match[0].toLowerCase() : undefined;
  }

  protected distillCommonText(): string[] {
    const blocks: string[] = [];
    const elements = Array.from(this.doc.querySelectorAll('h1, h2, p, span.address'));
    for (const el of elements.slice(0, 10)) {
      const text = (el as HTMLElement).innerText.trim();
      if (text.length > 10) blocks.push(text.substring(0, 200));
    }
    return blocks;
  }
}

/**
 * Four.Meme Specialized Parser
 */
class FourMemeParser extends BaseParser {
  extract(): Partial<ExtractionResult> {
    const caFromUrl = this.findCA(this.url);
    const h1 = this.doc.querySelector('h1')?.innerText;

    return {
      sourcePlatform: 'fourmeme',
      contractAddress: caFromUrl,
      tokenName: h1,
      confidence: caFromUrl ? 1.0 : 0.6,
      detectionReason: caFromUrl ? "Resolved CA from Four.Meme URL" : "Four.Meme context detected"
    };
  }
}

/**
 * DexScreener Specialized Parser
 */
class DexScreenerParser extends BaseParser {
  extract(): Partial<ExtractionResult> {
    const caFromUrl = this.findCA(this.url);
    // DexScreener often has the address in a specific info badge
    const badge = this.doc.querySelector('div[data-testid="token-address"]')?.innerText;
    const caFromBadge = badge ? this.findCA(badge) : undefined;

    return {
      sourcePlatform: 'dexscreener',
      contractAddress: caFromUrl || caFromBadge,
      confidence: (caFromUrl || caFromBadge) ? 1.0 : 0.5,
      detectionReason: caFromUrl ? "Resolved CA from DexScreener pair URL" : (caFromBadge ? "Resolved CA from DexScreener badge" : "DexScreener context detected")
    };
  }
}

/**
 * X/Twitter Specialized Parser
 */
class XTwitterParser extends BaseParser {
  extract(): Partial<ExtractionResult> {
    // Scrape visible tweet text
    const tweets = Array.from(this.doc.querySelectorAll('[data-testid="tweetText"]'));
    let foundCA: string | undefined;
    const texts: string[] = [];

    for (const tweet of tweets) {
      const txt = (tweet as HTMLElement).innerText;
      texts.push(txt.substring(0, 200));
      if (!foundCA) foundCA = this.findCA(txt);
    }

    return {
      sourcePlatform: 'twitter',
      contractAddress: foundCA,
      extractedText: texts,
      confidence: foundCA ? 0.8 : 0.3,
      detectionReason: foundCA ? "Extracted CA from Twitter thread" : "Twitter context detected"
    };
  }
}

/**
 * Telegram Specialized Parser
 */
class TelegramParser extends BaseParser {
  extract(): Partial<ExtractionResult> {
    const messages = Array.from(this.doc.querySelectorAll('.message, .text-content'));
    let foundCA: string | undefined;
    const texts: string[] = [];

    for (const msg of messages) {
      const txt = (msg as HTMLElement).innerText;
      texts.push(txt.substring(0, 200));
      if (!foundCA) foundCA = this.findCA(txt);
    }

    return {
      sourcePlatform: 'telegram',
      contractAddress: foundCA,
      extractedText: texts,
      confidence: foundCA ? 0.8 : 0.3,
      detectionReason: foundCA ? "Extracted CA from Telegram message" : "Telegram context detected"
    };
  }
}

/**
 * Generic Fallback Parser
 */
class GenericParser extends BaseParser {
  extract(): Partial<ExtractionResult> {
    const ca = this.findCA(this.url) || this.findCA(this.doc.body.innerText);
    return {
      sourcePlatform: 'generic',
      contractAddress: ca,
      confidence: ca ? 0.7 : 0.2,
      detectionReason: ca ? "Contract found via generic text scan" : "Awaiting operative target"
    };
  }
}

/**
 * Scraper Orchestrator
 */
function performFullExtraction(): ExtractionResult {
  const url = window.location.href;
  let parser: BaseParser;

  if (url.includes('four.meme')) parser = new FourMemeParser();
  else if (url.includes('dexscreener.com')) parser = new DexScreenerParser();
  else if (url.includes('x.com') || url.includes('twitter.com')) parser = new XTwitterParser();
  else if (url.includes('web.telegram.org')) parser = new TelegramParser();
  else parser = new GenericParser();

  const platformData = parser.extract();
  const commonText = (parser as any).distillCommonText();

  return {
    sourcePlatform: platformData.sourcePlatform || 'generic',
    pageUrl: url,
    pageTitle: document.title,
    contractAddress: platformData.contractAddress,
    fourMemeUrl: platformData.fourMemeUrl,
    dexscreenerUrl: platformData.dexscreenerUrl,
    tokenName: platformData.tokenName,
    tokenTicker: platformData.tokenTicker,
    extractedText: platformData.extractedText || commonText,
    confidence: platformData.confidence || 0,
    detectionReason: platformData.detectionReason || "Contextual analysis"
  };
}

// Listen for messages from the Sentinel Terminal (Extension Action)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_TOKEN") {
    console.log("[Sentinel_AI] Initiating platform-aware intelligence scan...");
    const result = performFullExtraction();
    sendResponse(result);
  }
  return true;
});

console.log("[Sentinel_AI] Platform-Aware Extraction Engine (V3) initialized.");
