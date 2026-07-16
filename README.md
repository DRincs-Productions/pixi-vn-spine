# Spine 2D integration for Pixi’VN

![pixi-vn-cover](https://github.com/user-attachments/assets/6d0edd5e-4ff6-414b-9c27-348e70f866b1)

<p align="center">
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
