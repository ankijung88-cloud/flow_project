import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [react()],
  base: "./", // 이 부분을 추가하여 상대 경로로 빌드되게 합니다.
});
