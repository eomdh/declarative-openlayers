import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // 데모가 재사용하는 샘플. #2(browser-geotiff-epsg5179)의 필지 데이터를 여기 둔다.
  publicDir: "public",
  test: {
    // 코어 테스트는 OL Map 을 헤드리스로 띄우므로 DOM 이 필요하다.
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
