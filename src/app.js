import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();

const {
  NODE_ENV = "development",
  MONGODB_URI,
  SESSION_SECRET,
  CORS_ORIGIN,
} = process.env;

if (!MONGODB_URI) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

if (!SESSION_SECRET) {
  throw new Error("Missing required environment variable: SESSION_SECRET");
}

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// const allowedOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(",") : [];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         const msg =
//           "The CORS policy for this site does not allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//     },
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

// Routes import
import superadminRouter from "./routes/superadmin.route.js";
import adminRouter from "./routes/admin.route.js";
import eventRouter from "./routes/event.route.js";

// Router declare
app.use("/api/v1/super", superadminRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/event", eventRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorMessage =
    NODE_ENV === "production" ? "Internal Server Error" : err.message;

  res.status(err.status || 500).json({
    error: {
      message: errorMessage,
    },
  });
});

export default app;
