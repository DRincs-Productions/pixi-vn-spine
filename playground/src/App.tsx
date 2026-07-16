import { canvas, Game, narration, stepHistory } from "@drincs/pixi-vn";
import { useEffect, useState } from "react";
import { baseLabel, motionLabel, sequenceLabel, setSkinLabel } from "./labels";

const LABELS = [baseLabel, motionLabel, sequenceLabel, setSkinLabel];

export default function App() {
  const [running, setRunning] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    Game.onEnd(() => {
      canvas.clear();
      setRunning(false);
    });
  }, []);

  async function selectLabel(label: (typeof LABELS)[number]) {
    setRunning(true);
    await Game.start(label, {});
    forceUpdate((n) => n + 1);
  }

  async function handleContinue() {
    await narration.continue({});
    forceUpdate((n) => n + 1);
  }

  async function handleBack() {
    await stepHistory.back({});
    forceUpdate((n) => n + 1);
  }

  if (running) {
    return (
      <div>
        <button style={{ pointerEvents: "auto" }} onClick={handleContinue}>
          Continue
        </button>
        <button
          style={{ pointerEvents: "auto" }}
          onClick={handleBack}
          disabled={!stepHistory.canGoBack}
        >
          Back
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
