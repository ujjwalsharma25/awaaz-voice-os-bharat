require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./services/db");

const voiceRoutes   = require("./routes/voice");
const serviceRoutes = require("./routes/services");
const requestRoutes = require("./routes/requests");
const smsRoutes     = require("./routes/sms");
const arduinoRoutes = require("./routes/arduino");

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

app.use("/api/voice",    voiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sms",      smsRoutes);
app.use("/api/arduino",  arduinoRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "AWAAZ Backend running 🎙️", timestamp: new Date().toISOString() })
);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`🚀 AWAAZ Backend → http://localhost:${PORT}`));
