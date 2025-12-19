import { Spine as CoreSpine, SpineFromOptions } from "@drincs/pixi-vn-spine/core";
import { Spine } from "src/components";

export function newSpine(options: Omit<SpineFromOptions, "boundsProvider">): Spine {
    const spineCore = CoreSpine.from(options);
    const { skeleton, parent, ...props } = spineCore;
    const spine = new Spine({
        skeletonData: skeleton.data,
        ...props,
    });
    return spine;
}
