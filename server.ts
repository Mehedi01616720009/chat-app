import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    // Initialize Socket.io
    const io = new Server(httpServer, {
        cors: { origin: "*" },
    });

    // Make io globally accessible in Next.js API Routes
    (global as any).io = io;

    io.on("connection", (socket) => {
        console.log("A client connected:", socket.id);

        // Client joins a specific chat room
        socket.on("join-chat", (chatId: string) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat: ${chatId}`);
        });

        // Client leaves a chat room
        socket.on("leave-chat", (chatId: string) => {
            socket.leave(chatId);
            console.log(`Socket ${socket.id} left chat: ${chatId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
