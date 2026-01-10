import { useState, useEffect, useMemo } from "react";

// Mock socket for demonstration - replace with your actual socket import
import { socket } from "../socket";
import CanvasBoard from "../components/CanvasBoard";
import Leaderboard from "../components/Leaderboard";
import TopBar from "../components/TopBar";
import RoundReady from "../components/RoundReady";
import PlayerList from "../components/PlayerList";
import ChatBox from "../components/ChatBox";
// Mock Leaderboard component

export default function Game({ player: propPlayer }) {
  const [players, setPlayers] = useState([]);
  const [currentDrawerId, setCurrentDrawerId] = useState(null);
  const [drawerWord, setDrawerWord] = useState("");
  const [fullWord, setFullWord] = useState("");
  const [isRoundReady, setIsRoundReady] = useState(false);
  const [roundReadyCount, setRoundReadyCount] = useState(0);
  const [readyIds, setReadyIds] = useState([]);
  const [markedRoundReady, setMarkedRoundReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [leaderboard, setLeaderboard] = useState({});
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const isDrawer = useMemo(
    () => socket.id === currentDrawerId,
    [currentDrawerId]
  );

  const getPlayer = () => {
    if (propPlayer) return propPlayer;
    try {
      const stored = localStorage.getItem("player");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const player = useMemo(() => getPlayer(), []);

  const markRoundReady = () => {
    if (!markedRoundReady) {
      socket.emit("round_ready", { roomId: player.roomId });
      setMarkedRoundReady(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat_message", {
        roomId: player.roomId,
        name: player.name,
        message: message.trim(),
      });
      setMessage("");
    }
  };

  const formatHint = (hint = "") => {
    // Split every character and join with space
    return hint.split("").join(" ");
  };

  // keep audio helper in sync with state

  function handleTurnStart({ drawer, drawerName, hint }) {
    try {
      setCurrentDrawerId(drawer);
      // setCurrentDrawerName(drawerName || "");
      setDrawerWord(formatHint(hint || ""));

      setIsRoundReady(true);
      setMarkedRoundReady(false);

      // Clear canvas for new turn
    } catch (e) {
      console.error("Error in handleTurnStart:", e);
    }
  }

  // Validate player data
  if (!player?.roomId) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-hidden flex flex-col">
        <div>
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-4xl font-black mb-2">Game Error</h2>
          <p className="text-xl mb-4">
            Player data is missing. Please return to home and join a room.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-white text-red-600 font-black px-6 py-3 rounded-lg inline-block hover:bg-gray-100 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  // Socket event handlers with proper dependency
  useEffect(() => {
    if (!socket) return;

    const handlePlayersUpdate = (updatedPlayers) => {
      setPlayers(updatedPlayers || []);
    };

    const handleTimerUpdate = (time) => {
      try {
        setTimeLeft(time);
      } catch (e) {
        console.error("Error in handleTimerUpdate:", e);
      }
    };

    const handleChatMessage = (data) => {
      setChatMessages((prev) => [...prev, data]);
    };

    const handleRoundStart = () => {
      setIsRoundReady(false);
      setMarkedRoundReady(false);
    };

    const handleRoundReadyUpdate = ({ readyCount, total, readyIds }) => {
      setRoundReadyCount(readyCount || 0);
      setReadyIds(readyIds || []);
      setMarkedRoundReady(!!(readyIds && readyIds.includes(socket.id)));
    };

    const handleCorrectGuess = (data) => {
      setChatMessages((prev) => [
        ...prev,
        {
          senderName: "System",
          message: `${data.name} guessed correctly! +10 points`,
          isSystem: true,
          timestamp: Date.now(),
        },
      ]);
      setLeaderboard(data.scores || {});
    };
    // Play the correct-guess sound (if not muted)

    const handleDrawerWord = (word) => {
      setFullWord(word || "");
      setDrawerWord(word || "");
    };

    // Register all socket listeners
    socket.on("players_update", handlePlayersUpdate);
    socket.on("turn_start", handleTurnStart);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("round_start", handleRoundStart);
    socket.on("round_ready_update", handleRoundReadyUpdate);
    socket.on("drawer_word", handleDrawerWord);
    // socket.on("new_message", handleNewMessage);
    socket.on("chat_message", handleChatMessage);

    socket.on("correct_guess", handleCorrectGuess);
    socket.on("game_started", () => {
      console.log("[client] game_started received, requesting room state");
      socket.emit(
        "request_room_state",
        { roomId: player.roomId },
        (payload) => {
          console.log("[client] request_room_state payload:", payload);
          if (!payload) return;
          setPlayers(payload.players || []);
          setRoundReadyCount(payload.readyCount || 0);
          setReadyIds(payload.readyIds || []);
          setMarkedRoundReady(
            !!(payload.readyIds && payload.readyIds.includes(socket.id))
          );
          setIsRoundReady(!!payload.turnActive);
          setCurrentDrawerId(payload.drawer ?? null);
          // setCurrentDrawerName(payload.drawerName ?? "");
          if (payload.hint && payload.hint.text)
            setDrawerWord(payload.hint.text);
          setTimeLeft(payload.timeLeft ?? payload.roundTime ?? 60);
          setLeaderboard(payload.scores || {});
          if (payload.word && payload.drawer === socket.id) {
            setFullWord(payload.word);
          }
        }
      );
    });

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("turn_start", handleTurnStart);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("round_start", handleRoundStart);
      socket.off("round_ready_update", handleRoundReadyUpdate);
      socket.off("drawer_word", handleDrawerWord);
      socket.off("chat_message", handleChatMessage);
      socket.off("correct_guess", handleCorrectGuess);
      socket.off("game_started");
    };
  }, [player.roomId]);
  // Added dependency

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 overflow-y-auto">
      {/* TOP BAR */}
      <TopBar
        player={player}
        isDrawer={isDrawer}
        timeLeft={timeLeft}
        drawerWord={drawerWord}
        fullWord={fullWord}
      />

      {/* ROUND READY */}
      {!isRoundReady ? (
        <RoundReady
          players={players}
          readyIds={readyIds}
          roundReadyCount={roundReadyCount}
          markedRoundReady={markedRoundReady}
          markRoundReady={markRoundReady}
        />
      ) : (
        <div className="flex px-6 gap-6 pt-4">
          {/* LEFT PANEL */}
          <div className="w-[260px] flex-shrink-0 space-y-6">
            <PlayerList players={players} currentDrawerId={currentDrawerId} />
            <Leaderboard players={players} />
          </div>

          {/* CENTER CANVAS */}
          <div className="flex-1 flex justify-center">
            <CanvasBoard
              player={player}
              isDrawer={isDrawer}
              clearKey={currentDrawerId}
            />
          </div>

          {/* RIGHT CHAT */}
          <div className="w-[320px] flex-shrink-0">
            <ChatBox
              chatMessages={chatMessages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              isDrawer={isDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
