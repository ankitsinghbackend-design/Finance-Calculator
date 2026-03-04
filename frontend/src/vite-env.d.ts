/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_BAIT_PATH?: string
  readonly VITE_ADBLOCK_LOG_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
