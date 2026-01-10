import { useRef, useEffect } from "react";

export default function ChatBox({
  chatMessages,
  message,
  setMessage,
  sendMessage,
  isDrawer,
}) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-purple-500 p-4">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-white font-black text-lg mb-3">
        <span>💬</span>
        <span>CHAT</span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-2 text-white text-sm">
        {chatMessages.length === 0 && (
          <div className="text-white/50 text-center mt-4">
            No messages yet 💭
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className="text-white text-sm">
            <span className="font-bold">
              {msg.senderName || msg.name || "System"}:
            </span>{" "}
            {msg.message}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="mt-3 flex gap-2">
        <input
          disabled={isDrawer}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={isDrawer ? "Drawer can't guess" : "Type your guess..."}
          className="flex-1 px-3 py-2 rounded-lg bg-white text-black outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={isDrawer}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white font-black disabled:opacity-50"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
