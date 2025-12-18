import fs from "fs";
import path from "path";

const DIST_DIR = path.resolve("dist");

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (/\.(js|mjs|cjs|d\.ts)$/.test(file)) {
            let content = fs.readFileSync(fullPath, "utf8");

            const replaced = content.replace(
                /(['"])pixi\.js(\/[^'"]*)?\1/g,
                (_, quote, subpath = "") => `${quote}@drincs/pixi-vn/pixi.js${subpath}${quote}`
            );

            if (replaced !== content) {
                fs.writeFileSync(fullPath, replaced, "utf8");
                console.log(`✔ patched: ${fullPath}`);
            }
        }
    }
}

walk(DIST_DIR);
