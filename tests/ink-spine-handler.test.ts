import { createSpineHandler, parseShowSpineTail } from "@/ink";
import { HashtagCommands } from "@drincs/pixi-vn-ink";
import { afterEach, describe, expect, test } from "vitest";

afterEach(() => {
    HashtagCommands.clear();
});

describe("parseShowSpineTail", () => {
    test("no separate source: alias doubles as skeleton", () => {
        expect(parseShowSpineTail("hero", ["atlas", "heroAtlas"])).toEqual({
            skeleton: "hero",
            propsList: ["atlas", "heroAtlas"],
            transitionType: undefined,
            transitionPropsList: [],
        });
    });

    test("separate source: first tail token is the skeleton", () => {
        expect(parseShowSpineTail("hero", ["heroSkeleton", "atlas", "heroAtlas"])).toEqual({
            skeleton: "heroSkeleton",
            propsList: ["atlas", "heroAtlas"],
            transitionType: undefined,
            transitionPropsList: [],
        });
    });

    test("recognizes an entrance transition and its own props", () => {
        expect(
            parseShowSpineTail("hero", [
                "atlas",
                "heroAtlas",
                "with",
                "dissolve",
                "duration",
                "1",
            ]),
        ).toEqual({
            skeleton: "hero",
            propsList: ["atlas", "heroAtlas"],
            transitionType: "dissolve",
            transitionPropsList: ["duration", "1"],
        });
    });

    test("drops the 'with' tail but ignores an unsupported (exit-only) transition type", () => {
        expect(
            parseShowSpineTail("hero", ["atlas", "heroAtlas", "with", "moveout", "duration", "1"]),
        ).toEqual({
            skeleton: "hero",
            propsList: ["atlas", "heroAtlas"],
            transitionType: undefined,
            transitionPropsList: [],
        });
    });
});

describe("createSpineHandler", () => {
    test("registers 'Show spine' and 'Show spine with source'", () => {
        createSpineHandler();
        const names = HashtagCommands.info().map((o) => o.name);
        expect(names).toContain("Show spine");
        expect(names).toContain("Show spine with source");
    });

    test("'Show spine' validation accepts an alias-only command", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine");
        const validation = opts?.validation as { safeParse: (v: unknown) => { success: boolean } };
        expect(validation.safeParse(["show", "spine", "hero", "atlas", "heroAtlas"]).success).toBe(
            true,
        );
    });

    test("'Show spine with source' validation requires an even key/value tail after the source", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine with source");
        const validation = opts?.validation as { safeParse: (v: unknown) => { success: boolean } };
        expect(
            validation.safeParse(["show", "spine", "hero", "heroSkeleton", "atlas", "heroAtlas"])
                .success,
        ).toBe(true);
    });

    test("known asset alias ids constrain the alias-only command", () => {
        createSpineHandler({ assetAliasIds: ["heroSkeleton"] });
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine");
        const validation = opts?.validation as { safeParse: (v: unknown) => { success: boolean } };
        expect(validation.safeParse(["show", "spine", "heroSkeleton"]).success).toBe(true);
        expect(validation.safeParse(["show", "spine", "unknownAlias"]).success).toBe(false);
    });
});
