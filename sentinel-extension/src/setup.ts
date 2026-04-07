/**
 * Sentinel AI: Agent Authorization Bridge
 * Manually requests mic permission for the extension origin.
 */

const authBtn = document.getElementById('auth-btn');
const statusText = document.getElementById('status-text');

if (authBtn) {
  authBtn.onclick = async () => {
    try {
      if (statusText) statusText.innerText = "Initializing secure media bridge...";
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (statusText) statusText.innerText = "CALIBRATION_SUCCESS: OPERATIVE AUTHORIZED";
      if (authBtn) {
        authBtn.innerText = "AUTHORIZED";
        authBtn.style.background = "#fff";
        authBtn.style.color = "#000";
        (authBtn as HTMLButtonElement).disabled = true;
      }

      // Close this setup tab after a short delay
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (err: any) {
      console.error("[Sentinel_Setup] Calibration failed:", err);
      if (statusText) statusText.innerText = `CALIBRATION_ERROR: ${err.message}`;
    }
  };
}
