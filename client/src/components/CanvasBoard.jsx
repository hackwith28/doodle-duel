import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6",
  "#a855f7", "#ec4899", "#78716c", "#94a3b8",
];

const TOOLS = [
  { id: "pencil", icon: "✏️", label: "Pencil" },
  { id: "pen",    icon: "🖊️", label: "Pen"    },
  { id: "eraser", icon: "⬜", label: "Eraser" },
  { id: "fill",   icon: "🪣", label: "Fill"   },
];

export default function CanvasBoard({ player, isDrawer, clearKey }) {
  const canvasRef = useRef(null);
  const ctxRef    = useRef(null);

  const [color, setColor]       = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool]           = useState("pencil");

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxStack  = 12;

  function handleMouseUp() {
    if (!isDrawer) return;
    setIsDrawing(false);
    emitCanvasState();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = 1000;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    ctx.lineCap    = "round";
    ctx.lineJoin   = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth   = brushSize;
    ctx.fillStyle   = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;

    socket.on("draw", (data) => {
      if (data.senderId === socket.id) return;
      const c = ctxRef.current;
      if (data.tool === "eraser") {
        c.globalCompositeOperation = "destination-out";
        c.lineWidth    = data.penSize * 2;
        c.strokeStyle  = "rgba(255,255,255,1.0)";
      } else {
        c.globalCompositeOperation = "source-over";
        c.strokeStyle = data.color;
        c.lineWidth   = data.penSize;
      }
      if (!data.drawing) { c.beginPath(); c.moveTo(data.x, data.y); }
      else { c.lineTo(data.x, data.y); c.stroke(); }
    });

    socket.on("fill", ({ x, y, color: fillColor }) => {
      floodFill(canvasRef.current, x, y, fillColor);
    });

    socket.on("canvas_state", (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        const c = ctxRef.current;
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    });

    return () => { socket.off("draw"); socket.off("fill"); socket.off("canvas_state"); };
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth   = brushSize;
    }
  }, [color, brushSize]);

  const lastClearKey = useRef(null);
  useEffect(() => {
    if (!clearKey || clearKey === lastClearKey.current) return;
    lastClearKey.current = clearKey;
    pushUndo();
    clearBoard();
  }, [clearKey]);

  function pushUndo() {
    try {
      const dataUrl = canvasRef.current.toDataURL();
      undoStack.current.push(dataUrl);
      if (undoStack.current.length > maxStack) undoStack.current.shift();
      redoStack.current = [];
    } catch (e) {}
  }

  function undo() {
    if (!isDrawer || undoStack.current.length === 0) return;
    const last = undoStack.current.pop();
    try { redoStack.current.push(canvasRef.current.toDataURL()); } catch (e) {}
    const img = new Image();
    img.onload = () => {
      const c = ctxRef.current;
      c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      c.drawImage(img, 0, 0);
      emitCanvasState();
    };
    img.src = last;
  }

  function redo() {
    if (!isDrawer || redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    try { undoStack.current.push(canvasRef.current.toDataURL()); } catch (e) {}
    const img = new Image();
    img.onload = () => {
      const c = ctxRef.current;
      c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      c.drawImage(img, 0, 0);
      emitCanvasState();
    };
    img.src = next;
  }

  function emitCanvasState() {
    try {
      socket.emit("canvas_state", { roomId: player.roomId, dataUrl: canvasRef.current.toDataURL() });
    } catch (e) {}
  }

  function drawLocal(x, y, dragging, dc = color, db = brushSize, dt = tool) {
    const c = ctxRef.current;
    if (dt === "eraser") {
      c.globalCompositeOperation = "destination-out";
      c.lineWidth   = db * 2;
      c.strokeStyle = "rgba(255,255,255,1.0)";
    } else {
      c.globalCompositeOperation = "source-over";
      c.strokeStyle = dc;
      c.lineWidth   = db;
    }
    if (!dragging) { c.beginPath(); c.moveTo(x, y); }
    else { c.lineTo(x, y); c.stroke(); }
  }

  function getCoords(e) {
    const rect   = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width  / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top)  * scaleY),
    };
  }

  function handleMouse(e, isDown) {
    if (!isDrawer) return;
    if (!isDown) { setIsDrawing(false); return; }
    if (!isDrawing) pushUndo();
    setIsDrawing(true);

    const { x, y } = getCoords(e);

    if (tool === "fill") {
      floodFill(canvasRef.current, x, y, color);
      emitCanvasState();
      socket.emit("fill", { roomId: player.roomId, x, y, color });
      return;
    }

    const useBrush = tool === "pen" ? Math.max(brushSize, 8) : brushSize;
    drawLocal(x, y, false, color, useBrush, tool === "eraser" ? "eraser" : tool);
    socket.emit("draw", { roomId: player.roomId, x, y, drawing: false, color, penSize: brushSize, tool, senderId: socket.id });
  }

  function handleMove(e) {
    if (!isDrawer || !isDrawing) return;
    const { x, y } = getCoords(e);
    drawLocal(x, y, true, color, brushSize, tool);
    socket.emit("draw", { roomId: player.roomId, x, y, drawing: true, color, penSize: brushSize, tool, senderId: socket.id });
  }

  function clearBoard() {
    if (!isDrawer) return;
    pushUndo();
    const c = ctxRef.current;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    emitCanvasState();
  }

  function floodFill(canvas, startX, startY, fillColor) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;

    const hexToRgba = (hex) => {
      const h = hex.replace("#", "");
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
    };

    const tp = (startY * w + startX) * 4;
    const tc = [data[tp], data[tp+1], data[tp+2], data[tp+3]];
    const nc = hexToRgba(fillColor);
    if (tc[0]===nc[0] && tc[1]===nc[1] && tc[2]===nc[2]) return;

    const stack = [[startX, startY]];
    while (stack.length) {
      const [x, y] = stack.pop();
      let nx = x, ny = y;
      while (ny >= 0) {
        const p = (ny * w + nx) * 4;
        if (data[p]===tc[0] && data[p+1]===tc[1] && data[p+2]===tc[2]) ny--; else break;
      }
      ny++;
      let rl = false, rr = false;
      for (let i = ny; i < h; i++) {
        const p = (i * w + nx) * 4;
        if (!(data[p]===tc[0] && data[p+1]===tc[1] && data[p+2]===tc[2])) break;
        data[p]=nc[0]; data[p+1]=nc[1]; data[p+2]=nc[2]; data[p+3]=nc[3];
        if (nx > 0) {
          const lp = (i * w + nx - 1) * 4;
          if (data[lp]===tc[0] && data[lp+1]===tc[1] && data[lp+2]===tc[2]) { if (!rl) { stack.push([nx-1,i]); rl=true; } } else rl=false;
        }
        if (nx < w-1) {
          const rp = (i * w + nx + 1) * 4;
          if (data[rp]===tc[0] && data[rp+1]===tc[1] && data[rp+2]===tc[2]) { if (!rr) { stack.push([nx+1,i]); rr=true; } } else rr=false;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  return (
    <div
      className="flex flex-col gap-3 h-full"
      style={{
        background: "rgba(12,12,24,0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "12px",
      }}
    >
      {/* TOOLBAR — only for drawer */}
      {isDrawer && (
        <div
          className="shrink-0 flex flex-wrap gap-2 items-center rounded-xl px-3 py-2.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Tools */}
          <div className="flex gap-1 shrink-0">
            {TOOLS.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                title={label}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base transition-all duration-150 hover:scale-110 active:scale-95"
                style={
                  tool === id
                    ? { background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 4px 12px rgba(168,85,247,0.4)" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          {/* Color presets */}
          <div className="flex flex-wrap gap-1 shrink-0">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="rounded-lg transition-all duration-150 hover:scale-110 active:scale-95"
                style={{
                  width: 20, height: 20,
                  background: c,
                  border: color === c ? "2px solid #e879f9" : "1.5px solid rgba(255,255,255,0.2)",
                  boxShadow: color === c ? "0 0 8px rgba(232,121,249,0.6)" : "none",
                }}
              />
            ))}
          </div>

          {/* Custom color picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-xs font-bold text-slate-500 hidden sm:block">Custom</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer"
              style={{ border: "1.5px solid rgba(255,255,255,0.2)", padding: "1px" }}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          {/* Brush size */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-slate-500 hidden sm:block">Size</label>
            <input
              type="range" min="1" max="30" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 sm:w-20 h-1.5 rounded-full cursor-pointer accent-fuchsia-400"
            />
            <span
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black"
              style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}
            >
              {brushSize}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden sm:block" />

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            {[
              { label: "↶", title: "Undo", action: undo, color: "#3b82f6" },
              { label: "↷", title: "Redo", action: redo, color: "#10b981" },
              { label: "🗑", title: "Clear", action: clearBoard, color: "#ef4444" },
            ].map(({ label, title, action, color: btnColor }) => (
              <button
                key={title}
                onClick={action}
                title={title}
                className="px-2.5 py-1.5 rounded-lg text-xs font-black text-white transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ background: `${btnColor}22`, border: `1px solid ${btnColor}44`, color: btnColor }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden" style={{ boxShadow: "0 0 0 2px rgba(168,85,247,0.25), 0 8px 32px rgba(0,0,0,0.5)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white"
          style={{ cursor: isDrawer ? (tool === "fill" ? "crosshair" : "crosshair") : "default", display: "block" }}
          onMouseDown={(e) => handleMouse(e, true)}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={handleMove}
        />
      </div>
    </div>
  );
}
