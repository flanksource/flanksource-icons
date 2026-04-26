/**
 * Bundle the codegenned src/ into ESM + CJS + .d.ts files in dist/.
 */
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rmSync, existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const distDir = join(pkgRoot, "dist");

async function main() {
  if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });

  const entryPoint = join(pkgRoot, "src", "index.ts");

  await build({
    entryPoints: [entryPoint],
    outfile: join(distDir, "index.mjs"),
    bundle: true,
    format: "esm",
    platform: "neutral",
    jsx: "automatic",
    external: ["react", "react/jsx-runtime"],
    target: ["es2020"],
  });

  await build({
    entryPoints: [entryPoint],
    outfile: join(distDir, "index.js"),
    bundle: true,
    format: "cjs",
    platform: "neutral",
    jsx: "automatic",
    external: ["react", "react/jsx-runtime"],
    target: ["es2020"],
  });

  // Type declarations via tsc --emitDeclarationOnly.
  execSync("pnpm exec tsc --emitDeclarationOnly --declaration --outDir dist", {
    cwd: pkgRoot,
    stdio: "inherit",
  });

  console.log("Bundled to", distDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
