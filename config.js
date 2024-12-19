import dotenv from 'dotenv'; // Dépendance pour rendre accessible le .env

dotenv.config(); // Execute la configuration

export const ENV = { // Exporte la constante ENV avec les infos
    NODE_ENV:  process.env.NODE_ENV, // Ajoute la variable d'environnement ('dev", "prod' ou 'test')
    PORT: process.env.PORT,
    TOKEN: process.env.TOKEN,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    WEB_APP_URL: process.env.WEB_APP_URL,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_TO: process.env.MAIL_TO,
    API_KEY_MAILGUN: process.env.API_KEY_MAILGUN,
    DOMAIN_MAILGUN: process.env.DOMAIN_MAILGUN,
};
