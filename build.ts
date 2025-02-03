import { compile } from "@goatdb/goatdb/server";

async function main(): Promise<void> {
  await compile({
    buildDir: "./build",
    serverEntry: "./server.ts",
    jsPath: "./scaffold/index.tsx",
    htmlPath: "./scaffold/index.html",
    cssPath: "./scaffold/index.css",
    assetsPath: "./assets",
    os: "linux",
    arch: "aar64",
  });
  Deno.exit();
}

if (import.meta.main) main();
