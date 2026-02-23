import { CachedMap } from "@drincs/pixi-vn";

export class CompleteOnContinueTracks {
    static tracks: CachedMap<
        string,
        {
            spine: any;
            tracks: number[];
        }
    > = new CachedMap({ cacheSize: 4 });
}
