/**
 * GENERATED FILE — do not edit by hand.
 * Produced by `scripts/generate-spine-options-schema.mjs` from `SpineOptions`
 * (src/interfaces/SpineOptions.ts). Re-run that script (see its header comment) to refresh this
 * file after that interface (or the types it derives from) changes.
 */

/**
 * JSON Schema (usable as `@drincs/pixi-vn-ink`'s `HashtagHandlerOptions.keySchemas` values, or
 * with any other JSON Schema validator) for `SpineOptions`.
 */
export const spineOptionsSchema: object = {
    type: "object",
    properties: {
        skin: {
            type: "string",
        },
        skeleton: {
            type: "string",
        },
        atlas: {
            type: "string",
        },
        scale: {
            type: "number",
        },
        autoUpdate: {
            enum: [false, true],
        },
        darkTint: {
            enum: [false, true],
        },
        allowMissingRegions: {
            enum: [false, true],
        },
        ticker: {
            type: "object",
        },
        parent: {
            type: "object",
        },
        accessible: {
            enum: [false, true],
        },
        accessibleTitle: {
            type: ["null", "string"],
        },
        accessibleHint: {
            type: ["null", "string"],
        },
        tabIndex: {
            type: "number",
        },
        accessibleType: {
            enum: [
                "object",
                "label",
                "a",
                "abbr",
                "address",
                "area",
                "article",
                "aside",
                "audio",
                "b",
                "base",
                "bdi",
                "bdo",
                "blockquote",
                "body",
                "br",
                "button",
                "canvas",
                "caption",
                "cite",
                "code",
                "col",
                "colgroup",
                "data",
                "datalist",
                "dd",
                "del",
                "details",
                "dfn",
                "dialog",
                "div",
                "dl",
                "dt",
                "em",
                "embed",
                "fieldset",
                "figcaption",
                "figure",
                "footer",
                "form",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "head",
                "header",
                "hgroup",
                "hr",
                "html",
                "i",
                "iframe",
                "img",
                "input",
                "ins",
                "kbd",
                "legend",
                "li",
                "link",
                "main",
                "map",
                "mark",
                "menu",
                "meta",
                "meter",
                "nav",
                "noscript",
                "ol",
                "optgroup",
                "option",
                "output",
                "p",
                "picture",
                "pre",
                "progress",
                "q",
                "rp",
                "rt",
                "ruby",
                "s",
                "samp",
                "script",
                "search",
                "section",
                "select",
                "slot",
                "small",
                "source",
                "span",
                "strong",
                "style",
                "sub",
                "summary",
                "sup",
                "table",
                "tbody",
                "td",
                "template",
                "textarea",
                "tfoot",
                "th",
                "thead",
                "time",
                "title",
                "tr",
                "track",
                "u",
                "ul",
                "var",
                "video",
                "wbr",
            ],
        },
        accessiblePointerEvents: {
            enum: [
                "visible",
                "auto",
                "none",
                "visiblePainted",
                "visibleFill",
                "visibleStroke",
                "painted",
                "fill",
                "stroke",
                "all",
                "inherit",
            ],
        },
        accessibleText: {
            type: ["null", "string"],
        },
        accessibleChildren: {
            enum: [false, true],
        },
        cullArea: {
            type: "object",
        },
        cullable: {
            enum: [false, true],
        },
        cullableChildren: {
            enum: [false, true],
        },
        isRenderGroup: {
            enum: [false, true],
        },
        blendMode: {
            enum: [
                "none",
                "inherit",
                "normal",
                "add",
                "multiply",
                "screen",
                "darken",
                "lighten",
                "erase",
                "color-dodge",
                "color-burn",
                "linear-burn",
                "linear-dodge",
                "linear-light",
                "hard-light",
                "soft-light",
                "pin-light",
                "difference",
                "exclusion",
                "overlay",
                "saturation",
                "color",
                "luminosity",
                "normal-npm",
                "add-npm",
                "screen-npm",
                "subtract",
                "divide",
                "vivid-light",
                "hard-mix",
                "negation",
                "min",
                "max",
            ],
        },
        tint: {
            anyOf: [
                {
                    type: "string",
                },
                {
                    type: "number",
                },
                {
                    type: "object",
                },
                {
                    type: "object",
                },
                {
                    type: "object",
                },
                {
                    type: "object",
                },
                {
                    type: "object",
                },
                {
                    allOf: [
                        {
                            type: "object",
                        },
                        {
                            type: "object",
                        },
                    ],
                },
                {
                    type: "object",
                },
                {
                    allOf: [
                        {
                            type: "object",
                        },
                        {
                            type: "object",
                        },
                    ],
                },
                {
                    type: "object",
                },
                {
                    allOf: [
                        {
                            type: "object",
                        },
                        {
                            type: "object",
                        },
                    ],
                },
                {
                    type: "object",
                },
            ],
        },
        alpha: {
            type: "number",
        },
        angle: {
            type: "number",
        },
        children: {
            type: "object",
        },
        renderable: {
            enum: [false, true],
        },
        rotation: {
            type: "number",
        },
        pivot: {
            type: ["number", "object"],
        },
        origin: {
            type: ["number", "object"],
        },
        position: {
            type: "object",
        },
        skew: {
            type: "object",
        },
        visible: {
            enum: [false, true],
        },
        x: {
            type: "number",
        },
        y: {
            type: "number",
        },
        boundsArea: {
            type: "object",
        },
        cursor: {
            anyOf: [
                {
                    const: "progress",
                },
                {
                    const: "auto",
                },
                {
                    const: "none",
                },
                {
                    const: "default",
                },
                {
                    const: "context-menu",
                },
                {
                    const: "help",
                },
                {
                    const: "pointer",
                },
                {
                    const: "wait",
                },
                {
                    const: "cell",
                },
                {
                    const: "crosshair",
                },
                {
                    const: "text",
                },
                {
                    const: "vertical-text",
                },
                {
                    const: "alias",
                },
                {
                    const: "copy",
                },
                {
                    const: "move",
                },
                {
                    const: "no-drop",
                },
                {
                    const: "not-allowed",
                },
                {
                    const: "e-resize",
                },
                {
                    const: "n-resize",
                },
                {
                    const: "ne-resize",
                },
                {
                    const: "nw-resize",
                },
                {
                    const: "s-resize",
                },
                {
                    const: "se-resize",
                },
                {
                    const: "sw-resize",
                },
                {
                    const: "w-resize",
                },
                {
                    const: "ns-resize",
                },
                {
                    const: "ew-resize",
                },
                {
                    const: "nesw-resize",
                },
                {
                    const: "col-resize",
                },
                {
                    const: "nwse-resize",
                },
                {
                    const: "row-resize",
                },
                {
                    const: "all-scroll",
                },
                {
                    const: "zoom-in",
                },
                {
                    const: "zoom-out",
                },
                {
                    const: "grab",
                },
                {
                    const: "grabbing",
                },
                {
                    allOf: [
                        {
                            type: "string",
                        },
                        {
                            type: "object",
                        },
                    ],
                },
            ],
        },
        eventMode: {
            enum: ["auto", "none", "passive", "static", "dynamic"],
        },
        interactive: {
            enum: [false, true],
        },
        interactiveChildren: {
            enum: [false, true],
        },
        hitArea: {
            type: ["null", "object"],
        },
        onclick: {
            type: ["null", "object"],
        },
        onmousedown: {
            type: ["null", "object"],
        },
        onmouseenter: {
            type: ["null", "object"],
        },
        onmouseleave: {
            type: ["null", "object"],
        },
        onmousemove: {
            type: ["null", "object"],
        },
        onglobalmousemove: {
            type: ["null", "object"],
        },
        onmouseout: {
            type: ["null", "object"],
        },
        onmouseover: {
            type: ["null", "object"],
        },
        onmouseup: {
            type: ["null", "object"],
        },
        onmouseupoutside: {
            type: ["null", "object"],
        },
        onpointercancel: {
            type: ["null", "object"],
        },
        onpointerdown: {
            type: ["null", "object"],
        },
        onpointerenter: {
            type: ["null", "object"],
        },
        onpointerleave: {
            type: ["null", "object"],
        },
        onpointermove: {
            type: ["null", "object"],
        },
        onglobalpointermove: {
            type: ["null", "object"],
        },
        onpointerout: {
            type: ["null", "object"],
        },
        onpointerover: {
            type: ["null", "object"],
        },
        onpointertap: {
            type: ["null", "object"],
        },
        onpointerup: {
            type: ["null", "object"],
        },
        onpointerupoutside: {
            type: ["null", "object"],
        },
        onrightclick: {
            type: ["null", "object"],
        },
        onrightdown: {
            type: ["null", "object"],
        },
        onrightup: {
            type: ["null", "object"],
        },
        onrightupoutside: {
            type: ["null", "object"],
        },
        ontap: {
            type: ["null", "object"],
        },
        ontouchcancel: {
            type: ["null", "object"],
        },
        ontouchend: {
            type: ["null", "object"],
        },
        ontouchendoutside: {
            type: ["null", "object"],
        },
        ontouchmove: {
            type: ["null", "object"],
        },
        onglobaltouchmove: {
            type: ["null", "object"],
        },
        ontouchstart: {
            type: ["null", "object"],
        },
        onwheel: {
            type: ["null", "object"],
        },
        onRender: {
            type: ["null", "object"],
        },
        width: {
            type: "number",
        },
        height: {
            type: "number",
        },
        mask: {
            type: ["null", "number", "object"],
        },
        setMask: {
            type: "object",
        },
        filters: {
            type: "object",
        },
        label: {
            type: "string",
        },
        zIndex: {
            type: "number",
        },
        sortDirty: {
            enum: [false, true],
        },
        sortableChildren: {
            enum: [false, true],
        },
        cacheAsTexture: {
            type: "object",
        },
        anchor: {
            type: ["number", "object"],
        },
        align: {
            type: ["number", "object"],
        },
        xAlign: {
            type: "number",
        },
        yAlign: {
            type: "number",
        },
        percentagePosition: {
            type: ["number", "object"],
        },
        percentageX: {
            type: "number",
        },
        percentageY: {
            type: "number",
        },
    },
    required: ["skeleton", "atlas"],
    additionalProperties: false,
};
