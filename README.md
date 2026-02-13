# Spine 2D integration for Pixi’VN

<img width="1600" height="400" alt="pixi-vn-cover" src="https://github.com/user-attachments/assets/6d0edd5e-4ff6-414b-9c27-348e70f866b1" />

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
