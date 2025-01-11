/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
