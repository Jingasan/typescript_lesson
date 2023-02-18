import * as esbuild from "esbuild";

// esbuildによるビルド処理
esbuild
  .build({
    entryPoints: [{ in: "src/index.ts", out: "index" }], // エントリポイントとビルドファイル名(複数指定可能)
    outdir: "dist", // 出力先ディレクトリ
    //outfile: "dist/index.js", // ビルドファイル名
    platform: "node", // ビルド対象のプラットフォーム：node/browser/neutral
    bundle: true, // バンドルする（ビルド成果物をまとめる）かどうか
    minify: true, // コードを最小化するかどうか
    sourcemap: false, // SourceMapを出力するかどうか
    external: [], // ビルドから除くファイル群
    logLevel: "info", // ビルド時に表示するログのレベル：verbose/debug/info/warning/error/silent
    metafile: true, // ビルド後に結果のメタファイルを出力するかどうか
  })
  .catch((result) => {
    // ビルド結果のメタ情報の表示
    esbuild.analyzeMetafile(result.metafile, { verbose: true });
  });
