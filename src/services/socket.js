import app from './../../app.js'; // Importation du serveur express crée avec sa config (routes, controlleur)
import http from "http";
import { Server } from "socket.io"; // Importation du module server de socketIO

const server = http.createServer(app); // Creation d'un serveur http à partir sur serveur express

const io = new Server(server, { // Création d'un serveur Web SocketIO en autorisant les cors sur 5173
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => { // Ecouteur d'évévenement sur la connection au socket
  console.log(`Le Socket ${socket.id} est bien connecté !`);

  socket.on("disconnect", () => {
    console.log(`Le Socket ${socket.id} vient de se déconnecter !`);
  });

  socket.on("error", (error) => {
    console.log(`Le Socket ${socket.id} vient de générer une erreur:`, error);
  });
});

export { server, io }; // Exportation du serveur http et du serveur io
