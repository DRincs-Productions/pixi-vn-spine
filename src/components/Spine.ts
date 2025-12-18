import { CanvasBaseItem, CanvasBaseItemMemory, RegisteredCanvasComponents } from "@drincs/pixi-vn";
import { Spine as CoreSpine, SkeletonData, SpineOptions } from "@drincs/pixi-vn-spine/core";

const CANVAS_SPINE_ID = "Spine";

export default class Spine extends CoreSpine implements CanvasBaseItem<CanvasBaseItemMemory> {
    constructor(options: SpineOptions | SkeletonData) {
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
