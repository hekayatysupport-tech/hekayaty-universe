import express, { type Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// 1. Logging Middleware
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// 2. HTTP Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://res.cloudinary.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.cloudinary.com;"
  );
  next();
});

// 3. CORS Configuration
// In production on Vercel, the frontend and backend share the same domain so
// requests are same-origin. For preview deployments, origins vary, so we allow all.
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: isProduction
      ? true // allow all origins on Vercel (frontend is same-origin anyway)
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS policy violation: Origin not allowed"));
          }
        },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// 4. HTTP Parameter Pollution Protection
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key]) && typeof req.query[key] !== "string") {
        // Normalize array queries to single string if necessary
        req.query[key] = (req.query[key] as any)[(req.query[key] as any).length - 1];
      }
    }
  }
  next();
});

// 5. Body Parsing with Safe Limits (25mb for image uploads & base64)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// 6. Router Mounting
app.use("/api", router);

// 7. Global Fail-Closed Error Handler (Prevents stack traces/SQL leakage to clients)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API Error:", err);

  if (res.headersSent) {
    return _next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : err.message || "An unexpected error occurred",
  });
});

export default app;

