/**
 * Sentinel AI: FourScan Background Service Worker
 */

const BACKEND_URL = "https://sentinel-ai-ruddy.vercel.app/api/audit";

import { apiClient } from './lib/api-client';

/**
 * Ensures the Offscreen Document is active for continuous voice listening.
 */
async function setupOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen.html'),
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK, chrome.offscreen.Reason.USER_MEDIA],
    justification: 'Sentinel AI needs background microphone access for the "Hey Sentinel" wake-word listener.',
  });
}

// Initialize on startup
chrome.runtime.onStartup.addListener(setupOffscreen);
chrome.runtime.onInstalled.addListener(setupOffscreen);

// Utility: Safe Messaging to Tab (Ignores internal Chrome pages)
async function safeMessageToTab(tabId: number, message: any) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || "";
    const isSupported = url.includes('four.meme') || url.includes('dexscreener.com') || url.includes('x.com') || url.includes('twitter.com') || url.includes('web.telegram.org');
    
    if (isSupported) {
      return await chrome.tabs.sendMessage(tabId, message);
    }
  } catch (e) {
    // Silent Error Protocol: Suppress connection failures for non-supported tabs
  }
}

async function handleVoiceScan(transcript?: string) {
  console.log("[Sentinel_AI] Executing Voice Command Protocol. Context:", transcript || "None");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Show "HEARING" state in HUD via content script
  await safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD", status: "HEARING" });

  try {
    // Trigger extraction in the content script
    const extraction = await safeMessageToTab(tab.id, { action: "EXTRACT_TOKEN" });
    
    if (!extraction || extraction.confidence < 0.3) {
      console.warn("[Sentinel_AI] Extraction failed or low confidence. Aborting voice scan.");
      await safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD", status: "NOT_FOUND" });
      return;
    }

    // Update HUD to ANALYZING
    await safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD", status: "ANALYZING" });

    // Perform full analysis
    performAnalysis(extraction, "voice", (res: any) => {
      if (res.success && res.data.audioBase64) {
        // Send to offscreen for playback
        chrome.runtime.sendMessage({ 
          action: "PLAY_VOICE_RESULT", 
          audioBase64: res.data.audioBase64 
        });
        // Success HUD state
        safeMessageToTab(tab.id!, { action: "SHOW_VOICE_HUD", status: "SUCCESS" });
      } else {
        console.error("[Sentinel_AI] Analysis failed:", res.error);
        safeMessageToTab(tab.id!, { action: "SHOW_VOICE_HUD", status: "ERROR" });
      }
    });
  } catch (error) {
    console.error("[Sentinel_AI] Voice Scan Error:", error);
    await safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD", status: "ERROR" });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "WAKE_WORD_DETECTED") {
    handleVoiceScan(request.transcript);
  }

  if (request.action === "TRIGGER_COMMAND_LISTENING") {
    console.log("[Sentinel_AI] Manual trigger received. Initializing Offscreen Listener.");
    chrome.runtime.sendMessage({ action: "START_TRIGGERED_LISTENING" });
  }

  if (request.action === "UPDATE_HUD_PHASE") {
    // Proxy phase updates from offscreen to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD", status: request.phase });
      }
    });
  }

  if (request.action === "MIC_PERMISSION_DENIED") {
    console.warn("[Sentinel_AI] Mic Permission Denied. Initializing Authorization Bridge...");
    const setupUrl = chrome.runtime.getURL('setup.html');
    
    chrome.tabs.query({ url: setupUrl }, (tabs) => {
      if (tabs.length === 0) {
        chrome.tabs.create({ url: setupUrl });
      } else {
        chrome.tabs.update(tabs[0].id!, { active: true });
      }
    });
  }

  if (request.action === "ANALYZE_TOKEN") {
    const { extraction, scanMode = "manual" } = request;
    performAnalysis(extraction, scanMode, (res: any) => {
       sendResponse(res);
    });
    return true; 
  }
});



async function performAnalysis(extraction: any, scanMode: string, callback: Function) {
    apiClient.analyzeToken({
      ...extraction,
      scanMode
    })
    .then(data => callback({ success: true, data }))
    .catch(error => callback({ success: false, error: error.message }));
}

// Keyboard Shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "_execute_action") {
    try {
       chrome.action.openPopup(); 
    } catch (e) {
       // Open setup as fallback if popup fails
       chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    }
  }

  if (command === "trigger-voice-protocol") {
    console.log("[Sentinel_AI] Voice Protocol Initialized (Ctrl+Shift+V)");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Force HUD to appear regardless of URL for visual feedback
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "SHOW_VOICE_HUD", status: "WAITING", force: true });
    } catch (e) {
      // Content script may not be loaded on this specific tab
      console.warn("[Sentinel_AI] HUD failed to load on this tab. Extension may not support this origin.");
    }

    // Ensure offscreen listener is ready
    await setupOffscreen();
  }
});


console.log("[Sentinel_AI] Background operative layer active (Vercel Sync).");
