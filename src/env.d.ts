/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly YOUTUBE_API_KEY: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
