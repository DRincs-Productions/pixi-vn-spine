import type { Spine } from "@/components";
import { CanvasPropertyUtility as PropsUtils } from "@drincs/pixi-vn";

export function getSuperPivot(spine: Spine) {
    const pivot = PropsUtils.getSuperPoint(spine.pivot, spine.angle);
    pivot.y;
    return {
        x: pivot.x + spine.width / 2,
        y: pivot.y + spine.height,
    };
}
