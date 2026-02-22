import { CanvasBaseItemMemory, ListenerExtensionMemory } from "@drincs/pixi-vn";
import { SpineOptions as SpineOptionsCore } from "@drincs/pixi-vn-spine/core";
import type { SequenceOptions } from "motion";
import SpineOptions from "./SpineOptions";
import SpineSequenceOptions from "./SpineSequenceOptions";
import TrackMemory from "./TrackMemory";

interface MemoryCore extends Omit<
    SpineOptionsCore,
    | "skeletonData"
    | "cacheAsTexture"
    | "boundsArea"
    | "boundsProvider"
    | "cullArea"
    | "darkTint"
    | "hitArea"
    | "mask"
    | "onclick"
    | "onglobalmousemove"
    | "onglobalpointermove"
    | "onmousemove"
    | "onpointermove"
    | "onglobaltouchmove"
    | "ontouchmove"
    | "onmousedown"
    | "onmouseenter"
    | "onmouseleave"
    | "onmouseout"
    | "onmouseover"
    | "onmouseup"
    | "onmouseupoutside"
    | "onpointercancel"
    | "onpointerenter"
    | "onpointerdown"
    | "onpointerleave"
    | "onpointerout"
    | "onpointerover"
    | "onpointertap"
    | "onpointerup"
    | "onrightdown"
    | "onrightup"
    | "ontouchcancel"
    | "onRender"
    | "onpointerupoutside"
    | "onrightclick"
    | "onrightupoutside"
    | "ontap"
    | "ontouchendoutside"
    | "ontouchend"
    | "ontouchstart"
    | "onwheel"
    | "children"
    | "filters"
    | "parent"
    | "setMask"
    | "skeletonData"
> {}
export default interface SpineMemory
    extends MemoryCore, CanvasBaseItemMemory, ListenerExtensionMemory, Omit<SpineOptions, "scale"> {
    state: { tracks: (TrackMemory | null)[] };
    currentSkin?: string;
    sequenceTimelines: {
        [track: number]: {
            sequence: [string, SpineSequenceOptions | undefined][];
            options: SequenceOptions & { completeOnContinue?: boolean };
        };
    };
}
