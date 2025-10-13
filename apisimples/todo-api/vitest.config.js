// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
    },
  },
});
