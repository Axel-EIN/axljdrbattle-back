import nodemailer from "nodemailer";
import nodemailerMailgunTransport from "nodemailer-mailgun-transport";
import { ENV } from './../../config.js';

const mailgunAuth = {
    auth: {
        api_key: ENV.API_KEY_MAILGUN,
        domain: ENV.DOMAIN_MAILGUN,
    }
};



// const transport = nodemailer.createTransport({
//     host: ENV.MAIL_HOST,
//     port: ENV.MAIL_PORT,
//     secure: true,
//     auth: {
//         user: ENV.MAIL_USER,
//         pass: ENV.MAIL_PASSWORD,
//     },
// });

export let sendMailToUser = async (user, verifyEmailToken) => {
    try {
      const verifyLinkToken = `<a href="${ENV.WEB_APP_URL}/verification/${verifyEmailToken}">${verifyEmailToken}</a>`;
  
      if (ENV.NODE_ENV != 'test') {
            const smtpTransport = nodemailer.createTransport(nodemailerMailgunTransport(mailgunAuth));
            await smtpTransport.sendMail({
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
  