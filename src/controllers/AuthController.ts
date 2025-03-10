import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../email/AuthEmail";
import { generateJWT } from "./jwt";

export class AuthController {
  static crateAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El Usuario ya esta registrado");
        res.status(409).json({ error: error.message });
        return;
      }

      //crear nuevo usario
      const user = new User(req.body);

      //hash password
      user.password = await hashPassword(password);

      // generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //enviar el email
      AuthEmail.sedConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send("Cuenta creada con éxito, verifica tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExist.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sedConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "Cuenta no confirmada, enviamos un email de confirmación"
        );
        res.status(401).json({ error: error.message });
        return;
      }

      //revisar password
      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto, intentelo de nuevo");
        res.status(404).json({ error: error.message });
        return;
      }

      const token = generateJWT({ id: user._id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El Usuario no esta registrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (user.confirmed) {
        const error = new Error("El Usuario ya esta confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      // generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //enviar el email
      AuthEmail.sedConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send("Nuevo token enviado!, revisa tu e-mail");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El Usuario no esta registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // generar token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      //enviar el email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Revisa tu email");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }

      res.send("Token válido, crea tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExist.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send("Password actualizado!");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
    return;
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("Ese email ya esta registrado");
      res.status(409).json({ error: error.message });
      return;
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("Password actual incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Password actualizado");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("Password incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    res.send("Password correcto");
  };
}
