import { CanvasBaseItem, CanvasBaseItemMemory, RegisteredCanvasComponents } from "@drincs/pixi-vn";
import { Spine as CoreSpine } from "@drincs/pixi-vn-spine/core";
import { SpineBaseMemory, SpineOptions } from "../interfaces";

const CANVAS_SPINE_ID = "Spine";

export default class Spine extends CoreSpine implements CanvasBaseItem<SpineBaseMemory> {
    constructor(options: SpineOptions = {}) {
        const { skeletonData, ...rest } = options;
        super({
            ...rest,
            skeletonData: {
                animations: [],
                bones: [],
                audioPath: null,
                defaultSkin: null,
                events: [],
                height: 0,
                ikConstraints: [],
                imagesPath: null,
                name: null,
                pathConstraints: [],
                physicsConstraints: [],
                referenceScale: 100,
                slots: [],
                skins: [],
                transformConstraints: [],
                version: null,
                width: 0,
                x: 0,
                y: 0,
                hash: null,
                fps: 0,
                findAnimation: () => null,
                findBone: () => null,
                findEvent: () => null,
                findIkConstraint: () => null,
                findPathConstraint: () => null,
                findPhysicsConstraint: () => null,
                findSkin: () => null,
                findSlot: () => null,
                findTransformConstraint: () => null,
                ...skeletonData,
            },
        });
    }
    pixivnId: string = CANVAS_SPINE_ID;
    get memory(): SpineBaseMemory {
        return {
            pixivnId: CANVAS_SPINE_ID,
            accessible: this.accessible,
            x: this.x,
            y: this.y,
            scale: {
                x: this.scale.x,
                y: this.scale.y,
            },
            rotation: this.rotation,
            alpha: this.alpha,
            visible: this.visible,
            autoUpdate: this.autoUpdate,
            accessibleChildren: this.accessibleChildren,
            accessibleHint: this.accessibleHint,
            accessiblePointerEvents: this.accessiblePointerEvents,
            accessibleText: this.accessibleText,
            accessibleTitle: this.accessibleTitle,
            accessibleType: this.accessibleType,
            angle: this.angle,
            blendMode: this.blendMode,
            cullable: this.cullable,
            cullableChildren: this.cullableChildren,
            cursor: this.cursor,
        };
    }
    set memory(_value: SpineBaseMemory) {}
    setMemory(_value: CanvasBaseItemMemory): Promise<void> | void {
        throw new Error("Method not implemented.");
    }
}
RegisteredCanvasComponents.add(Spine, CANVAS_SPINE_ID);
