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
    const badge = (this.doc.querySelector('div[data-testid="token-address"]') as HTMLElement | null)?.innerText;
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
(chrome.runtime.onMessage as any).addListener((request: any, sender: any, sendResponse: any) => {
  if (request.action === "EXTRACT_TOKEN") {
    console.log("[Sentinel_AI] Initiating platform-aware intelligence scan...");
    hideSentinelHUD(); // Cleanup HUD if active
    const result = performFullExtraction();
    sendResponse(result);
  }

  if (request.action === "SHOW_VOICE_HUD") {
    showSentinelHUD(request.status || "WAITING");
    sendResponse({ success: true });
  }

  if (request.action === "SHOW_PERMISSION_ERROR") {
    showPermissionError();
    sendResponse({ success: true });
  }

  if (request.action === "HIDE_VOICE_HUD") {
    hideSentinelHUD();
    sendResponse({ success: true });
  }
  return true;
});

/**
 * Sentinel Operative HUD & Pinned Orb
 */
function bootstrapSentinelOrb() {
  if (document.getElementById('sentinel-pinned-orb')) return;

  const orb = document.createElement('div');
  orb.id = 'sentinel-pinned-orb';
  Object.assign(orb.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '48px',
    height: '48px',
    zIndex: '2147483647',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid rgba(0, 248, 187, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 20px rgba(0, 248, 187, 0.1)',
    backdropFilter: 'blur(10px)'
  });

  orb.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f8bb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
    <style>
      @keyframes breathing-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 248, 187, 0.2); border-color: rgba(0, 248, 187, 0.3); transform: scale(1); }
        50% { box-shadow: 0 0 40px rgba(0, 248, 187, 0.6); border-color: rgba(0, 248, 187, 0.8); transform: scale(1.1); }
      }
      @keyframes fast-pulse {
        0%, 100% { box-shadow: 0 0 10px #00f8bb; transform: scale(1); }
        50% { box-shadow: 0 0 30px #00f8bb; transform: scale(1.2); }
      }
      .sentinel-listening {
        animation: breathing-glow 2s ease-in-out infinite !important;
        background: rgba(0, 248, 187, 0.1) !important;
      }
      .sentinel-processing {
        animation: fast-pulse 0.5s infinite !important;
        border-color: #00f8bb !important;
      }
      @keyframes hud-pulse {
        0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px #00f8bb; }
        50% { opacity: 0.5; transform: scale(1.2); box-shadow: 0 0 20px #00f8bb; }
      }
    </style>
  `;

  document.body.appendChild(orb);
}

function showSentinelHUD(status: string = "WAITING") {
  hideSentinelHUD(); 
  const orb = document.getElementById('sentinel-pinned-orb');
  if (orb) {
    orb.classList.add('sentinel-listening');
    if (status !== "WAITING") orb.classList.add('sentinel-processing');
  }

  const hud = document.createElement('div');
  hud.id = 'sentinel-voice-hud';
  Object.assign(hud.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    padding: '12px 24px',
    background: 'rgba(0, 0, 0, 0.9)',
    border: '2px solid #00f8bb',
    borderRadius: '8px',
    color: '#00f8bb',
    fontFamily: '"Orbitron", "Inter", sans-serif',
    fontSize: '12px',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'none',
    boxShadow: '0 0 30px rgba(0, 248, 187, 0.3)',
    transition: 'all 0.3s ease'
  });

  let content = '';
  let duration = 5000;

  switch(status) {
    case 'HEARING':
      content = `<span>🟢</span> HEARING COMMAND...`;
      break;
    case 'ANALYZING':
      content = `<span style="animation: hud-pulse 1s infinite;">🛰️</span> ANALYZING OPERATIVE TARGET...`;
      break;
    case 'SUCCESS':
      content = `<span>✅</span> ANALYSIS COMPLETE: TRANSMITTING DATA`;
      duration = 3000;
      break;
    case 'NOT_FOUND':
      content = `<span>⚠️</span> SCAN FAILED: NO CONTRACT DETECTED`;
      hud.style.borderColor = "#ff4444";
      hud.style.color = "#ff4444";
      duration = 4000;
      break;
    case 'ERROR':
      content = `<span>❌</span> OPERATIVE ERROR: RETRY COMMAND`;
      hud.style.borderColor = "#ff4444";
      hud.style.color = "#ff4444";
      duration = 4000;
      break;
    default:
      content = `<span style="width: 10px; height: 10px; background: #00f8bb; border-radius: 50%; animation: hud-pulse 1s infinite;"></span> AWAITING INSTRUCTION: [SAY "SENTINEL"]`;
  }

  hud.innerHTML = content;
  document.body.appendChild(hud);
  
  if (status === "SUCCESS" || status === "ERROR" || status === "NOT_FOUND") {
     setTimeout(hideSentinelHUD, duration);
  }
}


function showPermissionError() {
  hideSentinelHUD();
  const hud = document.createElement('div');
  hud.id = 'sentinel-voice-hud';
  // ... (rest of style stays same)
  hud.innerHTML = `
    <span>⚠️</span>
    SENTINEL_ACCESS_DENIED: MIC PERMISSION REQUIRED
  `;
  document.body.appendChild(hud);
  setTimeout(hideSentinelHUD, 15000);
}

function hideSentinelHUD() {
  const existing = document.getElementById('sentinel-voice-hud');
  if (existing) existing.remove();
  const orb = document.getElementById('sentinel-pinned-orb');
  if (orb) orb.classList.remove('sentinel-listening');
}

// Global Initialization
bootstrapSentinelOrb();
console.log("[Sentinel_AI] Platform-Aware Extraction Engine (V3) initialized.");
