import { ENV } from './config.js';
import { server } from './src/services/socket.js';

// Lancement de l'écoute du serveur
const PORT = ENV.PORT;
server.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur http://localhost:${PORT}`);
});
