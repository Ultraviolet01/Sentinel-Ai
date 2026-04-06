/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_BSC_RPC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
