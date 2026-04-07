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
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK, chrome.offscreen.Reason.USER_MEDIA],
    justification: 'Sentinel AI needs background microphone access for the "Hey Sentinel" wake-word listener.',
  });
}

// Initialize on startup
chrome.runtime.onStartup.addListener(setupOffscreen);
chrome.runtime.onInstalled.addListener(setupOffscreen);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "WAKE_WORD_DETECTED") {
    handleVoiceScan();
  }

  if (request.action === "MIC_PERMISSION_DENIED") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { action: "SHOW_PERMISSION_ERROR" });
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
  const extraction = await chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_TOKEN" });
  if (!extraction || extraction.confidence === 0) return;

  // Perform full analysis
  performAnalysis(extraction, "voice", (res: any) => {
    if (res.success && res.data.audioBase64) {
      // Send back to offscreen for playback
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

    // Show HUD to the user
    chrome.tabs.sendMessage(tab.id, { action: "SHOW_VOICE_HUD" });

    // Ensure offscreen is ready
    await setupOffscreen();
  }
});

console.log("[Sentinel_AI] Background operative layer active (Vercel Sync).");
