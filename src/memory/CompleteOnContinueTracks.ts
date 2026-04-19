import type { Spine } from "@/components";
import { CachedMap } from "@drincs/pixi-vn";

export namespace CompleteOnContinueTracks {
    export const tracks: CachedMap<
        string,
        {
            spine: Spine;
            tracks: number[];
        }
    > = new CachedMap({ cacheSize: 4 });
}
