import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes";
import authRoutes from "./routes/authRoutes";
import type { Request, Response, NextFunction } from "express";

dotenv.config();
connectDB();
const app = express();
app.use(cors(corsConfig));

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (res: Response) => {
  res.send("API funcionando correctamente 🚀");
});

// Manejo de rutas no encontradas
app.use((res: Response) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

app.use((err, res: Response) => {
  console.error(err);
  res.status(500).json({ msg: "Error del servidor" });
});

export default app;
