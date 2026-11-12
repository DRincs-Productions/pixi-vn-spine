---
name: pixi-vn-spine-ink
description: Use when a Pixi'VN ink project needs to show, edit, animate or remove Spine 2D models from .ink scripts. Covers registering the handlers with createSpineHandler from @drincs/pixi-vn-spine/ink and the full syntax of `# show spine`, `# edit spine`, `# remove spine`, `# change skin ... on spine`, `# play ... on spine` and `# clear tracks on spine`, including entrance/exit transitions. Part of the pixi-vn-spine skill set — load pixi-vn-spine for installation and the TypeScript API.
---

# Spine 2D in ink

`@drincs/pixi-vn-spine/ink` adds ink hashtag commands that control the `Spine` canvas component from
`.ink` files. They use the same command system as `@drincs/pixi-vn-ink`'s built-in commands
(`# show image`, `# play sound`, ...), and each one calls the TypeScript API described in
`pixi-vn-spine`.

Official docs: [pixi-vn.com/start/canvas-spine2d](https://pixi-vn.com/start/canvas-spine2d) (open the
"ink" tabs). For ink in Pixi'VN in general, use the `pixi-vn-ink` skill set
(`npx skills@latest add DRincs-Productions/pixi-vn-ink@latest --skill '*' -g -y`).

## Setup

1. Install and register the package as described in `pixi-vn-spine`. That includes the
   `import "@drincs/pixi-vn-spine";` side-effect import in `main.ts`.
2. Make sure `@drincs/pixi-vn-ink` and `zod` are installed. They are optional peer dependencies and
   are only needed for this entry point.
3. Call `createSpineHandler()` **once**, next to `addBaseHashtagCommands`, before any ink content is
   parsed:

```ts title="content/ink/hashtag-commands.ts"
import { addBaseHashtagCommands } from "@drincs/pixi-vn-ink";
import { createSpineHandler } from "@drincs/pixi-vn-spine/ink";

addBaseHashtagCommands({ bundleIds, assetAliasIds });
createSpineHandler();
```

Calling it more than once registers the commands twice. The spine commands do not intercept the base
commands (`# show image`, `# play sound`, ...). If those commands stop resolving, check the
`assetAliasIds`/`bundleIds` allow-lists passed to `addBaseHashtagCommands`. Every alias used in
ink, including the skeleton and atlas aliases, must be listed there when an allow-list is provided.

## Command reference

In the commands below, `<alias>` is the **canvas key** of the element, as in `canvas.add(alias, ...)`.
It is not an asset alias. Free-form properties are written as `<key> <value>` pairs and parsed into
an object. Numbers and booleans are converted to their types (`xAlign 0.5`, `loop true`).

### Show

```ink
# show spine <alias> skeleton <skeletonAlias> atlas <atlasAlias> [<key> <value> …] [with <transition> [<key> <value> …]]
```

- `skeleton` and `atlas` (asset aliases) are **required**. Without them, the command logs an error
  and nothing is shown.
- The command loads both assets itself, so a separate `# load` step is not needed.
- Every other property is passed to `SpineOptions`: `xAlign`, `yAlign`, `align`, `anchor`,
  `percentageX`, `x`, `y`, `alpha`, `zIndex`, `scale`, `skin`, `animation`, ...
  `animation` starts looping on track 0.
- Entrance transitions: `dissolve`, `fade`, `movein`, `zoomin`, `pushin`. The words after the
  transition name are its props (`duration 1`, `direction left`, ...).

```ink
=== start ===
# show spine boy skeleton spineboySkeleton atlas spineboyAtlas xAlign 0.5 yAlign 1 animation idle
# show spine goblin skeleton goblinsSkeleton atlas goblinsAtlas skin goblin xAlign 0.2 yAlign 1 animation walk with dissolve duration 1
-> DONE
```

Use `xAlign`/`yAlign` (0..1) for screen-relative placement. `x`/`y` are **pixels**, so `x 0 y 1`
puts the model in the top-left corner, not on the bottom edge.

### Edit

```ink
# edit spine <alias> [<key> <value> …]
```

Assigns the properties directly on the existing `Spine` (`alpha`, `tint`, `x`, `y`, `xAlign`,
`yAlign`, `visible`, `zIndex`, `angle`, ...). Use the dedicated commands below for skins and
animations. If no element has that alias, the command logs an error.

```ink
# edit spine boy xAlign 0.8 alpha 0.5
```

### Remove

```ink
# remove spine <alias> [with <transition> [<key> <value> …]]
```

Exit transitions: `dissolve`, `fade`, `moveout`, `zoomout`, `pushout`. Entrance-only names such as
`movein` are ignored here, and the element is removed immediately with no transition.

```ink
# remove spine boy with fade duration 0.5
```

### Change skin

```ink
# change skin <skinName> on spine <alias>
```

Calls `setSkin`. The skin name is case sensitive and must exist in the Spine project.

### Play an animation

```ink
# play <animationName> on spine <alias> [loop <bool>] [trackIndex <n>] [delay <seconds>] [completeOnContinue <bool>]
```

Calls `addAnimation`, so the animation is **queued** after whatever is playing on that track.

**Pass `trackIndex` to queue on an existing track.** Without it, the animation goes on a new track
and is layered on top of the current one. For example, after
`# show spine boy ... animation idle` (track 0):

```ink
# play walk on spine boy trackIndex 0 loop true   // walk follows idle on track 0
# play wave on spine boy trackIndex 1             // wave layered over the body, on track 1
```

`completeOnContinue true` clears that track on the next narration step, which is useful for one-shot
animations that should not keep running into the next line.

Ink has no command for `setAnimation` (replace immediately) or `playSequence`. For those, use
`# clear tracks` followed by `# play`, or write a custom hashtag command in TypeScript (see the
`pixi-vn-ink-hashtag-commands` skill) that calls the `Spine` API.

### Clear tracks

```ink
# clear tracks on spine <alias>
```

Calls `clearTracks()`. This stops every track and running sequence and leaves the skeleton in its
current pose.

## Full example

```ink
=== start ===
# show spine boy skeleton spineboySkeleton atlas spineboyAtlas xAlign 0.5 yAlign 1 animation idle with fade duration 0.5
Boy: Hi!
# play walk on spine boy trackIndex 0 loop true
# edit spine boy xAlign 0.8
Boy: Let's go.
# clear tracks on spine boy
# change skin alt on spine boy
# pause
# remove spine boy with dissolve
-> DONE
```

## Exported helpers

- `createSpineHandler(): void` registers all the commands above with `HashtagCommands.add` from
  `@drincs/pixi-vn-ink`. Each command has a zod `validation` and `keySchemas`, so the
  `@drincs/pixi-vn-ink` Vite dev server lists the commands and lints their properties.
- `parseShowSpineTail(tail: string[])` splits the tokens after `<alias>` in a `# show spine` line into
  `{ propsList, transitionType?, transitionPropsList }`. It is used internally and exported so
  custom commands can parse the same syntax.

## Gotchas

- `createSpineHandler` was not called: `# show spine ...` is reported as an unknown hashtag command.
- The `skeleton` or `atlas` key is missing in `# show spine`: an error is logged and nothing appears.
- `# play` without `trackIndex` layers a new track instead of queueing (see above).
- An asset allow-list in `addBaseHashtagCommands` that omits the Spine aliases makes the dev-server
  linter flag them.
