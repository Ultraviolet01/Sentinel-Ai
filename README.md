# Sentinel AI: Integrated Intelligence Platform

The **Sentinel AI** ecosystem is a premium, real-time security and auditing suite for the crypto ecosystem. It combines a high-fidelity intelligence dashboard with a platform-aware browser extension to provide immediate risk assessments for tokens on Four.Meme, DexScreener, X, and Telegram.

## 🌐 Sentinel AI Dashboard (Web App)
The central intelligence hub for deep-scrutiny audits, risk scoring, and voice-assisted diagnostic reports.

- **Live URL**: [https://sentinel-ai-ruddy.vercel.app](https://sentinel-ai-ruddy.vercel.app)
- **Tech Stack**: Next.js 15+, React 19, Tailwind CSS, Framer Motion, Google Gemini AI.

### 🛠️ Web App Setup
1. **Clone the repository**: `git clone https://github.com/Ultraviolet01/Sentinel-Ai.git`
2. **Install dependencies**: `npm install`
3. **Configure Environment Variables**: Create a `.env` file with:
   ```env
   GEMINI_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed.binance.org
   ```
4. **Run development server**: `npm run dev`

---

## 🧩 FourScan Browser Extension
A Manifest V3 tool that brings Sentinel AI's operative intelligence directly to your trading floor.

### 🚀 Installation (Developer Mode)
1. Navigate to the `sentinel-extension/` directory.
2. Run `npm install && npm run build` to generate the production `dist/` folder.
3. Open **Chrome** and go to `chrome://extensions/`.
4. Enable **"Developer mode"** (top right).
5. Click **"Load unpacked"** and select the `/sentinel-extension` folder.

### 🛠️ Key Commands
- **Manual Scan**: Click the extension icon on any token page.
- **Terminal Shortcut**: `Ctrl + Shift + S` (Windows) or `Command + Shift + S` (Mac).
- **Voice Mode**: Click the Microphone in the popup to enable real-time auditory verdicts.

---

## 🏗️ Project Structure
```text
.
├── sentinel-extension/    # Manifest V3 Chrome Extension (React + Vite)
├── src/                   # Next.js Dashboard Source
├── public/                # Static Assets
└── package.json           # Root Project Configuration
```

## 🍱 Verification Checklist
- [x] Production build successful (Next.js 16.2.2).
- [x] Environment variables synchronized on Vercel.
- [x] Extension packaged with clean `dist/` artifacts.

---
**Build 1.0.0 // Operative Status: LIVE & SECURED**
