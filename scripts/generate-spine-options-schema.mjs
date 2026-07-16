#!/usr/bin/env node
/**
 * Generates the JSON Schema used by `createSpineHandler`'s `# show spine` `keySchemas` (its
 * numeric position key, see `src/ink/spineHandler.ts`) from `SpineOptions`
 * (src/interfaces/SpineOptions.ts), via `@drincs/pixi-vn-json`'s own generic
 * TypeScript-interface-to-JSON-Schema generator (`schema-generator.mjs`) — the same generator
 * `@drincs/pixi-vn-json` itself uses to produce `entranceTransitionKeySchemas`.
 *
 * `SpineOptions` is generated via the depth-capped "external" path (no `interfaceDir` passed):
 * since it `extends Omit<SpineFromOptions, ...>, Omit<ContainerOptions, ...>`, the generator's
 * AST-only "local" path can't resolve `Omit<>` (it's a recognized builtin that collapses straight
 * to `{}`, so an `extends Omit<...>` clause would contribute nothing) — but the type checker's
 * fully-resolved `ts.Type`, used by the "external" path, already flattens `extends`/`Omit`/
 * intersections correctly, so every inherited property (`skeleton`, `atlas`, the `ContainerOptions`
 * fields, ...) comes through.
 *
 * Run via `npm run generate-spine-options-schema`; re-run whenever `SpineOptions` (or the
 * `@drincs/pixi-vn`/`@esotericsoftware/spine-pixi-v8` types it derives from) changes.
 */

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateJsonSchema } from "@drincs/pixi-vn-json/schema-generator";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const spineOptionsFile = join(rootDir, "src", "interfaces", "SpineOptions.ts");

const { schemas, definitions } = generateJsonSchema({
    rootFiles: [spineOptionsFile],
    rootTypeNames: ["SpineOptions"],
    tsconfigPath: join(rootDir, "tsconfig.json"),
});

/** Must be self-contained (it's used standalone as one JSON Schema by any validator). */
function toStandaloneSchema(rootSchema) {
    if (rootSchema.$ref) {
        const key = rootSchema.$ref.replace("#/definitions/", "");
        const { [key]: own, ...rest } = definitions;
        const usedRefs = JSON.stringify(own).match(/#\/definitions\/[A-Za-z0-9_]+/g) ?? [];
        if (usedRefs.length === 0) return own;
        const neededDefinitions = Object.fromEntries(
            usedRefs
                .map((ref) => ref.replace("#/definitions/", ""))
                .filter((k) => k in rest)
                .map((k) => [k, rest[k]]),
        );
        return Object.keys(neededDefinitions).length > 0
            ? { ...own, definitions: neededDefinitions }
            : own;
    }
    return rootSchema;
}

const spineOptionsSchema = toStandaloneSchema(schemas.SpineOptions);

const outPath = join(rootDir, "src", "ink", "spine-options-schema.generated.ts");
const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Produced by \`scripts/generate-spine-options-schema.mjs\` from \`SpineOptions\`
 * (src/interfaces/SpineOptions.ts). Re-run that script (see its header comment) to refresh this
 * file after that interface (or the types it derives from) changes.
 */

/**
 * JSON Schema (usable as \`@drincs/pixi-vn-ink\`'s \`HashtagHandlerOptions.keySchemas\` values, or
 * with any other JSON Schema validator) for \`SpineOptions\`.
 */
export const spineOptionsSchema: object = `;

writeFileSync(outPath, `${banner}${JSON.stringify(spineOptionsSchema, null, 4)};\n`);

console.log(`Generated: ${outPath}`);
