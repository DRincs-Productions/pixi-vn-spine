import type { Spine } from "../components";

export class CompleteOnContinueTracks {
    static tracks: Map<
        string,
        {
            spine: Spine;
            tracks: number[];
        }
    > = new Map();
}
