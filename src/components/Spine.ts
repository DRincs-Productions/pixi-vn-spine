import { Assets, CanvasBaseItem, RegisteredCanvasComponents, setMemoryContainer } from "@drincs/pixi-vn";
import { Spine as CoreSpine } from "@drincs/pixi-vn-spine/core";
import { SpineMemory, SpineOptions } from "../interfaces";

const CANVAS_SPINE_ID = "Spine";

/**
 * Spine component for Pixi.js, used to display Spine components.
 * @example
 * ```ts
 * import { Assets, canvas } from "@drincs/pixi-vn";
 * import { Spine } from "@drincs/pixi-vn-spine";
 *
 * await Assets.load([
 *     {
 *         alias: "spineSkeleton",
 *         src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pro.skel",
 *     },
 *     {
 *         alias: "spineAtlas",
 *         src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pma.atlas",
 *     },
 * ]);
 *
 * const spine = new Spine({ atlas: "spineAtlas", skeleton: "spineSkeleton" });
 * spine.x = canvas.width / 2;
 * spine.y = canvas.height;
 *
 * canvas.add("spine", spine);
 * ```
 */
export default class Spine extends CoreSpine implements CanvasBaseItem<SpineMemory> {
    constructor(options: Omit<SpineOptions, "parent">) {
        const spineCore = CoreSpine.from(options);
        const { skeleton, parent, ...props } = spineCore;
        super({
            skeletonData: skeleton.data,
            ...props,
        });
        this.skeletonAlias = options.skeleton;
        this.atlasAlias = options.atlas;
        this.darkTintCore = options.darkTint;
    }
    readonly pixivnId: string = CANVAS_SPINE_ID;
    readonly skeletonAlias: SpineOptions["skeleton"];
    readonly atlasAlias: SpineOptions["atlas"];
    readonly darkTintCore: SpineOptions["darkTint"];
    get memory(): SpineMemory {
        return {
            pixivnId: CANVAS_SPINE_ID,
            // container properties
            isRenderGroup: this.isRenderGroup,
            blendMode: this.blendMode,
            tint: this.tint,
            alpha: this.alpha,
            angle: this.angle,
            renderable: this.renderable,
            rotation: this.rotation,
            scale: {
                x: this.scale.x,
                y: this.scale.y,
            },
            pivot: {
                x: this.pivot.x,
                y: this.pivot.y,
            },
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            skew: {
                x: this.skew.x,
                y: this.skew.y,
            },
            visible: this.visible,
            x: this.x,
            y: this.y,
            cursor: this.cursor,
            eventMode: this.eventMode,
            interactive: this.interactive,
            interactiveChildren: this.interactiveChildren,
            height: this.height,
            width: this.width,
            // spine properties
            accessible: this.accessible,
            autoUpdate: this.autoUpdate,
            accessibleChildren: this.accessibleChildren,
            accessibleHint: this.accessibleHint,
            accessiblePointerEvents: this.accessiblePointerEvents,
            accessibleText: this.accessibleText,
            accessibleTitle: this.accessibleTitle,
            accessibleType: this.accessibleType,
            cullable: this.cullable,
            cullableChildren: this.cullableChildren,
            label: this.label,
            origin: {
                x: this.origin.x,
                y: this.origin.y,
            },
            sortableChildren: this.sortableChildren,
            zIndex: this.zIndex,
            sortDirty: this.sortDirty,
            tabIndex: this.tabIndex,
            skeleton: this.skeletonAlias,
            atlas: this.atlasAlias,
            darkTint: this.darkTintCore,
        };
    }
    async setMemory(memory: SpineMemory): Promise<void> {
        await setMemorySpine(this, memory);
    }
}
RegisteredCanvasComponents.add<SpineMemory, typeof Spine>(Spine, {
    name: CANVAS_SPINE_ID,
    getInstance: async (canvasClass, memory) => {
        await Assets.load([memory.skeleton, memory.atlas]);
        const instance = new canvasClass({
            skeleton: memory.skeleton,
            atlas: memory.atlas,
            darkTint: memory.darkTint,
        });
        await instance.setMemory(memory);
        return instance;
    },
});

async function setMemorySpine(element: Spine, memory: SpineMemory) {
    return await setMemoryContainer(element, memory, {
        end() {
            memory.accessible !== undefined && (element.accessible = memory.accessible);
            memory.autoUpdate !== undefined && (element.autoUpdate = memory.autoUpdate);
            memory.accessibleChildren !== undefined && (element.accessibleChildren = memory.accessibleChildren);
            memory.accessibleHint !== undefined && (element.accessibleHint = memory.accessibleHint);
            memory.accessiblePointerEvents !== undefined &&
                (element.accessiblePointerEvents = memory.accessiblePointerEvents);
            memory.accessibleText !== undefined && element;
            memory.accessibleTitle !== undefined && (element.accessibleTitle = memory.accessibleTitle);
            memory.accessibleType !== undefined && element;
            memory.cullable !== undefined && (element.cullable = memory.cullable);
            memory.cullableChildren !== undefined && (element.cullableChildren = memory.cullableChildren);
            memory.label !== undefined && (element.label = memory.label);
            if (memory.origin !== undefined) {
                if (typeof memory.origin === "number") {
                    element.origin.set(memory.origin, memory.origin);
                } else {
                    element.origin.set(memory.origin.x, memory.origin.y);
                }
            }
            memory.sortableChildren !== undefined && (element.sortableChildren = memory.sortableChildren);
            memory.zIndex !== undefined && (element.zIndex = memory.zIndex);
            memory.sortDirty !== undefined && (element.sortDirty = memory.sortDirty);
            memory.tabIndex !== undefined && (element.tabIndex = memory.tabIndex);
        },
    });
}
