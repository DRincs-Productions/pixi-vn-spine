import { ContainerOptions } from "@drincs/pixi-vn";
import { SpineFromOptions } from "@drincs/pixi-vn-spine/core";
export default interface SpineOptions
    extends Omit<SpineFromOptions, "boundsProvider" | "parent">, Omit<ContainerOptions, "scale"> {}
