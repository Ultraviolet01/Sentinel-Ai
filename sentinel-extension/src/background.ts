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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "WAKE_WORD_DETECTED") {
    handleVoiceScan();
  }

  if (request.action === "MIC_PERMISSION_DENIED") {
    console.warn("[Sentinel_AI] Mic Permission Denied. Initializing Authorization Bridge...");
    const setupUrl = chrome.runtime.getURL('setup.html');
    
    // Check if the setup tab is already open to prevent infinite loops
    chrome.tabs.query({ url: setupUrl }, (tabs) => {
      if (tabs.length === 0) {
        chrome.tabs.create({ url: setupUrl });
      } else {
        // Bring existing setup tab to the front
        chrome.tabs.update(tabs[0].id!, { active: true });
      }
    });
  }

  if (request.action === "ANALYZE_TOKEN") {
    const { extraction, scanMode = "manual" } = request;
    performAnalysis(extraction, scanMode, sendResponse);
    return true; 
  }
});

async function handleVoiceScan() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Trigger extraction in the content script
  const extraction = await safeMessageToTab(tab.id, { action: "EXTRACT_TOKEN" });
  if (!extraction || extraction.confidence === 0) return;

  // Perform full analysis
  performAnalysis(extraction, "voice", (res: any) => {
    if (res.success && res.data.audioBase64) {
      chrome.runtime.sendMessage({ 
        action: "PLAY_VOICE_RESULT", 
        audioBase64: res.data.audioBase64 
      });
    }
  });
}

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
    chrome.action.openPopup(); 
  }

  if (command === "trigger-voice-protocol") {
    console.log("[Sentinel_AI] Voice Protocol Initialized (Ctrl+Shift+V)");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Show HUD to the user (Safe Check)
    await safeMessageToTab(tab.id, { action: "SHOW_VOICE_HUD" });

    // Ensure offscreen is ready
    await setupOffscreen();
  }
});

console.log("[Sentinel_AI] Background operative layer active (Vercel Sync).");
