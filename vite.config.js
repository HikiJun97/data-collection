import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: ["./index.html", "./login.html"], // 'login.html' 파일의 경로를 정확하게 지정하세요.
    },
    chunkSizeWarningLimit: 1000,
  },
});
