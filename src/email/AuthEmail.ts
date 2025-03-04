import { transport } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sedConfirmationEmail = async (user: IEmail) => {
    const info = await transport.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UpTask - Confirma tu cuenta</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
              }
              .container {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 100%;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #6b46c1;
              }
              h1 {
                  color: #333;
              }
              p {
                  color: #666;
                  line-height: 1.6;
              }
              a {
                  display: inline-block;
                  padding: 10px 20px;
                  color: #fff;
                  background-color: #00bcd4;
                  text-decoration: none;
                  border-radius: 4px;
                  margin-top: 10px;
              }
              a:hover {
                  background-color: #444;
              }
              .token {
                  font-size: 18px;
                  font-weight: bold;
                  color: #333;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo">UpTask</div>
              <h1>Confirma tu cuenta</h1>
              <p>Hola <strong>${user.name}</strong>, Bienvenid@ a UpTask. Ya casi está todo listo, solo necesitas confirmar tu cuenta.</p>
              <p>Visita el siguiente enlace para confirmar tu cuenta:</p>
              <a href="${process.env.FRONTEND_URL}/auth/confirm-account">CONFIRMAR CUENTA</a>
              <p>Ingresa el código:</p>
              <p class="token">${user.token}</p>
              <p>Este token expira en 10 minutos...</p>
              <div class="footer">
                  &copy; UpTask - Todos los derechos reservados
              </div>
          </div>
      </body>
      </html>`,
    });
    console.log("Mensaje enviado", info.messageId);
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transport.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Reestablece tu password",
      text: "UpTask - Reestablece tu password",
      html: `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UpTask - Confirma tu cuenta</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
              }
              .container {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 100%;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #6b46c1;
              }
              h1 {
                  color: #333;
              }
              p {
                  color: #666;
                  line-height: 1.6;
              }
              a {
                  display: inline-block;
                  padding: 10px 20px;
                  color: #fff;
                  background-color: #00bcd4;
                  text-decoration: none;
                  border-radius: 4px;
                  margin-top: 10px;
              }
              a:hover {
                  background-color: #444;
              }
              .token {
                  font-size: 18px;
                  font-weight: bold;
                  color: #333;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo">UpTask</div>
              <h1>Reestablece tu password</h1>
              <p>Hola <strong>${user.name}</strong>, has solicitado reestablecer tu password.</p>
              <p>Visita el siguiente enlace:</p>
              <a href="${process.env.FRONTEND_URL}/auth/new-password">REESTABLECER PASSWORD</a>
              <p>Ingresa el código:</p>
              <p class="token">${user.token}</p>
              <p>Este token expira en 10 minutos...</p>
              <div class="footer">
                  &copy; UpTask - Todos los derechos reservados
              </div>
          </div>
      </body>
      </html>`,
    });
    console.log("Mensaje enviado", info.messageId);
  };
}
