import * as esbuild from "esbuild";
import dependencies from "./package.json";

// ES Modules/CommonJSで共通のビルド設定
const buildSetting = {
  entryPoints: ["src/index.ts"],
  external: Object.keys(dependencies),
  bundle: true,
  minify: true,
  sourcemap: false,
};

// ES Modules向けのビルド
esbuild.build({
  format: "esm",
  target: ["ES6"],
  outfile: "./dist/index.esm.js",
  entryPoints: buildSetting.entryPoints,
  external: buildSetting.external,
  bundle: buildSetting.bundle,
  minify: buildSetting.minify,
  sourcemap: buildSetting.sourcemap,
});

// CommonJS向けのビルド
esbuild.build({
  format: "cjs",
  target: ["ES6"],
  outfile: "./dist/index.cjs.js",
  entryPoints: buildSetting.entryPoints,
  external: buildSetting.external,
  bundle: buildSetting.bundle,
  minify: buildSetting.minify,
  sourcemap: buildSetting.sourcemap,
});
