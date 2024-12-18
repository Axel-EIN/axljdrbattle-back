import nodemailer from "nodemailer";
import { ENV } from './../../config.js';

const transport = nodemailer.createTransport({
    host: ENV.MAIL_HOST,
    port: ENV.MAIL_PORT,
    secure: true,
    auth: {
        user: ENV.MAIL_USER,
        pass: ENV.MAIL_PASSWORD,
    },
});

export let sendMailToUser = async (user, verifyEmailToken) => {
    try {
      const verifyLinkToken = `<a href="${ENV.WEB_APP_URL}/verification/${verifyEmailToken}">${verifyEmailToken}</a>`;
  
      if (ENV.NODE_ENV != 'test') {
          await transport.sendMail({
            from: ENV.MAIL_FROM,
            to: user.email,
            subject: "Validation du Mail",
            text: `Bonjour, ${user.firstname}, ceci est un mail pour valider votre e-mail`, // Au cas où l'html ne passe pas
            html: `
                      <p>Veuillez cliquez sur ce lien.</p>
                      ${verifyLinkToken}
                  `,
          });
      }

    } catch (erreur) {
        console.log(erreur);
    }
};
  