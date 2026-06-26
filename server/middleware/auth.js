import jwt from "jsonwebtoken";

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
