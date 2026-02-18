import { AnimationOptionsCommon, At } from "@drincs/pixi-vn";

type SpineSequenceOptions = Omit<AnimationOptionsCommon, "deplay"> &
    At & {
        /**
         * Whether the animation should loop. If true, the animation will loop indefinitely until changed.
         */
        loop?: boolean;
        /**
         * Delay in seconds before the animation starts. If not provided, the animation will start immediately after the previous animation on the track, or after the mix duration if there is a previous animation.
         * If > 0, sets TrackEntry#delay. If <= 0, the delay set is the duration of the previous track entry
         * minus any mix duration (from the AnimationStateData) plus the specified `delay` (ie the mix
         * ends at (`delay` = 0) or before (`delay` < 0) the previous track entry duration). If the
         * previous entry is looping, its next loop completion is used instead of its duration.
         */
        delay?: number;
    };
export default SpineSequenceOptions;
