import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        core: "src/core/index.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    treeshake: true,
    clean: false,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    external: ["@drincs/pixi-vn", "pixi.js"],
    outExtension({ format }) {
        return {
            js: format === "esm" ? ".mjs" : ".cjs",
        };
    },
});
