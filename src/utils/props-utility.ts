import { CanvasPropertyUtility as PropsUtils } from "@drincs/pixi-vn";
import type { Spine } from "../components";

export function getSuperPivot(spine: Spine) {
    const pivot = PropsUtils.getSuperPoint(spine.pivot, spine.angle);
    pivot.y;
    return {
        x: pivot.x,
        y: pivot.y - spine.height,
    };
}
