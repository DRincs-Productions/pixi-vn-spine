import { CanvasBaseItem, CanvasBaseItemMemory, RegisteredCanvasComponents } from "@drincs/pixi-vn";
import { Spine as CoreSpine, SpineOptions } from "@drincs/pixi-vn-spine/core";

const CANVAS_SPINE_ID = "Spine";

export default class Spine extends CoreSpine implements CanvasBaseItem<CanvasBaseItemMemory> {
    constructor(
        options: SpineOptions = {
            // | SkeletonData
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
            },
        }
    ) {
        super(options);
    }
    pixivnId: string = CANVAS_SPINE_ID;
    get memory(): CanvasBaseItemMemory {
        return {
            pixivnId: CANVAS_SPINE_ID,
        };
    }
    set memory(_value: CanvasBaseItemMemory) {}
    setMemory(_value: CanvasBaseItemMemory): Promise<void> | void {
        throw new Error("Method not implemented.");
    }
}
RegisteredCanvasComponents.add(Spine, CANVAS_SPINE_ID);
