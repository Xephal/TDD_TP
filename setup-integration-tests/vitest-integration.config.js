import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Project root
    root: path.resolve(__dirname, ".."),

  // Only run integration tests (matches your files like book-ride.integration.spec.ts)
  include: ["test/integration/**/*.integration.spec.ts"],
    environment: "node",

    // Increase timeouts to allow Docker to start
    hookTimeout: 120_000,
    testTimeout: 120_000,

    // Start/stop Dockerized Postgres and run migrations
    globalSetup: path.resolve(__dirname, "./setup-postgresql-docker.ts"),
    globalTeardown: path.resolve(__dirname, "./teardown-postgresql-docker.ts"),

    coverage: {
      include: ["**/*.ts"],
      exclude: ["test/**/*.spec.ts"],
    },

    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
});
