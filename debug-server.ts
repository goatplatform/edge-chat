import { startDebugServer } from "@goatdb/goatdb/server";
import { registerSchemas } from "./schema.ts";

async function main(): Promise<void> {
  registerSchemas();
  await startDebugServer({
    path: "./server-data",
    jsPath: "./scaffold/index.tsx",
    htmlPath: "./scaffold/index.html",
    cssPath: "./scaffold/index.css",
    assetsPath: "./assets",
    watchDir: "./",
    buildDir: "./build",
  });
}

if (import.meta.main) main();
