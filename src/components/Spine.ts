import {
    AdditionalPositionsExtension,
    addListenerHandler,
    analizePositionsExtensionProps,
    AnchorExtension,
    Assets,
    CanvasBaseItem,
    createExportableElement,
    ListenerExtension,
    OnEventsHandlers,
    CanvasPropertyUtility as PropsUtils,
    RegisteredCanvasComponents,
    SegmentOptions,
    setMemoryContainer,
    timeline,
} from "@drincs/pixi-vn";
import { Spine as CoreSpine } from "@drincs/pixi-vn-spine/core";
import type { AnimationPlaybackControlsWithThen, SequenceOptions } from "motion";
import { ContainerChild, ContainerEvents, EventEmitter, ObservablePoint, PointData } from "pixi.js";
import { SpineMemory, SpineOptions, SpineSequenceOptions } from "../interfaces";
import TrackMemory from "../interfaces/TrackMemory";
import { CompleteOnContinueTracks } from "../memory/CompleteOnContinueTracks";
import { logger } from "../utils/log-utility";
import { getSuperPivot } from "../utils/props-utility";

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
export default class Spine
    extends CoreSpine
    implements CanvasBaseItem<SpineMemory>, AnchorExtension, ListenerExtension, AdditionalPositionsExtension
{
    constructor(options: SpineOptions) {
        options = analizePositionsExtensionProps(options as any);
        let align = undefined;
        let percentagePosition = undefined;
        let anchor = undefined;
        if (options && "anchor" in options && options?.anchor !== undefined) {
            anchor = options.anchor;
            delete options.anchor;
        }
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align;
            delete options.align;
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition;
            delete options.percentagePosition;
        }

        const { skeleton: skeletonOpt, atlas, darkTint, autoUpdate, scale, ...containerOptions } = options;
        const spineCore = CoreSpine.from({
            skeleton: skeletonOpt,
            atlas,
            darkTint,
            autoUpdate,
            scale,
        });
        const { skeleton, parent, ...props } = spineCore;
        super({
            skeletonData: skeleton.data,
            ...props,
            ...containerOptions,
        });
        this.skeletonAlias = options.skeleton;
        this.atlasAlias = options.atlas;
        this.darkTintCore = options.darkTint;

        if (anchor) {
            this.anchor = anchor;
        }
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    readonly pixivnId: string = CANVAS_SPINE_ID;
    readonly skeletonAlias: SpineOptions["skeleton"];
    readonly atlasAlias: SpineOptions["atlas"];
    readonly darkTintCore: SpineOptions["darkTint"];
    private sequenceTimelines: {
        [track: number]: {
            sequence: ([string, SpineSequenceOptions] | string)[];
            options: SequenceOptions & { completeOnContinue?: boolean };
            timeline: AnimationPlaybackControlsWithThen;
        };
    } = {};
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
            // additional positions and anchor
            anchor: this._anchor ? this.anchor : undefined,
            align: this._align,
            percentagePosition: this._percentagePosition,
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
            sequenceTimelines: Object.fromEntries(
                Object.entries(this.sequenceTimelines).map(([trackIndex, { sequence, options, timeline }]) => [
                    trackIndex,
                    {
                        sequence,
                        options,
                    },
                ]),
            ),
        };
    }
    async setMemory(memory: SpineMemory): Promise<void> {
        await setMemorySpine(this, memory);
        this.reloadAnchor();
        this.reloadPosition();
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
     * Play a sequence of animations on a track, with the given animation configuration.
     * @param sequence The sequence of animations to play, with their respective options. Corresponds to the motion sequence settings: https://motion.dev/docs/animate#timeline-sequences
     * @param options Additional options for playing the track.
     * @example
     * ```ts
     * spine.playTrack([
     *     ["walk", { loop: true, duration: 2 }],
     *     ["jump", { delay: 0.5 }],
     * ], { loop: true, completeOnContinue: true });
     * ```
     */
    playSequence(
        sequence: ([string, SpineSequenceOptions] | string)[],
        options: SequenceOptions & {
            /**
             * If true, the animation will be completed before the next step.
             * @default true
             */
            completeOnContinue?: boolean;
            /**
             * The track index to play the animation on.
             */
            trackIndex?: number;
        } = {},
    ): Omit<AnimationPlaybackControlsWithThen, "pause"> {
        try {
            sequence = createExportableElement(sequence);
        } catch (e) {
            logger.error("Failed to create exportable element for sequence", e);
            throw e;
        }
        try {
            options = createExportableElement(options);
        } catch (e) {
            logger.error("Failed to create exportable element for options", e);
            throw e;
        }
        const { trackIndex = this.state.tracks.length, completeOnContinue = true } = options;
        this.clearTrack(trackIndex);
        const timeline = this.setTrackSequence(sequence, { ...options, trackIndex, completeOnContinue });
        this.sequenceTimelines[trackIndex] = {
            sequence,
            options,
            timeline,
        };
        return timeline;
    }
    private setTrackSequence(
        sequence: ([string, SpineSequenceOptions] | string)[],
        options: SequenceOptions & { completeOnContinue: boolean; trackIndex: number },
    ) {
        const { completeOnContinue, trackIndex, ...rest } = options;
        const results: SegmentOptions[] = [];
        sequence.forEach((item) => {
            if (typeof item === "string") {
                item = [item, {}];
            }
            const [currentAnimationName, animOptions] = item;
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
        Object.values(this.sequenceTimelines).forEach(({ timeline }) => timeline.stop());
        this.sequenceTimelines = {};
        this.state.clearTracks();
    }
    /**
     * Removes a track by index, leaving skeletons in their current pose.
     * @param trackIndex The track index to clear. Removes all animations from the track, leaving skeletons in their current pose.
     */
    clearTrack(trackIndex: number) {
        this.sequenceTimelines[trackIndex]?.timeline.stop();
        delete this.sequenceTimelines[trackIndex];
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

    /** ListenerExtension */
    readonly onEventsHandlers: OnEventsHandlers = {};
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: [
                ...EventEmitter.ArgumentMap<
                    ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
                >[Extract<
                    T,
                    keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }
                >],
                typeof this,
            ]
        ) => void,
        context?: any,
    ): this {
        addListenerHandler(event, this, fn);

        return super.on<T>(event, (...e) => fn(...e, this), context);
    }

    /** Anchor */
    private _anchor?: PointData;
    get anchor(): PointData {
        let x = super.pivot.x / this.width;
        let y = super.pivot.y / this.height;
        return { x, y };
    }
    set anchor(value: PointData | number) {
        if (typeof value === "number") {
            this._anchor = { x: value, y: value };
        } else {
            this._anchor = value;
        }
        this.reloadAnchor();
    }
    protected reloadAnchor() {
        if (this._anchor) {
            super.pivot.set(this._anchor.x * this.width, this._anchor.y * this.height);
        }
    }
    override get pivot() {
        return super.pivot;
    }
    override set pivot(value: ObservablePoint) {
        this._anchor = undefined;
        super.pivot = value;
    }

    /** AdditionalPositions */
    private _align: Partial<PointData> | undefined = undefined;
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            value.x !== undefined && (this._align.x = value.x);
            value.y !== undefined && (this._align.y = value.y);
        }
        this.reloadPosition();
    }
    get align() {
        let superPivot = getSuperPivot(this);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return {
            x: PropsUtils.calculateAlignByPosition(
                "width",
                this.x,
                PropsUtils.getSuperWidth(this),
                superPivot.x,
                superScale.x < 0,
                this.anchor.x,
            ),
            y: PropsUtils.calculateAlignByPosition(
                "height",
                this.y,
                PropsUtils.getSuperHeight(this),
                superPivot.y,
                superScale.y < 0,
                this.anchor.y,
            ),
        };
    }
    set xAlign(value: number) {
        if (this._percentagePosition) {
            this._percentagePosition = undefined;
        }
        this._align === undefined && (this._align = {});
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        let superPivot = getSuperPivot(this);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "width",
            this.x,
            PropsUtils.getSuperWidth(this),
            superPivot.x,
            superScale.x < 0,
            this.anchor.x,
        );
    }
    set yAlign(value: number) {
        if (this._percentagePosition) {
            this._percentagePosition = undefined;
        }
        this._align === undefined && (this._align = {});
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        let superPivot = getSuperPivot(this);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "height",
            this.y,
            PropsUtils.getSuperHeight(this),
            superPivot.y,
            superScale.y < 0,
            this.anchor.y,
        );
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined;
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            value.x !== undefined && (this._percentagePosition.x = value.x);
            value.y !== undefined && (this._percentagePosition.y = value.y);
        }
        this.reloadPosition();
    }
    get percentagePosition() {
        return {
            x: PropsUtils.calculatePercentagePositionByPosition("width", this.x),
            y: PropsUtils.calculatePercentagePositionByPosition("height", this.y),
        };
    }
    set percentageX(_value: number) {
        if (this._align) {
            this._align = undefined;
        }
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageX() {
        return PropsUtils.calculatePercentagePositionByPosition("width", this.x);
    }
    set percentageY(_value: number) {
        if (this._align) {
            this._align = undefined;
        }
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.y = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return PropsUtils.calculatePercentagePositionByPosition("height", this.y);
    }
    get positionType(): "pixel" | "percentage" | "align" {
        if (this._align) {
            return "align";
        } else if (this._percentagePosition) {
            return "percentage";
        }
        return "pixel";
    }
    get positionInfo(): { x: number; y: number; type: "pixel" | "percentage" | "align" } {
        if (this._align) {
            return { x: this._align.x || 0, y: this._align.y || 0, type: "align" };
        } else if (this._percentagePosition) {
            return { x: this._percentagePosition.x || 0, y: this._percentagePosition.y || 0, type: "percentage" };
        }
        return { x: this.x, y: this.y, type: "pixel" };
    }
    set positionInfo(value: { x: number; y: number; type?: "pixel" | "percentage" | "align" }) {
        if (value.type === "align") {
            this.align = { x: value.x, y: value.y };
        } else if (value.type === "percentage") {
            this.percentagePosition = { x: value.x, y: value.y };
        } else {
            this.position.set(value.x, value.y);
        }
    }
    protected reloadPosition() {
        if (this._align) {
            let superPivot = getSuperPivot(this);
            let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
            if (this._align.x !== undefined) {
                super.x = PropsUtils.calculatePositionByAlign(
                    "width",
                    this._align.x,
                    PropsUtils.getSuperWidth(this),
                    superPivot.x,
                    superScale.x < 0,
                );
            }
            if (this._align.y !== undefined) {
                super.y = PropsUtils.calculatePositionByAlign(
                    "height",
                    this._align.y,
                    PropsUtils.getSuperHeight(this),
                    superPivot.y,
                    superScale.y < 0,
                );
            }
        } else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = PropsUtils.calculatePositionByPercentagePosition("width", this._percentagePosition.x);
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = PropsUtils.calculatePositionByPercentagePosition("height", this._percentagePosition.y);
            }
        }
    }
    get position(): ObservablePoint {
        return super.position;
    }
    set position(value: ObservablePoint) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.position = value;
    }
    get x(): number {
        return super.x;
    }
    set x(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.x = value;
    }
    override get y(): number {
        return super.y;
    }
    override set y(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.y = value;
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
    memory = analizePositionsExtensionProps(memory)!;
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
            // "anchor" in memory && memory.anchor !== undefined && (element.anchor = memory.anchor as number | PointData);
            "align" in memory && memory.align !== undefined && (element.align = memory.align as Partial<PointData>);
            "percentagePosition" in memory &&
                memory.percentagePosition !== undefined &&
                (element.percentagePosition = memory.percentagePosition as Partial<PointData>);
        },
    });
    const indexToIgnore: number[] = [];
    memory.sequenceTimelines &&
        Object.entries(memory.sequenceTimelines).forEach(([trackIndex, { sequence, options }]) => {
            const index = Number(trackIndex);
            indexToIgnore.push(index);
            element.playSequence(sequence, { ...options, trackIndex: index });
        });
    memory.state.tracks.forEach((track) => {
        if (!track) {
            return;
        }
        if (indexToIgnore.includes(track.trackIndex)) {
            return;
        }
        element.state.addAnimation(track.trackIndex, track.animationName, track.loop, track.delay);
    });
}
