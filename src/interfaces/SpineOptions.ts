import type { ContainerOptions } from "@drincs/pixi-vn";
import type { SpineFromOptions } from "@drincs/pixi-vn-spine/core";

export default interface SpineOptions
    extends Omit<SpineFromOptions, "boundsProvider" | "parent">,
        Omit<ContainerOptions, "scale"> {
    /**
     * The name of the skin to set on the skeleton as soon as it is created, equivalent to calling
     * {@link Spine.setSkin} right after construction.
     */
    skin?: string;
    /**
     * The name of the animation to play on track 0 as soon as the skeleton is created, equivalent
     * to calling {@link Spine.addAnimation} right after construction.
     */
    animation?: string;
}
