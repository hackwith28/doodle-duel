import { useState, useEffect, useMemo } from "react";
import { socket } from "../socket";
import CanvasBoard from "../components/CanvasBoard";
import Leaderboard from "../components/Leaderboard";
import TopBar from "../components/TopBar";
import RoundReady from "../components/RoundReady";
import PlayerList from "../components/PlayerList";
import ChatBox from "../components/ChatBox";

export default function Game({ player: propPlayer, onLeaveRoom }) {
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

  const isDrawer = useMemo(() => socket.id === currentDrawerId, [currentDrawerId]);

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

  const formatHint = (hint = "") => hint.split("").join(" ");

  function handleTurnStart({ drawer, hint }) {
    try {
      setCurrentDrawerId(drawer);
      setDrawerWord(formatHint(hint || ""));
      setIsRoundReady(true);
      setMarkedRoundReady(false);
    } catch (e) {
      console.error("Error in handleTurnStart:", e);
    }
  }

  if (!player?.roomId) {
    return (
      <div className="w-screen h-screen bg-[#0a0a14] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-black mb-2 font-fredoka">Game Error</h2>
          <p className="text-slate-400 mb-5">Player data is missing. Please return to home.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const restore = () => {
      socket.emit("request_room_state", { roomId: player.roomId }, (payload) => {
        if (!payload) return;
        setPlayers(payload.players || []);
        setRoundReadyCount(payload.readyCount || 0);
        setReadyIds(payload.readyIds || []);
        setMarkedRoundReady(!!(payload.readyIds && payload.readyIds.includes(socket.id)));
        setIsRoundReady(!!payload.turnActive);
        setCurrentDrawerId(payload.drawer ?? null);
        if (payload.hint?.text) setDrawerWord(formatHint(payload.hint.text));
        setTimeLeft(payload.timeLeft ?? payload.roundTime ?? 60);
        setLeaderboard(payload.scores || {});
        if (payload.word && payload.drawer === socket.id) setFullWord(payload.word);
      });
    };

    if (socket.connected) restore();
    else socket.once("connect", restore);

    return () => socket.off("connect", restore);
  }, [player.roomId]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayersUpdate = (updatedPlayers) => setPlayers(updatedPlayers || []);
    const handleTimerUpdate = (time) => { try { setTimeLeft(time); } catch (e) {} };
    const handleChatMessage = (data) => setChatMessages((prev) => [...prev, data]);
    const handleRoundStart = () => { setIsRoundReady(false); setMarkedRoundReady(false); };
    const handleRoundReadyUpdate = ({ readyCount, readyIds }) => {
      setRoundReadyCount(readyCount || 0);
      setReadyIds(readyIds || []);
      setMarkedRoundReady(!!(readyIds && readyIds.includes(socket.id)));
    };
    const handleCorrectGuess = (data) => {
      setChatMessages((prev) => [...prev, {
        senderName: "System",
        message: `${data.name} guessed it! +10 points 🎉`,
        isSystem: true,
        timestamp: Date.now(),
      }]);
      setLeaderboard(data.scores || {});
    };
    const handleDrawerWord = (word) => { setFullWord(word || ""); setDrawerWord(word || ""); };

    const handleGameStarted = () => {
      socket.emit("request_room_state", { roomId: player.roomId }, (payload) => {
        if (!payload) return;
        setPlayers(payload.players || []);
        setRoundReadyCount(payload.readyCount || 0);
        setReadyIds(payload.readyIds || []);
        setMarkedRoundReady(!!(payload.readyIds && payload.readyIds.includes(socket.id)));
        setIsRoundReady(!!payload.turnActive);
        setCurrentDrawerId(payload.drawer ?? null);
        if (payload.hint?.text) setDrawerWord(payload.hint.text);
        setTimeLeft(payload.timeLeft ?? payload.roundTime ?? 60);
        setLeaderboard(payload.scores || {});
        if (payload.word && payload.drawer === socket.id) setFullWord(payload.word);
      });
    };

    socket.on("players_update", handlePlayersUpdate);
    socket.on("turn_start", handleTurnStart);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("round_start", handleRoundStart);
    socket.on("round_ready_update", handleRoundReadyUpdate);
    socket.on("drawer_word", handleDrawerWord);
    socket.on("chat_message", handleChatMessage);
    socket.on("correct_guess", handleCorrectGuess);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("turn_start", handleTurnStart);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("round_start", handleRoundStart);
      socket.off("round_ready_update", handleRoundReadyUpdate);
      socket.off("drawer_word", handleDrawerWord);
      socket.off("chat_message", handleChatMessage);
      socket.off("correct_guess", handleCorrectGuess);
      socket.off("game_started", handleGameStarted);
    };
  }, [player.roomId]);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#0a0a14]">
      {/* Ambient glows — fixed, behind everything */}
      <div className="fixed pointer-events-none" style={{ top: "-60px", left: "-60px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-60px", right: "-60px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />

      <div className="relative z-10 flex flex-col h-full">
        {/* TOP BAR */}
        <div className="shrink-0 px-3 pt-3 pb-1">
          <TopBar
            player={player}
            isDrawer={isDrawer}
            timeLeft={timeLeft}
            drawerWord={drawerWord}
            fullWord={fullWord}
            onLeaveRoom={onLeaveRoom}
          />
        </div>

        {/* MAIN CONTENT */}
        {!isRoundReady ? (
          <div className="flex-1 flex items-center justify-center px-3 pb-3">
            <RoundReady
              players={players}
              readyIds={readyIds}
              roundReadyCount={roundReadyCount}
              markedRoundReady={markedRoundReady}
              markRoundReady={markRoundReady}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 pb-3 min-h-0">
            {/* LEFT PANEL */}
            <div className="order-last lg:order-first lg:w-52 shrink-0 flex flex-row lg:flex-col gap-3">
              <div className="flex-1 lg:flex-none min-h-0">
                <PlayerList players={players} currentDrawerId={currentDrawerId} />
              </div>
              <div className="flex-1 lg:flex-none min-h-0">
                <Leaderboard players={players} />
              </div>
            </div>

            {/* CENTER CANVAS */}
            <div className="flex-1 min-w-0 order-first lg:order-0 min-h-0 flex flex-col">
              <CanvasBoard player={player} isDrawer={isDrawer} clearKey={currentDrawerId} />
            </div>

            {/* RIGHT CHAT */}
            <div className="shrink-0 h-56 sm:h-64 lg:h-auto order-2 lg:order-last min-h-0 lg:w-72">
              <ChatBox chatMessages={chatMessages} message={message} setMessage={setMessage} sendMessage={sendMessage} isDrawer={isDrawer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
