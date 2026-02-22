import {
    Assets,
    CanvasBaseItem,
    RegisteredCanvasComponents,
    SegmentOptions,
    setMemoryContainer,
    timeline,
} from "@drincs/pixi-vn";
import { Spine as CoreSpine } from "@drincs/pixi-vn-spine/core";
import type { AnimationPlaybackControlsWithThen, SequenceOptions } from "motion";
import { SpineMemory, SpineOptions, SpineSequenceOptions } from "../interfaces";
import TrackMemory from "../interfaces/TrackMemory";
import { CompleteOnContinueTracks } from "../memory/CompleteOnContinueTracks";
import { logger } from "../utils/log-utility";

const CANVAS_SPINE_ID = "Spine";

/**
 * Spine component for Pixi.js, used to display Spine components.
 * @example
 * ```ts
 * import { Assets, canvas } from "@drincs/pixi-vn";
 * import { Spine } from "@drincs/pixi-vn-spine";
 *
 * await Assets.load([
 *     {
 *         alias: "spineSkeleton",
 *         src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pro.skel",
 *     },
 *     {
 *         alias: "spineAtlas",
 *         src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pma.atlas",
 *     },
 * ]);
 *
 * const spine = new Spine({ atlas: "spineAtlas", skeleton: "spineSkeleton" });
 * spine.x = canvas.width / 2;
 * spine.y = canvas.height;
 *
 * canvas.add("spine", spine);
 * ```
 */
export default class Spine extends CoreSpine implements CanvasBaseItem<SpineMemory> {
    constructor(options: Omit<SpineOptions, "parent">) {
        const spineCore = CoreSpine.from(options);
        const { skeleton, parent, ...props } = spineCore;
        super({
            skeletonData: skeleton.data,
            ...props,
        });
        this.skeletonAlias = options.skeleton;
        this.atlasAlias = options.atlas;
        this.darkTintCore = options.darkTint;
    }
    readonly pixivnId: string = CANVAS_SPINE_ID;
    readonly skeletonAlias: SpineOptions["skeleton"];
    readonly atlasAlias: SpineOptions["atlas"];
    readonly darkTintCore: SpineOptions["darkTint"];
    get memory(): SpineMemory {
        return {
            pixivnId: CANVAS_SPINE_ID,
            // container properties
            isRenderGroup: this.isRenderGroup,
            blendMode: this.blendMode,
            tint: this.tint,
            alpha: this.alpha,
            angle: this.angle,
            renderable: this.renderable,
            rotation: this.rotation,
            scale: {
                x: this.scale.x,
                y: this.scale.y,
            },
            pivot: {
                x: this.pivot.x,
                y: this.pivot.y,
            },
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            skew: {
                x: this.skew.x,
                y: this.skew.y,
            },
            visible: this.visible,
            x: this.x,
            y: this.y,
            cursor: this.cursor,
            eventMode: this.eventMode,
            interactive: this.interactive,
            interactiveChildren: this.interactiveChildren,
            height: this.height,
            width: this.width,
            // spine properties
            accessible: this.accessible,
            autoUpdate: this.autoUpdate,
            accessibleChildren: this.accessibleChildren,
            accessibleHint: this.accessibleHint,
            accessiblePointerEvents: this.accessiblePointerEvents,
            accessibleText: this.accessibleText,
            accessibleTitle: this.accessibleTitle,
            accessibleType: this.accessibleType,
            cullable: this.cullable,
            cullableChildren: this.cullableChildren,
            label: this.label,
            origin: {
                x: this.origin.x,
                y: this.origin.y,
            },
            sortableChildren: this.sortableChildren,
            zIndex: this.zIndex,
            sortDirty: this.sortDirty,
            tabIndex: this.tabIndex,
            skeleton: this.skeletonAlias,
            atlas: this.atlasAlias,
            darkTint: this.darkTintCore,
            state: {
                tracks: this.state.tracks.map((track) => {
                    if (!track || !track.animation) {
                        return null;
                    }
                    const res: TrackMemory = {
                        animationName: track.animation.name,
                        loop: track.loop,
                        trackIndex: track.trackIndex,
                        delay: track.delay,
                    };
                    return res;
                }),
            },
            currentSkin: this.skeleton.skin?.name,
        };
    }
    async setMemory(memory: SpineMemory): Promise<void> {
        await setMemorySpine(this, memory);
    }
    /**
     * Set a current track with the given animation configuration.
     * @param trackIndex The track index to set the animation on.
     * @param animationName The name of the animation to set.
     * @param options Additional options for setting the animation.
     */
    setAnimation(
        animationName: string,
        options: {
            /**
             * The track index to play the animation on.
             */
            trackIndex: number;
            /**
             * Whether the animation should loop. If true, the animation will loop indefinitely until changed.
             */
            loop?: boolean;
            /**
             * If true, the animation will be completed before the next step.
             * @default true
             */
            completeOnContinue?: boolean;
        },
    ) {
        const { loop, completeOnContinue = true, trackIndex } = options;
        const mem = CompleteOnContinueTracks.tracks.get(`${this.uid}`) || { spine: this, tracks: [] };
        if (completeOnContinue && !mem.tracks.includes(trackIndex)) {
            mem.tracks.push(trackIndex);
            CompleteOnContinueTracks.tracks.set(`${this.uid}`, mem);
        } else if (!completeOnContinue && mem.tracks.includes(trackIndex)) {
            mem.tracks = mem.tracks.filter((index) => index !== trackIndex);
        }
        return this.state.setAnimation(trackIndex, animationName, loop);
    }
    /**
     * Add an animation to a track with the given animation configuration.
     * @param animationName The name of the animation to play.
     * @param options Additional options for playing the track.
     */
    addAnimation(
        animationName: string,
        options: {
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
            /**
             * The track index to play the animation on.
             */
            trackIndex?: number;
            /**
             * If true, the animation will be completed before the next step.
             * @default true
             */
            completeOnContinue?: boolean;
        } = {},
    ) {
        const { loop, delay, trackIndex = this.state.tracks.length, completeOnContinue } = options;
        const milliDelay = delay ? delay * 1000 : 0;
        const mem = CompleteOnContinueTracks.tracks.get(`${this.uid}`) || { spine: this, tracks: [] };
        if (completeOnContinue && !mem.tracks.includes(trackIndex)) {
            mem.tracks.push(trackIndex);
            CompleteOnContinueTracks.tracks.set(`${this.uid}`, mem);
        } else if (!completeOnContinue && mem.tracks.includes(trackIndex)) {
            mem.tracks = mem.tracks.filter((index) => index !== trackIndex);
        }
        return this.state.addAnimation(trackIndex, animationName, loop, milliDelay);
    }
    /**
     * Play a track with the given animation configuration.
     * @param sequence The animation configuration for the track. Corresponds to the motion sequence settings: https://motion.dev/docs/animate#timeline-sequences
     * @param options Additional options for playing the track.
     * @example
     * ```ts
     * spine.playTrack([
     *     ["walk", { loop: true, duration: 2 }],
     *     ["jump", { delay: 0.5 }],
     * ], { loop: true, completeOnContinue: true });
     * ```
     */
    playTrack(
        sequence: [string, SpineSequenceOptions | undefined][],
        options: {
            /**
             * Whether the animation should loop. If true, the animation will loop indefinitely until changed.
             */
            loop?: boolean;
            /**
             * If true, the animation will be completed before the next step.
             * @default true
             */
            completeOnContinue?: boolean;
        } = {},
    ): Omit<AnimationPlaybackControlsWithThen, "pause"> {
        const index = this.state.tracks.length;
        this.clearTrack(index);
        const { completeOnContinue = true } = options;
        const [animationName, animationOptions] = sequence[0];
        this.addAnimation(animationName, { trackIndex: index, completeOnContinue, ...animationOptions });
        const timeline = this.setTrackSequence(index, sequence, options);
        return timeline;
    }
    setTrackSequence(
        trackIndex: number,
        sequence: [string, SpineSequenceOptions | undefined][],
        options: SequenceOptions & { completeOnContinue?: boolean } = {},
    ) {
        const { completeOnContinue = true, ...rest } = options;
        const results: SegmentOptions[] = [];
        sequence.forEach(([currentAnimationName, animOptions]) => {
            const currentAnimation = this.skeleton.data.findAnimation(currentAnimationName);
            if (!currentAnimation) {
                logger.warn(`Animation ${currentAnimationName} not found in skeleton ${this.skeletonAlias}`);
                return;
            }
            const {
                loop,
                delay,
                duration = currentAnimation.duration ? currentAnimation.duration / 1000 : undefined,
                ...rest
            } = animOptions || {};

            results.push({
                ...rest,
                delay: delay,
                duration: duration,
                onPlay: () =>
                    this.addAnimation(currentAnimationName, { ...animOptions, trackIndex, completeOnContinue }),
                onComplete: () => this.clearTrack(trackIndex),
            });
        });
        return timeline(results, { ...rest });
    }
    /**
     * Removes all animations from all tracks, leaving skeletons in their current pose.
     */
    clearTracks() {
        this.state.clearTracks();
    }
    /**
     * Removes a track by index, leaving skeletons in their current pose.
     * @param trackIndex The track index to clear. Removes all animations from the track, leaving skeletons in their current pose.
     */
    clearTrack(trackIndex: number) {
        this.state.clearTrack(trackIndex);
    }
    /**
     * Set the skin of the spine sprite.
     * @param skinName The name of the skin.
     */
    setSkin(skinName: string) {
        try {
            this.skeleton.setSkinByName(skinName);
            this.skeleton.setSlotsToSetupPose();
        } catch (e) {
            logger.error(`Failed to set skin: ${skinName}`, e);
        }
    }
}
RegisteredCanvasComponents.add<SpineMemory, typeof Spine>(Spine, {
    name: CANVAS_SPINE_ID,
    getInstance: async (canvasClass, memory) => {
        await Assets.load([memory.skeleton, memory.atlas]);
        const instance = new canvasClass({
            skeleton: memory.skeleton,
            atlas: memory.atlas,
            darkTint: memory.darkTint,
        });
        await instance.setMemory(memory);
        return instance;
    },
});

async function setMemorySpine(element: Spine, memory: SpineMemory) {
    element.state.clearTracks();
    memory.currentSkin !== undefined && element.setSkin(memory.currentSkin);
    await setMemoryContainer(element, memory, {
        end() {
            memory.accessible !== undefined && (element.accessible = memory.accessible);
            memory.autoUpdate !== undefined && (element.autoUpdate = memory.autoUpdate);
            memory.accessibleChildren !== undefined && (element.accessibleChildren = memory.accessibleChildren);
            memory.accessibleHint !== undefined && (element.accessibleHint = memory.accessibleHint);
            memory.accessiblePointerEvents !== undefined &&
                (element.accessiblePointerEvents = memory.accessiblePointerEvents);
            memory.accessibleText !== undefined && element;
            memory.accessibleTitle !== undefined && (element.accessibleTitle = memory.accessibleTitle);
            memory.accessibleType !== undefined && element;
            memory.cullable !== undefined && (element.cullable = memory.cullable);
            memory.cullableChildren !== undefined && (element.cullableChildren = memory.cullableChildren);
            memory.label !== undefined && (element.label = memory.label);
            if (memory.origin !== undefined) {
                if (typeof memory.origin === "number") {
                    element.origin.set(memory.origin, memory.origin);
                } else {
                    element.origin.set(memory.origin.x, memory.origin.y);
                }
            }
            memory.sortableChildren !== undefined && (element.sortableChildren = memory.sortableChildren);
            memory.zIndex !== undefined && (element.zIndex = memory.zIndex);
            memory.sortDirty !== undefined && (element.sortDirty = memory.sortDirty);
            memory.tabIndex !== undefined && (element.tabIndex = memory.tabIndex);
        },
    });
    memory.state.tracks.forEach((track, index) => {
        if (!track) {
            return;
        }
        element.state.addAnimation(index, track.animationName, track.loop, track.delay);
    });
}
