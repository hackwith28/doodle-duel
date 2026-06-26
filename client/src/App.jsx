import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Login from "./pages/Login";
import { connectSocket, disconnectSocket, socket } from "./socket";
import { playOne, unlock as unlockAudio } from "./PlaySound";

export default function App() {
  const [auth, setAuth] = useState(null); // { username, token }
  const [player, setPlayer] = useState(null);
  const [stage, setStage] = useState("home");

  // Restore auth and room state from localStorage on mount (handles page refresh)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setAuth({ token, username });
      connectSocket();

      const savedPlayer = localStorage.getItem("player");
      const savedTimestamp = localStorage.getItem("playerTimestamp");
      const ONE_MINUTE = 60 * 1000;

      if (savedPlayer && savedTimestamp) {
        const elapsed = Date.now() - parseInt(savedTimestamp, 10);
        if (elapsed < ONE_MINUTE) {
          try {
            const p = JSON.parse(savedPlayer);
            setPlayer(p);
            setStage("lobby");
          } catch {}
        } else {
          // Session expired — clear old room data, go to home
          localStorage.removeItem("player");
          localStorage.removeItem("playerTimestamp");
        }
      }
    }
  }, []);

  // Keep the session timestamp fresh every 30s while in lobby/game
  useEffect(() => {
    if (stage === "lobby" || stage === "game") {
      const interval = setInterval(() => {
        localStorage.setItem("playerTimestamp", Date.now().toString());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  function handleAuth(authData) {
    setAuth(authData);
    connectSocket();
  }

  function handleLogout() {
    const cleanup = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("player");
      localStorage.removeItem("playerTimestamp");
      disconnectSocket();
      setAuth(null);
      setPlayer(null);
      setStage("home");
    };

    if (player?.roomId) {
      // Wait for server ack before disconnecting so the event isn't dropped
      const timeout = setTimeout(cleanup, 1500); // fallback if server is slow
      socket.emit("leave_room", { roomId: player.roomId }, () => {
        clearTimeout(timeout);
        cleanup();
      });
    } else {
      cleanup();
    }
  }

  function handleLeaveRoom() {
    // Socket stays connected (user stays logged in) — ack is instant
    const finish = () => {
      localStorage.removeItem("player");
      localStorage.removeItem("playerTimestamp");
      setPlayer(null);
      setStage("home");
    };

    if (player?.roomId) {
      const timeout = setTimeout(finish, 1500);
      socket.emit("leave_room", { roomId: player.roomId }, () => {
        clearTimeout(timeout);
        finish();
      });
    } else {
      finish();
    }
  }

  function handleJoin(p) {
    setPlayer(p);
    setStage("lobby");
  }

  unlockAudio();

  if (!auth) {
    return <Login onAuth={handleAuth} />;
  }

  if (stage === "home") {
    return <Home setPlayer={handleJoin} username={auth.username} onLogout={handleLogout} />;
  }

  if (stage === "lobby") {
    return <Lobby player={player} setStage={setStage} onLeaveRoom={handleLeaveRoom} />;
  }

  if (stage === "game") {
    return <Game player={player} onLeaveRoom={handleLeaveRoom} />;
  }

  return null;
}
