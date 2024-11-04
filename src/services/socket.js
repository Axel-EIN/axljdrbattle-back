import app from './../../app.js'; // Importation de de la création du serveur express et de sa config (routes, controlleur)
import http from "http"; // Importation du module http
import { Server } from "socket.io"; // Importation du module server de socketIO

const server = http.createServer(app); // Creation d'un serveur http en utilisant app.js

const io = new Server(server, { // Création d'un serveur Web Socket à partir du serveur http en autorisant les cors sur 5173
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => { // Ecouteur d'évévenement sur la connection au socket
  console.log(("Le Socket est bien connecté !")); // Affichage d'un message dans la console lorsque le socket se connect

  socket.on("disconnect", () => { // Affichage d'un message dans la console lorsque le socket est déconnecté
    console.log("Le Socket vient de se déconnecter !");
  });

  socket.on("error", (error) => {
    console.log("Le Socket vient de générer une erreur:", error);
  });
});

// Exportation du serveur et de l'instance 'io' pour les utiliser dans d'autres parties de l'application
export { server, io };
