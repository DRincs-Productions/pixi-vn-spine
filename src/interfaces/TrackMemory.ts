import { TrackEntry } from "@drincs/pixi-vn-spine/core";
export default interface TrackMemory extends Omit<Pick<TrackEntry, "loop" | "trackIndex" | "delay">, "animation"> {
    animationName: string;
}
