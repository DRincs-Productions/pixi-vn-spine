import { Game } from "@drincs/pixi-vn";
import { CompleteOnContinueTracks } from "../memory/CompleteOnContinueTracks";

export { default as Spine } from "./Spine";

Game.addOnPreContinue(() => {
    // Clear all tracks on continue, to avoid weird states when the player continues while an animation is still playing.
    CompleteOnContinueTracks.tracks.forEach(({ spine, tracks }) => {
        tracks.forEach((track) => {
            spine.clearTrack(track);
        });
    });
    CompleteOnContinueTracks.tracks.clear();
});
