import dotenv from 'dotenv'; // Dépendance pour rendre accessible le .env

dotenv.config(); // Execute la configuration

export const env = { // Exporte la constante env avec les infos
    port: process.env.PORT,
    token: process.env.TOKEN,

    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbName: process.env.DB_NAME,
    dbPassword: process.env.DB_PASSWORD
}