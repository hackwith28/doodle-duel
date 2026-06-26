import { useRef, useEffect } from "react";

export default function ChatBox({ chatMessages, message, setMessage, sendMessage, isDrawer }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(12,12,24,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-base">💬</span>
        <span className="text-white font-black text-sm uppercase tracking-wider">
          {isDrawer ? "Chat" : "Guesses"}
        </span>
        {isDrawer && (
          <span
            className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
          >
            ✏️ Drawing
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="text-3xl opacity-30">💭</span>
            <p className="text-slate-700 text-xs font-semibold">No messages yet</p>
          </div>
        )}

        {chatMessages.map((msg, i) => {
          if (msg.isSystem) {
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold animate-pop-in"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}
              >
                <span>🎉</span>
                <span>{msg.message}</span>
              </div>
            );
          }

          return (
            <div key={i} className="text-xs animate-slide-in-up" style={{ animationDelay: "0s" }}>
              <span className="font-black" style={{ color: "#c084fc" }}>
                {msg.senderName || msg.name || "?"}
              </span>
              <span className="text-slate-500 mx-1">›</span>
              <span className="text-slate-300 font-semibold">{msg.message}</span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 flex gap-2 px-3 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <input
          disabled={isDrawer}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={isDrawer ? "You're drawing..." : "Type your guess..."}
          className="flex-1 px-3 py-2 rounded-xl text-white text-xs font-semibold outline-none transition-all duration-200 bg-white/6 border border-white/10 focus:border-fuchsia-400/50 placeholder:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={isDrawer}
          className="px-3 py-2 rounded-xl font-black text-white text-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 12px rgba(168,85,247,0.3)" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
