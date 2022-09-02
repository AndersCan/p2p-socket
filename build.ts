import { build } from "esbuild";

let makeAllPackagesExternalPlugin = {
  name: "make-all-packages-external",
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};

build({
  bundle: true,
  preserveSymlinks: true,
  entryPoints: ["./bin.ts"],
  external: ["./node_modules/*"],
  platform: "node",
  format: "esm",
  target: "es2020",
  outdir: "./build/",
  banner: { js: "#!/usr/bin/env node" },
  plugins: [makeAllPackagesExternalPlugin],
});
