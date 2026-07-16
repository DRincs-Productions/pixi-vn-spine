import { Assets, canvas, newLabel } from "@drincs/pixi-vn";
import { Spine } from "@drincs/pixi-vn-spine";

export const baseLabel = newLabel("base", [
    async () => {
        await Assets.load(["spineboySkeleton", "spineboyAtlas"]);
        const spine = new Spine({
            atlas: "spineboyAtlas",
            skeleton: "spineboySkeleton",
            xAlign: 0.5,
            yAlign: 1,
        });
        spine.addAnimation("idle", { loop: true });
        canvas.add("spine", spine);
    },
    () => {}
]);

export const motionLabel = newLabel("motion", [
    async () => {
        await Assets.load(["spineboySkeleton", "spineboyAtlas"]);
        const spine = new Spine({
            atlas: "spineboyAtlas",
            skeleton: "spineboySkeleton",
            xAlign: 0,
            yAlign: 1,
        });
        spine.addAnimation("walk", { loop: true });
        canvas.add("spine", spine);
        canvas.animate(
            spine,
            [
                [{ xAlign: 1 }, { duration: 1, ease: "linear" }],
                [{ scaleX: -1 }, { duration: 0.2 }],
                [{ xAlign: 0 }, { duration: 1, ease: "linear" }],
                [{ scaleX: 1 }, { duration: 0.2 }],
            ],
            { repeat: Infinity },
        );
    },
    () => {}
]);

export const setSkinLabel = newLabel("set-skin", [
    async () => {
        await Assets.load(["goblinsSkeleton", "goblinsAtlas"]);
        const spine = new Spine({
            atlas: "goblinsAtlas",
            skeleton: "goblinsSkeleton",
            skin: "goblin",
            xAlign: 0.5,
            yAlign: 1,
        });
        spine.addAnimation("walk", { loop: true });
        canvas.add("spine", spine);
    },
    () => {
        canvas.find<Spine>("spine")?.setSkin("goblingirl");
    },
    () => {
        canvas.find<Spine>("spine")?.setSkin("goblin");
    },
    () => {},
]);

export const sequenceLabel = newLabel("sequence", [
    async () => {
        await Assets.load(["spineboySkeleton", "spineboyAtlas"]);
        const spine = new Spine({
            atlas: "spineboyAtlas",
            skeleton: "spineboySkeleton",
            xAlign: 0.5,
            yAlign: 1,
        });
        spine.playSequence([["idle", { loop: true, duration: 0.5 }], "jump"], {
            repeat: Infinity,
        });
        canvas.add("spine", spine);
    },
    () => {}
]);
