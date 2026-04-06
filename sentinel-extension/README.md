# Sentinel AI: FourScan Browser Extension Setup

The **Sentinel AI** extension (branded as **FourScan**) is a Manifest V3 browser tool that brings the power of the Sentinel AI dashboard directly to your trading floor on Four.Meme, DexScreener, X/Twitter, and Telegram.

## 🚀 Installation (Developer Mode)

1.  **Clone / Download** the `sentinel-extension` directory.
2.  Open **Chrome** and navigate to: `chrome://extensions/`.
3.  Enable **"Developer mode"** (top right toggle).
4.  Click **"Load unpacked"** and select the `/sentinel-extension` folder.
5.  Pin the **Sentinel AI: FourScan** icon to your toolbar.

## 🛠️ Usage Instructions

### 1. Manual Audit
Navigate to any token page (e.g. `four.meme/token/0x...`) and click the extension icon. The Sentinel will automatically extract the contract address and generate an audit trace.

### 2. Keyboard Shortcut (Wake Word Simulation)
Use the following shortcut to trigger the Sentinel terminal instantly:
- **Mac**: `Command + Shift + S`
- **Windows / Linux**: `Ctrl + Shift + S`

### 3. Voice Mode
Click the **Microphone** icon in the popup. While active, the Sentinel will listen for trading commands (Note: V1 requires the popup to be open for speech recognition due to Chrome privacy restrictions).

## 🏢 Technical Architecture
- **Manifest V3**: Using modern service workers and host permissions.
- **Content-Script Scraper**: High-fidelity DOM extraction of BSC addresses.
- **Background API Proxy**: Routes extension requests through the existing Sentinel AI backend (`/api/audit`).
- **React + Tailwind**: Premium operative dark UI for high-density diagnostic data.

## 🍱 Verification Checklist
- [ ] Install extension in Developer Mode.
- [ ] Verify contract extraction on Four.Meme.
- [ ] Verify score and risk badge delivery.
- [ ] Verify "Open Full Report" link navigation.

> [!IMPORTANT]
> **Backend Dependency**: Ensure your Sentinel AI backend is running on `http://localhost:3000` for the extension to connect and provide real-time audits.

---
**Build 1.0.0 // Operative Terminal Ready**
