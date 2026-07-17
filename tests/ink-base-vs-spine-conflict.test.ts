import { createSpineHandler } from "@/ink";
import { addBaseHashtagCommands, HashtagCommands } from "@drincs/pixi-vn-ink";
import type { PixiVNJsonLabelStep } from "@drincs/pixi-vn-json/schema";
import { afterEach, describe, expect, test, vi } from "vitest";

// These mocks mirror tests/ink-spine-handler.test.ts: createSpineHandler() only needs to
// *register* its handlers here (none of these commands are "show/edit/remove spine", so the
// handler bodies never run), but its module still imports these packages at load time.
vi.mock("@drincs/pixi-vn-spine", () => ({
    Spine: vi.fn(function (this: Record<string, unknown>, options: Record<string, unknown>) {
        Object.assign(this, options);
    }),
}));

vi.mock("@drincs/pixi-vn-json/actions", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@drincs/pixi-vn-json/actions")>();
    return {
        ...actual,
        executeEntranceTransition: vi.fn(async () => ["ticker-id"]),
    };
});

vi.mock("@drincs/pixi-vn/canvas", () => ({
    removeWithDissolve: vi.fn(),
    removeWithFade: vi.fn(),
    moveOut: vi.fn(),
    zoomOut: vi.fn(),
    pushOut: vi.fn(),
}));

const step = {} as unknown as PixiVNJsonLabelStep;

afterEach(() => {
    HashtagCommands.clear();
    HashtagCommands.clearMappers();
});

/**
 * Reproduces the exact report: two base Ink hashtag commands
 * (`# show image bg bg02-dorm align 0 with fade`, `# play sound sfx_whoosh delay 0.4`) that Vite
 * logs as "Unknown hashtag command ... no registered handler matched this command" once
 * `createSpineHandler()` is registered alongside `addBaseHashtagCommands`.
 *
 * The goal is to determine *why* — is it really `createSpineHandler`'s handlers shadowing the
 * base ones, or something else (e.g. the `assetAliasIds`/`bundleIds` allow-list)?
 */
describe("addBaseHashtagCommands + createSpineHandler: base command resolution", () => {
    test("without an asset-id allow-list, 'show image' and 'play sound' resolve fine even with the spine handler registered", async () => {
        addBaseHashtagCommands();
        createSpineHandler();

        const showImage = await HashtagCommands.run(
            "show image bg bg02-dorm align 0 with fade",
            step,
            {} as never,
        );
        expect(showImage).toEqual({
            type: "image",
            operationType: "show",
            alias: "bg",
            url: "bg02-dorm",
            transition: { type: "fade" },
            props: { align: 0 },
        });

        const playSound = await HashtagCommands.run(
            "play sound sfx_whoosh delay 0.4",
            step,
            {} as never,
        );
        expect(playSound).toEqual({
            type: "sound",
            operationType: "play",
            alias: "sfx_whoosh",
            url: "sfx_whoosh",
            props: { delay: 0.4 },
        });
    });

    test("registering createSpineHandler() never intercepts 'show image'/'play sound': result is identical with or without it", async () => {
        addBaseHashtagCommands();
        const withoutSpine = {
            showImage: await HashtagCommands.run("show image bg bg02-dorm align 0 with fade", step, {} as never),
            playSound: await HashtagCommands.run("play sound sfx_whoosh delay 0.4", step, {} as never),
        };
        HashtagCommands.clear();
        HashtagCommands.clearMappers();

        addBaseHashtagCommands();
        createSpineHandler();
        const withSpine = {
            showImage: await HashtagCommands.run("show image bg bg02-dorm align 0 with fade", step, {} as never),
            playSound: await HashtagCommands.run("play sound sfx_whoosh delay 0.4", step, {} as never),
        };

        expect(withSpine).toEqual(withoutSpine);
        expect(withSpine.showImage).toBeDefined();
        expect(withSpine.playSound).toBeDefined();
    });

    test("the real culprit: an assetAliasIds allow-list that omits the used ids breaks 'show image'/'play sound' — with or without spine registered", async () => {
        // "bg02-dorm" and "sfx_whoosh" are NOT in this list, unlike the user's real generated
        // `assetAliasIds` presumably should contain them.
        addBaseHashtagCommands({ assetAliasIds: ["heroSkeleton", "heroAtlas"] });
        createSpineHandler();

        const showImage = await HashtagCommands.run(
            "show image bg bg02-dorm align 0 with fade",
            step,
            {} as never,
        );
        const playSound = await HashtagCommands.run(
            "play sound sfx_whoosh delay 0.4",
            step,
            {} as never,
        );

        // Both are swallowed: no registered mapper's validation matches, exactly like the
        // "Unknown hashtag command: no registered handler matched this command" Vite warning.
        expect(showImage).toBeUndefined();
        expect(playSound).toBeUndefined();
    });

    test("once the allow-list actually includes the used ids, both commands resolve correctly alongside the spine handler", async () => {
        addBaseHashtagCommands({ assetAliasIds: ["bg02-dorm", "sfx_whoosh"] });
        createSpineHandler();

        const showImage = await HashtagCommands.run(
            "show image bg bg02-dorm align 0 with fade",
            step,
            {} as never,
        );
        const playSound = await HashtagCommands.run(
            "play sound sfx_whoosh delay 0.4",
            step,
            {} as never,
        );

        expect(showImage).toMatchObject({ type: "image", alias: "bg", url: "bg02-dorm" });
        expect(playSound).toMatchObject({ type: "sound", alias: "sfx_whoosh" });
    });
});
