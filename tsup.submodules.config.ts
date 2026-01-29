import { defineConfig } from "tsup";

export default defineConfig({
    target: "es2020",
    entry: {
        core: "src/core/index.ts",
    },
    format: ["esm"],
    dts: true,
    treeshake: true,
    clean: true,
    minify: true,
    bundle: true,
    skipNodeModulesBundle: false,
    external: ["pixi.js", "@esotericsoftware/spine-core"],
    noExternal: ["@esotericsoftware/spine-pixi-v8"],
    esbuildOptions(options) {
        options.alias = {
            ...options.alias,
            "pixi.js": "@drincs/pixi-vn/pixi.js",
        };
    },
});
