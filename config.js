import dotenv from 'dotenv'; // Dépendance pour rendre accessible le .env

dotenv.config(); // Execute la configuration

export const ENV = { // Exporte la constante env avec les infos
    PORT: process.env.PORT,
    TOKEN: process.env.TOKEN,

    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD
}