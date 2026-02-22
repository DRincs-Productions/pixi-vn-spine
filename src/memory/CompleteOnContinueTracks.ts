import { CachedMap } from "@drincs/pixi-vn";
import type { Spine } from "../components";

export class CompleteOnContinueTracks {
    static tracks: CachedMap<
        string,
        {
            spine: Spine;
            tracks: number[];
        }
    > = new CachedMap({ cacheSize: 4 });
}
