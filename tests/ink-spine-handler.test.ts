import { createSpineHandler, parseShowSpineTail } from "@/ink";
import { logger } from "@/utils/log-utility";
import { Assets, canvas } from "@drincs/pixi-vn";
import { moveOut, pushOut, removeWithDissolve, removeWithFade, zoomOut } from "@drincs/pixi-vn/canvas";
import { HashtagCommands } from "@drincs/pixi-vn-ink";
import { executeEntranceTransition } from "@drincs/pixi-vn-json/actions";
import type { PixiVNJsonLabelStep } from "@drincs/pixi-vn-json/schema";
import { Spine } from "@drincs/pixi-vn-spine";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
    removeWithDissolve: vi.fn(() => ["ticker-dissolve"]),
    removeWithFade: vi.fn(() => ["ticker-fade"]),
    moveOut: vi.fn(() => ["ticker-moveout"]),
    zoomOut: vi.fn(() => ["ticker-zoomout"]),
    pushOut: vi.fn(() => ["ticker-pushout"]),
}));

const step = {} as unknown as PixiVNJsonLabelStep;

afterEach(() => {
    HashtagCommands.clear();
    vi.restoreAllMocks();
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("parseShowSpineTail", () => {
    test("no transition: the whole tail is props", () => {
        expect(parseShowSpineTail(["atlas", "heroAtlas"])).toEqual({
            propsList: ["atlas", "heroAtlas"],
            transitionType: undefined,
            transitionPropsList: [],
        });
    });

    test("recognizes an entrance transition and its own props", () => {
        expect(parseShowSpineTail(["atlas", "heroAtlas", "with", "dissolve", "duration", "1"])).toEqual({
            propsList: ["atlas", "heroAtlas"],
            transitionType: "dissolve",
            transitionPropsList: ["duration", "1"],
        });
    });

    test("drops the 'with' tail but ignores an unsupported (exit-only) transition type", () => {
        expect(
            parseShowSpineTail(["atlas", "heroAtlas", "with", "moveout", "duration", "1"]),
        ).toEqual({
            propsList: ["atlas", "heroAtlas"],
            transitionType: undefined,
            transitionPropsList: [],
        });
    });
});

describe("createSpineHandler", () => {
    test("registers 'Show spine'", () => {
        createSpineHandler();
        const names = HashtagCommands.info().map((o) => o.name);
        expect(names).toContain("Show spine");
    });

    test("validation accepts an alias with skeleton/atlas props", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine");
        const validation = opts?.validation as { safeParse: (v: unknown) => { success: boolean } };
        expect(
            validation.safeParse([
                "show",
                "spine",
                "hero",
                "skeleton",
                "heroSkeleton",
                "atlas",
                "heroAtlas",
            ]).success,
        ).toBe(true);
    });

    test("registers a keySchemas section for the props position and each entrance transition", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine");
        expect(Object.keys(opts?.keySchemas ?? {})).toEqual(
            expect.arrayContaining(["with", "dissolve", "fade", "movein", "zoomin", "pushin", "3"]),
        );
        const propsSchema = (opts?.keySchemas as Record<string, { required?: string[] }>)?.[3];
        expect(propsSchema?.required).toContain("atlas");
        expect(propsSchema?.required).toContain("skeleton");
    });

    test("the props position schema also describes the optional 'animation' prop", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Show spine");
        const propsSchema = (
            opts?.keySchemas as Record<string, { properties?: Record<string, unknown> }>
        )?.[3];
        expect(propsSchema?.properties?.animation).toEqual({ type: "string" });
    });
});

describe("createSpineHandler: running '# show spine' through HashtagCommands.run", () => {
    beforeEach(() => {
        createSpineHandler();
        vi.spyOn(Assets, "load").mockResolvedValue(undefined as never);
        vi.spyOn(canvas, "add").mockImplementation(() => undefined as never);
    });

    test("alias is just the canvas key; skeleton/atlas come from props, no transition -> canvas.add", async () => {
        await HashtagCommands.run(
            "show spine hero skeleton heroSkeleton atlas heroAtlas",
            step,
            {} as never,
        );

        expect(Assets.load).toHaveBeenCalledWith(["heroSkeleton", "heroAtlas"]);
        expect(Spine).toHaveBeenCalledWith({ skeleton: "heroSkeleton", atlas: "heroAtlas" });

        expect(canvas.add).toHaveBeenCalledTimes(1);
        const [aliasArg, spineArg] = vi.mocked(canvas.add).mock.calls[0];
        expect(aliasArg).toBe("hero");
        expect(spineArg).toMatchObject({ skeleton: "heroSkeleton", atlas: "heroAtlas" });
        expect(executeEntranceTransition).not.toHaveBeenCalled();
    });

    test("forwards extra key/value props to the Spine constructor", async () => {
        await HashtagCommands.run(
            "show spine hero skeleton heroSkeleton atlas heroAtlas xAlign 0.5 yAlign 1 skin alt animation walk",
            step,
            {} as never,
        );

        expect(Spine).toHaveBeenCalledWith({
            skeleton: "heroSkeleton",
            atlas: "heroAtlas",
            xAlign: 0.5,
            yAlign: 1,
            skin: "alt",
            animation: "walk",
        });
    });

    test("with a supported entrance transition: executeEntranceTransition runs instead of canvas.add", async () => {
        await HashtagCommands.run(
            "show spine hero skeleton heroSkeleton atlas heroAtlas with dissolve duration 1",
            step,
            {} as never,
        );

        expect(executeEntranceTransition).toHaveBeenCalledTimes(1);
        const [alias, spineArg, type, transitionProps] = vi.mocked(executeEntranceTransition).mock
            .calls[0];
        expect(alias).toBe("hero");
        expect(spineArg).toMatchObject({ skeleton: "heroSkeleton", atlas: "heroAtlas" });
        expect(type).toBe("dissolve");
        expect(transitionProps).toEqual({ duration: 1 });
        expect(canvas.add).not.toHaveBeenCalled();
    });

    test("an unsupported (exit-only) transition type falls back to a plain canvas.add", async () => {
        await HashtagCommands.run(
            "show spine hero skeleton heroSkeleton atlas heroAtlas with moveout duration 1",
            step,
            {} as never,
        );

        expect(executeEntranceTransition).not.toHaveBeenCalled();
        expect(canvas.add).toHaveBeenCalledTimes(1);
    });

    test("missing atlas prop: logs an error and never loads assets or constructs a Spine", async () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await HashtagCommands.run(
            "show spine hero skeleton heroSkeleton xAlign 0.5",
            step,
            {} as never,
        );

        expect(errorSpy).toHaveBeenCalled();
        expect(Assets.load).not.toHaveBeenCalled();
        expect(Spine).not.toHaveBeenCalled();
        expect(canvas.add).not.toHaveBeenCalled();
    });

    test("missing skeleton prop: logs an error and never loads assets or constructs a Spine", async () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await HashtagCommands.run("show spine hero atlas heroAtlas", step, {} as never);

        expect(errorSpy).toHaveBeenCalled();
        expect(Assets.load).not.toHaveBeenCalled();
        expect(Spine).not.toHaveBeenCalled();
        expect(canvas.add).not.toHaveBeenCalled();
    });

    test("a malformed command (missing alias) is left unhandled", async () => {
        const result = await HashtagCommands.run("show spine", step, {} as never);

        expect(result).toBeUndefined();
        expect(Spine).not.toHaveBeenCalled();
        expect(Assets.load).not.toHaveBeenCalled();
    });
});

describe("createSpineHandler: 'Edit spine'", () => {
    test("registers 'Edit spine' with a keySchemas section for the props position", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Edit spine");
        expect(opts).toBeDefined();
        expect((opts?.keySchemas as Record<string, unknown> | undefined)?.[3]).toBeDefined();
    });

    describe("running '# edit spine' through HashtagCommands.run", () => {
        let fakeSpine: Record<string, unknown>;

        beforeEach(() => {
            createSpineHandler();
            fakeSpine = { alpha: 1, x: 0 };
            vi.spyOn(canvas, "find").mockImplementation(() => fakeSpine as never);
        });

        test("applies key/value props onto the found canvas element", async () => {
            await HashtagCommands.run("edit spine hero alpha 0.5 x 100", step, {} as never);

            expect(canvas.find).toHaveBeenCalledWith("hero");
            expect(fakeSpine).toMatchObject({ alpha: 0.5, x: 100 });
        });

        test("no props: leaves the element untouched", async () => {
            await HashtagCommands.run("edit spine hero", step, {} as never);

            expect(fakeSpine).toEqual({ alpha: 1, x: 0 });
        });

        test("alias not found: logs an error instead of throwing", async () => {
            vi.mocked(canvas.find).mockReturnValue(undefined);
            const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

            await expect(
                HashtagCommands.run("edit spine missing alpha 0.5", step, {} as never),
            ).resolves.toBeUndefined();

            expect(errorSpy).toHaveBeenCalled();
        });
    });
});

describe("createSpineHandler: 'Remove spine'", () => {
    test("registers 'Remove spine' with keySchemas for 'with' and each exit transition", () => {
        createSpineHandler();
        const opts = HashtagCommands.info().find((o) => o.name === "Remove spine");
        expect(Object.keys(opts?.keySchemas ?? {})).toEqual(
            expect.arrayContaining(["with", "dissolve", "fade", "moveout", "zoomout", "pushout"]),
        );
    });

    describe("running '# remove spine' through HashtagCommands.run", () => {
        let fakeSpine: Record<string, unknown>;

        beforeEach(() => {
            createSpineHandler();
            fakeSpine = {};
            vi.spyOn(canvas, "find").mockImplementation(() => fakeSpine as never);
            vi.spyOn(canvas, "remove").mockImplementation(() => undefined as never);
        });

        test("no transition: canvas.remove is called with the alias", async () => {
            await HashtagCommands.run("remove spine hero", step, {} as never);

            expect(canvas.remove).toHaveBeenCalledWith("hero");
            expect(removeWithDissolve).not.toHaveBeenCalled();
        });

        test("with 'dissolve': removeWithDissolve runs instead of canvas.remove", async () => {
            await HashtagCommands.run("remove spine hero with dissolve duration 1", step, {} as never);

            expect(removeWithDissolve).toHaveBeenCalledWith("hero", { duration: 1 });
            expect(canvas.remove).not.toHaveBeenCalled();
        });

        test.each([
            ["moveout", () => moveOut],
            ["zoomout", () => zoomOut],
            ["pushout", () => pushOut],
        ] as const)("with '%s': the matching exit transition runs", async (type, getFn) => {
            await HashtagCommands.run(`remove spine hero with ${type} duration 1`, step, {} as never);

            expect(getFn()).toHaveBeenCalledWith("hero", { duration: 1 });
            expect(canvas.remove).not.toHaveBeenCalled();
        });

        test("with an unsupported (entrance-only) transition type: falls back to canvas.remove", async () => {
            await HashtagCommands.run("remove spine hero with movein duration 1", step, {} as never);

            expect(canvas.remove).toHaveBeenCalledWith("hero");
            expect(removeWithDissolve).not.toHaveBeenCalled();
            expect(moveOut).not.toHaveBeenCalled();
        });

        test("alias not found: logs an error and never calls canvas.remove", async () => {
            vi.mocked(canvas.find).mockReturnValue(undefined);
            const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

            await HashtagCommands.run("remove spine missing", step, {} as never);

            expect(errorSpy).toHaveBeenCalled();
            expect(canvas.remove).not.toHaveBeenCalled();
        });
    });
});

function createFakeSpine() {
    return {
        setSkin: vi.fn(),
        clearTrack: vi.fn(),
        addAnimation: vi.fn(),
        setAnimation: vi.fn(),
    };
}

describe("createSpineHandler: 'Change spine skin'", () => {
    let fakeSpine: ReturnType<typeof createFakeSpine>;

    beforeEach(() => {
        createSpineHandler();
        fakeSpine = createFakeSpine();
        vi.spyOn(canvas, "find").mockImplementation(() => fakeSpine as never);
    });

    test("registers 'Change spine skin'", () => {
        const names = HashtagCommands.info().map((o) => o.name);
        expect(names).toContain("Change spine skin");
    });

    test("calls spine.setSkin with the given skin name", async () => {
        await HashtagCommands.run("change spine hero skin goblin", step, {} as never);

        expect(canvas.find).toHaveBeenCalledWith("hero");
        expect(fakeSpine.setSkin).toHaveBeenCalledWith("goblin");
    });

    test("alias not found: logs an error instead of throwing", async () => {
        vi.mocked(canvas.find).mockReturnValue(undefined);
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await expect(
            HashtagCommands.run("change spine missing skin goblin", step, {} as never),
        ).resolves.toBeUndefined();

        expect(errorSpy).toHaveBeenCalled();
    });
});

describe("createSpineHandler: 'Clear track'", () => {
    let fakeSpine: ReturnType<typeof createFakeSpine>;

    beforeEach(() => {
        createSpineHandler();
        fakeSpine = createFakeSpine();
        vi.spyOn(canvas, "find").mockImplementation(() => fakeSpine as never);
    });

    test("registers 'Clear track'", () => {
        const names = HashtagCommands.info().map((o) => o.name);
        expect(names).toContain("Clear track");
    });

    test("calls spine.clearTrack with the track index parsed as a number", async () => {
        await HashtagCommands.run("clear track hero 0", step, {} as never);

        expect(fakeSpine.clearTrack).toHaveBeenCalledWith(0);
    });

    test("invalid track index: logs an error and never calls spine.clearTrack", async () => {
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await HashtagCommands.run("clear track hero notanumber", step, {} as never);

        expect(errorSpy).toHaveBeenCalled();
        expect(fakeSpine.clearTrack).not.toHaveBeenCalled();
    });

    test("alias not found: logs an error instead of throwing", async () => {
        vi.mocked(canvas.find).mockReturnValue(undefined);
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await HashtagCommands.run("clear track missing 0", step, {} as never);

        expect(errorSpy).toHaveBeenCalled();
        expect(fakeSpine.clearTrack).not.toHaveBeenCalled();
    });
});

describe("createSpineHandler: 'Animate spine'", () => {
    let fakeSpine: ReturnType<typeof createFakeSpine>;

    beforeEach(() => {
        createSpineHandler();
        fakeSpine = createFakeSpine();
        vi.spyOn(canvas, "find").mockImplementation(() => fakeSpine as never);
    });

    test("registers 'Animate spine' with a keySchemas section for the options position", () => {
        const opts = HashtagCommands.info().find((o) => o.name === "Animate spine");
        expect((opts?.keySchemas as Record<string, unknown> | undefined)?.[5]).toBeDefined();
    });

    test("calls spine.addAnimation with no options when none are given", async () => {
        await HashtagCommands.run("animate spine hero with walk", step, {} as never);

        expect(fakeSpine.addAnimation).toHaveBeenCalledWith("walk", {});
    });

    test("forwards key/value options to spine.addAnimation", async () => {
        await HashtagCommands.run(
            "animate spine hero with walk loop true trackIndex 1 delay 0.5",
            step,
            {} as never,
        );

        expect(fakeSpine.addAnimation).toHaveBeenCalledWith("walk", {
            loop: true,
            trackIndex: 1,
            delay: 0.5,
        });
    });

    test("alias not found: logs an error instead of throwing", async () => {
        vi.mocked(canvas.find).mockReturnValue(undefined);
        const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

        await HashtagCommands.run("animate spine missing with walk", step, {} as never);

        expect(errorSpy).toHaveBeenCalled();
        expect(fakeSpine.addAnimation).not.toHaveBeenCalled();
    });
});

