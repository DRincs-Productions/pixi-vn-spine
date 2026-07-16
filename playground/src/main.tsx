import { Assets, Container, Game, canvas, sound } from "@drincs/pixi-vn";
import { createRoot } from "react-dom/client";
import App from "./App";

// Canvas setup with PIXI
const body = document.body;
if (!body) {
  throw new Error("body element not found");
}

Game.init(body, {
  height: 1080,
  width: 1920,
}).then(() => {
  // Pixi.JS UI Layer
  canvas.addLayer("ui", new Container());

  // Sound setup
  sound.addChannel("bgm", { background: true });
  sound.addChannel("sfx");
  sound.defaultChannelAlias = "sfx";

  // React setup with ReactDOM
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("root element not found");
  }

  const htmlLayout = canvas.addHtmlLayer("ui", root);
  if (!htmlLayout) {
    throw new Error("htmlLayout not found");
  }
  const reactRoot = createRoot(htmlLayout);

  Assets.load([
    {
      alias: "spineboySkeleton",
      src: "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/examples/spineboy/export/spineboy-pro.skel",
    },
    {
      alias: "spineboyAtlas",
      src: "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/examples/spineboy/export/spineboy-pma.atlas",
    },
    {
      alias: "goblinsSkeleton",
      src: "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/examples/goblins/export/goblins-pro.skel",
    },
    {
      alias: "goblinsAtlas",
      src: "https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/examples/goblins/export/goblins-pma.atlas",
    },
  ]).then(() => {
    reactRoot.render(<App />);
  });
});
