import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

export default function CanvasBoard({ player, isDrawer, clearKey }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxStack = 12;

  function handleMouseUp() {
    if (!isDrawer) return;
    setIsDrawing(false);
    emitCanvasState();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;

    socket.on("draw", (data) => {
      if (data.senderId === socket.id) return;

      const ctx = ctxRef.current;

      if (data.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = data.penSize * 2;
        ctx.strokeStyle = "rgba(255,255,255,1.0)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.penSize;
      }

      if (!data.drawing) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    });

    socket.on("fill", ({ x, y, color: fillColor }) => {
      const canvas = canvasRef.current;
      floodFill(canvas, x, y, fillColor);
    });

    socket.on("canvas_state", (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    });

    return () => {
      socket.off("draw");
      socket.off("fill");
      socket.off("canvas_state");
    };
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  // clear board when a new round/turn starts (clearKey changes)
  const lastClearKey = useRef(null);

  useEffect(() => {
    if (!clearKey || clearKey === lastClearKey.current) return;

    lastClearKey.current = clearKey;
    pushUndo();
    clearBoard();
  }, [clearKey]);

  function pushUndo() {
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      undoStack.current.push(dataUrl);
      if (undoStack.current.length > maxStack) undoStack.current.shift();
      // clear redo stack
      redoStack.current = [];
    } catch (e) {
      console.warn("undo push failed", e);
    }
  }

  function undo() {
    if (!isDrawer) return;
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const last = undoStack.current.pop();
    // push current to redo
    try {
      redoStack.current.push(canvas.toDataURL());
    } catch (e) {}
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // broadcast state
      emitCanvasState();
    };
    img.src = last;
  }

  function redo() {
    if (!isDrawer) return;
    if (redoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const next = redoStack.current.pop();
    try {
      undoStack.current.push(canvas.toDataURL());
    } catch (e) {}
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      emitCanvasState();
    };
    img.src = next;
  }

  function emitCanvasState() {
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL();
      socket.emit("canvas_state", { roomId: player.roomId, dataUrl });
    } catch (e) {}
  }

  function drawLocal(
    x,
    y,
    dragging,
    drawColor = color,
    drawBrush = brushSize,
    drawTool = tool
  ) {
    const ctx = ctxRef.current;

    if (drawTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = drawBrush * 2;
      ctx.strokeStyle = "rgba(255,255,255,1.0)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawBrush;
    }

    if (!dragging) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function handleMouse(e, isDown) {
    if (!isDrawer) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (!isDown) {
      setIsDrawing(false);
      return;
    }

    if (!isDrawing) {
      pushUndo(); // save state only at stroke start
    }
    setIsDrawing(true); // only once per stroke

    // if (!isDown) return;

    // push undo snapshot at start of an action
    // pushUndo();

    if (tool === "fill") {
      // perform fill locally then broadcast
      const canvas = canvasRef.current;
      floodFill(canvas, x, y, color);
      emitCanvasState();
      socket.emit("fill", { roomId: player.roomId, x, y, color });
      return;
    }

    if (tool === "eraser") {
      // draw a white stroke (eraser)
      drawLocal(x, y, false, color, brushSize, "eraser");

      socket.emit("draw", {
        roomId: player.roomId,
        x,
        y,
        drawing: false,
        color,
        penSize: brushSize,
        tool,
        senderId: socket.id,
      });

      return;
    }

    // pencil/pen
    const useBrush = tool === "pen" ? Math.max(brushSize, 8) : brushSize;
    drawLocal(x, y, false, color, useBrush);

    socket.emit("draw", {
      roomId: player.roomId,
      x,
      y,
      drawing: false, // or false on mouseDown
      color,
      penSize: brushSize,
      tool,
      senderId: socket.id,
    });
  }

  function handleMove(e) {
    if (!isDrawer || !isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    drawLocal(x, y, true, color, brushSize, tool);

    socket.emit("draw", {
      roomId: player.roomId,
      x,
      y,
      drawing: true,
      color,
      penSize: brushSize,
      tool,
      senderId: socket.id,
    });
  }

  function clearBoard() {
    if (!isDrawer) return;
    pushUndo();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    emitCanvasState();
  }

  // simple flood fill implementation
  function floodFill(canvas, startX, startY, fillColor) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;

    function colorToRGBA(hex) {
      const hexc = hex.replace("#", "");
      const bigint = parseInt(hexc, 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
    }

    const targetPos = (startY * w + startX) * 4;
    const targetColor = [
      data[targetPos],
      data[targetPos + 1],
      data[targetPos + 2],
      data[targetPos + 3],
    ];
    const newColor = colorToRGBA(fillColor);

    // if target color equals new color, nothing to do
    if (
      targetColor[0] === newColor[0] &&
      targetColor[1] === newColor[1] &&
      targetColor[2] === newColor[2]
    )
      return;

    const stack = [[startX, startY]];
    while (stack.length) {
      const [x, y] = stack.pop();
      let nx = x;
      let ny = y;
      // move to top-left of area
      while (ny >= 0) {
        const pos = (ny * w + nx) * 4;
        if (
          data[pos] === targetColor[0] &&
          data[pos + 1] === targetColor[1] &&
          data[pos + 2] === targetColor[2]
        )
          ny--;
        else break;
      }
      ny++;
      let reachLeft = false;
      let reachRight = false;
      for (let i = ny; i < h; i++) {
        const pos = (i * w + nx) * 4;
        if (
          !(
            data[pos] === targetColor[0] &&
            data[pos + 1] === targetColor[1] &&
            data[pos + 2] === targetColor[2]
          )
        )
          break;
        // color pixel
        data[pos] = newColor[0];
        data[pos + 1] = newColor[1];
        data[pos + 2] = newColor[2];
        data[pos + 3] = newColor[3];

        if (nx > 0) {
          const leftPos = (i * w + (nx - 1)) * 4;
          if (
            data[leftPos] === targetColor[0] &&
            data[leftPos + 1] === targetColor[1] &&
            data[leftPos + 2] === targetColor[2]
          ) {
            if (!reachLeft) {
              stack.push([nx - 1, i]);
              reachLeft = true;
            }
          } else reachLeft = false;
        }
        if (nx < w - 1) {
          const rightPos = (i * w + (nx + 1)) * 4;
          if (
            data[rightPos] === targetColor[0] &&
            data[rightPos + 1] === targetColor[1] &&
            data[rightPos + 2] === targetColor[2]
          ) {
            if (!reachRight) {
              stack.push([nx + 1, i]);
              reachRight = true;
            }
          } else reachRight = false;
        }
      }
    }

    ctx.putImageData(img, 0, 0);
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border-4 border-purple-600 shadow-2xl">
      {/* Toolbar */}

      {isDrawer && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 border-3 border-purple-500 rounded-2xl p-2 sm:p-4 shadow-lg">
          {/* Tool buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4 justify-center">
            {[
              { id: "pencil", label: "✏️ Pencil" },
              { id: "pen",    label: "🖊️ Pen" },
              { id: "eraser", label: "🗑️ Eraser" },
              { id: "fill",   label: "🪣 Fill" },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-bold border-2 text-xs sm:text-sm transition-all duration-200 transform hover:scale-105 ${
                  tool === id
                    ? "bg-yellow-400 border-yellow-500 text-purple-900 shadow-lg"
                    : "bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                }`}
                onClick={() => setTool(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Color + Size */}
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-white font-bold text-xs sm:text-sm">🎨 Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl border-2 border-yellow-400 cursor-pointer shadow-lg"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-3 bg-slate-700 px-2 sm:px-4 py-1 sm:py-2 rounded-xl border-2 border-slate-600">
              <label className="text-white font-bold text-xs sm:text-sm">📋 Size:</label>
              <input
                type="range"
                min="1"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 sm:w-24 h-2 sm:h-3 bg-slate-600 rounded-full appearance-none cursor-pointer accent-yellow-400"
              />
              <span className="text-white font-bold text-xs sm:text-sm bg-yellow-400 text-purple-900 px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg">
                {brushSize}
              </span>
            </div>
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex gap-1 sm:gap-2 justify-center mt-2 sm:mt-4 flex-wrap">
            <button
              onClick={undo}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1 sm:py-2 px-2 sm:px-4 rounded-xl font-bold border-2 border-blue-400 text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-1 sm:py-2 px-2 sm:px-4 rounded-xl font-bold border-2 border-green-400 text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ↷ Redo
            </button>
            <button
              onClick={clearBoard}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1 sm:py-2 px-2 sm:px-4 rounded-xl font-bold border-2 border-red-400 text-xs sm:text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full border-4 border-purple-500 rounded-2xl shadow-2xl cursor-crosshair bg-white"
        onMouseDown={(e) => handleMouse(e, true)}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={handleMove}
      />
    </div>
  );
}
