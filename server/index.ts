import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import next, { NextApiHandler } from "next";
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();
nextApp.prepare().then(async () => {
  const app = express();
  const server = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);
  app.get("/health", async (_, res) => {
    res.send("Healthy");
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("draw", (moves, options) => {
      console.log("drawing");
      // gửi sự kiện "socket_draw" cho tất cả client khác(ng đang dùng hiện tại thì ko cần gửi)
      socket.broadcast.emit("socket_draw", moves, options);
    });
    socket.on("disconnect", () => {
      console.log("disconnect");
    });
  });
  app.all("*", (req: any, res: any) => nextHandler(req, res));
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
