import { CompleteOnContinueTracks } from "@/memory/CompleteOnContinueTracks";
import { Game } from "@drincs/pixi-vn";

export * from "@/components";
export type { SpineMemory, SpineOptions, SpineSequenceOptions, TrackMemory } from "@/interfaces";

Game.addOnPreContinue(() => {
    // Clear all tracks on continue, to avoid weird states when the player continues while an animation is still playing.
    CompleteOnContinueTracks.tracks.values().forEach(({ tracks, spine }) => {
        tracks.forEach((t) => {
            spine.clearTrack(t);
        });
    });
    CompleteOnContinueTracks.tracks.clear();
});
