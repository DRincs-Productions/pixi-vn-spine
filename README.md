# Spine 2D integration for Pixi’VN

<p align="left">
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn-spine" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/v/@drincs/pixi-vn-spine?label=version" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn-spine" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/dm/@drincs/pixi-vn-spine" alt="npm downloads per month"></a>
  <a target="_blank" href="https://www.jsdelivr.com/package/npm/@drincs/pixi-vn-spine" rel="noopener noreferrer nofollow"><img alt="jsDelivr hits (npm)" src="https://img.shields.io/jsdelivr/npm/hm/@drincs/pixi-vn-spine?logo=jsdeliver"></a>
  <a href="https://www.npmjs.com/package/@drincs/pixi-vn-spine" rel="noopener noreferrer nofollow"><img alt="NPM License" src="https://img.shields.io/npm/l/@drincs/pixi-vn-spine"></a>
  <a target="_blank" href="https://discord.gg/E95FZWakzp" rel="noopener noreferrer nofollow"><img alt="Discord" src="https://img.shields.io/discord/1263071210011496501?color=7289da&label=discord"></a>
</p>

`@drincs/pixi-vn-spine` is a lightweight wrapper around `@esotericsoftware/spine-pixi-v8`, designed specifically to integrate **Spine 2D** components into **Pixi’VN** projects.

The library provides Pixi’VN-friendly abstractions for using Spine animations inside visual novels, making it easier to load, manage, and display Spine content within the Pixi’VN ecosystem.

## Example

```ts
import { Assets, canvas } from "@drincs/pixi-vn";
import { Spine } from "@drincs/pixi-vn-spine";

await Assets.load([
    {
        alias: "spineSkeleton",
        src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pro.skel",
    },
    {
        alias: "spineAtlas",
        src: "https://raw.githubusercontent.com/pixijs/spine-v8/main/examples/assets/spineboy-pma.atlas",
    },
]);

const spine = new Spine({ atlas: "spineAtlas", skeleton: "spineSkeleton" });
spine.x = canvas.width / 2;
spine.y = canvas.height;

spine.setAnimation(0, "idle", true);

canvas.add("spine", spine);
```

## Important: register the component in your main file

When this package is imported, it registers `Spine` with Pixi’VN's `RegisteredCanvasComponents`, which is what allows the canvas to restore a `Spine` instance from a serialized save (e.g. `currentSkin`, animation tracks, etc.). This registration is a side effect that runs the first time the module is evaluated, not when `Spine` is actually used.

In simple setups this isn't noticeable, because importing `Spine` to create an instance also triggers the registration. But in more complex projects with asynchronous/lazy loading (code-split routes, dynamically imported labels, a save loaded before any scene that uses `Spine` has been imported, etc.), the registration might not have happened yet when Pixi’VN needs to deserialize a save containing a `Spine` component — restoring it will then fail because `"Spine"` isn't registered.

To avoid this, import the package once, for its side effect only, directly in your app's main/entry file, before anything else runs:

```ts
import "@drincs/pixi-vn-spine";
```

This guarantees the registration always happens as early as possible, regardless of when/where `Spine` is later imported and used.

## Agent Skills

Pixi’VN Spine ships a set of [Agent Skills](https://www.skills.sh/) that teach AI coding assistants how to correctly use the Spine 2D integration.

> In LM Studio Bionic, ask the agent to install skills from `https://github.com/DRincs-Productions/pixi-vn-spine`, or add the skill files in **Settings → Skills**. To reuse skills installed for Codex or Claude Code, enable **Settings → Skills → Use skills found in other apps**.

**Codex**:

```npm
npx skills@latest add DRincs-Productions/pixi-vn-spine@latest --skill '*' --agent codex -g -y
```

**Claude Code**:

```npm
npx skills@latest add DRincs-Productions/pixi-vn-spine@latest --skill '*' --agent claude-code -g -y
```

**Other agents**:

```npm
npx skills@latest add DRincs-Productions/pixi-vn-spine@latest --all -y
```

Available skills:

- `pixi-vn-spine` — the entry point: installation, registering the package in the main file, loading skeleton/atlas assets, the `Spine` component, skins, animations, tracks, sequences and saves
- `pixi-vn-spine-ink` — the ink hashtag commands (`# show spine`, `# edit spine`, `# remove spine`, `# change skin … on spine`, `# play … on spine`, `# clear tracks on spine`) enabled by `createSpineHandler`
