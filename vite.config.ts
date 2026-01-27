import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [react()],
  base: "/flow_project/", // GitHub Pages 저장소 명에 맞게 베이스 경로 설정
});
