/**
 * Sentinel AI: FourScan Background Service Worker
 * Handles API calls to the existing Sentinel AI backend.
 */

const BACKEND_URL = "http://localhost:3000/api/audit";

import { apiClient } from './lib/api-client';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_TOKEN") {
    const { extraction, scanMode = "manual" } = request;
    
    // Dispatch to typed API Client
    apiClient.analyzeToken({
      sourcePlatform: extraction.sourcePlatform,
      pageUrl: extraction.pageUrl,
      pageTitle: extraction.pageTitle,
      contractAddress: extraction.contractAddress,
      fourMemeUrl: extraction.fourMemeUrl,
      dexscreenerUrl: extraction.dexscreenerUrl,
      tokenName: extraction.tokenName,
      tokenTicker: extraction.tokenTicker,
      extractedText: extraction.extractedText,
      scanMode
    })
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error("[Sentinel_AI] Analysis failure:", error.message);
      sendResponse({ success: false, error: error.message || "Backend connectivity failure." });
    });
    
    return true; // Keep message channel open for async response
  }
});

// Event listener for Keyboard Shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    // This triggers the default_popup in Manifest V3
    chrome.action.openPopup(); 
  }
});

console.log("[Sentinel_AI] Background operative layer active.");
