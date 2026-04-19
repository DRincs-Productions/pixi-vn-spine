import { defineConfig } from "tsup";

export default defineConfig([
    {
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
        external: ["pixi.js", "@esotericsoftware/spine-core", "@esotericsoftware/spine-pixi-v8"],
        esbuildOptions(options) {
            options.alias = {
                ...options.alias,
                "pixi.js": "@drincs/pixi-vn/pixi.js",
            };
        },
    },
    {
        target: "es2020",
        entry: {
            index: "src/index.ts",
        },
        format: ["cjs", "esm"],
        dts: true,
        treeshake: true,
        clean: false,
        minify: true,
        bundle: true,
        skipNodeModulesBundle: false,
        external: ["@drincs/pixi-vn", "pixi.js", "@drincs/pixi-vn-spine/core"],
        outExtension({ format }) {
            return {
                js: format === "esm" ? ".mjs" : ".cjs",
            };
        },
    },
]);
