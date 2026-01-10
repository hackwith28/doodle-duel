import { useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import { playOne, unlock as unlockAudio } from "./PlaySound";

export default function App() {
  const [player, setPlayer] = useState(null);
  const [stage, setStage] = useState("home");
  // stages = "home" | "lobby" | "game"

  // When user joins, go to lobby
  function handleJoin(p) {
    console.log("Player joined:", p);
    setPlayer(p);
    setStage("lobby");
  }
  unlockAudio();

  if (stage === "home") {
    return <Home setPlayer={handleJoin} />;
  }

  if (stage === "lobby") {
    return <Lobby player={player} setStage={setStage} />;
  }

  if (stage === "game") {
    return <Game player={player} />;
  }

  return null;
}
