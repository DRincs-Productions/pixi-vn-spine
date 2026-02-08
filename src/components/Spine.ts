import { AsyncLoadExtension, CanvasBaseItem, RegisteredCanvasComponents } from "@drincs/pixi-vn";
import { Spine as CoreSpine } from "@drincs/pixi-vn-spine/core";
import { SpineBaseMemory, SpineOptions } from "../interfaces";

const CANVAS_SPINE_ID = "Spine";

export default class Spine extends CoreSpine implements CanvasBaseItem<SpineBaseMemory>, AsyncLoadExtension {
    constructor(options: SpineOptions) {
        const spineCore = CoreSpine.from(options);
        const { skeleton, parent, ...props } = spineCore;
        super({
            skeletonData: skeleton.data,
            ...props,
        });
        this.skeletonAlias = options.skeleton;
        this.atlasAlias = options.atlas;
        this.darkTintCore = options.darkTint;
        this.assetsAliases = [options.skeleton, options.atlas];
    }
    readonly assetsAliases: string[];
    readonly pixivnId: string = CANVAS_SPINE_ID;
    get memory(): SpineBaseMemory {
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
            assetsData: this.assetsAliases.map((alias) => ({
                alias,
                url: alias,
            })),
        };
    }
    set memory(memory: SpineBaseMemory) {
        // container properties
        memory.isRenderGroup !== undefined && (this.isRenderGroup = memory.isRenderGroup);
        memory.blendMode !== undefined && (this.blendMode = memory.blendMode);
        memory.tint !== undefined && (this.tint = memory.tint);
        memory.alpha !== undefined && (this.alpha = memory.alpha);
        memory.angle !== undefined && (this.angle = memory.angle);
        memory.renderable !== undefined && (this.renderable = memory.renderable);
        memory.rotation !== undefined && (this.rotation = memory.rotation);
        if (memory.scale !== undefined) {
            if (typeof memory.scale === "number") {
                this.scale.set(memory.scale, memory.scale);
            } else {
                this.scale.set(memory.scale.x, memory.scale.y);
            }
        }
        if (memory.pivot !== undefined) {
            if (typeof memory.pivot === "number") {
                this.pivot.set(memory.pivot, memory.pivot);
            } else {
                this.pivot.set(memory.pivot.x, memory.pivot.y);
            }
        }
        memory.position !== undefined && this.position.set(memory.position.x, memory.position.y);
        memory.skew !== undefined && this.skew.set(memory.skew.x, memory.skew.y);
        memory.visible !== undefined && (this.visible = memory.visible);
        memory.x !== undefined && (this.x = memory.x);
        memory.y !== undefined && (this.y = memory.y);
        memory.cursor !== undefined && (this.cursor = memory.cursor);
        memory.eventMode !== undefined && (this.eventMode = memory.eventMode);
        memory.interactive !== undefined && (this.interactive = memory.interactive);
        memory.interactiveChildren !== undefined && (this.interactiveChildren = memory.interactiveChildren);
        // spine properties
        memory.accessible !== undefined && (this.accessible = memory.accessible);
        memory.autoUpdate !== undefined && (this.autoUpdate = memory.autoUpdate);
        memory.accessibleChildren !== undefined && (this.accessibleChildren = memory.accessibleChildren);
        memory.accessibleHint !== undefined && (this.accessibleHint = memory.accessibleHint);
        memory.accessiblePointerEvents !== undefined && (this.accessiblePointerEvents = memory.accessiblePointerEvents);
        memory.accessibleText !== undefined && (this.accessibleText = memory.accessibleText);
        memory.accessibleTitle !== undefined && (this.accessibleTitle = memory.accessibleTitle);
        memory.accessibleType !== undefined && (this.accessibleType = memory.accessibleType);
        memory.cullable !== undefined && (this.cullable = memory.cullable);
        memory.cullableChildren !== undefined && (this.cullableChildren = memory.cullableChildren);
        memory.label !== undefined && (this.label = memory.label);
        if (memory.origin !== undefined) {
            if (typeof memory.origin === "number") {
                this.origin.set(memory.origin, memory.origin);
            } else {
                this.origin.set(memory.origin.x, memory.origin.y);
            }
        }
        memory.sortableChildren !== undefined && (this.sortableChildren = memory.sortableChildren);
        memory.zIndex !== undefined && (this.zIndex = memory.zIndex);
        memory.sortDirty !== undefined && (this.sortDirty = memory.sortDirty);
        memory.tabIndex !== undefined && (this.tabIndex = memory.tabIndex);
        // end
        memory.width !== undefined && (this.width = memory.width);
        memory.height !== undefined && (this.height = memory.height);
    }
    setMemory(memory: SpineBaseMemory): Promise<void> | void {
        this.memory = memory;
    }
    readonly skeletonAlias: SpineOptions["skeleton"];
    readonly atlasAlias: SpineOptions["atlas"];
    readonly darkTintCore: SpineOptions["darkTint"];
}
RegisteredCanvasComponents.add(Spine, CANVAS_SPINE_ID);
