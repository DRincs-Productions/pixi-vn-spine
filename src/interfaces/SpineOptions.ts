import { SkeletonData as CoreSkeletonData, SpineOptions as CoreSpineOptions } from "@drincs/pixi-vn-spine/core";
export default interface SpineOptions extends Omit<CoreSpineOptions, "skeletonData"> {
    skeletonData?: SkeletonData;
}
export interface SkeletonData
    extends Partial<
        Omit<
            CoreSkeletonData,
            | "findAnimation"
            | "findBone"
            | "findEvent"
            | "findIkConstraint"
            | "findPathConstraint"
            | "findPhysicsConstraint"
            | "findSkin"
            | "findSlot"
            | "findTransformConstraint"
        >
    > {}
