import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import keystrokeRoutes from "./routes/keystroke.routes";
import pasteRoutes from "./routes/paste.routes";
import sessionRoutes from "./routes/session.routes";

dotenv.config();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL || "",
      ].filter(Boolean);

      // In production, add your Vercel frontend URL here
      if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
        // FRONTEND_URL is set in Vercel environment variables
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Vi-Notes backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/keystrokes", keystrokeRoutes);

app.use("/api/pastes", pasteRoutes);

app.use("/api/sessions", sessionRoutes);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
    });
  },
);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

export default app;
