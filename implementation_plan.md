# Sentinel AI: Extension Distribution & Production Packaging

I will package the **Sentinel AI** extension into a production-ready "Downloadable" format. This involves building a standalone build system that transpiles our high-fidelity React components and TypeScript scripts into a single `dist/` folder that can be instantly loaded into any Chrome/Edge browser.

## Proposed Changes

### Build Infrastructure
#### [NEW] [package.json](file:///c:/Users/USER/Downloads/Four.meme/sentinel-extension/package.json)
- Define `build` and `watch` scripts specifically for the Manifest V3 extension.

#### [NEW] [vite.config.ts](file:///c:/Users/USER/Downloads/Four.meme/sentinel-extension/vite.config.ts)
- Configure Vite to bundle:
  - `src/popup/Popup.tsx` -> `dist/popup.js` 
  - `src/content.ts` -> `dist/content.js`
  - `src/background.ts` -> `dist/background.js`

### Manifest Synchronization
#### [MODIFY] [manifest.json](file:///c:/Users/USER/Downloads/Four.meme/sentinel-extension/manifest.json)
- Update paths to point to the built `dist/` assets, ensuring the extension is "Production-Ready".

### Distribution Walkthrough
I will provide a high-fidelity **Walkthrough** artifact with screenshots/diagrams explaining how to:
1.  Run the build command.
2.  Open `chrome://extensions`.
3.  Enable "Developer Mode".
4.  Click "Load Unpacked" and select the `sentinel-extension/dist` folder.

---

## Verification Plan

### Automated Verification
- Run `npm run build` in the extension directory and confirm all 3 entry points (popup, content, background) are present in `dist/`.
- Verify the `manifest.json` correctly references the built JS files.

### Manual Verification
- I'll provide the user with the steps to load the extension and confirm real-time token extraction on **Four.Meme**.
