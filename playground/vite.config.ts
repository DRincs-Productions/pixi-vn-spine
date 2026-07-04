import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@drincs/pixi-vn-spine/core": resolve(__dirname, "../src/core/index.ts"),
            "@drincs/pixi-vn-spine": resolve(__dirname, "../src/index.ts"),
            // needed for the library's internal "@/" imports (e.g. "@/functions/...")
            "@": resolve(__dirname, "../src"),
        },
    },
});
