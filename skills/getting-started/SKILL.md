---
name: pixi-vn-spine
description: Entry point for @drincs/pixi-vn-spine, the Spine 2D integration for Pixi'VN. Use when a Pixi'VN project needs to install the package, register it in main.ts, load Spine skeleton/atlas assets, show a `Spine` component on the canvas, switch skins, play/queue/sequence animations on tracks, clear tracks, combine Spine with `canvas.animate`, or restore Spine state from a save. For ink hashtag commands (`# show spine`, `# play ... on spine`), load `pixi-vn-spine-ink` too.
---

# Pixi'VN Spine 2D

`@drincs/pixi-vn-spine` wraps the official Spine runtime for PixiJS v8
(`@esotericsoftware/spine-pixi-v8`) in a Pixi'VN canvas component called `Spine`. It behaves like
any other Pixi'VN canvas element: you add it with `canvas.add`, find it with `canvas.find`, animate
it with `canvas.animate`, and it is saved and restored with the game state.

Official docs: [pixi-vn.com/start/canvas-spine2d](https://pixi-vn.com/start/canvas-spine2d).
API reference: [jsdocs.pixi-vn.com/pixi-vn-spine](https://jsdocs.pixi-vn.com/pixi-vn-spine).
For the base engine (canvas, assets, labels), use the `pixi-vn` skill set
(`npx skills@latest add DRincs-Productions/pixi-vn@latest --skill '*' -g -y`).

## Skill map

| Task | Skill |
| --- | --- |
| Install, register, show and animate Spine from TypeScript | **pixi-vn-spine** (this skill) |
| Use Spine from ink scripts via hashtag commands | [pixi-vn-spine-ink](../ink/SKILL.md) |

## Installation

```npm
npm install @drincs/pixi-vn-spine
```

Peer dependencies: `@drincs/pixi-vn` (>= 1.5.13), `@esotericsoftware/spine-core` and
`@esotericsoftware/spine-pixi-v8` (^4.3.9). `@drincs/pixi-vn-ink` and `zod` are only needed for the
ink integration.

### Required: import the package in the entry file

Importing `@drincs/pixi-vn-spine` registers `Spine` in Pixi'VN's `RegisteredCanvasComponents` and
installs a `Game.addOnPreContinue` hook. Both are side effects of evaluating the module. If the
package is only imported inside lazily loaded code (code-split routes, dynamically imported labels),
a save that contains a `Spine` element can be loaded **before** registration happens, and restoring
it fails because `"Spine"` is unknown. Always add a side-effect import at the top of `main.ts`,
before `Game.init`:

```ts title="main.ts"
import "@drincs/pixi-vn-spine";
import { Game } from "@drincs/pixi-vn";

Game.init(body, {
    // ...
});
```

## Exports

| Entry point | Exports |
| --- | --- |
| `@drincs/pixi-vn-spine` | `Spine` (the Pixi'VN component); types `SpineOptions`, `SpineMemory`, `SpineSequenceOptions`, `TrackMemory` |
| `@drincs/pixi-vn-spine/core` | Re-export of everything in `@esotericsoftware/spine-pixi-v8` (the raw runtime `Spine`, `TrackEntry`, `SpineFromOptions`, ...) |
| `@drincs/pixi-vn-spine/ink` | `createSpineHandler`, `parseShowSpineTail` (see `pixi-vn-spine-ink`) |

Use the `Spine` from the root entry point in games. The one in `/core` is the raw runtime class: it is
not registered with Pixi'VN and is not saved.

## Loading assets

A Spine model needs two assets: a **skeleton** (`.skel` or `.json`) and an **atlas** (`.atlas`, which
references its texture pages). Register them with aliases in the asset manifest (or load them by URL)
and load both before constructing `Spine`:

```ts title="src/assets/index.ts"
import type { AssetsManifest } from "@drincs/pixi-vn";

export const manifest: AssetsManifest = {
    bundles: [
        {
            name: "start",
            assets: [
                { alias: "heroSkeleton", src: "/assets/spine/hero.skel" },
                { alias: "heroAtlas", src: "/assets/spine/hero.atlas" },
            ],
        },
    ],
};
```

```ts
import { Assets } from "@drincs/pixi-vn";

await Assets.load(["heroSkeleton", "heroAtlas"]);
```

Construction fails if the assets are not loaded yet. When restoring a save, the component loads
`memory.skeleton` and `memory.atlas` by itself, so those values must be **asset aliases**
(or URLs) that still resolve when the save is loaded.

## Showing a Spine component

```ts title="content/labels/start.label.ts"
import { Assets, canvas, newLabel } from "@drincs/pixi-vn";
import { Spine } from "@drincs/pixi-vn-spine";

export const startLabel = newLabel("start", [
    async () => {
        await Assets.load(["heroSkeleton", "heroAtlas"]);
        const spine = new Spine({
            skeleton: "heroSkeleton",
            atlas: "heroAtlas",
            xAlign: 0.5,
            yAlign: 1,
            skin: "default",
            animation: "idle",
        });
        canvas.add("hero", spine);
    },
]);
```

`SpineOptions`:

- `skeleton`, `atlas` (required): asset aliases.
- `scale`: skeleton scale applied when the skeleton data is parsed (not the container scale).
- `darkTint`: `true` forces the dark-tint renderer, `false` disables it, `undefined` enables it only
  if some slot uses tint black.
- `autoUpdate`: whether the skeleton updates on the ticker (default `true`).
- `skin`: initial skin, same as calling `setSkin` right after construction.
- `animation`: initial animation, queued **looping on track 0**.
- Every Pixi'VN container option: `x`, `y`, `alpha`, `angle`, `zIndex`, `visible`, ..., plus the
  Pixi'VN positioning props `anchor`, `align` / `xAlign` / `yAlign`, and `percentagePosition` /
  `percentageX` / `percentageY`.

Positioning works as for other Pixi'VN components: `xAlign: 0.5, yAlign: 1` centers the model
horizontally and puts it on the bottom edge. Setting `x`, `y` or `position` switches back to pixel
positioning.

Retrieve it later with `canvas.find<Spine>("hero")`. Remove it with `canvas.remove("hero")` or with any
Pixi'VN exit transition (`removeWithDissolve`, `removeWithFade`, ...). Entrance transitions
(`showWithDissolve`, `moveIn`, ...) accept a `Spine` instance like any other canvas component.

## Skins

```ts
canvas.find<Spine>("goblin")?.setSkin("goblingirl");
```

`setSkin` also resets the slots to the setup pose so the new attachments appear. An unknown skin
name is logged as an error instead of throwing. The current skin is saved with the game.

## Animations and tracks

Spine plays animations on numbered **tracks**. Higher tracks are layered on top of lower ones, which
lets you, for example, play `walk` on track 0 and `wave` on track 1 at the same time.

```ts
const hero = canvas.find<Spine>("hero");

// Replace whatever is playing on track 0, immediately. trackIndex is required.
hero?.setAnimation("run", { trackIndex: 0, loop: true });

// Queue "jump" after the current animation on track 0 finishes.
hero?.addAnimation("jump", { trackIndex: 0 });
// Then go back to idle, starting 0.2s after jump ends.
hero?.addAnimation("idle", { trackIndex: 0, loop: true, delay: 0.2 });
```

- `setAnimation(name, { trackIndex, loop?, completeOnContinue? })`: replaces the current animation on
  the track. Returns the runtime `TrackEntry`, or `null` if the animation does not exist.
- `addAnimation(name, { trackIndex?, loop?, delay?, completeOnContinue? })`: queues the animation
  after the current one on the track. `delay` is in **seconds**.

**Pass `trackIndex` to `addAnimation` if you want to queue on an existing track.** When it is
omitted, the default is `state.tracks.length`, which is a **new, empty track**. The animation then
starts immediately and is layered on top of the others, so nothing is queued.
For example, after `new Spine({ ..., animation: "idle" })` (which uses track 0),
`addAnimation("walk", { loop: true })` plays `walk` on track 1 over `idle`. To have `walk` follow
`idle`, use `addAnimation("walk", { trackIndex: 0, loop: true })`. To switch right away, use
`setAnimation("walk", { trackIndex: 0, loop: true })`.

### `completeOnContinue`

When this flag is true, the track is registered for clearing: on the next narration step
(`Game.addOnPreContinue`, i.e. when the player continues), the package calls `clearTrack` on it,
so a one-shot animation started in one step does not keep running into the next.

- `setAnimation` and `playSequence`: default `true`.
- `addAnimation`: only applies when you pass `completeOnContinue: true` explicitly (its JSDoc says
  `@default true`, but the code treats a missing value as false).

Pass `completeOnContinue: false` to keep an animation running across steps (for example a looping
idle that should persist).

### Sequences

`playSequence` plays several animations one after another on a single track. It is driven by a
`motion` timeline, so it accepts motion sequence options such as `repeat`, `repeatDelay` and
`repeatType`:

```ts
spine.playSequence(
    [
        ["idle", { loop: true, duration: 0.5 }], // [animationName, SpineSequenceOptions]
        "jump", // name only: plays for the animation's own duration
    ],
    { repeat: Infinity },
);
```

- Each entry is either an animation name or `[name, { duration?, loop?, delay? }]`. `duration` and
  `delay` are in seconds. Without `duration`, the animation's own length is used.
- Options: motion `SequenceOptions`, plus `trackIndex` (default: a new track) and
  `completeOnContinue` (default `true`).
- The track is cleared before the sequence starts and again when the timeline ends.
- Unknown animation names are skipped with a warning.
- The return value is the motion timeline controls without `pause`, so `await` works and so does
  `.stop()`.
- Sequences are saved and resumed when the game is loaded. Their entries and options must therefore
  be serializable. Do not use callbacks in them.

### Clearing

```ts
spine.clearTrack(1); // stop track 1 and its sequence, if any
spine.clearTracks(); // stop every track and every running sequence
```

Both leave the skeleton in its current pose. They do not reset to the setup pose.

## Combining with Pixi'VN motion animations

`Spine` supports `canvas.animate` like any other component, so a skeletal animation (e.g. `walk`) can
be combined with movement on the canvas:

```ts
const spine = new Spine({
    skeleton: "heroSkeleton",
    atlas: "heroAtlas",
    xAlign: 0,
    yAlign: 1,
    animation: "walk",
});
canvas.add("hero", spine);
canvas.animate(
    spine,
    [
        [{ xAlign: 1 }, { duration: 1, ease: "linear" }],
        [{ scaleX: -1 }, { duration: 0.2 }],
        [{ xAlign: 0 }, { duration: 1, ease: "linear" }],
        [{ scaleX: 1 }, { duration: 0.2 }],
    ],
    { repeat: Infinity },
);
```

For interactive games, you can also call `setAnimation`/`addAnimation` from event handlers or a
ticker, for example when a button is pressed.

## Saves and memory

`Spine` implements Pixi'VN's `CanvasBaseItem<SpineMemory>`. Its memory stores the skeleton/atlas
aliases, `darkTint`, container and positioning props, `currentSkin`, the animation on each track
(name, loop, delay) and any running `playSequence` timelines. Listeners added with `spine.on(...)`
are tracked by Pixi'VN's `ListenerExtension`, so they follow the same save rules as listeners on
the other Pixi'VN canvas components. Restoring:

1. Loads the skeleton and atlas assets.
2. Rebuilds the component.
3. Applies the skin and the container props.
4. Replays the sequences and track animations.

This requires the entry-file side-effect import described above.

## Gotchas

- Forgetting `import "@drincs/pixi-vn-spine"` in `main.ts`: loading a save fails when the first
  import of the package happens lazily.
- Building `Spine` before `Assets.load([...skeleton, atlas])` has resolved: construction fails.
- Calling `addAnimation` without `trackIndex`: the animation goes on a new layered track instead of
  being queued (see above).
- Animation and skin names are defined in the Spine project and are case sensitive. Check them in
  the Spine editor or with `spine.skeleton.data.animations` / `spine.skeleton.data.skins`.
- Spine runtime version: the 4.3 runtime needs data exported by Spine 4.3. Mismatched exports fail
  while parsing.
