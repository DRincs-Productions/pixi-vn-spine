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

            const replacedRequire = content.replace(
                /require\(\s*(['"])pixi\.js(\/[^'\"]*)?\1\s*\)/g,
                (match, quote, subpath = "") => `require(${quote}@drincs/pixi-vn/pixi.js${subpath}${quote})`,
            );

            // replace `from "pixi.js"`, `import "pixi.js"` and similar ESM patterns
            const replaced = replacedRequire.replace(
                /(\bfrom\s+|\bimport\s+)(['"])pixi\.js(\/[^'\"]*)?\2/g,
                (match, prefix, quote, subpath = "") => `${prefix}${quote}@drincs/pixi-vn/pixi.js${subpath}${quote}`,
            );

            if (replaced !== content) {
                fs.writeFileSync(fullPath, replaced, "utf8");
                console.log(`✔ patched: ${fullPath}`);
            }
        }
    }
}

walk(DIST_DIR);
