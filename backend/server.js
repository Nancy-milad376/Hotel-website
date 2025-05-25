// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");
const { initializeDatabase } = require("./utils/databaseInit");
const scheduledTasks = require("./utils/scheduledTasks");

const app = express();

// Simple health-check endpoint
app.get("/api/health-check", (req, res) => {
  res.sendStatus(200);
});

// CORS + JSON body parsing
app.use(
  cors({
    origin: "http://localhost:3000", // adjust to your frontend origin
    credentials: true,
  })
);
app.use(express.json());

// ─── Mount API Routes ────────────────────────────────────────
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// ─── Start & Initialize ──────────────────────────────────────
const startServer = async () => {
  try {
    // 1) Connect to the database
    await db.sequelize.authenticate();
    console.log("✔️ Database connected");

    // 2) Create tables, seed rooms & inventory
    await initializeDatabase();
    console.log("✅ Database initialized");

    // 3) Start any scheduled background tasks
    scheduledTasks.start();

    // 4) Launch HTTP server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
