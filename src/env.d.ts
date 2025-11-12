/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // kamu bisa tambahkan variabel environment lainnya di sini jika ada
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
