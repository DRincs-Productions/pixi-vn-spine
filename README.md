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
