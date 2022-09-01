import { build } from "esbuild";

build({
  bundle: true,
  entryPoints: ["./bin.ts"],
  platform: "node",
  format: "esm",
  target: "es2020",
  external: ["./node_modules/*"],
  outdir: "./build/",
  banner: { js: "#!/usr/bin/env node" },
});
