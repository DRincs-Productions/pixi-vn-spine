import { spineOptionsSchema } from "@/ink/spine-options-schema.generated";
import { logger } from "@/utils/log-utility";
import { Assets, canvas } from "@drincs/pixi-vn";
import { HashtagCommands } from "@drincs/pixi-vn-ink";
import {
    containerMemorySchema,
    ENTRANCE_TRANSITION_TYPES,
    entranceTransitionKeySchemas,
    type EntranceTransitionType,
    executeEntranceTransition,
} from "@drincs/pixi-vn-json/actions";
import { Spine } from "@drincs/pixi-vn-spine";
import type { SpineOptions } from "@drincs/pixi-vn-spine";
import {
    moveOut,
    pushOut,
    removeWithDissolve,
    removeWithFade,
    zoomOut,
} from "@drincs/pixi-vn/canvas";
import { z } from "zod";

/**
 * The transition types used to remove a canvas element **out** (as opposed to
 * `dissolve`/`fade`/`movein`/`zoomin`/`pushin`, used only to bring one in). Mirrors
 * `@drincs/pixi-vn-json/actions`' own `ENTRANCE_TRANSITION_TYPES`, but for `# remove spine`.
 */
const EXIT_TRANSITION_TYPES = ["dissolve", "fade", "moveout", "zoomout", "pushout"] as const;
type ExitTransitionType = (typeof EXIT_TRANSITION_TYPES)[number];

/**
 * Runs an exit transition on a canvas element, mirroring `@drincs/pixi-vn-json/actions`'
 * `executeEntranceTransition` but for removal — `@drincs/pixi-vn-json` doesn't (yet) expose an
 * equivalent helper for the exit direction, so this dispatches straight to `@drincs/pixi-vn/canvas`.
 */
function executeExitTransition(
    alias: string,
    transitionType: ExitTransitionType,
    props?: object,
): string[] | undefined {
    switch (transitionType) {
        case "dissolve":
            return removeWithDissolve(alias, props);
        case "fade":
            return removeWithFade(alias, props);
        case "moveout":
            return moveOut(alias, props);
        case "zoomout":
            return zoomOut(alias, props);
        case "pushout":
            return pushOut(alias, props);
    }
}

/** Mirrors {@link Spine.addAnimation}'s own inline options type. */
const addAnimationOptionsSchema = {
    type: "object",
    properties: {
        loop: { type: "boolean" },
        delay: { type: "number" },
        trackIndex: { type: "number" },
        completeOnContinue: { type: "boolean" },
    },
    additionalProperties: false,
};

type AddAnimationOptions = Parameters<Spine["addAnimation"]>[1];

/**
 * Splits the tail (everything after `<alias>`) of a `# show spine` command into its free-form
 * construction props and an optional entrance transition.
 */
export function parseShowSpineTail(tail: string[]): {
    propsList: string[];
    transitionType?: EntranceTransitionType;
    transitionPropsList: string[];
} {
    let propsList = tail;
    let transitionType: EntranceTransitionType | undefined;
    let transitionPropsList: string[] = [];
    const withIndex = propsList.indexOf("with");
    if (withIndex !== -1 && propsList.length > withIndex + 1) {
        const rawType = propsList[withIndex + 1];
        if ((ENTRANCE_TRANSITION_TYPES as readonly string[]).includes(rawType)) {
            transitionType = rawType as EntranceTransitionType;
            transitionPropsList = propsList.slice(withIndex + 2);
        }
        propsList = propsList.slice(0, withIndex);
    }

    return { propsList, transitionType, transitionPropsList };
}

/**
 * Registers the `# show spine` Ink hashtag command, letting Ink scripts show a {@link Spine}
 * canvas element the same way `@drincs/pixi-vn-ink`'s built-in `# show image` shows an
 * `ImageSprite`: `<alias>` is just the canvas key (like every other `# show ...` command), and
 * `skeleton`/`atlas` are required among the free-form `<key> <value>` construction props
 * (forwarded to {@link SpineOptions}). An optional entrance transition can run the element in.
 *
 * Call this once, near the start of your app (alongside e.g. `addBaseHashtagCommands`), before any
 * Ink content is parsed.
 *
 * @example
 * ```ink
 * # show spine hero skeleton heroSkeleton atlas heroAtlas xAlign 0.5 yAlign 1 with dissolve duration 1
 * ```
 */
export function createSpineHandler(): void {
    HashtagCommands.add(
        async (list, _props, convertListStringToObj) => {
            const alias = list[2];
            const { propsList, transitionType, transitionPropsList } = parseShowSpineTail(
                list.slice(3),
            );

            let props: Record<string, unknown> = {};
            if (propsList.length > 0) {
                try {
                    props = convertListStringToObj(propsList) as Record<string, unknown>;
                } catch (e) {
                    logger.error(`Failed to parse props for "show spine ${alias}"`, e);
                    return true;
                }
            }
            const { skeleton, atlas, ...rest } = props;
            if (typeof skeleton !== "string" || typeof atlas !== "string") {
                logger.error(
                    `"show spine ${alias}" requires "skeleton" and "atlas" props with the skeleton/atlas asset aliases, e.g. "skeleton heroSkeleton atlas heroAtlas"`,
                );
                return true;
            }

            await Assets.load([skeleton, atlas]);
            const spine = new Spine({
                ...(rest as Partial<SpineOptions>),
                skeleton,
                atlas,
            });

            if (transitionType) {
                let transitionProps: object | undefined;
                if (transitionPropsList.length > 0) {
                    try {
                        transitionProps = convertListStringToObj(transitionPropsList);
                    } catch (e) {
                        logger.error(
                            `Failed to parse transition props for "show spine ${alias}"`,
                            e,
                        );
                    }
                }
                await executeEntranceTransition(alias, spine, transitionType, transitionProps);
            } else {
                canvas.add(alias, spine);
            }
            return true;
        },
        {
            name: "Show spine",
            description: `Shows a Spine canvas element with key/value construction properties (forwarded to \`SpineOptions\`) and an optional entrance transition. \`<alias>\` is just the canvas key; \`skeleton\` and \`atlas\` (asset aliases) are both required among the key/value properties, e.g. "skeleton heroSkeleton atlas heroAtlas".

\`\`\`ink
# show spine <alias> [<key> <value> …] [with dissolve|fade|movein|moveout|zoomin|zoomout|pushin|pushout [<key> <value> …]]
\`\`\``,
            validation: z
                .tuple([z.literal("show"), z.literal("spine"), z.string()])
                .rest(z.string()),
            keySchemas: {
                with: {},
                ...entranceTransitionKeySchemas,
                3: spineOptionsSchema,
            },
        },
    );

    function runEditSpine(
        alias: string,
        tail: string[],
        convertListStringToObj: (listParm: string[]) => object,
    ): boolean {
        const spine = canvas.find<Spine>(alias);
        if (!spine) {
            logger.error(`"edit spine ${alias}": no Spine canvas element found with this alias`);
            return true;
        }
        if (tail.length === 0) {
            return true;
        }
        try {
            const props = convertListStringToObj(tail);
            Object.assign(spine, props);
        } catch (e) {
            logger.error(`Failed to parse props for "edit spine ${alias}"`, e);
        }
        return true;
    }

    HashtagCommands.add(
        (list, _props, convertListStringToObj) =>
            runEditSpine(list[2], list.slice(3), convertListStringToObj),
        {
            name: "Edit spine",
            description: `Edits the properties of a Spine canvas element identified by its alias, using key/value properties (e.g. alpha, tint, x, y, visible, xAlign, ...).

\`\`\`ink
# edit spine <alias> [<key> <value> …]
\`\`\``,
            validation: z
                .tuple([z.literal("edit"), z.literal("spine"), z.string()])
                .rest(z.string()),
            keySchemas: {
                3: containerMemorySchema,
            },
        },
    );

    function runRemoveSpine(
        alias: string,
        tail: string[],
        convertListStringToObj: (listParm: string[]) => object,
    ): boolean {
        const spine = canvas.find<Spine>(alias);
        if (!spine) {
            logger.error(`"remove spine ${alias}": no Spine canvas element found with this alias`);
            return true;
        }

        let transitionType: ExitTransitionType | undefined;
        let transitionPropsList: string[] = [];
        const withIndex = tail.indexOf("with");
        if (withIndex !== -1 && tail.length > withIndex + 1) {
            const rawType = tail[withIndex + 1];
            if ((EXIT_TRANSITION_TYPES as readonly string[]).includes(rawType)) {
                transitionType = rawType as ExitTransitionType;
                transitionPropsList = tail.slice(withIndex + 2);
            }
        }

        if (transitionType) {
            let transitionProps: object | undefined;
            if (transitionPropsList.length > 0) {
                try {
                    transitionProps = convertListStringToObj(transitionPropsList);
                } catch (e) {
                    logger.error(`Failed to parse transition props for "remove spine ${alias}"`, e);
                }
            }
            executeExitTransition(alias, transitionType, transitionProps);
        } else {
            canvas.remove(alias);
        }
        return true;
    }

    HashtagCommands.add(
        (list, _props, convertListStringToObj) =>
            runRemoveSpine(list[2], list.slice(3), convertListStringToObj),
        {
            name: "Remove spine",
            description: `Removes a Spine canvas element with an optional exit transition.

\`\`\`ink
# remove spine <alias> [with dissolve|fade|movein|moveout|zoomin|zoomout|pushin|pushout [<key> <value> …]]
\`\`\``,
            validation: z
                .tuple([z.literal("remove"), z.literal("spine"), z.string()])
                .rest(z.string()),
            keySchemas: {
                with: {},
                dissolve: entranceTransitionKeySchemas.dissolve,
                fade: entranceTransitionKeySchemas.fade,
                moveout: entranceTransitionKeySchemas.movein,
                zoomout: entranceTransitionKeySchemas.zoomin,
                pushout: entranceTransitionKeySchemas.pushin,
            },
        },
    );

    function findSpineOrLogError(commandLabel: string, alias: string): Spine | undefined {
        const spine = canvas.find<Spine>(alias);
        if (!spine) {
            logger.error(`"${commandLabel}": no Spine canvas element found with alias "${alias}"`);
        }
        return spine;
    }

    HashtagCommands.add(
        (list) => {
            const skinName = list[2];
            const alias = list[5];
            const spine = findSpineOrLogError(`change skin ${skinName} on spine ${alias}`, alias);
            spine?.setSkin(skinName);
            return true;
        },
        {
            name: "Change skin on spine",
            description: `Sets the active skin on a Spine canvas element identified by its alias.

\`\`\`ink
# change skin <skinName> on spine <alias>
\`\`\``,
            validation: z.tuple([
                z.literal("change"),
                z.literal("skin"),
                z.string(),
                z.literal("on"),
                z.literal("spine"),
                z.string(),
            ]),
        },
    );

    HashtagCommands.add(
        (list) => {
            const alias = list[4];
            const spine = findSpineOrLogError(`clear tracks on spine ${alias}`, alias);
            spine?.clearTracks();
            return true;
        },
        {
            name: "Clear tracks on spine",
            description: `Clears every animation track on a Spine canvas element identified by its alias, stopping any running sequences and leaving the skeleton in its current pose.

\`\`\`ink
# clear tracks on spine <alias>
\`\`\``,
            validation: z.tuple([
                z.literal("clear"),
                z.literal("tracks"),
                z.literal("on"),
                z.literal("spine"),
                z.string(),
            ]),
        },
    );

    HashtagCommands.add(
        (list, _props, convertListStringToObj) => {
            const animationName = list[1];
            const alias = list[4];
            const spine = findSpineOrLogError(`play ${animationName} on spine ${alias}`, alias);
            if (!spine) {
                return true;
            }
            const tail = list.slice(5);
            let options: AddAnimationOptions = {};
            if (tail.length > 0) {
                try {
                    options = convertListStringToObj(tail) as AddAnimationOptions;
                } catch (e) {
                    logger.error(
                        `Failed to parse options for "play ${animationName} on spine ${alias}"`,
                        e,
                    );
                    return true;
                }
            }
            spine.addAnimation(animationName, options);
            return true;
        },
        {
            name: "Play animation on spine",
            description: `Queues an animation to play after the current one on a track, on a Spine canvas element identified by its alias. Optional key/value properties: loop, delay, trackIndex, completeOnContinue.

\`\`\`ink
# play <animationName> on spine <alias> [<key> <value> …]
# play walk on spine hero trackIndex 0 loop true
\`\`\``,
            validation: z
                .tuple([
                    z.literal("play"),
                    z.string(),
                    z.literal("on"),
                    z.literal("spine"),
                    z.string(),
                ])
                .rest(z.string()),
            keySchemas: {
                5: addAnimationOptionsSchema,
            },
        },
    );
}
