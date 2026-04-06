/**
 * Sentinel AI: Background Service Worker (Production JS)
 */

const BACKEND_URL = "http://localhost:3000/api/audit";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ANALYZE_TOKEN") {
        const { extraction, scanMode = "manual" } = request;

        fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...extraction, scanMode })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Normalize response for the popup
                    const audit = data.data;
                    sendResponse({
                        success: true,
                        data: {
                            score: audit.result.scores.risk,
                            riskLevel: audit.result.finalVerdict === "Promising" ? "Low" : "High",
                            confidence: audit.result.confidenceLevel,
                            shortSummary: audit.result.summary,
                            redFlags: audit.result.topRedFlags,
                            positives: audit.result.topPositiveSignals,
                            fullReportUrl: `http://localhost:3000/scan/${audit.metadata.address}`,
                            audioBase64: audit.audioBase64
                        }
                    });
                } else {
                    sendResponse({ success: false, error: data.error });
                }
            })
            .catch(error => {
                sendResponse({ success: false, error: "Sentinel Backend unreachable." });
            });

        return true;
    }
    return true;
});

console.log("[Sentinel_AI] background.js active.");
