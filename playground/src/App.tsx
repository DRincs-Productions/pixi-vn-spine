import { canvas, Game, narration } from "@drincs/pixi-vn";
import { useEffect, useState } from "react";
import { baseLabel, motionLabel, sequenceLabel } from "./labels";

const LABELS = [baseLabel, motionLabel, sequenceLabel];

export default function App() {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Game.onEnd(() => {
      canvas.clear();
      setRunning(false);
    });
  }, []);

  async function selectLabel(label: (typeof LABELS)[number]) {
    setRunning(true);
    await Game.start(label, {});
  }

  if (running) {
    return (
      <div>
        <button
          style={{ pointerEvents: "auto" }}
          onClick={() => narration.continue({})}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div>
      {LABELS.map((label) => (
        <button
          style={{ pointerEvents: "auto" }}
          key={label.id}
          onClick={() => selectLabel(label)}
        >
          {label.id}
        </button>
      ))}
    </div>
  );
}
